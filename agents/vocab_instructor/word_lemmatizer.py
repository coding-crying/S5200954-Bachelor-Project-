"""
Word Lemmatizer Module

This module provides word lemmatization functionality to detect different forms
of vocabulary words (conjugations, plurals, etc.) in conversation text.
Uses NLTK's WordNetLemmatizer for accurate lemmatization.
"""

import re
from typing import Set, Dict, List, Tuple, Optional
from functools import lru_cache

try:
    import nltk
    from nltk.stem import WordNetLemmatizer
    from nltk.corpus import wordnet
    from nltk.tokenize import word_tokenize
    from nltk.tag import pos_tag
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    print("Warning: NLTK not available. Using fallback lemmatization.")


class WordLemmatizer:
    """
    Class for lemmatizing words to detect different forms of vocabulary words.
    """
    
    def __init__(self):
        """
        Initialize the WordLemmatizer.
        Downloads required NLTK data if not present.
        """
        self.lemmatizer = None
        self.fallback_rules = self._create_fallback_rules()
        
        if NLTK_AVAILABLE:
            try:
                # Download required NLTK data
                self._download_nltk_data()
                self.lemmatizer = WordNetLemmatizer()
            except Exception as e:
                print(f"Warning: Failed to initialize NLTK lemmatizer: {e}")
                print("Using fallback lemmatization rules.")
    
    def _download_nltk_data(self):
        """Download required NLTK data packages."""
        required_packages = ['wordnet', 'punkt', 'averaged_perceptron_tagger', 'omw-1.4']
        
        for package in required_packages:
            try:
                nltk.data.find(f'tokenizers/{package}')
            except LookupError:
                try:
                    nltk.data.find(f'corpora/{package}')
                except LookupError:
                    try:
                        nltk.data.find(f'taggers/{package}')
                    except LookupError:
                        print(f"Downloading NLTK package: {package}")
                        nltk.download(package, quiet=True)
    
    def _create_fallback_rules(self) -> Dict[str, List[str]]:
        """
        Create fallback lemmatization rules for common word forms.
        
        Returns:
            Dictionary mapping suffixes to their possible base forms
        """
        return {
            # Verb forms
            'ing': [''],  # running -> run
            'ed': [''],   # walked -> walk
            'es': [''],   # goes -> go
            's': [''],    # runs -> run
            
            # Noun plurals
            'ies': ['y'],  # cities -> city
            'ves': ['f', 'fe'],  # wolves -> wolf, knives -> knife
            
            # Adjective forms
            'er': [''],    # bigger -> big
            'est': [''],   # biggest -> big
            'ly': [''],    # quickly -> quick
        }
    
    def _get_wordnet_pos(self, treebank_tag: str) -> str:
        """
        Convert TreeBank POS tag to WordNet POS tag.
        
        Args:
            treebank_tag: TreeBank POS tag
            
        Returns:
            WordNet POS tag
        """
        if treebank_tag.startswith('J'):
            return wordnet.ADJ
        elif treebank_tag.startswith('V'):
            return wordnet.VERB
        elif treebank_tag.startswith('N'):
            return wordnet.NOUN
        elif treebank_tag.startswith('R'):
            return wordnet.ADV
        else:
            return wordnet.NOUN  # Default to noun
    
    @lru_cache(maxsize=1000)
    def lemmatize_word(self, word: str, pos: Optional[str] = None) -> str:
        """
        Lemmatize a single word to its base form.
        
        Args:
            word: The word to lemmatize
            pos: Part of speech tag (optional)
            
        Returns:
            The lemmatized word
        """
        word = word.lower().strip()
        
        if self.lemmatizer and NLTK_AVAILABLE:
            try:
                if pos:
                    wordnet_pos = self._get_wordnet_pos(pos)
                    return self.lemmatizer.lemmatize(word, pos=wordnet_pos)
                else:
                    # Try different POS tags and return the shortest result
                    candidates = [
                        self.lemmatizer.lemmatize(word, pos=wordnet.NOUN),
                        self.lemmatizer.lemmatize(word, pos=wordnet.VERB),
                        self.lemmatizer.lemmatize(word, pos=wordnet.ADJ),
                        self.lemmatizer.lemmatize(word, pos=wordnet.ADV)
                    ]
                    return min(candidates, key=len)
            except Exception:
                pass
        
        # Fallback to rule-based lemmatization
        return self._fallback_lemmatize(word)
    
    def _fallback_lemmatize(self, word: str) -> str:
        """
        Fallback lemmatization using simple rules.
        
        Args:
            word: The word to lemmatize
            
        Returns:
            The lemmatized word
        """
        word = word.lower()
        
        # Try each suffix rule
        for suffix, replacements in self.fallback_rules.items():
            if word.endswith(suffix) and len(word) > len(suffix):
                for replacement in replacements:
                    candidate = word[:-len(suffix)] + replacement
                    if len(candidate) >= 2:  # Ensure reasonable word length
                        return candidate
        
        return word
    
    def find_vocabulary_matches(self, text: str, vocabulary_words: Set[str]) -> List[Tuple[str, str]]:
        """
        Find vocabulary word matches in text, including different word forms.
        
        Args:
            text: The text to analyze
            vocabulary_words: Set of vocabulary words to match against
            
        Returns:
            List of tuples (found_word, vocabulary_word) for matches
        """
        if not text or not vocabulary_words:
            return []
        
        # Tokenize text
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        matches = []
        
        # Create a mapping of lemmatized vocabulary words to original words
        vocab_lemma_map = {}
        for vocab_word in vocabulary_words:
            lemma = self.lemmatize_word(vocab_word)
            if lemma not in vocab_lemma_map:
                vocab_lemma_map[lemma] = []
            vocab_lemma_map[lemma].append(vocab_word)
        
        # Check each word in the text
        for word in words:
            # First check exact match
            if word in vocabulary_words:
                matches.append((word, word))
                continue
            
            # Then check lemmatized form
            lemma = self.lemmatize_word(word)
            if lemma in vocab_lemma_map:
                # Use the first vocabulary word that matches this lemma
                vocab_word = vocab_lemma_map[lemma][0]
                matches.append((word, vocab_word))
        
        return matches
    
    def get_word_forms(self, base_word: str) -> Set[str]:
        """
        Generate possible word forms for a base word.
        
        Args:
            base_word: The base word
            
        Returns:
            Set of possible word forms
        """
        forms = {base_word.lower()}
        
        # Add common inflections
        forms.update([
            base_word + 's',      # plural/3rd person
            base_word + 'es',     # plural
            base_word + 'ed',     # past tense
            base_word + 'ing',    # present participle
            base_word + 'er',     # comparative
            base_word + 'est',    # superlative
            base_word + 'ly',     # adverb
        ])
        
        # Handle words ending in 'y'
        if base_word.endswith('y') and len(base_word) > 1:
            stem = base_word[:-1]
            forms.update([
                stem + 'ies',     # cities
                stem + 'ied',     # carried
            ])
        
        # Handle words ending in 'e'
        if base_word.endswith('e'):
            stem = base_word[:-1]
            forms.update([
                stem + 'ing',     # making
                stem + 'ed',      # baked
            ])
        
        return forms


# Create a singleton instance for easy access
word_lemmatizer = WordLemmatizer()
