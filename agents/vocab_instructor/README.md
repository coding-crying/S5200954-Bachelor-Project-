# Vocabulary Instructor

A system for vocabulary learning using spaced repetition and different agent types for varied learning experiences.

## Overview

The Vocabulary Instructor system helps users learn and retain vocabulary through a combination of spaced repetition (SM-2 algorithm) and varied learning experiences provided by different agent types. The system tracks user progress with vocabulary words and adapts the learning experience accordingly.

## Components

### Agents

- **VocabSupervisorAgent**: Manages the overall learning experience and decides which sub-agent to call for each interaction.
- **RoleplayAgent**: Provides contextual vocabulary practice through roleplaying scenarios.
- **TestingAgent**: Formally tests vocabulary knowledge with direct questions.
- **ReviewAgent**: Reviews previously learned words to reinforce memory.

### Tools and Utilities

- **WordPicker**: Tool for selecting words due for review based on the SM-2 algorithm.
- **vocab_store.py**: Manages vocabulary data storage and retrieval using a CSV file.
- **srs.py**: Implements the SM-2 spaced repetition algorithm.

## Data Structure

The vocabulary data is stored in a CSV file with the following schema:

```
word,time_last_seen,correct_uses,total_uses,next_due,EF,interval,repetitions
```

Where:
- **word**: The vocabulary word
- **time_last_seen**: Timestamp of when the word was last seen
- **correct_uses**: Number of times the word was used correctly
- **total_uses**: Total number of times the word was used
- **next_due**: Timestamp of when the word is next due for review
- **EF**: Ease Factor (from SM-2 algorithm)
- **interval**: Current interval in days (from SM-2 algorithm)
- **repetitions**: Number of repetitions (from SM-2 algorithm)

## Usage

To run the Vocabulary Instructor demo:

```bash
python main.py --vocab-demo
```

This will start the VocabSupervisorAgent loop, which will cycle through the different agent types to provide a varied learning experience.

## Implementation Details

### SM-2 Algorithm

The system uses the SM-2 algorithm for spaced repetition, which calculates the optimal intervals between reviews based on user performance. The algorithm is implemented in `srs.py`.

### Conversation Processing

Conversation logs are processed with GPT-4.1-mini to identify word usage and update the vocabulary store accordingly. This allows the system to track user performance with vocabulary words during natural conversations.

## Development

To add new vocabulary words, simply add them to the vocabulary.csv file. The system will automatically pick them up and include them in the learning process.
