"""
Session-Optimized Spaced Repetition System

Designed for short learning sessions with focus on 24h retention.
Optimizes for rapid vocabulary acquisition rather than long-term maintenance.
"""

from typing import Dict, Any, Tuple
import time

def calculate_session_intervals(repetitions: int, quality: int) -> int:
    """
    Calculate optimal intervals for session-based learning with 24h retention focus.
    
    Args:
        repetitions: Number of successful reviews
        quality: Quality of response (0-5)
    
    Returns:
        Next review interval in minutes
    """
    # Base intervals designed for rapid acquisition and 24h retention
    base_intervals = {
        0: 5,        # 5 minutes (same session)
        1: 20,       # 20 minutes (same session)  
        2: 60,       # 1 hour (same session)
        3: 240,      # 4 hours (same day)
        4: 1440,     # 24 hours (next day) - CRITICAL 24h retention point
        5: 4320,     # 3 days
        6: 10080,    # 1 week
        7: 43200     # 1 month (then switch to traditional SM-2)
    }
    
    # Get base interval
    base_interval = base_intervals.get(repetitions, 43200)  # Default to 1 month for high repetitions
    
    # Adjust based on quality
    if quality >= 4:  # Perfect or near-perfect recall
        multiplier = 1.0
    elif quality == 3:  # Correct with effort
        multiplier = 0.8
    elif quality == 2:  # Incorrect but familiar
        multiplier = 0.6
        if repetitions >= 4:  # Reset to earlier stage for 24h retention
            repetitions = max(0, repetitions - 2)
            base_interval = base_intervals.get(repetitions, 5)
    else:  # Poor recall (quality 0-1)
        multiplier = 0.3
        if repetitions >= 2:  # Reset significantly
            repetitions = 0
            base_interval = base_intervals.get(0, 5)
    
    return int(base_interval * multiplier)

def get_review_priority_score(word_data: Dict[str, Any], current_time: int) -> float:
    """
    Calculate priority score for words optimized for short sessions.
    Higher score = higher priority for review.
    
    Args:
        word_data: Dictionary with word statistics
        current_time: Current timestamp in milliseconds
    
    Returns:
        Priority score (higher = more urgent)
    """
    total_uses = int(word_data.get('total_uses', 0))
    correct_uses = int(word_data.get('correct_uses', 0))
    next_due = int(word_data.get('next_due', 0))
    repetitions = int(word_data.get('repetitions', 0))
    time_last_seen = int(word_data.get('time_last_seen', 0))
    
    # Base priority factors
    priority_score = 0.0
    
    # 1. Overdue words get highest priority
    if next_due <= current_time:
        overdue_hours = (current_time - next_due) / (1000 * 60 * 60)
        priority_score += 100 + min(overdue_hours * 10, 200)  # Cap at 300 total
    
    # 2. Words approaching 24h mark get special priority
    time_since_last = (current_time - time_last_seen) / (1000 * 60 * 60)  # hours
    if 20 <= time_since_last <= 28:  # 20-28 hour window for 24h retention
        priority_score += 150
    
    # 3. Low-repetition words (new learning) get priority
    if repetitions <= 4:  # Focus on words not yet at 24h retention
        priority_score += (5 - repetitions) * 20
    
    # 4. Poor performance gets priority
    if total_uses > 0:
        accuracy = correct_uses / total_uses
        if accuracy < 0.7:  # Struggling words
            priority_score += (1 - accuracy) * 50
    
    # 5. Recent activity bonus (for session continuity)
    if time_since_last <= 2:  # Within 2 hours
        priority_score += 30
    
    return priority_score

def should_review_in_session(word_data: Dict[str, Any], current_time: int, session_start: int) -> bool:
    """
    Determine if a word should be available for review in the current session.
    
    Args:
        word_data: Dictionary with word statistics
        current_time: Current timestamp in milliseconds
        session_start: Session start timestamp in milliseconds
    
    Returns:
        True if word should be available for review
    """
    next_due = int(word_data.get('next_due', 0))
    repetitions = int(word_data.get('repetitions', 0))
    time_last_seen = int(word_data.get('time_last_seen', 0))
    
    # 1. Overdue words are always available
    if next_due <= current_time:
        return True
    
    # 2. Words learned in current session (for rapid reinforcement)
    if time_last_seen >= session_start:
        return True
    
    # 3. Words approaching 24h critical window
    time_since_last = (current_time - time_last_seen) / (1000 * 60 * 60)
    if 20 <= time_since_last <= 28:
        return True
    
    # 4. Low-repetition words (still in acquisition phase)
    if repetitions <= 3:
        hours_until_due = (next_due - current_time) / (1000 * 60 * 60)
        if hours_until_due <= 6:  # Available if due within 6 hours
            return True
    
    return False