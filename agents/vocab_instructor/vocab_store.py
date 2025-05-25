"""
Vocabulary Store Module

This module manages vocabulary data storage and retrieval using a CSV file.
It provides functions for adding, updating, and retrieving vocabulary words,
as well as tracking user progress with vocabulary words.

The CSV schema is:
word,time_last_seen,correct_uses,total_uses,next_due,EF,interval,repetitions
"""

import csv
import os
import time
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta

# Default path to the vocabulary CSV file
DEFAULT_VOCAB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'vocabulary.csv')

class VocabularyStore:
    """
    Class for managing vocabulary data storage and retrieval.
    """
    
    def __init__(self, csv_path: str = DEFAULT_VOCAB_PATH):
        """
        Initialize the VocabularyStore with the path to the CSV file.
        
        Args:
            csv_path: Path to the vocabulary CSV file
        """
        self.csv_path = csv_path
        self._ensure_file_exists()
    
    def _ensure_file_exists(self) -> None:
        """
        Ensure that the vocabulary CSV file exists.
        If it doesn't exist, create it with the correct header.
        """
        if not os.path.exists(self.csv_path):
            with open(self.csv_path, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['word', 'time_last_seen', 'correct_uses', 'total_uses', 'next_due', 'EF', 'interval', 'repetitions'])
    
    def _read_csv(self) -> List[Dict[str, Any]]:
        """
        Read the vocabulary CSV file and return the data as a list of dictionaries.
        
        Returns:
            List of dictionaries, where each dictionary represents a vocabulary word
        """
        with open(self.csv_path, 'r', newline='') as f:
            reader = csv.DictReader(f)
            return list(reader)
    
    def _write_csv(self, data: List[Dict[str, Any]]) -> None:
        """
        Write the vocabulary data to the CSV file.
        
        Args:
            data: List of dictionaries, where each dictionary represents a vocabulary word
        """
        with open(self.csv_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['word', 'time_last_seen', 'correct_uses', 'total_uses', 'next_due', 'EF', 'interval', 'repetitions'])
            writer.writeheader()
            writer.writerows(data)
    
    def get_all_words(self) -> List[Dict[str, Any]]:
        """
        Get all vocabulary words from the CSV file.
        
        Returns:
            List of dictionaries, where each dictionary represents a vocabulary word
        """
        return self._read_csv()
    
    def get_word(self, word: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific vocabulary word from the CSV file.
        
        Args:
            word: The vocabulary word to retrieve
            
        Returns:
            Dictionary representing the vocabulary word, or None if not found
        """
        data = self._read_csv()
        for item in data:
            if item['word'].lower() == word.lower():
                return item
        return None
    
    def add_word(self, word: str, ef: float = 2.5, interval: int = 1, repetitions: int = 0) -> None:
        """
        Add a new vocabulary word to the CSV file.
        
        Args:
            word: The vocabulary word to add
            ef: Initial ease factor (default: 2.5)
            interval: Initial interval in days (default: 1)
            repetitions: Initial number of repetitions (default: 0)
        """
        data = self._read_csv()
        
        # Check if the word already exists
        for item in data:
            if item['word'].lower() == word.lower():
                return  # Word already exists, do nothing
        
        # Add the new word
        current_time = int(time.time())
        data.append({
            'word': word,
            'time_last_seen': '0',
            'correct_uses': '0',
            'total_uses': '0',
            'next_due': '0',
            'EF': str(ef),
            'interval': str(interval),
            'repetitions': str(repetitions)
        })
        
        self._write_csv(data)
    
    def update_word(self, word: str, **kwargs) -> None:
        """
        Update a vocabulary word in the CSV file.
        
        Args:
            word: The vocabulary word to update
            **kwargs: Key-value pairs to update
        """
        data = self._read_csv()
        
        for i, item in enumerate(data):
            if item['word'].lower() == word.lower():
                for key, value in kwargs.items():
                    data[i][key] = str(value)
                break
        
        self._write_csv(data)
    
    def get_due_words(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get vocabulary words that are due for review.
        
        Args:
            limit: Maximum number of words to return
            
        Returns:
            List of dictionaries, where each dictionary represents a vocabulary word
        """
        data = self._read_csv()
        current_time = int(time.time())
        
        # Filter words that are due for review
        due_words = [item for item in data if int(item['next_due']) <= current_time]
        
        # Sort by next_due (oldest first)
        due_words.sort(key=lambda x: int(x['next_due']))
        
        return due_words[:limit]
    
    def log_result(self, word: str, correct: bool) -> None:
        """
        Log the result of a vocabulary word usage.
        
        Args:
            word: The vocabulary word
            correct: Whether the word was used correctly
        """
        data = self._read_csv()
        current_time = int(time.time())
        
        for i, item in enumerate(data):
            if item['word'].lower() == word.lower():
                # Update usage statistics
                correct_uses = int(item['correct_uses'])
                total_uses = int(item['total_uses'])
                
                if correct:
                    correct_uses += 1
                total_uses += 1
                
                data[i]['correct_uses'] = str(correct_uses)
                data[i]['total_uses'] = str(total_uses)
                data[i]['time_last_seen'] = str(current_time)
                
                break
        
        self._write_csv(data)
    
    def update_srs(self, word: str, quality: int, new_ef: float, new_interval: int, new_repetitions: int) -> None:
        """
        Update the SRS parameters for a vocabulary word.
        
        Args:
            word: The vocabulary word
            quality: Quality of the response (0-5)
            new_ef: New ease factor
            new_interval: New interval in days
            new_repetitions: New number of repetitions
        """
        data = self._read_csv()
        current_time = int(time.time())
        
        for i, item in enumerate(data):
            if item['word'].lower() == word.lower():
                # Calculate next due date
                next_due = current_time + int(new_interval * 24 * 60 * 60)
                
                # Update SRS parameters
                data[i]['EF'] = str(new_ef)
                data[i]['interval'] = str(new_interval)
                data[i]['repetitions'] = str(new_repetitions)
                data[i]['next_due'] = str(next_due)
                data[i]['time_last_seen'] = str(current_time)
                
                break
        
        self._write_csv(data)


# Create a singleton instance for easy access
vocab_store = VocabularyStore()
