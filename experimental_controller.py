#!/usr/bin/env python3
"""
Experimental Controller for ABAB/BABA Counterbalanced Vocabulary Learning Study

This script manages the complete experimental workflow:
- Participant randomization to condition orders
- Automatic timing of 6-minute learning blocks  
- Condition switching between conversational and flashcard methods
- RIMMS survey administration after each condition's second block
- Data collection and session management

Usage:
    python experimental_controller.py --participant-id 001 --start-experiment
    python experimental_controller.py --participant-id 001 --resume-block 3
"""

import argparse
import json
import time
import subprocess
import threading
import random
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Literal, Optional
import webbrowser
import os

class ExperimentalSession:
    def __init__(self, participant_id: str, condition_order: Literal['ABAB', 'BABA'] = None):
        self.participant_id = participant_id
        self.condition_order = condition_order or self._randomize_condition_order()
        self.current_block = 0
        self.start_time = datetime.now()
        self.blocks = self._generate_blocks()
        self.session_data = {
            'participant_id': participant_id,
            'condition_order': self.condition_order,
            'start_time': self.start_time.isoformat(),
            'blocks_completed': [],
            'rimms_scores': {},
            'vocabulary_sets': {},
            'session_complete': False
        }
        self.data_dir = Path(f"participant_{participant_id}")
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize participant-specific vocabulary
        self._initialize_participant_vocabulary()
        
        # Split vocabulary into condition-specific sets
        self._create_condition_vocabularies()
        
    def _randomize_condition_order(self) -> Literal['ABAB', 'BABA']:
        """Randomly assign participant to ABAB or BABA condition order"""
        return random.choice(['ABAB', 'BABA'])
    
    def _initialize_participant_vocabulary(self):
        """Initialize participant-specific vocabulary from main vocabulary.csv"""
        main_vocab_path = Path('vocabulary.csv')
        participant_vocab_path = self.data_dir / 'vocabulary.csv'
        
        if main_vocab_path.exists() and not participant_vocab_path.exists():
            import shutil
            shutil.copy2(main_vocab_path, participant_vocab_path)
            print(f"✅ Initialized vocabulary for participant {self.participant_id}")
        elif participant_vocab_path.exists():
            print(f"📝 Using existing vocabulary for participant {self.participant_id}")
        else:
            print(f"⚠️  Main vocabulary.csv not found, participant will use defaults")
    
    def _create_condition_vocabularies(self):
        """Split the 24-word participant vocabulary into 12 words per condition"""
        participant_vocab_path = self.data_dir / 'vocabulary.csv'
        
        if not participant_vocab_path.exists():
            print(f"⚠️  Participant vocabulary not found, cannot split into conditions")
            return
        
        try:
            import csv
            import random
            
            # Read participant vocabulary
            with open(participant_vocab_path, 'r') as f:
                reader = csv.DictReader(f)
                all_words = list(reader)
            
            if len(all_words) != 24:
                print(f"⚠️  Expected 24 words, found {len(all_words)}. Cannot split properly.")
                return
            
            # Randomly split into two groups of 12 words each
            shuffled_words = all_words.copy()
            random.shuffle(shuffled_words)
            
            conversational_words = shuffled_words[:12]
            flashcard_words = shuffled_words[12:]
            
            # Create condition-specific CSV files
            fieldnames = all_words[0].keys()
            
            # Conversational condition vocabulary
            conversational_path = self.data_dir / 'vocabulary_conversational.csv'
            with open(conversational_path, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(conversational_words)
            
            # Flashcard condition vocabulary  
            flashcard_path = self.data_dir / 'vocabulary_flashcard.csv'
            with open(flashcard_path, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(flashcard_words)
            
            # Save word assignment log
            assignment_log = self.data_dir / 'condition_word_assignments.txt'
            with open(assignment_log, 'w') as f:
                f.write(f"Participant {self.participant_id} - Condition Word Assignments\n")
                f.write(f"Total words: {len(all_words)}\n")
                f.write(f"Split: 12 words per condition\n\n")
                
                f.write("Conversational Condition Words (12):\n")
                for word in sorted([w['word'] for w in conversational_words]):
                    f.write(f"- {word}\n")
                f.write("\n")
                
                f.write("Flashcard Condition Words (12):\n")
                for word in sorted([w['word'] for w in flashcard_words]):
                    f.write(f"- {word}\n")
            
            print(f"✅ Split vocabulary: 12 words each for conversational and flashcard conditions")
            
        except Exception as e:
            print(f"❌ Failed to create condition vocabularies: {str(e)}")
    
    def _generate_blocks(self) -> List[Dict]:
        """Generate the 4 experimental blocks based on condition order"""
        condition_map = {
            'A': 'conversational',
            'B': 'flashcard'
        }
        
        blocks = []
        for i, condition_letter in enumerate(self.condition_order):
            condition_type = condition_map[condition_letter]
            # First exposure to each condition (blocks 0,1), then second exposure (blocks 2,3)
            is_first_exposure = i < 2
            
            blocks.append({
                'block_number': i + 1,
                'condition': condition_type,
                'duration_minutes': 1,
                'is_first_exposure': is_first_exposure,
                'requires_rimms': not is_first_exposure,  # RIMMS after 2nd exposure to each condition
                'vocabulary_count': 12  # Each condition uses all 12 words
            })
        
        return blocks

class ExperimentalController:
    def __init__(self):
        self.current_session: Optional[ExperimentalSession] = None
        self.timer_thread: Optional[threading.Thread] = None
        self.block_complete = False
        self.dev_server_process = None
        
    def start_experiment(self, participant_id: str, condition_order: str = None):
        """Initialize and start a new experimental session"""
        print(f"\n🧪 Starting Experimental Session for Participant {participant_id}")
        print("=" * 60)
        
        # Check if participant needs pretest (should have exactly 24 words)
        if self._needs_pretest_vocabulary(participant_id):
            print(f"\n📋 Running pretest vocabulary selection for participant {participant_id}")
            if not self._run_pretest(participant_id):
                print("❌ Pretest cancelled. Cannot proceed with experiment.")
                return
        
        self.current_session = ExperimentalSession(participant_id, condition_order)
        self._save_session_data()
        
        print(f"📋 Condition Order: {self.current_session.condition_order}")
        print(f"📂 Data Directory: {self.current_session.data_dir}")
        print(f"⏰ Session Start: {self.current_session.start_time.strftime('%H:%M:%S')}")
        
        # Display experimental schedule
        self._display_experimental_schedule()
        
        # Start npm development server for web interface
        self._start_development_server()
        
        # Start with block 1
        self._advance_to_next_block()
    
    def resume_experiment(self, participant_id: str, block_number: int):
        """Resume an existing experimental session at specific block"""
        data_file = Path(f"participant_{participant_id}/session_data.json")
        
        if not data_file.exists():
            print(f"❌ No existing session found for participant {participant_id}")
            return
            
        with open(data_file, 'r') as f:
            session_data = json.load(f)
            
        # Reconstruct session
        self.current_session = ExperimentalSession(participant_id, session_data['condition_order'])
        self.current_session.session_data = session_data
        self.current_session.current_block = block_number - 1
        
        print(f"\n🔄 Resuming Session for Participant {participant_id}")
        print(f"📋 Condition Order: {self.current_session.condition_order}")
        print(f"⏭️  Resuming at Block {block_number}")
        
        self._advance_to_next_block()
    
    def _display_experimental_schedule(self):
        """Display the complete experimental schedule"""
        print("\n📅 Experimental Schedule:")
        print("-" * 40)
        
        for i, block in enumerate(self.current_session.blocks):
            block_num = i + 1
            condition = block['condition'].title()
            exposure = "1st" if block['is_first_exposure'] else "2nd"
            rimms = " + RIMMS" if block['requires_rimms'] else ""
            
            print(f"Block {block_num}: {condition} ({exposure} exposure) - 1 min{rimms}")
        
        print("-" * 40)
    
    def _advance_to_next_block(self):
        """Advance to the next experimental block"""
        if self.current_session.current_block >= len(self.current_session.blocks):
            self._complete_experiment()
            return
            
        current_block = self.current_session.blocks[self.current_session.current_block]
        block_number = self.current_session.current_block + 1
        
        print(f"\n🎯 Block {block_number}: {current_block['condition'].title()} Condition")
        print("=" * 50)
        
        # Pre-block setup
        self._setup_block(current_block, block_number)
        
        # Start the learning condition
        self._start_learning_block(current_block, block_number)
        
        # Post-block processing
        self._complete_block(current_block, block_number)
    
    def _setup_block(self, block: Dict, block_number: int):
        """Setup before starting a learning block"""
        print(f"📝 Block {block_number} Setup:")
        print(f"   Condition: {block['condition'].title()}")
        print(f"   Duration: {block['duration_minutes']} minutes")
        print(f"   Vocabulary: {block['vocabulary_count']} words")
        print(f"   Exposure: {'First' if block['is_first_exposure'] else 'Second'}")
        
        # Load appropriate vocabulary set
        vocab_set = self._load_vocabulary_for_block(block_number)
        print(f"   Words: {', '.join(vocab_set[:3])}..." if len(vocab_set) > 3 else f"   Words: {', '.join(vocab_set)}")
        
        input("\n⏳ Press Enter when participant is ready to begin...")
        
    def _load_vocabulary_for_block(self, block_number: int) -> List[str]:
        """Load vocabulary words for specific block based on participant's selection"""
        vocab_file = self.current_session.data_dir / "vocabulary.csv"
        
        if not vocab_file.exists():
            # Use default vocabulary if participant-specific not available
            print("⚠️  Using default vocabulary set (participant-specific set not found)")
            default_words = [
                "obfuscate", "disparage", "perfunctory", "precocious", "circumspect",
                "capitulate", "vociferous", "intractable", "abrogate", "admonish",
                "bolster", "cacophony", "candor", "capricious", "conciliatory",
                "copious", "cursory", "deleterious", "despot", "ephemeral",
                "eschew", "garrulous", "hackneyed", "ennui"
            ]
            # Assign 6 words per block
            start_idx = (block_number - 1) * 6
            return default_words[start_idx:start_idx + 6]
        
        # Load participant-specific vocabulary
        with open(vocab_file, 'r') as f:
            lines = f.readlines()[1:]  # Skip header
            words = [line.split(',')[0] for line in lines if line.strip()]
        
        # Assign words to blocks (6 per block, 24 total)
        start_idx = (block_number - 1) * 6
        return words[start_idx:start_idx + 6]
    
    def _start_learning_block(self, block: Dict, block_number: int):
        """Start the timed learning block"""
        condition = block['condition']
        duration_seconds = block['duration_minutes'] * 60
        
        print(f"\n🚀 Starting {condition.title()} Learning Block...")
        print(f"⏱️  Duration: {block['duration_minutes']} minutes")
        print("🔄 Starting in 30 seconds...")
        
        time.sleep(30)
        
        # Start timer
        self.block_complete = False
        self.timer_thread = threading.Thread(
            target=self._run_block_timer,
            args=(duration_seconds, block_number)
        )
        self.timer_thread.start()
        
        # Launch appropriate learning condition
        if condition == 'conversational':
            self._launch_conversational_condition()
        elif condition == 'flashcard':
            self._launch_flashcard_condition()
        
        # Wait for timer completion
        self.timer_thread.join()
        
    def _run_block_timer(self, duration_seconds: int, block_number: int):
        """Run the block timer with progress updates"""
        start_time = time.time()
        
        while not self.block_complete:
            elapsed = time.time() - start_time
            remaining = max(0, duration_seconds - elapsed)
            
            if remaining <= 0:
                self.block_complete = True
                print(f"\n⏰ Block {block_number} Timer Complete!")
                print("🛑 Please finish your current interaction and prepare for the next phase.")
                break
                
            # Progress updates every minute
            if int(elapsed) % 60 == 0 and elapsed > 0:
                minutes_elapsed = int(elapsed // 60)
                minutes_remaining = int(remaining // 60)
                print(f"⏱️  {minutes_elapsed} min elapsed, {minutes_remaining} min remaining")
            
            time.sleep(1)
    
    def _launch_conversational_condition(self):
        """Launch the conversational learning condition"""
        print("🗣️  Launching Conversational Tutor...")
        print("   Opening browser to localhost:3000")
        print("   💡 Instructions:")
        print("      - Engage naturally with the vocabulary tutor")
        print("      - Try to use new words in conversation")
        print("      - Ask questions about word meanings")
        print("      - Continue until timer expires")
        
        try:
            # Start Next.js development server if not running
            self._ensure_dev_server_running()
            
            # Open browser to conversation interface with participant and condition parameters
            url = f'http://localhost:3000?participant={self.current_session.participant_id}&condition=conversational'
            webbrowser.open(url)
            print(f"   🔗 URL: {url}")
            
        except Exception as e:
            print(f"⚠️  Error launching conversational condition: {e}")
            print(f"   Please manually navigate to http://localhost:3000?participant={self.current_session.participant_id}&condition=conversational")
    
    def _launch_flashcard_condition(self):
        """Launch the flashcard learning condition"""
        print("📚 Launching Flashcard Study...")
        print("   Opening flashcard interface")
        print("   💡 Instructions:")
        print("      - Study each flashcard carefully")
        print("      - Read definitions and examples")
        print("      - Use navigation buttons to review")
        print("      - Continue until timer expires")
        
        try:
            # Open browser to flashcard interface with participant parameter
            url = f'http://localhost:3000/conditions/flashcard?participant={self.current_session.participant_id}'
            webbrowser.open(url)
            print(f"   🔗 URL: {url}")
            
        except Exception as e:
            print(f"⚠️  Error launching flashcard condition: {e}")
            print(f"   Please manually navigate to http://localhost:3000/conditions/flashcard?participant={self.current_session.participant_id}")
    
    def _ensure_dev_server_running(self):
        """Ensure Next.js development server is running"""
        try:
            import requests
            requests.get('http://localhost:3000', timeout=2)
            print("✅ Development server is running")
        except:
            print("🔄 Starting development server...")
            # Note: In production, you might want to handle this differently
            subprocess.Popen(['npm', 'run', 'dev'], cwd=Path.cwd())
            time.sleep(5)  # Give server time to start
    
    def _complete_block(self, block: Dict, block_number: int):
        """Complete post-block processing"""
        print(f"\n✅ Block {block_number} Complete!")
        
        # Record block completion
        block_data = {
            'block_number': block_number,
            'condition': block['condition'],
            'completion_time': datetime.now().isoformat(),
            'duration_minutes': block['duration_minutes']
        }
        
        self.current_session.session_data['blocks_completed'].append(block_data)
        
        # Administer RIMMS if required
        if block['requires_rimms']:
            self._administer_rimms(block['condition'])
        
        # Short break between blocks
        if block_number < len(self.current_session.blocks):
            print("⏸️  Taking 1-minute break before next block...")
            time.sleep(60)
        
        # Save session data
        self._save_session_data()
        
        # Advance to next block
        self.current_session.current_block += 1
        self._advance_to_next_block()
    
    def _administer_rimms(self, condition: str):
        """Administer RIMMS survey for completed condition"""
        print(f"\n📊 RIMMS Survey - {condition.title()} Condition")
        print("=" * 40)
        print("Please complete the motivation survey for the learning method you just used.")
        
        # Open RIMMS survey interface
        rimms_url = f"http://localhost:3000/survey/rimms?condition={condition}&participant={self.current_session.participant_id}"
        
        try:
            webbrowser.open(rimms_url)
            print(f"🌐 Survey opened in browser: {rimms_url}")
        except:
            print(f"⚠️  Please manually navigate to: {rimms_url}")
        
        # Wait for survey completion
        input("⏳ Press Enter after completing the RIMMS survey...")
        
        # Record RIMMS completion
        self.current_session.session_data['rimms_scores'][condition] = {
            'completed': True,
            'completion_time': datetime.now().isoformat()
        }
    
    def _complete_experiment(self):
        """Complete the experimental session"""
        print("\n🎉 Experimental Session Complete!")
        print("=" * 50)
        
        # Mark session as complete
        self.current_session.session_data['session_complete'] = True
        self.current_session.session_data['completion_time'] = datetime.now().isoformat()
        
        # Display session summary
        self._display_session_summary()
        
        # Schedule 24-hour posttest
        self._schedule_posttest()
        
        # Save final session data
        self._save_session_data()
        
        print("\n✅ Session data saved successfully!")
        print(f"📂 Data location: {self.current_session.data_dir}")
        
        # Clean up development server
        if self.dev_server_process and self.dev_server_process.poll() is None:
            print("\n🛑 Stopping development server...")
            self.dev_server_process.terminate()
            try:
                self.dev_server_process.wait(timeout=5)
                print("✅ Development server stopped")
            except subprocess.TimeoutExpired:
                self.dev_server_process.kill()
                print("🔥 Development server force stopped")
    
    def _display_session_summary(self):
        """Display summary of completed session"""
        session = self.current_session.session_data
        
        print(f"📋 Session Summary:")
        print(f"   Participant: {session['participant_id']}")
        print(f"   Condition Order: {session['condition_order']}")
        print(f"   Start Time: {session['start_time']}")
        print(f"   Completion Time: {session['completion_time']}")
        print(f"   Blocks Completed: {len(session['blocks_completed'])}/4")
        print(f"   RIMMS Surveys: {len(session['rimms_scores'])}/2")
        
        total_duration = datetime.fromisoformat(session['completion_time']) - datetime.fromisoformat(session['start_time'])
        print(f"   Total Duration: {total_duration}")
    
    def _needs_pretest_vocabulary(self, participant_id: str) -> bool:
        """Check if participant needs to run pretest vocabulary selection"""
        participant_vocab_path = Path(f"participant_{participant_id}/vocabulary.csv")
        
        if not participant_vocab_path.exists():
            return True
            
        # Count words in vocabulary file (should be exactly 24 + header = 25 lines)
        try:
            with open(participant_vocab_path, 'r') as f:
                lines = f.readlines()
                word_count = len(lines) - 1  # Subtract header
                
            if word_count != 24:
                print(f"⚠️  Participant {participant_id} has {word_count} words, expected 24")
                return True
                
            return False
        except Exception:
            return True
    
    def _run_pretest(self, participant_id: str) -> bool:
        """Run the pretest vocabulary selection GUI"""
        try:
            print(f"🖥️  Opening vocabulary selection interface...")
            print(f"📋 A GUI window will open for participant {participant_id} to select familiar words")
            
            # Set environment variable for the participant ID so the GUI knows which participant
            os.environ['PRETEST_PARTICIPANT_ID'] = participant_id
            
            # Run the existing vocabulary selector GUI
            result = subprocess.run([
                'python3', 'experiment_word_selector.py'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                # Check if the vocabulary file was created with 24 words
                participant_vocab_path = Path(f"participant_{participant_id}/vocabulary.csv")
                if participant_vocab_path.exists():
                    with open(participant_vocab_path, 'r') as f:
                        lines = f.readlines()
                        word_count = len(lines) - 1  # Subtract header
                    
                    if word_count == 24:
                        print(f"✅ Pretest complete: 24 words selected for participant {participant_id}")
                        return True
                    else:
                        print(f"⚠️  Expected 24 words, but got {word_count}")
                        return False
                else:
                    print(f"❌ Vocabulary file not created for participant {participant_id}")
                    return False
            else:
                print(f"❌ Pretest GUI failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Pretest failed: {str(e)}")
            return False
    
    def _start_development_server(self):
        """Start the npm development server for the web interface"""
        try:
            print(f"\n🚀 Starting web development server...")
            print(f"⏳ This may take a few moments to initialize...")
            
            # Start npm dev server in background
            self.dev_server_process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for server to be ready (check for specific output)
            import time
            max_wait = 30  # seconds
            start_time = time.time()
            
            while time.time() - start_time < max_wait:
                # Check if process is still running
                if self.dev_server_process.poll() is not None:
                    # Process has ended
                    stdout, stderr = self.dev_server_process.communicate()
                    print(f"❌ Development server failed to start: {stderr}")
                    return False
                
                # Check if server is responding
                try:
                    import requests
                    response = requests.get('http://localhost:3000', timeout=2)
                    if response.status_code == 200:
                        print(f"✅ Development server ready at http://localhost:3000")
                        return True
                except:
                    pass
                
                time.sleep(1)
            
            print(f"⚠️  Development server taking longer than expected to start")
            print(f"💡 Continuing with experiment - server should be ready soon")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start development server: {str(e)}")
            print(f"💡 Please manually run 'npm run dev' in another terminal")
            return False
    
    def _schedule_posttest(self):
        """Schedule the 24-hour delayed posttest"""
        posttest_time = datetime.now() + timedelta(hours=24)
        
        print(f"\n📅 24-Hour Posttest Scheduled:")
        print(f"   Scheduled for: {posttest_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Generate posttest form
        try:
            print("🔄 Generating personalized posttest...")
            subprocess.run([
                'python', 'post_test_generator.py',
                '--participant-id', self.current_session.participant_id
            ], check=True)
            print("✅ Posttest generated successfully!")
            
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Error generating posttest: {e}")
        
        # Record scheduling information
        self.current_session.session_data['posttest'] = {
            'scheduled_time': posttest_time.isoformat(),
            'generated': True
        }
    
    def _save_session_data(self):
        """Save session data to JSON file"""
        data_file = self.current_session.data_dir / "session_data.json"
        
        with open(data_file, 'w') as f:
            json.dump(self.current_session.session_data, f, indent=2)

def main():
    parser = argparse.ArgumentParser(description='Experimental Controller for Vocabulary Learning Study')
    parser.add_argument('--participant-id', required=True, help='Participant ID (e.g., 001)')
    parser.add_argument('--start-experiment', action='store_true', help='Start new experimental session')
    parser.add_argument('--resume-block', type=int, help='Resume at specific block number')
    parser.add_argument('--condition-order', choices=['ABAB', 'BABA'], help='Force specific condition order')
    
    args = parser.parse_args()
    
    controller = ExperimentalController()
    
    if args.start_experiment:
        controller.start_experiment(args.participant_id, args.condition_order)
    elif args.resume_block:
        controller.resume_experiment(args.participant_id, args.resume_block)
    else:
        print("Please specify --start-experiment or --resume-block")

if __name__ == "__main__":
    main()