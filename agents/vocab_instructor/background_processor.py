"""
Background Processor Module

This module provides background processing of conversation text to analyze
vocabulary word usage effectiveness and update the vocabulary store with
review timing information.
"""

import time
import threading
from typing import List, Dict, Any, Optional, Deque
from collections import deque
import logging

# Use absolute imports instead of relative imports
try:
    # First try to import the simple analyzer
    from simple_effectiveness_analyzer import SimpleEffectivenessAnalyzer, simple_effectiveness_analyzer
    effectiveness_analyzer = simple_effectiveness_analyzer
except ImportError:
    # If that fails, try the original analyzer
    try:
        from effectiveness_analyzer import EffectivenessAnalyzer, effectiveness_analyzer
    except ImportError:
        # Try alternative import paths
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        try:
            from simple_effectiveness_analyzer import SimpleEffectivenessAnalyzer, simple_effectiveness_analyzer
            effectiveness_analyzer = simple_effectiveness_analyzer
        except ImportError:
            from effectiveness_analyzer import EffectivenessAnalyzer, effectiveness_analyzer

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('background_processor')


class BackgroundProcessor:
    """
    Class for background processing of conversation text to analyze
    vocabulary word usage effectiveness.
    """

    def __init__(self, analyzer_instance=None, context_window_size=5):
        """
        Initialize the BackgroundProcessor with an effectiveness analyzer instance.

        Args:
            analyzer_instance: Instance of EffectivenessAnalyzer (default: global effectiveness_analyzer)
            context_window_size: Number of previous messages to keep for context
        """
        self.analyzer = analyzer_instance or effectiveness_analyzer
        self.context_window_size = context_window_size
        self.conversation_history = deque(maxlen=context_window_size)
        self.processing_queue = deque()
        self.processing_thread = None
        self.running = False
        self.lock = threading.Lock()

    def start(self):
        """
        Start the background processor thread.
        """
        if self.processing_thread is None or not self.processing_thread.is_alive():
            self.running = True
            self.processing_thread = threading.Thread(target=self._process_queue, daemon=True)
            self.processing_thread.start()
            logger.info("Background processor started")

    def stop(self):
        """
        Stop the background processor thread.
        """
        self.running = False
        if self.processing_thread and self.processing_thread.is_alive():
            self.processing_thread.join(timeout=2.0)
            logger.info("Background processor stopped")

    def add_text(self, text: str):
        """
        Add text to the processing queue and conversation history.

        Args:
            text: The text to process
        """
        if not text or not text.strip():
            return

        with self.lock:
            # Add to conversation history
            self.conversation_history.append(text)

            # Add to processing queue
            self.processing_queue.append(text)

        logger.info(f"Added text to processing queue: {text[:50]}...")

    def _process_queue(self):
        """
        Process the queue of conversation texts.
        This method runs in a separate thread.
        """
        while self.running:
            # Check if there's anything to process
            if len(self.processing_queue) == 0:
                time.sleep(0.5)
                continue

            # Get the next text to process
            with self.lock:
                if len(self.processing_queue) == 0:
                    continue

                text = self.processing_queue.popleft()
                # Get a copy of the conversation history for context
                history = list(self.conversation_history)[:-1]  # Exclude the current text

            # Process the text
            try:
                logger.info(f"Processing text: {text[:50]}...")
                result = self.analyzer.analyze_conversation(text, history)

                if result["processed"]:
                    words_analyzed = result.get("analysis", {}).get("words_analyzed", [])
                    logger.info(f"Processed text successfully. Words analyzed: {len(words_analyzed)}")

                    # Log the analysis results
                    for word_info in words_analyzed:
                        word = word_info.get("word", "")
                        score = word_info.get("review_score", 0)
                        logger.info(f"Word: {word}, Review Score: {score}")
                else:
                    logger.warning(f"Failed to process text: {result.get('reason', 'Unknown reason')}")

            except Exception as e:
                logger.error(f"Error processing text: {str(e)}")

            # Sleep briefly to avoid consuming too many resources
            time.sleep(0.1)


# Create a singleton instance for easy access
background_processor = BackgroundProcessor()

# Start the background processor automatically
background_processor.start()
