#!/usr/bin/env python3
"""
Test Simple Effectiveness Analyzer

This script tests the simple effectiveness analyzer by processing a sample text
and checking if it correctly updates the vocabulary store.
"""

import sys
import os
import logging
import time

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
logger = logging.getLogger('test_simple_analyzer')

# Import the simple effectiveness analyzer
try:
    from simple_effectiveness_analyzer import SimpleEffectivenessAnalyzer, simple_effectiveness_analyzer
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


def print_word_info(word):
    """
    Print information about a vocabulary word.
    """
    word_data = vocab_store.get_word(word)
    if not word_data:
        logger.info(f"Word '{word}' not found in vocabulary store")
        return

    logger.info(f"Word: {word}")
    logger.info(f"  Time last seen: {word_data.get('time_last_seen', '0')}")
    logger.info(f"  Correct uses: {word_data.get('correct_uses', '0')}")
    logger.info(f"  Total uses: {word_data.get('total_uses', '0')}")
    logger.info(f"  Next due: {word_data.get('next_due', '0')}")
    logger.info(f"  EF: {word_data.get('EF', '2.5')}")
    logger.info(f"  Interval: {word_data.get('interval', '1')}")
    logger.info(f"  Repetitions: {word_data.get('repetitions', '0')}")


def main():
    """
    Main function to test the simple effectiveness analyzer.
    """
    logger.info("Starting test_simple_analyzer.py")

    # Get all words from the vocabulary store
    all_words = vocab_store.get_all_words()
    logger.info(f"Found {len(all_words)} words in vocabulary store")

    # Select a few words to test
    test_words = [word['word'] for word in all_words[:5]]
    logger.info(f"Selected test words: {test_words}")

    # Print initial word information
    logger.info("Initial word information:")
    for word in test_words:
        print_word_info(word)

    # Create a test text that includes the test words
    test_text = f"Let me use some vocabulary words in this text. I will try to use {test_words[0]} and {test_words[1]} correctly. I might also mention {test_words[2]} and {test_words[3]}. Finally, I'll use {test_words[4]} in a sentence."
    logger.info(f"Test text: {test_text}")

    # Process the text with the simple effectiveness analyzer
    logger.info("Processing text with SimpleEffectivenessAnalyzer...")
    result = simple_effectiveness_analyzer.analyze_conversation(test_text)

    # Check the result
    logger.info(f"Processing result: {result['processed']}")
    if result['processed']:
        words_analyzed = result.get('analysis', {}).get('words_analyzed', [])
        logger.info(f"Words analyzed: {len(words_analyzed)}")
        for word_info in words_analyzed:
            logger.info(f"  Word: {word_info.get('word')}, Review score: {word_info.get('review_score')}")

    # Wait a moment for any background processing to complete
    time.sleep(1)

    # Print updated word information
    logger.info("Updated word information:")
    for word in test_words:
        print_word_info(word)

    logger.info("Test completed")


if __name__ == "__main__":
    main()
