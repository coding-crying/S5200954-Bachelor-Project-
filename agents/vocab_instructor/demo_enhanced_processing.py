#!/usr/bin/env python3
"""
Enhanced Vocabulary Instructor Demo

This script demonstrates the updated vocabularyInstructor agent using the enhanced
conversation processing endpoint. It shows how to process user messages with context
to handle split messages effectively.
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
logger = logging.getLogger('vocab_instructor_demo')

# Import the conversation processor
try:
    from .conversation_processor import conversation_processor
    logger.info("Successfully imported conversation_processor")
except ImportError:
    try:
        # Fallback for direct execution
        import conversation_processor
        conversation_processor = conversation_processor.conversation_processor
        logger.info("Successfully imported conversation_processor (fallback)")
    except ImportError as e:
        logger.error(f"Error importing conversation_processor: {e}")
        sys.exit(1)

# Import the vocabulary store
try:
    from .vocab_store import vocab_store
    logger.info("Successfully imported vocab_store")
except ImportError:
    try:
        # Fallback for direct execution
        import vocab_store
        vocab_store = vocab_store.vocab_store
        logger.info("Successfully imported vocab_store (fallback)")
    except ImportError as e:
        logger.error(f"Error importing vocab_store: {e}")
        sys.exit(1)


def print_word_info(word):
    """Print information about a vocabulary word."""
    word_data = vocab_store.get_word(word)
    if word_data:
        logger.info(f"  Word: {word}")
        logger.info(f"    Total uses: {word_data.get('total_uses', 0)}")
        logger.info(f"    Correct uses: {word_data.get('correct_uses', 0)}")
        logger.info(f"    Last seen: {word_data.get('time_last_seen', 'Never')}")

        # Calculate accuracy
        total = int(word_data.get('total_uses', 0))
        correct = int(word_data.get('correct_uses', 0))
        accuracy = (correct / total * 100) if total > 0 else 0
        logger.info(f"    Accuracy: {accuracy:.1f}%")
    else:
        logger.info(f"  Word '{word}' not found in vocabulary store")


def demo_single_message_processing():
    """Demonstrate processing a single user message."""
    logger.info("=== Single Message Processing Demo ===")

    # Test message with vocabulary words
    test_message = "I was running to the store when I saw beautiful flowers blooming in the garden."

    logger.info(f"Processing message: '{test_message}'")

    # Process the message
    result = conversation_processor.process_user_message(test_message)

    if result.get("processed", False):
        analysis = result.get("analysis", {})
        words_analyzed = analysis.get("words_analyzed", [])

        logger.info(f"✅ Processing successful!")
        logger.info(f"Words analyzed: {len(words_analyzed)}")
        logger.info(f"Learning effectiveness: {analysis.get('learning_effectiveness', 0.0):.2f}")

        for word_info in words_analyzed:
            word = word_info.get("word", "")
            found_form = word_info.get("found_form", "")
            used_correctly = word_info.get("used_correctly", False)
            confidence = word_info.get("confidence", 0.0)

            logger.info(f"  📝 Found: '{found_form}' -> '{word}' (correct: {used_correctly}, confidence: {confidence:.2f})")
    else:
        logger.error(f"❌ Processing failed: {result.get('reason', 'Unknown error')}")


def demo_split_message_processing():
    """Demonstrate processing split messages with context."""
    logger.info("\n=== Split Message Processing Demo ===")

    # Simulate split messages
    message_parts = [
        "I was thinking about",
        "the beautiful flowers",
        "that were blooming yesterday"
    ]

    logger.info("Simulating split messages:")
    for i, part in enumerate(message_parts):
        logger.info(f"  Part {i+1}: '{part}'")

    # Process the final part with context from previous parts
    current_message = message_parts[-1]
    context_messages = message_parts[:-1]

    logger.info(f"Processing final part with context...")

    result = conversation_processor.process_user_message(current_message, context_messages)

    if result.get("processed", False):
        analysis = result.get("analysis", {})
        words_analyzed = analysis.get("words_analyzed", [])

        logger.info(f"✅ Processing successful!")
        logger.info(f"Combined text analyzed: '{result.get('text', '')}'")
        logger.info(f"Words analyzed: {len(words_analyzed)}")
        logger.info(f"Learning effectiveness: {analysis.get('learning_effectiveness', 0.0):.2f}")

        for word_info in words_analyzed:
            word = word_info.get("word", "")
            found_form = word_info.get("found_form", "")
            used_correctly = word_info.get("used_correctly", False)
            confidence = word_info.get("confidence", 0.0)

            logger.info(f"  📝 Found: '{found_form}' -> '{word}' (correct: {used_correctly}, confidence: {confidence:.2f})")
    else:
        logger.error(f"❌ Processing failed: {result.get('reason', 'Unknown error')}")


def demo_vocabulary_tracking():
    """Demonstrate vocabulary word tracking over time."""
    logger.info("\n=== Vocabulary Tracking Demo ===")

    # Get some words from the vocabulary store
    all_words = vocab_store.get_all_words()
    if not all_words:
        logger.warning("No vocabulary words found in store")
        return

    # Select a few words to track
    test_words = [word['word'] for word in all_words[:3]]
    logger.info(f"Tracking words: {test_words}")

    # Show initial state
    logger.info("Initial word states:")
    for word in test_words:
        print_word_info(word)

    # Process a message containing these words
    test_message = f"I love {test_words[0]} and {test_words[1]} because they are {test_words[2]}."
    logger.info(f"\nProcessing test message: '{test_message}'")

    result = conversation_processor.process_user_message(test_message)

    if result.get("processed", False):
        logger.info("✅ Processing completed!")

        # Show updated states
        logger.info("\nUpdated word states:")
        for word in test_words:
            print_word_info(word)
    else:
        logger.error(f"❌ Processing failed: {result.get('reason', 'Unknown error')}")


def main():
    """Main function to run the enhanced vocabulary instructor demo."""
    logger.info("🚀 Starting Enhanced Vocabulary Instructor Demo")
    logger.info("=" * 60)

    # Check if the vocabulary store has words
    all_words = vocab_store.get_all_words()
    logger.info(f"Found {len(all_words)} words in vocabulary store")

    if len(all_words) == 0:
        logger.warning("No vocabulary words found. Please ensure vocabulary.csv is populated.")
        return

    try:
        # Run demos
        demo_single_message_processing()
        demo_split_message_processing()
        demo_vocabulary_tracking()

        logger.info("\n" + "=" * 60)
        logger.info("🎉 Demo completed successfully!")
        logger.info("The vocabularyInstructor agent is now using the enhanced conversation processing endpoint.")

    except Exception as e:
        logger.error(f"Demo failed with error: {str(e)}")
        raise


if __name__ == "__main__":
    main()
