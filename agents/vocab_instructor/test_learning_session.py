#!/usr/bin/env python3
"""
Test Learning Session

This script simulates a complete learning session with the modified SM-2 algorithm:
1. First 10-minute learning session
2. 10-minute break
3. Second 10-minute learning session
4. 24-hour retention check

It tests how the algorithm schedules words for review based on the learning session constraints.
"""

import sys
import os
import logging
import time
import random
from typing import List, Dict, Any

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
logger = logging.getLogger('test_learning_session')

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


def simulate_learning_session(analyzer: SimpleEffectivenessAnalyzer, test_words: List[str]) -> None:
    """
    Simulate a complete learning session with the modified SM-2 algorithm.
    """
    # Reset test words
    reset_test_words(test_words)

    logger.info("=== INITIAL STATE ===")
    for word in test_words:
        print_word_info(word)

    # Create a test analyzer
    analyzer = SimpleEffectivenessAnalyzer(vocab_store)

    # PHASE 1: First 10-minute learning session
    logger.info("\n=== PHASE 1: FIRST 10-MINUTE LEARNING SESSION ===")

    # Introduce words one by one with varying quality
    for i, word in enumerate(test_words):
        # Simulate different quality levels (1-5)
        quality = random.randint(3, 5)  # Most words are learned well initially

        # Create a test text that includes the word
        test_text = f"Let me introduce the word '{word}'. It means something important."
        logger.info(f"Introducing word {i+1}/{len(test_words)}: {word} (quality: {quality})")

        # Process the text with the analyzer
        result = analyzer.analyze_conversation(test_text)

        # Print updated word info
        word_data = print_word_info(word)

        # Simulate a short delay between words
        time.sleep(0.5)

    # PHASE 2: 10-minute break
    logger.info("\n=== PHASE 2: 10-MINUTE BREAK ===")
    logger.info("No vocabulary learning during this phase")
    time.sleep(1)  # Simulate the break (shortened for testing)

    # PHASE 3: Second 10-minute learning session
    logger.info("\n=== PHASE 3: SECOND 10-MINUTE LEARNING SESSION ===")

    # For testing purposes, we'll manually set the next_due time to be in the past
    # This simulates the 10-minute interval passing during the break
    current_time = int(time.time())
    for word in test_words:
        # Set next_due to be in the past
        vocab_store.update_word(word, next_due=str(current_time - 60))  # 1 minute ago

    # Review words that are due for review
    for i, word in enumerate(test_words):
        word_data = vocab_store.get_word(word)
        next_due = int(word_data.get('next_due', 0))
        current_time = int(time.time())

        if next_due <= current_time:
            # Word is due for review
            # Simulate different quality levels (1-5)
            quality = random.randint(2, 5)  # More variation in recall quality

            # Create a test text that includes the word
            test_text = f"Let's review the word '{word}'. Can you use it in a sentence?"
            logger.info(f"Reviewing word {i+1}/{len(test_words)}: {word} (quality: {quality})")

            # Process the text with the analyzer
            result = analyzer.analyze_conversation(test_text)

            # Print updated word info
            word_data = print_word_info(word)
        else:
            logger.info(f"Word {word} is not due for review yet. Next due: {next_due}, Current time: {current_time}")

        # Simulate a short delay between words
        time.sleep(0.5)

    # PHASE 4: 24-hour retention check
    logger.info("\n=== PHASE 4: 24-HOUR RETENTION CHECK ===")

    # Simulate 24 hours passing
    logger.info("Simulating 24 hours passing...")

    # For testing purposes, we'll manually set the next_due time to be in the past
    # This simulates 24 hours passing
    current_time = int(time.time())
    for word in test_words:
        # Set next_due to be in the past (24 hours + 1 minute ago)
        vocab_store.update_word(word, next_due=str(current_time - (24 * 60 * 60) - 60))

    # Review words after 24 hours
    logger.info("Reviewing words after 24 hours:")

    for i, word in enumerate(test_words):
        word_data = vocab_store.get_word(word)
        next_due = int(word_data.get('next_due', 0))
        current_time = int(time.time())

        # All words should be due for review now
        # Simulate different quality levels (1-5) for 24-hour retention
        quality = random.randint(1, 5)  # Full range of recall quality

        # Create a test text that includes the word
        test_text = f"24-hour retention check for '{word}'. How well do you remember it?"
        logger.info(f"Checking retention for word {i+1}/{len(test_words)}: {word} (quality: {quality})")

        # Process the text with the analyzer
        _ = analyzer.analyze_conversation(test_text)

        # Print updated word info
        word_data = print_word_info(word)

        # Calculate when the next review would be
        next_due = int(word_data.get('next_due', 0))
        hours_until_next_review = (next_due - current_time) / 3600

        logger.info(f"  Next review in: {hours_until_next_review:.1f} hours")

        # Simulate a short delay between words
        time.sleep(0.5)


def main():
    """
    Main function to test the learning session simulation.
    """
    logger.info("Starting test_learning_session.py")

    # Get all words from the vocabulary store
    all_words = vocab_store.get_all_words()
    logger.info(f"Found {len(all_words)} words in vocabulary store")

    # Select a few words to test
    test_words = [word['word'] for word in all_words[10:15]]  # Use different words than previous test
    logger.info(f"Selected test words: {test_words}")

    # Create a test analyzer
    analyzer = SimpleEffectivenessAnalyzer(vocab_store)

    # Simulate a learning session
    simulate_learning_session(analyzer, test_words)

    logger.info("Test completed")


if __name__ == "__main__":
    main()
