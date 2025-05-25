#!/usr/bin/env python3
"""
Test Effectiveness Analyzer

This script tests the effectiveness analyzer by analyzing a sample text
with vocabulary words and printing the results.
"""

import sys
import os
import json
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('test_effectiveness')

# Import the modules directly
import effectiveness_analyzer
import vocab_store

# Use the singleton instances
effectiveness_analyzer = effectiveness_analyzer.effectiveness_analyzer
vocab_store = vocab_store.vocab_store

def test_analyzer():
    """
    Test the effectiveness analyzer with a sample text.
    """
    # Get some vocabulary words from the store
    all_words = vocab_store.get_all_words()
    if not all_words:
        logger.error("No vocabulary words found in the store")
        return

    # Get the first 5 words
    sample_words = all_words[:5]
    sample_word_list = [word['word'] for word in sample_words]

    logger.info(f"Testing with words: {', '.join(sample_word_list)}")

    # Create a sample text with these words
    sample_text = f"""
    Let me use some vocabulary words in this text.

    I find the concept quite {sample_word_list[0]}, and it's important not to {sample_word_list[1]} the significance.
    The {sample_word_list[2]} nature of the problem requires careful consideration.
    I'm in a {sample_word_list[3]} about how to proceed, but I'll try to be {sample_word_list[4]} in my approach.
    """

    logger.info("Sample text created:")
    logger.info(sample_text)

    # Analyze the text
    logger.info("Analyzing text...")
    result = effectiveness_analyzer.analyze_conversation(sample_text)

    # Print the results
    logger.info("Analysis results:")
    logger.info(json.dumps(result, indent=2))

    # Check if any words were analyzed
    if result.get("processed") and "analysis" in result:
        words_analyzed = result["analysis"].get("words_analyzed", [])
        logger.info(f"Words analyzed: {len(words_analyzed)}")

        for word_info in words_analyzed:
            word = word_info.get("word", "")
            score = word_info.get("review_score", 0)
            explanation = word_info.get("explanation", "")
            logger.info(f"Word: {word}, Score: {score}, Explanation: {explanation}")
    else:
        logger.error(f"Analysis failed: {result.get('reason', 'Unknown reason')}")

def main():
    """
    Main function to run the test.
    """
    logger.info("Starting effectiveness analyzer test")

    try:
        # Print information about the vocabulary store
        logger.info(f"Vocabulary store path: {vocab_store.csv_path}")
        word_count = len(vocab_store.get_all_words())
        logger.info(f"Vocabulary store contains {word_count} words")

        # Test the analyzer
        test_analyzer()

        logger.info("Test completed")
    except Exception as e:
        logger.error(f"Error during test: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    main()
