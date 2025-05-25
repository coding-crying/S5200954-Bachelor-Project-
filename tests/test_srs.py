"""
Tests for the Spaced Repetition System (SRS) module.
"""

import unittest
import sys
import os

# Add the parent directory to the path so we can import the agents module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.srs import update, calculate_quality


class TestSRS(unittest.TestCase):
    """
    Test cases for the SRS module.
    """
    
    def test_update_quality_below_3(self):
        """
        Test that update resets repetitions and interval when quality is below 3.
        """
        card = {
            'EF': 2.5,
            'interval': 10,
            'repetitions': 5
        }
        
        # Quality 0 (complete blackout)
        new_ef, new_interval, new_repetitions = update(card, 0)
        self.assertLess(new_ef, 2.5)  # EF should decrease
        self.assertEqual(new_interval, 1)  # Interval should reset to 1
        self.assertEqual(new_repetitions, 0)  # Repetitions should reset to 0
        
        # Quality 2 (incorrect but familiar)
        new_ef, new_interval, new_repetitions = update(card, 2)
        self.assertLess(new_ef, 2.5)  # EF should decrease
        self.assertEqual(new_interval, 1)  # Interval should reset to 1
        self.assertEqual(new_repetitions, 0)  # Repetitions should reset to 0
    
    def test_update_quality_3_or_above(self):
        """
        Test that update increments repetitions and calculates new interval when quality is 3 or above.
        """
        # First repetition
        card1 = {
            'EF': 2.5,
            'interval': 1,
            'repetitions': 0
        }
        
        new_ef, new_interval, new_repetitions = update(card1, 5)
        self.assertGreater(new_ef, 2.5)  # EF should increase
        self.assertEqual(new_interval, 1)  # First interval is always 1
        self.assertEqual(new_repetitions, 1)  # Repetitions should increment
        
        # Second repetition
        card2 = {
            'EF': 2.5,
            'interval': 1,
            'repetitions': 1
        }
        
        new_ef, new_interval, new_repetitions = update(card2, 5)
        self.assertGreater(new_ef, 2.5)  # EF should increase
        self.assertEqual(new_interval, 6)  # Second interval is always 6
        self.assertEqual(new_repetitions, 2)  # Repetitions should increment
        
        # Third repetition
        card3 = {
            'EF': 2.5,
            'interval': 6,
            'repetitions': 2
        }
        
        new_ef, new_interval, new_repetitions = update(card3, 5)
        self.assertGreater(new_ef, 2.5)  # EF should increase
        self.assertEqual(new_interval, round(6 * new_ef))  # Interval should be previous * EF
        self.assertEqual(new_repetitions, 3)  # Repetitions should increment
    
    def test_update_with_string_values(self):
        """
        Test that update handles string values correctly.
        """
        card = {
            'EF': '2.5',
            'interval': '10',
            'repetitions': '5'
        }
        
        new_ef, new_interval, new_repetitions = update(card, 4)
        self.assertIsInstance(new_ef, float)
        self.assertIsInstance(new_interval, int)
        self.assertIsInstance(new_repetitions, int)
    
    def test_update_ef_minimum(self):
        """
        Test that EF never goes below 1.3.
        """
        card = {
            'EF': 1.4,
            'interval': 10,
            'repetitions': 5
        }
        
        # Quality 0 (complete blackout) - should decrease EF significantly
        new_ef, _, _ = update(card, 0)
        self.assertGreaterEqual(new_ef, 1.3)  # EF should not go below 1.3
    
    def test_calculate_quality(self):
        """
        Test the calculate_quality function.
        """
        # Perfect score
        self.assertEqual(calculate_quality(10, 10), 5)
        
        # High score
        self.assertEqual(calculate_quality(9, 10), 4)
        
        # Medium score
        self.assertEqual(calculate_quality(7, 10), 3)
        
        # Low score
        self.assertEqual(calculate_quality(5, 10), 2)
        
        # Very low score
        self.assertEqual(calculate_quality(3, 10), 1)
        
        # Terrible score
        self.assertEqual(calculate_quality(2, 10), 0)
        
        # No uses
        self.assertEqual(calculate_quality(0, 0), 0)


if __name__ == '__main__':
    unittest.main()
