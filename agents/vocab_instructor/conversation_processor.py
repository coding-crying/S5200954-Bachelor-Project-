"""
Conversation Processor Module

This module processes conversation text to identify vocabulary words and update
the vocabulary store with usage information. It integrates with the realtime
session to analyze user speech and track vocabulary usage.
"""

import re
import time
import json
from typing import List, Dict, Any, Optional, Set
import requests

from .vocab_store import VocabularyStore, vocab_store
from .word_lemmatizer import WordLemmatizer, word_lemmatizer


class ConversationProcessor:
    """
    Class for processing conversation text to identify and track vocabulary usage.
    """

    def __init__(self, vocab_store_instance=None, model="gpt-4o-nano", lemmatizer_instance=None):
        """
        Initialize the ConversationProcessor with a vocabulary store instance.

        Args:
            vocab_store_instance: Instance of VocabularyStore (default: global vocab_store)
            model: The model to use for processing (default: gpt-4o-mini)
            lemmatizer_instance: Instance of WordLemmatizer (default: global word_lemmatizer)
        """
        self.vocab_store = vocab_store_instance or vocab_store
        self.model = model
        self.lemmatizer = lemmatizer_instance or word_lemmatizer
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

    def process_text(self, text: str) -> Dict[str, Any]:
        """
        Process text to identify vocabulary words and update the vocabulary store.
        Uses lemmatization to detect different word forms (conjugations, plurals, etc.).

        Args:
            text: The text to process

        Returns:
            Dictionary with processing results
        """
        if not text or not text.strip():
            return {"processed": False, "reason": "Empty text", "words_found": []}

        # Use lemmatizer to find vocabulary matches
        matches = self.lemmatizer.find_vocabulary_matches(text, self.word_cache)

        # Process matches and update vocabulary store
        vocab_words_found = []
        current_time = int(time.time())

        for found_word, vocab_word in matches:
            vocab_words_found.append({
                "found_form": found_word,
                "vocabulary_word": vocab_word,
                "is_exact_match": found_word == vocab_word
            })

            # Update the vocabulary store using the base vocabulary word
            try:
                word_data = self.vocab_store.get_word(vocab_word)
                if word_data:
                    current_uses = int(word_data.get('total_uses', 0))
                    self.vocab_store.update_word(
                        vocab_word,
                        time_last_seen=current_time,
                        total_uses=current_uses + 1
                    )
            except Exception as e:
                print(f"Warning: Failed to update word '{vocab_word}': {e}")

        return {
            "processed": True,
            "text": text,
            "words_found": vocab_words_found,
            "matches_count": len(matches),
            "timestamp": current_time
        }

    def process_text_with_model(self, text: str) -> Dict[str, Any]:
        """
        Process text using a language model to identify vocabulary words and their usage quality.

        Args:
            text: The text to process

        Returns:
            Dictionary with processing results
        """
        if not text or not text.strip():
            return {"processed": False, "reason": "Empty text", "words_found": []}

        # First, identify words that are in our vocabulary
        vocab_words = list(self.word_cache)

        # Create a prompt for the model
        prompt = f"""
        Analyze the following text and identify any instances of the vocabulary words listed below.
        Look for exact matches as well as different word forms (conjugations, plurals, past tense, etc.).
        For each word found, determine if it was used correctly in context, and assign a mastery score from 1 to 5.

        Text: "{text}"

        Vocabulary words: {", ".join(vocab_words[:100])}

        Format your response as a JSON object with the following structure:
        {{
            "words_found": [
                {{
                    "word": "base_vocabulary_word",
                    "found_form": "actual_word_in_text",
                    "used_correctly": true/false,
                    "mastery_score": "1-5"
                }}
            ]
        }}

        Include both exact matches and different forms of the vocabulary words.
        """

        try:
            # Call the OpenAI API
            response = requests.post(
                "http://localhost:3000/api/chat/completions",
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are a language analysis assistant that identifies vocabulary words in text and evaluates their usage."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1000
                }
            )

            if response.status_code != 200:
                return {
                    "processed": False,
                    "reason": f"API error: {response.status_code}",
                    "words_found": []
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
                            "words_found": []
                        }
                else:
                    return {
                        "processed": False,
                        "reason": "Failed to extract JSON from model response",
                        "words_found": []
                    }

            # Update the vocabulary store
            current_time = int(time.time())
            for word_info in analysis.get("words_found", []):
                word = word_info.get("word", "").lower()
                used_correctly = word_info.get("used_correctly", False)

                if word in self.word_cache:
                    word_data = self.vocab_store.get_word(word)

                    # Update usage statistics
                    correct_uses = int(word_data['correct_uses'])
                    total_uses = int(word_data['total_uses'])

                    if used_correctly:
                        correct_uses += 1
                    total_uses += 1

                    self.vocab_store.update_word(
                        word,
                        time_last_seen=current_time,
                        correct_uses=correct_uses,
                        total_uses=total_uses
                    )

            return {
                "processed": True,
                "text": text,
                "analysis": analysis,
                "timestamp": current_time
            }

        except Exception as e:
            return {
                "processed": False,
                "reason": f"Error: {str(e)}",
                "words_found": []
            }


# Create a singleton instance for easy access
conversation_processor = ConversationProcessor()
