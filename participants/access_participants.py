#!/usr/bin/env python3
"""
Password-protected access to participant data
Access password: paul-vogt
"""

import hashlib
import getpass
import os
import sys
from pathlib import Path

# Hashed password for security (sha256 of "paul-vogt")
CORRECT_PASSWORD_HASH = "c02561bbaef49511d1002c1994f91ccc4e031894866a6b852e89da28425dc64c"

def verify_password():
    """Verify the access password"""
    password = getpass.getpass("Enter access password for participant data: ")
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    if password_hash == CORRECT_PASSWORD_HASH:
        return True
    else:
        print("❌ Incorrect password. Access denied.")
        return False

def list_participants():
    """List available participants"""
    participants_dir = Path(".")
    participants = [d.name for d in participants_dir.iterdir() if d.is_dir() and d.name.startswith("participant_")]
    participants.sort()
    
    print(f"📊 Available participants: {len(participants)}")
    for p in participants:
        print(f"  - {p}")
    
    return participants

def access_participant_data(participant_id):
    """Access specific participant data"""
    participant_dir = Path(f"participant_{participant_id}")
    
    if not participant_dir.exists():
        print(f"❌ Participant {participant_id} not found")
        return
    
    print(f"📁 Accessing participant {participant_id} data:")
    
    # List files in participant directory
    files = list(participant_dir.iterdir())
    files.sort()
    
    for file in files:
        if file.is_file():
            print(f"  📄 {file.name}")
        else:
            print(f"  📁 {file.name}/")
    
    print(f"\\n💡 Data location: {participant_dir.absolute()}")

def main():
    """Main access function"""
    print("🔒 Participant Data Access System")
    print("=" * 40)
    
    # Verify password
    if not verify_password():
        sys.exit(1)
    
    print("✅ Access granted!")
    print()
    
    # List participants
    participants = list_participants()
    
    if len(sys.argv) > 1:
        # Access specific participant
        participant_id = sys.argv[1]
        access_participant_data(participant_id)
    else:
        print("\\n💡 Usage:")
        print(f"  python {sys.argv[0]} <participant_id>")
        print("  Example: python access_participants.py 001")

if __name__ == "__main__":
    main()