#!/usr/bin/env python3
"""
Test Optimized Retrieval Algorithm

This script tests the optimized expanding retrieval algorithm for short learning sessions.
It simulates a complete 30-minute learning session (10 min learn, 10 min break, 10 min learn)
and tracks the retrieval schedule for vocabulary words.
"""

import sys
import os
import logging
import time
from typing import List, Dict, Any
from datetime import datetime, timedelta

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('test_optimized_retrieval')

# Import the simple effectiveness analyzer
try:
    from simple_effectiveness_analyzer import SimpleEffectivenessAnalyzer
    logger.info("Successfully imported SimpleEffectivenessAnalyzer")
except ImportError as e:
    logger.error(f"Error importing SimpleEffectivenessAnalyzer: {e}")
    sys.exit(1)

# Import the vocabulary store
try:
    from vocab_store import vocab_store
    logger.info("Successfully imported vocab_store")
except ImportError as e:
    logger.error(f"Error importing vocab_store: {e}")
    sys.exit(1)


def reset_test_words(words: List[str]) -> None:
    """
    Reset test words to their initial state.
    """
    for word in words:
        vocab_store.update_word(
            word,
            time_last_seen='0',
            correct_uses='0',
            total_uses='0',
            next_due='0'
        )
        vocab_store.update_srs(
            word,
            quality=0,
            new_ef=2.5,
            new_interval=1,
            new_repetitions=0
        )
        logger.info(f"Reset word: {word}")


def print_word_info(word: str) -> Dict[str, Any]:
    """
    Print information about a vocabulary word and return the word data.
    """
    word_data = vocab_store.get_word(word)
    if not word_data:
        logger.info(f"Word '{word}' not found in vocabulary store")
        return {}

    logger.info(f"Word: {word}")
    logger.info(f"  Time last seen: {word_data.get('time_last_seen', '0')}")
    logger.info(f"  Correct uses: {word_data.get('correct_uses', '0')}")
    logger.info(f"  Total uses: {word_data.get('total_uses', '0')}")
    logger.info(f"  Next due: {word_data.get('next_due', '0')}")
    logger.info(f"  EF: {word_data.get('EF', '2.5')}")
    logger.info(f"  Interval: {word_data.get('interval', '1')}")
    logger.info(f"  Repetitions: {word_data.get('repetitions', '0')}")
    
    return word_data


def simulate_optimized_retrieval(analyzer: SimpleEffectivenessAnalyzer, word: str) -> None:
    """
    Simulate the optimized expanding retrieval schedule for a single word.
    
    This simulates the complete 30-minute learning session with:
    - First 10-min session: retrievals at 2, 5, and 8 minutes after initial exposure
    - 10-min break
    - Second 10-min session: retrievals at 12, 16, and 20 minutes after initial exposure
    """
    # Reset the word
    reset_test_words([word])
    
    # Initial exposure (0 min)
    logger.info(f"\n=== INITIAL EXPOSURE (0 min) ===")
    test_text = f"Let me introduce the word '{word}'. It means something important."
    result = analyzer.analyze_conversation(test_text)
    word_data = print_word_info(word)
    
    # Track the retrieval schedule
    retrieval_schedule = [2, 5, 8, 12, 16, 20]
    
    # Simulate each retrieval point
    for i, retrieval_point in enumerate(retrieval_schedule):
        # Calculate the time since initial exposure
        if retrieval_point < 10:
            phase = "First 10-min session"
        elif retrieval_point < 20:
            phase = "Second 10-min session"
        else:
            phase = "End of second 10-min session"
            
        logger.info(f"\n=== RETRIEVAL {i+1} ({retrieval_point} min, {phase}) ===")
        
        # Simulate different quality levels (3-5 for successful retrievals)
        quality = 4  # Moderate success
        
        # Create a test text that includes the word
        test_text = f"Let's practice the word '{word}'. Can you use it in a sentence?"
        logger.info(f"Retrieving word: {word} (quality: {quality})")
        
        # Process the text with the analyzer
        result = analyzer.analyze_conversation(test_text)
        
        # Print updated word info
        word_data = print_word_info(word)
        
        # Calculate when the next retrieval would be
        next_due = int(word_data.get('next_due', 0))
        current_time = int(time.time())
        minutes_until_next_retrieval = (next_due - current_time) / 60
        
        logger.info(f"  Next retrieval in: {minutes_until_next_retrieval:.1f} minutes")
        
        # Simulate time passing until the next retrieval point
        if i < len(retrieval_schedule) - 1:
            next_point = retrieval_schedule[i+1]
            time_to_next = next_point - retrieval_point
            logger.info(f"  Waiting {time_to_next} minutes until next retrieval...")
            time.sleep(1)  # Just a short delay for testing
    
    # Final check - 24-hour retention
    logger.info(f"\n=== 24-HOUR RETENTION CHECK ===")
    
    # Simulate 24 hours passing
    logger.info("Simulating 24 hours passing...")
    
    # Simulate a successful 24-hour retention check
    quality = 5  # Excellent recall
    
    # Create a test text for the 24-hour check
    test_text = f"24-hour retention check for '{word}'. How well do you remember it?"
    logger.info(f"Checking 24-hour retention: {word} (quality: {quality})")
    
    # Process the text with the analyzer
    result = analyzer.analyze_conversation(test_text)
    
    # Print updated word info
    word_data = print_word_info(word)
    
    # Calculate when the next review would be
    next_due = int(word_data.get('next_due', 0))
    current_time = int(time.time())
    hours_until_next_review = (next_due - current_time) / 3600
    
    logger.info(f"  Next review in: {hours_until_next_review:.1f} hours")


def main():
    """
    Main function to test the optimized retrieval algorithm.
    """
    logger.info("Starting test_optimized_retrieval.py")
    
    # Get all words from the vocabulary store
    all_words = vocab_store.get_all_words()
    logger.info(f"Found {len(all_words)} words in vocabulary store")
    
    # Select a word to test
    test_word = all_words[20]['word']  # Use a different word than previous tests
    logger.info(f"Selected test word: {test_word}")
    
    # Create a test analyzer
    analyzer = SimpleEffectivenessAnalyzer(vocab_store)
    
    # Simulate the optimized retrieval schedule
    simulate_optimized_retrieval(analyzer, test_word)
    
    logger.info("Test completed")


if __name__ == "__main__":
    main()
