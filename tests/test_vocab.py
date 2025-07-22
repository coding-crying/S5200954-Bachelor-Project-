#!/usr/bin/env python3
"""
Simple test script for vocabulary store
"""

import os
import csv
import time

def main():
    """
    Test the vocabulary store by reading and updating the CSV file directly
    """
    # Path to the vocabulary CSV file
    csv_path = 'vocabulary.csv'
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return
    
    print(f"Reading vocabulary from {csv_path}")
    
    # Read the CSV file
    with open(csv_path, 'r', newline='') as f:
        reader = csv.DictReader(f)
        words = list(reader)
    
    print(f"Found {len(words)} words in the vocabulary")
    
    # Print the first 5 words
    print("\nFirst 5 words:")
    for i, word in enumerate(words[:5]):
        print(f"{i+1}. {word['word']}: last seen {word['time_last_seen']}, next due {word['next_due']}")
    
    # Update a word
    if words:
        word_to_update = words[0]['word']
        current_time = int(time.time())
        
        print(f"\nUpdating word: {word_to_update}")
        print(f"Current time: {current_time}")
        
        # Update the word
        for word in words:
            if word['word'] == word_to_update:
                word['time_last_seen'] = str(current_time)
                word['next_due'] = str(current_time + 86400)  # Due in 1 day
                word['EF'] = '2.6'
                word['interval'] = '2'
                word['repetitions'] = '1'
                break
        
        # Write the updated CSV file
        with open(csv_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=reader.fieldnames)
            writer.writeheader()
            writer.writerows(words)
        
        print(f"Updated {word_to_update} in the vocabulary")
        
        # Read the CSV file again to verify the update
        with open(csv_path, 'r', newline='') as f:
            reader = csv.DictReader(f)
            updated_words = list(reader)
        
        # Find the updated word
        for word in updated_words:
            if word['word'] == word_to_update:
                print(f"\nVerified update for {word_to_update}:")
                print(f"time_last_seen: {word['time_last_seen']}")
                print(f"next_due: {word['next_due']}")
                print(f"EF: {word['EF']}")
                print(f"interval: {word['interval']}")
                print(f"repetitions: {word['repetitions']}")
                break

if __name__ == "__main__":
    main()
