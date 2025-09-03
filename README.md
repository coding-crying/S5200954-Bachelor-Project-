# Conversational AI Vocabulary Learning System - Experimental Version

> **Note**: This is the experimental/simplified version of the system used for controlled testing. For the full production system with Neo4j graph database and complete spaced repetition implementation, see: [realtime-agents-language-tutor](https://github.com/coding-crying/realtime-agents-language-tutor)

This is a comprehensive vocabulary learning application featuring conversational AI tutors with an integrated experimental research platform. The system includes:

## Features
- **Conversational AI Tutor**: Interactive dialogue-based vocabulary learning with real-time feedback
- **Traditional Flashcard System**: Control condition for experimental comparisons
- **Spaced Repetition Algorithm**: SM-2 implementation for optimized vocabulary retention
- **Experimental Controller**: Automated ABAB/BABA counterbalanced study management
- **Comprehensive Analytics**: Statistical analysis and visualization tools
- **RIMMS Motivation Assessment**: Validated survey for measuring learning motivation

## Experimental Research Platform

This system was designed to conduct within-subjects experiments comparing conversational AI tutoring with traditional flashcard learning. Key findings from our completed study:

### Study Results (N=11 participants)
- **Learning Performance**: No significant difference in learning outcomes (Conversational AI: 62.7%, Flashcards: 70.9%, p = .281, r = 0.357)
- **Motivation**: Conversational AI showed higher engagement with moderate effect sizes:
  - Attention capture (r = 0.402, moderate effect)
  - Learning satisfaction (r = 0.405, moderate effect)
  - Individual differences emerged as primary factor, with performance variations ranging from -50% to +30% between conditions

### Research Documentation
- `docs/COMPLETE_EXPERIMENTAL_RESULTS.md` - Comprehensive research report
- Documentation of experimental design and findings

## Quick Start

### Setup and Running Experiments
1. Add your `OPENAI_API_KEY` to `.env` file
2. Install dependencies: `npm install`  
3. Run experimental controller: `python experimental_controller.py --participant-id 001 --start-experiment`

### Testing Components
```bash
# Test vocabulary system
cd tests && python test_vocab.py
cd tests && python test_srs.py

# Test conversation processing
cd tests && node test_conversation_pipeline.js
cd tests && node test_batch_processing.js

# Reset vocabulary for testing
node reset_vocabulary_for_testing.js
```

## Application Interface

The conversational AI tutor provides an intuitive interface for vocabulary learning:
- **Real-time conversation**: Voice-based interaction with AI vocabulary tutor
- **Progress tracking**: Visual feedback on learning progress and word mastery
- **Adaptive learning**: Spaced repetition algorithm adjusts based on performance
- **Experimental modes**: Switch between conversational AI and flashcard conditions

## Research Architecture

### Vocabulary Learning System
- **CSV-based Memory**: Persistent storage with SM-2 spaced repetition algorithm
- **Word Effectiveness Analysis**: Real-time GPT-4.1-mini powered conversation analysis
- **Batch Processing**: 3-second inactivity timer with 10-message buffer limits
- **Condition Isolation**: Separate vocabulary sets prevent cross-condition contamination

### Experimental Design
- **Within-subjects**: ABAB/BABA counterbalanced design
- **6-minute learning blocks** with 30-second breaks (manual progression available)
- **24-hour delayed testing** via automated Google Forms generation
- **RIMMS motivation assessment** after each condition's second exposure

### Statistical Analysis
- **Paired t-tests** for within-subjects comparisons
- **Cohen's d effect sizes** for practical significance
- **Individual participant profiling** with trajectory analysis
- **Correlation matrices** between learning and motivation measures

### File Structure
```
├── docs/                          # Documentation and reports
│   ├── COMPLETE_EXPERIMENTAL_RESULTS.md
│   ├── EXPERIMENTAL_DESIGN.md
│   └── *.md files
├── tests/                         # Test files
│   ├── test_vocab.py
│   └── test_*.js files
├── agents/                        # Agent system components
├── experimental_controller.py     # Main experimental controller
├── experiment_word_selector.py    # Vocabulary selection tool
├── post_test_generator.py         # Post-test generation
└── src/                          # Next.js application source code
```

## Architecture Overview

![Model Architecture](Screenshot%20from%202025-09-02%2023-43-42.png)
*System architecture showing the two-agent handoff design with IntroducerAgent and ReviewAgent components*

## Core Contributors
- Noah MacCallum - [noahmacca](https://x.com/noahmacca)
- Ilan Bigio - [ibigio](https://github.com/ibigio)

**Note**: This system was forked from OpenAI's Swarm framework with extensive additions including the experimental research platform, CSV-based vocabulary management, RIMMS motivation assessment integration, and comprehensive statistical analysis tools.

## Research Citation
This experimental study found no significant difference in learning outcomes between conversational AI tutoring and traditional flashcards, though conversational AI showed moderate effect sizes for increased attention and satisfaction. Individual differences emerged as the primary factor affecting learning method effectiveness, suggesting that personalized approaches may be more important than universal method superiority.
