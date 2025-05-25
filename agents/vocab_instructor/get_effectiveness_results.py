#!/usr/bin/env python3
"""
Get Effectiveness Results Script

This script is called by the API endpoint to get the latest effectiveness
analysis results. It's designed to be run as a separate process.
"""

import sys
import json
import logging
from typing import List, Dict, Any

# Add the current directory to the Python path
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Now import the vocab store
try:
    from vocab_store import vocab_store
except ImportError as e:
    print(f"Error importing vocab_store: {e}")
    sys.exit(1)

# Set up logging with absolute path
log_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
log_file = os.path.join(log_dir, 'effectiveness_results.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('get_effectiveness_results')
logger.info(f"Log file location: {log_file}")


def get_recent_analysis_results(limit: int = 20) -> List[Dict[str, Any]]:
    """
    Get the most recently analyzed vocabulary words.

    Args:
        limit: Maximum number of words to return

    Returns:
        List of dictionaries with word data
    """
    # Get all words from the vocabulary store
    all_words = vocab_store.get_all_words()

    # Sort by time_last_seen (most recent first)
    recent_words = sorted(
        all_words,
        key=lambda x: int(x.get('time_last_seen', 0)),
        reverse=True
    )

    # Format the results
    results = []
    for word_data in recent_words[:limit]:
        # Calculate effectiveness score (1-5) based on correct_uses / total_uses ratio
        correct_uses = int(word_data.get('correct_uses', 0))
        total_uses = int(word_data.get('total_uses', 0))

        if total_uses > 0:
            effectiveness_ratio = correct_uses / total_uses
            # Map ratio to 1-5 scale
            effectiveness_score = min(5, max(1, round(effectiveness_ratio * 5)))
        else:
            effectiveness_score = 0

        results.append({
            'word': word_data.get('word', ''),
            'time_last_seen': int(word_data.get('time_last_seen', 0)),
            'correct_uses': correct_uses,
            'total_uses': total_uses,
            'effectiveness_score': effectiveness_score,
            'next_due': int(word_data.get('next_due', 0)),
            'interval': int(word_data.get('interval', 1))
        })

    return results


def main():
    """
    Main function to get and output the effectiveness analysis results.
    """
    try:
        # Get the recent analysis results
        results = get_recent_analysis_results()

        # Output the results as JSON
        print(json.dumps(results))

    except Exception as e:
        # Log error
        logger.error(f"Error getting effectiveness results: {str(e)}")

        # Output error message
        result = {
            "error": str(e)
        }
        print(json.dumps(result))
        sys.exit(1)


if __name__ == "__main__":
    main()
