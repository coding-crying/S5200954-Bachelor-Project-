#!/usr/bin/env python3
"""
Run Background Processor Script

This script is called by the API endpoint to run the background processor
on a given text. It's designed to be run as a separate process.
"""

import argparse
import sys
import json
import logging

# Add the current directory to the Python path
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up logging with absolute path first
log_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
log_file = os.path.join(log_dir, 'background_processor.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('run_background_processor')
logger.info(f"Log file location: {log_file}")

# Now import the background processor
try:
    from background_processor import background_processor
    # Log the type of analyzer being used
    logger.info(f"Using analyzer: {type(background_processor.analyzer).__name__}")
except ImportError as e:
    logger.error(f"Error importing background_processor: {e}")
    print(f"Error importing background_processor: {e}")
    sys.exit(1)


def main():
    """
    Main function to parse arguments and run the background processor.
    """
    # Log script execution
    logger.info("Starting run_background_processor.py")
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"Python path: {sys.path}")

    parser = argparse.ArgumentParser(description='Run the background processor on a given text.')
    parser.add_argument('--text', required=True, help='The text to process')
    parser.add_argument('--include-history', action='store_true', help='Include conversation history for context')

    args = parser.parse_args()
    logger.info(f"Received arguments: text={args.text[:30]}..., include_history={args.include_history}")

    try:
        # Check if background_processor is available
        logger.info(f"Background processor object: {background_processor}")

        # Add the text to the background processor
        logger.info("Adding text to background processor...")
        background_processor.add_text(args.text)

        # Log success
        logger.info(f"Successfully added text to background processor: {args.text[:50]}...")

        # Output success message
        result = {
            "success": True,
            "message": "Text added to background processor"
        }
        print(json.dumps(result))

    except Exception as e:
        # Log error with traceback
        import traceback
        logger.error(f"Error running background processor: {str(e)}")
        logger.error(traceback.format_exc())

        # Output error message
        result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(result))
        sys.exit(1)


if __name__ == "__main__":
    main()
