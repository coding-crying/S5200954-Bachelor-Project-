"""
WordPicker Tool

This module provides a tool for selecting vocabulary words due for review
based on the SM-2 algorithm. It uses the vocabulary store to retrieve words
and can filter them based on various criteria.
"""

import random
from typing import List, Dict, Any, Optional

from .vocab_store import vocab_store


class WordPicker:
    """
    Tool for selecting vocabulary words due for review.
    """
    
    def __init__(self, vocab_store_instance=None):
        """
        Initialize the WordPicker with a vocabulary store instance.
        
        Args:
            vocab_store_instance: Instance of VocabularyStore (default: global vocab_store)
        """
        self.vocab_store = vocab_store_instance or vocab_store
    
    def get_due_word(self) -> Optional[Dict[str, Any]]:
        """
        Get a single word that is due for review.
        
        Returns:
            Dictionary representing the vocabulary word, or None if no words are due
        """
        due_words = self.vocab_store.get_due_words(1)
        return due_words[0] if due_words else None
    
    def get_due_words(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get multiple words that are due for review.
        
        Args:
            limit: Maximum number of words to return
            
        Returns:
            List of dictionaries, where each dictionary represents a vocabulary word
        """
        return self.vocab_store.get_due_words(limit)
    
    def get_random_word(self) -> Optional[Dict[str, Any]]:
        """
        Get a random word from the vocabulary store.
        
        Returns:
            Dictionary representing the vocabulary word, or None if no words are available
        """
        all_words = self.vocab_store.get_all_words()
        return random.choice(all_words) if all_words else None
    
    def get_random_words(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get multiple random words from the vocabulary store.
        
        Args:
            limit: Maximum number of words to return
            
        Returns:
            List of dictionaries, where each dictionary represents a vocabulary word
        """
        all_words = self.vocab_store.get_all_words()
        if not all_words:
            return []
        
        # Shuffle the words and return up to the limit
        random.shuffle(all_words)
        return all_words[:limit]
    
    def get_words_by_repetitions(self, min_repetitions: int = 0, max_repetitions: int = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get words filtered by number of repetitions.
        
        Args:
            min_repetitions: Minimum number of repetitions
            max_repetitions: Maximum number of repetitions (default: no maximum)
            limit: Maximum number of words to return
            
        Returns:
            List of dictionaries, where each dictionary represents a vocabulary word
        """
        all_words = self.vocab_store.get_all_words()
        
        # Filter by repetitions
        filtered_words = []
        for word in all_words:
            repetitions = int(word['repetitions'])
            if repetitions >= min_repetitions and (max_repetitions is None or repetitions <= max_repetitions):
                filtered_words.append(word)
        
        # Sort by repetitions (ascending)
        filtered_words.sort(key=lambda x: int(x['repetitions']))
        
        return filtered_words[:limit]
    
    def get_words_by_ef(self, min_ef: float = 0.0, max_ef: float = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get words filtered by ease factor (EF).
        
        Args:
            min_ef: Minimum ease factor
            max_ef: Maximum ease factor (default: no maximum)
            limit: Maximum number of words to return
            
        Returns:
            List of dictionaries, where each dictionary represents a vocabulary word
        """
        all_words = self.vocab_store.get_all_words()
        
        # Filter by EF
        filtered_words = []
        for word in all_words:
            ef = float(word['EF'])
            if ef >= min_ef and (max_ef is None or ef <= max_ef):
                filtered_words.append(word)
        
        # Sort by EF (ascending)
        filtered_words.sort(key=lambda x: float(x['EF']))
        
        return filtered_words[:limit]
    
    def get_words_by_usage(self, min_ratio: float = 0.0, max_ratio: float = 1.0, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get words filtered by correct usage ratio (correct_uses / total_uses).
        
        Args:
            min_ratio: Minimum correct usage ratio
            max_ratio: Maximum correct usage ratio
            limit: Maximum number of words to return
            
        Returns:
            List of dictionaries, where each dictionary represents a vocabulary word
        """
        all_words = self.vocab_store.get_all_words()
        
        # Filter by usage ratio
        filtered_words = []
        for word in all_words:
            correct_uses = int(word['correct_uses'])
            total_uses = int(word['total_uses'])
            
            # Avoid division by zero
            ratio = correct_uses / total_uses if total_uses > 0 else 0.0
            
            if ratio >= min_ratio and ratio <= max_ratio:
                filtered_words.append(word)
        
        # Sort by ratio (ascending)
        filtered_words.sort(key=lambda x: int(x['correct_uses']) / int(x['total_uses']) if int(x['total_uses']) > 0 else 0.0)
        
        return filtered_words[:limit]
