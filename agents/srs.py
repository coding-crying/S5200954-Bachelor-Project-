"""
Spaced Repetition System (SRS) Module

This module implements the SM-2 spaced repetition algorithm for optimizing
the intervals between vocabulary reviews based on user performance.

The SM-2 algorithm was developed by Piotr Wozniak for SuperMemo and is widely
used in spaced repetition software.

References:
- https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
- https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
"""

from typing import Dict, Any, Tuple


def update(card: Dict[str, Any], quality: int) -> Tuple[float, int, int]:
    """
    Update a card's spaced repetition parameters using the SM-2 algorithm.
    
    Args:
        card: Dictionary containing the card's current parameters:
            - EF: Ease Factor (float)
            - interval: Current interval in days (int)
            - repetitions: Number of repetitions (int)
        quality: Quality of the response (0-5):
            - 0: Complete blackout, wrong response
            - 1: Incorrect response, but upon seeing the correct answer it felt familiar
            - 2: Incorrect response, but upon seeing the correct answer it seemed easy to remember
            - 3: Correct response, but required significant effort to recall
            - 4: Correct response, after some hesitation
            - 5: Correct response, perfect recall
    
    Returns:
        Tuple containing:
            - new_ef: New Ease Factor (float)
            - new_interval: New interval in days (int)
            - new_repetitions: New number of repetitions (int)
    """
    # Convert string values to appropriate types if needed
    ef = float(card['EF']) if isinstance(card['EF'], str) else float(card['EF'])
    interval = int(card['interval']) if isinstance(card['interval'], str) else int(card['interval'])
    repetitions = int(card['repetitions']) if isinstance(card['repetitions'], str) else int(card['repetitions'])
    
    # Ensure quality is within valid range
    quality = max(0, min(5, quality))
    
    # Calculate new EF (Ease Factor)
    # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    
    # EF should be at least 1.3
    new_ef = max(1.3, new_ef)
    
    # Update repetitions and interval
    if quality < 3:
        # If the quality is less than 3, reset repetitions and interval
        new_repetitions = 0
        new_interval = 1
    else:
        # If the quality is 3 or higher, increment repetitions and calculate new interval
        new_repetitions = repetitions + 1
        
        if new_repetitions == 1:
            new_interval = 1
        elif new_repetitions == 2:
            new_interval = 6
        else:
            # For repetitions > 2, multiply the previous interval by EF
            new_interval = round(interval * new_ef)
    
    return new_ef, new_interval, new_repetitions


def calculate_quality(correct_uses: int, total_uses: int) -> int:
    """
    Calculate the quality of response based on correct uses and total uses.
    
    Args:
        correct_uses: Number of times the word was used correctly
        total_uses: Total number of times the word was used
    
    Returns:
        Quality of response (0-5)
    """
    if total_uses == 0:
        return 0
    
    ratio = correct_uses / total_uses
    
    if ratio == 1.0:
        return 5  # Perfect
    elif ratio >= 0.9:
        return 4  # Correct with hesitation
    elif ratio >= 0.7:
        return 3  # Correct with effort
    elif ratio >= 0.5:
        return 2  # Incorrect but familiar
    elif ratio >= 0.3:
        return 1  # Incorrect but recognized
    else:
        return 0  # Complete blackout
