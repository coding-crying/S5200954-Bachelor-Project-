#!/usr/bin/env python3
"""
Test Background Processor

This script tests the background processor by directly calling it with a sample text.
"""

import os
import sys
import time

# Add the agents directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
agents_dir = os.path.join(current_dir, 'agents', 'vocab_instructor')
sys.path.append(agents_dir)

print(f"Current directory: {current_dir}")
print(f"Agents directory: {agents_dir}")
print(f"Python path: {sys.path}")

try:
    # Import the modules
    print("Importing modules...")
    import vocab_store
    import effectiveness_analyzer
    import background_processor
    
    # Get the singleton instances
    vocab_store = vocab_store.vocab_store
    effectiveness_analyzer = effectiveness_analyzer.effectiveness_analyzer
    background_processor = background_processor.background_processor
    
    print("Modules imported successfully")
    
    # Get some vocabulary words from the store
    all_words = vocab_store.get_all_words()
    if not all_words:
        print("No vocabulary words found in the store")
        sys.exit(1)
    
    # Get the first 5 words
    sample_words = all_words[:5]
    sample_word_list = [word['word'] for word in sample_words]
    
    print(f"Testing with words: {', '.join(sample_word_list)}")
    
    # Create a sample text with these words
    sample_text = f"""
    Let me use some vocabulary words in this text.
    
    I find the concept quite {sample_word_list[0]}, and it's important not to {sample_word_list[1]} the significance.
    The {sample_word_list[2]} nature of the problem requires careful consideration.
    I'm in a {sample_word_list[3]} about how to proceed, but I'll try to be {sample_word_list[4]} in my approach.
    """
    
    print("Sample text created:")
    print(sample_text)
    
    # Start the background processor
    print("Starting background processor...")
    background_processor.start()
    
    # Add the text to the background processor
    print("Adding text to background processor...")
    background_processor.add_text(sample_text)
    
    # Wait for processing to complete
    print("Waiting for processing to complete...")
    time.sleep(5)
    
    # Stop the background processor
    print("Stopping background processor...")
    background_processor.stop()
    
    print("Test completed successfully")
    
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Error during test: {e}")
    import traceback
    print(traceback.format_exc())
    sys.exit(1)
