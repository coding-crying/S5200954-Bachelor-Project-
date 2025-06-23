#!/usr/bin/env python3
"""
Automated 24-Hour Posttest Scheduler

This script manages automated scheduling and delivery of posttest forms 
exactly 24 hours after experimental session completion.

Features:
- Email service integration for automated delivery
- Participant tracking and follow-up management
- Google Forms integration for posttest generation
- Retry logic for failed deliveries
- Logging and monitoring capabilities

Usage:
    python automated_scheduler.py --schedule-participant 001
    python automated_scheduler.py --check-pending
    python automated_scheduler.py --send-reminders
"""

import argparse
import json
import smtplib
import time
import subprocess
from datetime import datetime, timedelta
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from pathlib import Path
from typing import Dict, List, Optional
import schedule
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)

class PosttestScheduler:
    def __init__(self, config_file: str = 'scheduler_config.json'):
        self.config_file = config_file
        self.config = self.load_config()
        self.scheduled_tests_file = Path('scheduled_tests.json')
        self.scheduled_tests = self.load_scheduled_tests()
        
    def load_config(self) -> Dict:
        """Load scheduler configuration"""
        default_config = {
            'email': {
                'smtp_server': 'smtp.gmail.com',
                'smtp_port': 587,
                'sender_email': 'researcher@university.edu',
                'sender_password': 'your_app_password',
                'sender_name': 'Vocabulary Learning Research Team'
            },
            'timing': {
                'posttest_delay_hours': 24,
                'reminder_delay_hours': 25,
                'max_reminders': 2
            },
            'templates': {
                'posttest_subject': 'Vocabulary Learning Study - 24-Hour Assessment',
                'reminder_subject': 'Reminder: Vocabulary Assessment Awaiting Completion'
            }
        }
        
        try:
            if Path(self.config_file).exists():
                with open(self.config_file, 'r') as f:
                    user_config = json.load(f)
                    default_config.update(user_config)
        except Exception as e:
            logging.warning(f"Could not load config file: {e}, using defaults")
            
        return default_config
    
    def save_config(self):
        """Save current configuration"""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def load_scheduled_tests(self) -> List[Dict]:
        """Load scheduled tests from file"""
        if not self.scheduled_tests_file.exists():
            return []
            
        try:
            with open(self.scheduled_tests_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logging.error(f"Error loading scheduled tests: {e}")
            return []
    
    def save_scheduled_tests(self):
        """Save scheduled tests to file"""
        with open(self.scheduled_tests_file, 'w') as f:
            json.dump(self.scheduled_tests, f, indent=2, default=str)
    
    def schedule_participant_posttest(self, participant_id: str, participant_email: str = None):
        """Schedule posttest for a participant"""
        session_complete_time = datetime.now()
        posttest_time = session_complete_time + timedelta(hours=self.config['timing']['posttest_delay_hours'])
        
        # Generate posttest form
        form_url = self.generate_posttest_form(participant_id)
        
        if not form_url:
            logging.error(f"Failed to generate posttest form for participant {participant_id}")
            return False
        
        # Create scheduled test entry
        scheduled_test = {
            'participant_id': participant_id,
            'participant_email': participant_email or f"participant_{participant_id}@study.edu",
            'session_complete_time': session_complete_time.isoformat(),
            'scheduled_posttest_time': posttest_time.isoformat(),
            'form_url': form_url,
            'email_sent': False,
            'test_completed': False,
            'reminders_sent': 0,
            'created_at': datetime.now().isoformat()
        }
        
        self.scheduled_tests.append(scheduled_test)
        self.save_scheduled_tests()
        
        logging.info(f"Scheduled posttest for participant {participant_id} at {posttest_time}")
        return True
    
    def generate_posttest_form(self, participant_id: str) -> Optional[str]:
        """Generate Google Forms posttest for participant"""
        try:
            # Run the existing posttest generator
            result = subprocess.run([
                'python', 'post_test_generator.py',
                '--participant-id', participant_id,
                '--output-url'
            ], capture_output=True, text=True, check=True)
            
            # Extract form URL from output
            output_lines = result.stdout.strip().split('\n')
            for line in output_lines:
                if 'https://docs.google.com/forms' in line:
                    return line.strip()
            
            logging.warning(f"Could not extract form URL from generator output for participant {participant_id}")
            return None
            
        except subprocess.CalledProcessError as e:
            logging.error(f"Error generating posttest form: {e}")
            return None
    
    def check_and_send_pending_tests(self):
        """Check for tests that need to be sent and send them"""
        current_time = datetime.now()
        sent_count = 0
        
        for test in self.scheduled_tests:
            if test['email_sent'] or test['test_completed']:
                continue
                
            scheduled_time = datetime.fromisoformat(test['scheduled_posttest_time'])
            
            if current_time >= scheduled_time:
                if self.send_posttest_email(test):
                    test['email_sent'] = True
                    test['email_sent_time'] = current_time.isoformat()
                    sent_count += 1
                    logging.info(f"Sent posttest email to participant {test['participant_id']}")
        
        if sent_count > 0:
            self.save_scheduled_tests()
            logging.info(f"Sent {sent_count} posttest emails")
    
    def send_posttest_email(self, test: Dict) -> bool:
        """Send posttest email to participant"""
        try:
            # Create email content
            subject = self.config['templates']['posttest_subject']
            body = self.generate_posttest_email_body(test)
            
            # Send email
            return self.send_email(
                to_email=test['participant_email'],
                subject=subject,
                body=body
            )
            
        except Exception as e:
            logging.error(f"Error sending posttest email to {test['participant_id']}: {e}")
            return False
    
    def generate_posttest_email_body(self, test: Dict) -> str:
        """Generate email body for posttest invitation"""
        participant_id = test['participant_id']
        form_url = test['form_url']
        
        body = f"""
Dear Participant {participant_id},

Thank you for participating in our vocabulary learning research study yesterday. 

It's now time for the final part of the study - a brief 15-minute assessment to measure what you learned during the vocabulary sessions. This assessment is crucial for our research and your participation helps advance our understanding of effective language learning methods.

Please complete the assessment by clicking the link below:

{form_url}

Important reminders:
• The assessment should take approximately 15 minutes
• Please complete it in one sitting without external help
• Try to answer all questions to the best of your ability
• You have 24 hours from receiving this email to complete the assessment

If you experience any technical difficulties or have questions, please reply to this email immediately.

Thank you again for your valuable contribution to this research.

Best regards,
Vocabulary Learning Research Team
Bachelor's Thesis Study
"""
        return body.strip()
    
    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Send email via SMTP"""
        try:
            msg = MimeMultipart()
            msg['From'] = f"{self.config['email']['sender_name']} <{self.config['email']['sender_email']}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MimeText(body, 'plain'))
            
            # Connect to SMTP server
            server = smtplib.SMTP(self.config['email']['smtp_server'], self.config['email']['smtp_port'])
            server.starttls()
            server.login(self.config['email']['sender_email'], self.config['email']['sender_password'])
            
            # Send email
            text = msg.as_string()
            server.sendmail(self.config['email']['sender_email'], to_email, text)
            server.quit()
            
            return True
            
        except Exception as e:
            logging.error(f"SMTP error sending to {to_email}: {e}")
            return False
    
    def send_reminders(self):
        """Send reminder emails for incomplete tests"""
        current_time = datetime.now()
        reminder_count = 0
        
        for test in self.scheduled_tests:
            if test['test_completed'] or test['reminders_sent'] >= self.config['timing']['max_reminders']:
                continue
                
            if not test['email_sent']:
                continue
                
            # Check if reminder is due
            email_sent_time = datetime.fromisoformat(test['email_sent_time'])
            reminder_due_time = email_sent_time + timedelta(hours=self.config['timing']['reminder_delay_hours'] - self.config['timing']['posttest_delay_hours'])
            
            if current_time >= reminder_due_time:
                if self.send_reminder_email(test):
                    test['reminders_sent'] += 1
                    test[f'reminder_{test["reminders_sent"]}_sent_time'] = current_time.isoformat()
                    reminder_count += 1
                    logging.info(f"Sent reminder {test['reminders_sent']} to participant {test['participant_id']}")
        
        if reminder_count > 0:
            self.save_scheduled_tests()
            logging.info(f"Sent {reminder_count} reminder emails")
    
    def send_reminder_email(self, test: Dict) -> bool:
        """Send reminder email for incomplete posttest"""
        try:
            subject = self.config['templates']['reminder_subject']
            body = self.generate_reminder_email_body(test)
            
            return self.send_email(
                to_email=test['participant_email'],
                subject=subject,
                body=body
            )
            
        except Exception as e:
            logging.error(f"Error sending reminder to {test['participant_id']}: {e}")
            return False
    
    def generate_reminder_email_body(self, test: Dict) -> str:
        """Generate reminder email body"""
        participant_id = test['participant_id']
        form_url = test['form_url']
        reminder_num = test['reminders_sent'] + 1
        
        body = f"""
Dear Participant {participant_id},

This is a friendly reminder that you have not yet completed the vocabulary assessment for our research study.

Your participation is very important to the success of this research, and we would greatly appreciate if you could complete the assessment as soon as possible.

Assessment link: {form_url}

The assessment takes approximately 15 minutes and should be completed in one sitting. If you are experiencing any technical difficulties, please reply to this email.

Thank you for your time and contribution to this research.

Best regards,
Vocabulary Learning Research Team
"""
        return body.strip()
    
    def mark_test_completed(self, participant_id: str):
        """Mark a test as completed"""
        for test in self.scheduled_tests:
            if test['participant_id'] == participant_id and not test['test_completed']:
                test['test_completed'] = True
                test['completion_time'] = datetime.now().isoformat()
                self.save_scheduled_tests()
                logging.info(f"Marked test completed for participant {participant_id}")
                return True
        return False
    
    def get_status_report(self) -> Dict:
        """Generate status report of all scheduled tests"""
        total_tests = len(self.scheduled_tests)
        emails_sent = sum(1 for test in self.scheduled_tests if test['email_sent'])
        completed_tests = sum(1 for test in self.scheduled_tests if test['test_completed'])
        pending_tests = total_tests - completed_tests
        
        return {
            'total_scheduled': total_tests,
            'emails_sent': emails_sent,
            'tests_completed': completed_tests,
            'tests_pending': pending_tests,
            'completion_rate': completed_tests / total_tests if total_tests > 0 else 0
        }
    
    def run_scheduler_daemon(self):
        """Run the scheduler as a daemon process"""
        logging.info("Starting posttest scheduler daemon...")
        
        # Schedule regular checks
        schedule.every(5).minutes.do(self.check_and_send_pending_tests)
        schedule.every(30).minutes.do(self.send_reminders)
        schedule.every().hour.do(self.log_status)
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def log_status(self):
        """Log current status"""
        status = self.get_status_report()
        logging.info(f"Status: {status['tests_completed']}/{status['total_scheduled']} completed, "
                    f"{status['tests_pending']} pending")

def main():
    parser = argparse.ArgumentParser(description='Automated Posttest Scheduler')
    parser.add_argument('--schedule-participant', help='Schedule posttest for participant ID')
    parser.add_argument('--participant-email', help='Participant email address')
    parser.add_argument('--check-pending', action='store_true', help='Check and send pending tests')
    parser.add_argument('--send-reminders', action='store_true', help='Send reminder emails')
    parser.add_argument('--mark-completed', help='Mark test as completed for participant ID')
    parser.add_argument('--status', action='store_true', help='Show status report')
    parser.add_argument('--daemon', action='store_true', help='Run as daemon process')
    
    args = parser.parse_args()
    
    scheduler = PosttestScheduler()
    
    if args.schedule_participant:
        success = scheduler.schedule_participant_posttest(args.schedule_participant, args.participant_email)
        if success:
            print(f"✅ Scheduled posttest for participant {args.schedule_participant}")
        else:
            print(f"❌ Failed to schedule posttest for participant {args.schedule_participant}")
    
    if args.check_pending:
        print("🔍 Checking for pending tests...")
        scheduler.check_and_send_pending_tests()
        print("✅ Pending test check complete")
    
    if args.send_reminders:
        print("📧 Sending reminder emails...")
        scheduler.send_reminders()
        print("✅ Reminder check complete")
    
    if args.mark_completed:
        success = scheduler.mark_test_completed(args.mark_completed)
        if success:
            print(f"✅ Marked test completed for participant {args.mark_completed}")
        else:
            print(f"❌ Could not find pending test for participant {args.mark_completed}")
    
    if args.status:
        status = scheduler.get_status_report()
        print("\n📊 Scheduler Status Report:")
        print(f"   Total Scheduled: {status['total_scheduled']}")
        print(f"   Emails Sent: {status['emails_sent']}")
        print(f"   Tests Completed: {status['tests_completed']}")
        print(f"   Tests Pending: {status['tests_pending']}")
        print(f"   Completion Rate: {status['completion_rate']:.1%}")
    
    if args.daemon:
        scheduler.run_scheduler_daemon()

if __name__ == "__main__":
    main()