#!/usr/bin/env python3
"""
Master Experiment Runner Script

This script provides a unified interface to run the complete experimental workflow
including both the main experimental controller and the automated posttest scheduler.

Usage:
    python run_experiment.py --participant-id 001 --start
    python run_experiment.py --participant-id 001 --resume-block 3
    python run_experiment.py --status
    python run_experiment.py --setup-scheduler
"""

import argparse
import json
import subprocess
import sys
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

class ExperimentRunner:
    def __init__(self):
        self.config_file = Path('experiment_config.json')
        self.config = self.load_config()
        
    def load_config(self) -> dict:
        """Load experiment configuration"""
        default_config = {
            'experiment': {
                'condition_orders': ['ABAB', 'BABA'],
                'block_duration_minutes': 6,
                'total_blocks': 4,
                'vocabulary_words_per_block': 6
            },
            'scheduler': {
                'enabled': True,
                'posttest_delay_hours': 24,
                'auto_schedule': True
            },
            'paths': {
                'data_directory': 'participants',
                'log_directory': 'logs'
            }
        }
        
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    user_config = json.load(f)
                    default_config.update(user_config)
            except Exception as e:
                print(f"Warning: Could not load config file: {e}")
                
        return default_config
    
    def save_config(self):
        """Save current configuration"""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def setup_environment(self):
        """Set up the experimental environment"""
        print("🔧 Setting up experimental environment...")
        
        # Create necessary directories
        data_dir = Path(self.config['paths']['data_directory'])
        log_dir = Path(self.config['paths']['log_directory'])
        
        data_dir.mkdir(exist_ok=True)
        log_dir.mkdir(exist_ok=True)
        
        # Check if Next.js dependencies are installed
        if not Path('node_modules').exists():
            print("📦 Installing Node.js dependencies...")
            subprocess.run(['npm', 'install'], check=True)
        
        # Check if Python dependencies are available
        required_packages = ['schedule', 'requests']
        for package in required_packages:
            try:
                __import__(package)
            except ImportError:
                print(f"📦 Installing Python package: {package}")
                subprocess.run([sys.executable, '-m', 'pip', 'install', package], check=True)
        
        print("✅ Environment setup complete")
    
    def start_experiment(self, participant_id: str, condition_order: Optional[str] = None):
        """Start a new experimental session"""
        print(f"\n🧪 Starting experiment for participant {participant_id}")
        print("=" * 60)
        
        # Validate participant ID
        if not participant_id.isdigit() or len(participant_id) < 3:
            print("❌ Participant ID should be a 3-digit number (e.g., 001)")
            return False
        
        # Check if participant already exists
        participant_dir = Path(f"participant_{participant_id}")
        if participant_dir.exists():
            response = input(f"⚠️  Participant {participant_id} directory already exists. Continue anyway? (y/N): ")
            if response.lower() != 'y':
                print("❌ Experiment cancelled")
                return False
        
        # Start development server in background
        dev_server_process = self.start_dev_server()
        
        try:
            # Run experimental controller
            cmd = [
                'python', 'experimental_controller.py',
                '--participant-id', participant_id,
                '--start-experiment'
            ]
            
            if condition_order:
                cmd.extend(['--condition-order', condition_order])
            
            result = subprocess.run(cmd)
            
            # If experiment completed successfully, schedule posttest
            if result.returncode == 0 and self.config['scheduler']['auto_schedule']:
                self.schedule_posttest(participant_id)
            
            return result.returncode == 0
            
        except KeyboardInterrupt:
            print("\n⏹️  Experiment interrupted by user")
            return False
        except Exception as e:
            print(f"❌ Error running experiment: {e}")
            return False
        finally:
            # Clean up development server
            if dev_server_process:
                dev_server_process.terminate()
    
    def resume_experiment(self, participant_id: str, block_number: int):
        """Resume an existing experimental session"""
        print(f"\n🔄 Resuming experiment for participant {participant_id} at block {block_number}")
        
        # Check if participant exists
        participant_dir = Path(f"participant_{participant_id}")
        if not participant_dir.exists():
            print(f"❌ No data found for participant {participant_id}")
            return False
        
        # Start development server
        dev_server_process = self.start_dev_server()
        
        try:
            # Run experimental controller
            result = subprocess.run([
                'python', 'experimental_controller.py',
                '--participant-id', participant_id,
                '--resume-block', str(block_number)
            ])
            
            return result.returncode == 0
            
        except KeyboardInterrupt:
            print("\n⏹️  Experiment interrupted by user")
            return False
        except Exception as e:
            print(f"❌ Error resuming experiment: {e}")
            return False
        finally:
            if dev_server_process:
                dev_server_process.terminate()
    
    def start_dev_server(self):
        """Start Next.js development server in background"""
        print("🚀 Starting development server...")
        
        try:
            # Check if server is already running
            import requests
            requests.get('http://localhost:3000', timeout=2)
            print("✅ Development server already running")
            return None
        except:
            pass
        
        # Start server
        process = subprocess.Popen(
            ['npm', 'run', 'dev'],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
        # Wait for server to start
        print("⏳ Waiting for server to start...")
        for _ in range(30):  # Wait up to 30 seconds
            try:
                import requests
                requests.get('http://localhost:3000', timeout=1)
                print("✅ Development server started")
                return process
            except:
                time.sleep(1)
        
        print("⚠️  Development server may not have started properly")
        return process
    
    def schedule_posttest(self, participant_id: str):
        """Schedule posttest for participant"""
        if not self.config['scheduler']['enabled']:
            print("📅 Posttest scheduling disabled in config")
            return
        
        print(f"📅 Scheduling 24-hour posttest for participant {participant_id}...")
        
        try:
            result = subprocess.run([
                'python', 'automated_scheduler.py',
                '--schedule-participant', participant_id
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Posttest scheduled successfully")
            else:
                print(f"⚠️  Posttest scheduling may have failed: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Error scheduling posttest: {e}")
    
    def show_status(self):
        """Show experiment status"""
        print("\n📊 Experiment Status Report")
        print("=" * 50)
        
        # Count participants
        participant_dirs = list(Path('.').glob('participant_*'))
        total_participants = len(participant_dirs)
        
        print(f"Total Participants: {total_participants}")
        
        if total_participants > 0:
            completed_sessions = 0
            pending_sessions = 0
            
            for participant_dir in participant_dirs:
                session_file = participant_dir / 'session_data.json'
                if session_file.exists():
                    try:
                        with open(session_file, 'r') as f:
                            session_data = json.load(f)
                            if session_data.get('session_complete', False):
                                completed_sessions += 1
                            else:
                                pending_sessions += 1
                    except:
                        pending_sessions += 1
                else:
                    pending_sessions += 1
            
            print(f"Completed Sessions: {completed_sessions}")
            print(f"Pending Sessions: {pending_sessions}")
            
            if total_participants > 0:
                completion_rate = completed_sessions / total_participants * 100
                print(f"Completion Rate: {completion_rate:.1f}%")
        
        # Show scheduler status if enabled
        if self.config['scheduler']['enabled']:
            print("\n📧 Posttest Scheduler Status:")
            try:
                result = subprocess.run([
                    'python', 'automated_scheduler.py',
                    '--status'
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    print(result.stdout)
                else:
                    print("⚠️  Could not retrieve scheduler status")
                    
            except Exception as e:
                print(f"❌ Error checking scheduler status: {e}")
    
    def setup_scheduler(self):
        """Setup automated posttest scheduler"""
        print("\n📧 Setting up Automated Posttest Scheduler")
        print("=" * 50)
        
        # Create scheduler config
        scheduler_config = {
            'email': {
                'smtp_server': input("SMTP Server (default: smtp.gmail.com): ") or 'smtp.gmail.com',
                'smtp_port': int(input("SMTP Port (default: 587): ") or '587'),
                'sender_email': input("Sender Email: "),
                'sender_password': input("Sender Password (use app password): "),
                'sender_name': input("Sender Name (default: Research Team): ") or 'Research Team'
            },
            'timing': {
                'posttest_delay_hours': int(input("Posttest delay hours (default: 24): ") or '24'),
                'reminder_delay_hours': int(input("Reminder delay hours (default: 25): ") or '25'),
                'max_reminders': int(input("Max reminders (default: 2): ") or '2')
            }
        }
        
        # Save scheduler config
        with open('scheduler_config.json', 'w') as f:
            json.dump(scheduler_config, f, indent=2)
        
        print("✅ Scheduler configuration saved")
        
        # Update experiment config
        self.config['scheduler']['enabled'] = True
        self.save_config()
        
        print("✅ Scheduler enabled in experiment config")

def main():
    parser = argparse.ArgumentParser(description='Master Experiment Runner')
    parser.add_argument('--participant-id', help='Participant ID (3-digit number)')
    parser.add_argument('--start', action='store_true', help='Start new experiment')
    parser.add_argument('--resume-block', type=int, help='Resume at specific block number')
    parser.add_argument('--condition-order', choices=['ABAB', 'BABA'], help='Force specific condition order')
    parser.add_argument('--status', action='store_true', help='Show experiment status')
    parser.add_argument('--setup-scheduler', action='store_true', help='Setup automated scheduler')
    parser.add_argument('--setup-env', action='store_true', help='Setup experimental environment')
    
    args = parser.parse_args()
    
    runner = ExperimentRunner()
    
    if args.setup_env:
        runner.setup_environment()
        return
    
    if args.setup_scheduler:
        runner.setup_scheduler()
        return
    
    if args.status:
        runner.show_status()
        return
    
    if args.start:
        if not args.participant_id:
            print("❌ Participant ID required for starting experiment")
            return
        runner.start_experiment(args.participant_id, args.condition_order)
        return
    
    if args.resume_block:
        if not args.participant_id:
            print("❌ Participant ID required for resuming experiment")
            return
        runner.resume_experiment(args.participant_id, args.resume_block)
        return
    
    # Default: show help
    parser.print_help()

if __name__ == "__main__":
    main()