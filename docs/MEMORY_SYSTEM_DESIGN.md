# Memory System Design

## Overview

This vocabulary learning system uses a **simplified memory approach** optimized for controlled experimental comparison between conversational learning and traditional flashcards.

## Experimental Design

### Comparison Study
- **Condition A**: Conversational vocabulary learning (this system)
- **Condition B**: Traditional flashcards
- **Counterbalanced**: Participant order randomized between conditions
- **Structure**: 2x 10-minute learning blocks per condition + 24-hour post-test

### Why Simplified Memory System

The memory system deliberately steps down from traditional SRS to create a **controlled experimental environment**:

1. **Isolate Variables**: Compare conversation vs flashcards, not different algorithms
2. **Equivalent Exposure**: Both conditions get same timing and word exposure
3. **Clean Comparison**: Remove SRS complexity that would confound results
4. **Experimental Focus**: Test conversational learning effectiveness, not memory algorithms

## System Architecture

### Word Introduction
- **Criteria**: Words with `total_uses = 0` (never used in conversation)
- **Source**: Unintroduced words from vocabulary.csv 
- **Process**: Word Introducer agent fetches 3-5 new words without updating timestamps
- **Tracking**: Background processor analyzes word usage and updates CSV automatically

### Word Review
- **Criteria**: Words with `total_uses > 0` (previously used)
- **Priority**: Sorted by `next_due` time (earliest first)
- **Process**: Review agent creates scenarios using words closest to needing review
- **Focus**: Simple time-based priority for predictable experimental control

## Implementation

### Session Structure (Per Condition)
- **Block 1**: Word introduction (10 minutes)
- **Block 2**: Word review (10 minutes)  
- **Post-Test**: 24-hour retention assessment

### Background Processing
- **GPT-4.1-mini** analyzes conversation text for vocabulary usage
- **Automatic CSV updates** track word usage statistics
- **Speaker differentiation** separates user vs assistant usage

### Agent Framework
- **Word Introducer**: Gets unintroduced words, teaches rapidly
- **Review Agent**: Gets due words, creates practice scenarios
- **Seamless handoffs** between introduction and review phases

This design prioritizes **experimental validity** and **controlled comparison** over algorithmic sophistication, making it ideal for testing conversational learning effectiveness against traditional flashcard methods.