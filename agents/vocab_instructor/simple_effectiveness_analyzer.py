"""
Simple Vocabulary Effectiveness Analyzer Module

This module provides a simpler alternative to the GPT-powered effectiveness analyzer.
It analyzes conversation text to identify vocabulary words and updates the vocabulary
store with usage statistics and review timing based on a simple decay model.
"""

import re
import time
import logging
import os
from typing import List, Dict, Any, Optional, Set, Tuple
from datetime import datetime, timedelta

# Use absolute imports instead of relative imports
try:
    from vocab_store import VocabularyStore, vocab_store
except ImportError:
    # Try alternative import paths
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from vocab_store import VocabularyStore, vocab_store

# Set up logging
log_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'simple_analyzer.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('simple_effectiveness_analyzer')


class SimpleEffectivenessAnalyzer:
    """
    A simpler class for analyzing vocabulary word usage in conversations
    and determining appropriate review timing based on a decay model.
    """

    def __init__(self, vocab_store_instance=None):
        """
        Initialize the SimpleEffectivenessAnalyzer with a vocabulary store instance.

        Args:
            vocab_store_instance: Instance of VocabularyStore (default: global vocab_store)
        """
        self.vocab_store = vocab_store_instance or vocab_store
        self.word_cache = self._build_word_cache()
        logger.info(f"SimpleEffectivenessAnalyzer initialized with {len(self.word_cache)} words in cache")

    def _build_word_cache(self) -> Set[str]:
        """
        Build a cache of vocabulary words for faster lookup.

        Returns:
            Set of vocabulary words (lowercase)
        """
        words = self.vocab_store.get_all_words()
        return {word['word'].lower() for word in words}

    def refresh_word_cache(self):
        """
        Refresh the word cache with the latest vocabulary words.
        """
        self.word_cache = self._build_word_cache()
        logger.info(f"Word cache refreshed with {len(self.word_cache)} words")

    def analyze_conversation(self, current_text: str, previous_texts: List[str] = None) -> Dict[str, Any]:
        """
        Analyze conversation text to identify vocabulary words and update their usage statistics.

        Args:
            current_text: The current text to analyze
            previous_texts: Optional list of previous conversation texts for context (not used in this implementation)

        Returns:
            Dictionary with analysis results
        """
        if not current_text or not current_text.strip():
            return {"processed": False, "reason": "Empty text", "words_analyzed": []}

        # Normalize text and find words
        normalized_text = current_text.lower()
        words = re.findall(r'\b[a-z]+\b', normalized_text)

        # Filter to only include words that are in our vocabulary
        vocab_words_in_text = [word for word in words if word in self.word_cache]

        if not vocab_words_in_text:
            logger.info("No vocabulary words found in text")
            return {"processed": True, "words_analyzed": [], "reason": "No vocabulary words found in text"}

        logger.info(f"Found {len(vocab_words_in_text)} vocabulary words in text: {vocab_words_in_text}")

        # Process each word found in the text
        current_time = int(time.time())
        words_analyzed = []

        for word in vocab_words_in_text:
            try:
                # Get current word data
                word_data = self.vocab_store.get_word(word)

                # Determine if the word was used correctly (simple heuristic)
                # In a real implementation, you might use more sophisticated methods
                # For now, we'll assume the word was used correctly
                used_correctly = True

                # Update usage statistics
                correct_uses = int(word_data.get('correct_uses', 0))
                total_uses = int(word_data.get('total_uses', 0))

                if used_correctly:
                    correct_uses += 1
                total_uses += 1

                # Calculate effectiveness score (1-5) based on correct_uses / total_uses ratio
                if total_uses > 0:
                    effectiveness_ratio = correct_uses / total_uses
                    # Map ratio to 1-5 scale
                    review_score = min(5, max(1, round(effectiveness_ratio * 5)))
                else:
                    review_score = 3  # Default middle score

                # Calculate new SRS parameters based on review score
                ef, interval, repetitions = self._calculate_srs_parameters(
                    word_data, review_score
                )

                # Update the vocabulary store
                self.vocab_store.update_word(
                    word,
                    time_last_seen=current_time,
                    correct_uses=correct_uses,
                    total_uses=total_uses
                )

                # Update SRS parameters
                self.vocab_store.update_srs(
                    word,
                    quality=review_score,
                    new_ef=ef,
                    new_interval=interval,
                    new_repetitions=repetitions
                )

                logger.info(f"Updated word: {word}, review score: {review_score}, EF: {ef}, interval: {interval}")

                # Add to words analyzed
                words_analyzed.append({
                    "word": word,
                    "review_score": review_score,
                    "explanation": f"Word used in conversation. Correct uses: {correct_uses}, Total uses: {total_uses}"
                })

            except Exception as e:
                logger.error(f"Error processing word {word}: {str(e)}")

        return {
            "processed": True,
            "text": current_text,
            "analysis": {"words_analyzed": words_analyzed},
            "timestamp": current_time
        }

    def _calculate_srs_parameters(self, word_data: Dict[str, Any], quality: int) -> Tuple[float, int, int]:
        """
        Calculate new SRS parameters based on an optimized expanding retrieval algorithm for:
        1. Short learning sessions (10 min learn, 10 min break, 10 min learn)
        2. Maximizing retrieval practice within the 30-minute training phase

        The algorithm implements an expanding retrieval schedule with:
        - First 10-min session: retrievals at 2, 5, and 8 minutes after initial exposure
        - 10-min break
        - Second 10-min session: retrievals at 12, 16, and 20 minutes after initial exposure

        This is based on research showing that expanding retrieval intervals are optimal
        for short-term learning sessions and vocabulary acquisition.

        Args:
            word_data: Current word data from the vocabulary store
            quality: Quality of response (1-5)

        Returns:
            Tuple of (ease_factor, interval, repetitions)
        """
        # Get current SRS parameters
        ef = float(word_data.get('EF', 2.5))
        interval = int(word_data.get('interval', 1))
        repetitions = int(word_data.get('repetitions', 0))
        time_last_seen = int(word_data.get('time_last_seen', 0))
        current_time = int(time.time())

        # Adjust quality to 0-5 scale for algorithm
        adjusted_quality = quality - 1

        # Optimized expanding retrieval schedule for 30-minute learning session
        # Based on research showing expanding intervals are optimal for short-term learning

        # Define the optimal retrieval schedule (in minutes from initial exposure)
        retrieval_schedule = [2, 5, 8, 12, 16, 20]

        # Determine which retrieval point we're at based on repetitions
        if repetitions < len(retrieval_schedule):
            # We're still within the 30-minute learning session
            # Set the next interval based on the expanding retrieval schedule
            next_retrieval_point = retrieval_schedule[repetitions]

            if repetitions > 0:
                # Calculate the interval from the previous retrieval point
                previous_retrieval_point = retrieval_schedule[repetitions - 1]
                interval = next_retrieval_point - previous_retrieval_point
            else:
                # First retrieval should happen 2 minutes after initial exposure
                interval = next_retrieval_point

            # Adjust interval based on quality of response
            # If quality is low, shorten the interval to provide more practice
            if adjusted_quality < 3:
                interval = max(1, interval // 2)  # Minimum interval of 1 minute

            repetitions += 1

        else:
            # We've completed all retrievals in the 30-minute session
            # Now set up for the 24-hour retention check
            repetitions += 1

            if adjusted_quality >= 3:
                # If recalled well, set for 24-hour review
                interval = 1440  # 24 hours in minutes
            else:
                # If not recalled well, review sooner
                interval = 720  # 12 hours in minutes

        # Update ease factor based on quality
        # Higher quality = higher ease factor (easier to remember)
        ef_adjustment = 0.1 * (adjusted_quality - 2)  # -0.2 to +0.2 adjustment
        ef = max(1.3, ef + ef_adjustment)  # Minimum ease factor of 1.3

        # Calculate next due time in seconds from now
        next_due = int(time.time()) + (interval * 60)  # interval in minutes to seconds

        # Update the next_due time in the vocabulary store
        try:
            self.vocab_store.update_word(word_data['word'], next_due=next_due)
        except Exception as e:
            logger.error(f"Error updating next_due for word {word_data['word']}: {str(e)}")

        logger.info(f"Optimized retrieval for word {word_data['word']}: quality={quality}, " +
                   f"repetitions={repetitions}, interval={interval} minutes, " +
                   f"next retrieval in {interval} minutes")

        return ef, interval, repetitions


# Create a singleton instance for easy access
simple_effectiveness_analyzer = SimpleEffectivenessAnalyzer()
