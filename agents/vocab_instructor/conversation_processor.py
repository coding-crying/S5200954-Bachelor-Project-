"""
Conversation Processor Module

This module processes conversation text to identify vocabulary words and update
the vocabulary store with usage information. It integrates with the realtime
session to analyze user speech and track vocabulary usage.
"""

import time
from typing import Dict, Any, Set
import requests

from .vocab_store import vocab_store
from .word_lemmatizer import word_lemmatizer


class ConversationProcessor:
    """
    Class for processing conversation text to identify and track vocabulary usage.
    """

    def __init__(self, vocab_store_instance=None, model="gpt-4.1-mini", lemmatizer_instance=None):
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

    def process_text_with_model(self, text: str, context_messages: list = None) -> Dict[str, Any]:
        """
        Analyze conversation text using the enhanced conversation processing endpoint.
        This method handles split messages by combining recent context for better analysis.

        Args:
            text: The current text to process
            context_messages: List of recent messages for context (to handle split messages)

        Returns:
            Dictionary with processing results including structured analysis data
        """
        if not text or not text.strip():
            return {"processed": False, "reason": "Empty text", "words_found": []}

        # Get vocabulary words from cache
        vocab_words = list(self.word_cache)

        # Combine current text with recent context if provided
        combined_text = text
        if context_messages:
            # Look back at the last few messages to handle split messages
            recent_context = " ".join(context_messages[-3:])  # Last 3 messages for context
            combined_text = f"{recent_context} {text}".strip()

        try:
            # Use the enhanced conversation processing endpoint
            response = requests.post(
                "http://localhost:3000/api/conversation/process",
                json={
                    "text": combined_text,
                    "vocabularyWords": vocab_words[:100],  # Limit to avoid token limits
                    "includeAnalysis": True,
                    "speaker": "user",  # Assume user speech for vocabulary learning
                    "batchMode": bool(context_messages),  # Use batch mode if context provided
                    "messageCount": len(context_messages) + 1 if context_messages else 1
                },
                headers={
                    "Content-Type": "application/json"
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

            if not result.get("success", False):
                return {
                    "processed": False,
                    "reason": result.get("error", "Unknown API error"),
                    "words_found": []
                }

            # Extract analysis data
            analysis = result.get("analysis", {})
            vocabulary_words = analysis.get("vocabulary_words", [])
            csv_updates = result.get("csv_updates", [])

            # Update the vocabulary store based on the structured response
            current_time = int(time.time())
            words_analyzed = []

            for word_info in vocabulary_words:
                word = word_info.get("word", "").lower()
                found_form = word_info.get("found_form", "")
                used_correctly = word_info.get("used_correctly", False)
                confidence = word_info.get("confidence", 0.0)

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

                    # Add to analyzed words for response
                    words_analyzed.append({
                        "word": word,
                        "found_form": found_form,
                        "used_correctly": used_correctly,
                        "confidence": confidence,
                        "review_score": 5 if used_correctly and confidence > 0.8 else 3 if used_correctly else 1
                    })

            return {
                "processed": True,
                "text": combined_text,
                "analysis": {
                    "words_analyzed": words_analyzed,
                    "summary": analysis.get("summary", "Vocabulary analysis completed"),
                    "learning_effectiveness": analysis.get("learning_effectiveness", 0.0)
                },
                "csv_updates": csv_updates,
                "timestamp": current_time
            }

        except Exception as e:
            return {
                "processed": False,
                "reason": f"Error: {str(e)}",
                "words_found": []
            }

    def process_user_message(self, current_message: str, recent_messages: list = None) -> Dict[str, Any]:
        """
        Process a user message with context for vocabulary analysis.
        This is the main method for the vocabularyInstructor agent.

        Args:
            current_message: The current user message to process
            recent_messages: List of recent messages for context (handles split messages)

        Returns:
            Dictionary with processing results
        """
        return self.process_text_with_model(current_message, recent_messages)


# Create a singleton instance for easy access
conversation_processor = ConversationProcessor()
