"""
Vocabulary Effectiveness Analyzer Module

This module analyzes conversation text to evaluate how effectively vocabulary words
were used and determines appropriate review timing on a scale of 1-5. It integrates
with the vocabulary store to update spaced repetition parameters based on usage quality.
"""

import re
import time
import json
import logging
import os
from typing import List, Dict, Any, Optional, Set, Tuple
import requests
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
log_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'effectiveness_analyzer.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('effectiveness_analyzer')


class EffectivenessAnalyzer:
    """
    Class for analyzing the effectiveness of vocabulary word usage in conversations
    and determining appropriate review timing.
    """

    def __init__(self, vocab_store_instance=None, model="gpt-4.1-mini"):
        """
        Initialize the EffectivenessAnalyzer with a vocabulary store instance.

        Args:
            vocab_store_instance: Instance of VocabularyStore (default: global vocab_store)
            model: The model to use for analysis (default: gpt-4.1-mini)
        """
        self.vocab_store = vocab_store_instance or vocab_store
        self.model = model
        self.word_cache = self._build_word_cache()

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

    def analyze_conversation(self, current_text: str, previous_texts: List[str] = None) -> Dict[str, Any]:
        """
        Analyze conversation text to evaluate vocabulary word usage effectiveness
        and determine appropriate review timing.

        Args:
            current_text: The current text to analyze
            previous_texts: Optional list of previous conversation texts for context

        Returns:
            Dictionary with analysis results
        """
        if not current_text or not current_text.strip():
            return {"processed": False, "reason": "Empty text", "words_analyzed": []}

        # Combine current text with previous texts for context
        context_text = current_text
        if previous_texts:
            context_text = "\n".join(previous_texts[-3:] + [current_text])

        # First, identify words that are in our vocabulary
        vocab_words = list(self.word_cache)

        # Normalize text and find vocabulary words
        normalized_text = current_text.lower()
        words = re.findall(r'\b[a-z]+\b', normalized_text)

        # Filter to only include words that are in our vocabulary
        vocab_words_in_text = [word for word in words if word in self.word_cache]

        if not vocab_words_in_text:
            return {"processed": True, "words_analyzed": [], "reason": "No vocabulary words found in text"}

        # Create a prompt for the model
        prompt = f"""
        Analyze the following conversation text to evaluate how effectively vocabulary words were used.
        For each vocabulary word found, assess the quality of usage and determine an appropriate review timing score.

        Conversation:
        "{context_text}"

        Vocabulary words found in the text: {", ".join(vocab_words_in_text)}

        For each word, provide:
        1. A score from 1-5 indicating how soon the user should review this word:
           - 1: Very soon (user struggled with the word)
           - 2: Soon (user used it with some errors)
           - 3: Moderate timing (user used it correctly but hesitantly)
           - 4: Later (user used it correctly and confidently)
           - 5: Much later (user demonstrated mastery of the word)

        2. A brief explanation of your assessment

        Format your response as a JSON object with the following structure:
        {{
            "words_analyzed": [
                {{
                    "word": "example_word",
                    "review_score": 3,
                    "explanation": "Brief explanation of assessment"
                }}
            ]
        }}

        Only include words that actually appear in the text.
        """

        try:
            # Log the API request
            logger.info(f"Sending request to OpenAI API with model: {self.model}")
            logger.info(f"Vocabulary words in text: {vocab_words_in_text}")

            # Call the OpenAI API
            api_url = "http://localhost:3000/api/chat/completions"
            logger.info(f"API URL: {api_url}")

            request_data = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a language assessment assistant that evaluates vocabulary usage effectiveness and determines appropriate review timing."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 1000,
                "response_format": {"type": "json_object"}
            }

            try:
                # Set a timeout to avoid hanging
                response = requests.post(api_url, json=request_data, timeout=10)

                # Log the response status
                logger.info(f"API response status: {response.status_code}")

                if response.status_code != 200:
                    error_message = f"API error: {response.status_code}"
                    logger.error(error_message)
                    if response.text:
                        logger.error(f"Response text: {response.text}")
                    return {
                        "processed": False,
                        "reason": error_message,
                        "words_analyzed": []
                    }
            except requests.exceptions.RequestException as e:
                error_message = f"API request failed: {str(e)}"
                logger.error(error_message)

                # If the API is not available, use a fallback approach
                logger.info("Using fallback approach for word analysis")

                # Create a simple analysis based on word presence
                fallback_analysis = {
                    "words_analyzed": [
                        {
                            "word": word,
                            "review_score": 3,  # Default middle score
                            "explanation": "Analyzed using fallback method due to API unavailability"
                        }
                        for word in vocab_words_in_text
                    ]
                }

                # Use the fallback analysis
                analysis = fallback_analysis
                logger.info(f"Fallback analysis created for {len(vocab_words_in_text)} words")

                # Skip to the update section
                current_time = int(time.time())

                # Update the vocabulary store with the fallback scores
                for word_info in analysis.get("words_analyzed", []):
                    word = word_info.get("word", "").lower()
                    review_score = word_info.get("review_score", 3)

                    logger.info(f"Processing word with fallback: {word}, review score: {review_score}")

                    if word in self.word_cache:
                        word_data = self.vocab_store.get_word(word)

                        # Calculate new SRS parameters based on review score
                        ef, interval, repetitions = self._calculate_srs_parameters(
                            word_data, review_score
                        )

                        # Update the vocabulary store
                        try:
                            self.vocab_store.update_srs(
                                word,
                                quality=review_score,
                                new_ef=ef,
                                new_interval=interval,
                                new_repetitions=repetitions
                            )
                            logger.info(f"Successfully updated word in vocabulary store using fallback: {word}")
                        except Exception as e:
                            logger.error(f"Error updating word {word} in vocabulary store: {str(e)}")

                return {
                    "processed": True,
                    "text": current_text,
                    "analysis": analysis,
                    "timestamp": current_time,
                    "fallback": True
                }

            # Parse the response
            result = response.json()
            content = result["choices"][0]["message"]["content"]

            # Extract the JSON part
            try:
                # Try to parse the entire content as JSON
                analysis = json.loads(content)
            except json.JSONDecodeError:
                # If that fails, try to extract JSON from the text
                match = re.search(r'({.*})', content, re.DOTALL)
                if match:
                    try:
                        analysis = json.loads(match.group(1))
                    except json.JSONDecodeError:
                        return {
                            "processed": False,
                            "reason": "Failed to parse model response",
                            "words_analyzed": []
                        }
                else:
                    return {
                        "processed": False,
                        "reason": "Failed to extract JSON from model response",
                        "words_analyzed": []
                    }

            # Update the vocabulary store with review scores
            current_time = int(time.time())
            logger.info(f"Updating vocabulary store with review scores at time: {current_time}")

            words_analyzed_count = 0
            for word_info in analysis.get("words_analyzed", []):
                word = word_info.get("word", "").lower()
                review_score = word_info.get("review_score", 3)

                logger.info(f"Processing word: {word}, review score: {review_score}")

                if word in self.word_cache:
                    word_data = self.vocab_store.get_word(word)
                    logger.info(f"Found word in cache: {word}")

                    # Calculate new SRS parameters based on review score
                    ef, interval, repetitions = self._calculate_srs_parameters(
                        word_data, review_score
                    )

                    logger.info(f"New SRS parameters for {word}: EF={ef}, interval={interval}, repetitions={repetitions}")

                    # Update the vocabulary store
                    try:
                        self.vocab_store.update_srs(
                            word,
                            quality=review_score,
                            new_ef=ef,
                            new_interval=interval,
                            new_repetitions=repetitions
                        )
                        logger.info(f"Successfully updated word in vocabulary store: {word}")
                        words_analyzed_count += 1
                    except Exception as e:
                        logger.error(f"Error updating word {word} in vocabulary store: {str(e)}")
                else:
                    logger.warning(f"Word not found in cache: {word}")

            logger.info(f"Total words updated in vocabulary store: {words_analyzed_count}")

            return {
                "processed": True,
                "text": current_text,
                "analysis": analysis,
                "timestamp": current_time
            }

        except Exception as e:
            return {
                "processed": False,
                "reason": f"Error: {str(e)}",
                "words_analyzed": []
            }

    def _calculate_srs_parameters(self, word_data: Dict[str, Any], quality: int) -> Tuple[float, int, int]:
        """
        Calculate new SRS parameters based on the SM-2 algorithm.

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

        # Adjust quality to 0-5 scale for SM-2 algorithm
        sm2_quality = quality - 1

        # Apply SM-2 algorithm
        if sm2_quality < 3:
            # If quality is less than 3, reset repetitions
            repetitions = 0
            interval = 1
        else:
            # If quality is 3 or greater, increase repetitions
            repetitions += 1

            # Calculate new interval
            if repetitions == 1:
                interval = 1
            elif repetitions == 2:
                interval = 6
            else:
                interval = round(interval * ef)

        # Update ease factor
        ef = max(1.3, ef + (0.1 - (5 - sm2_quality) * (0.08 + (5 - sm2_quality) * 0.02)))

        return ef, interval, repetitions


# Create a singleton instance for easy access
effectiveness_analyzer = EffectivenessAnalyzer()
