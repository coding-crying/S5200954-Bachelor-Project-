# Conversational AI Vocabulary Learning System

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

### Study Results (N=12 participants)
- **Learning Performance**: Equivalent outcomes between conditions (Conversational AI: 60%, Flashcards: 62%)
- **Motivation**: Conversational AI significantly outperformed flashcards in:
  - Attention capture (Cohen's d = 0.97, large effect)
  - Learning satisfaction (Cohen's d = 1.12, large effect)
  - Overall motivation (approaching significance, p = 0.092)

### Generated Research Outputs
- `docs/COMPLETE_EXPERIMENTAL_RESULTS.md` - Comprehensive 12-page research report
- `results/experiment_results_master.csv` - Complete dataset with all participants
- `results/*.png` - Visualization suite (5 publication-ready graphs)
- Individual participant analysis files
- `results/comprehensive_results_analysis.py` - Statistical analysis scripts

## Quick Start

### Basic Setup
- This is a Next.js TypeScript application with Python backend components
- Install dependencies: `npm install`
- Add your `OPENAI_API_KEY` to `.env` file
- Start development server: `npm run dev`
- Open [http://localhost:3000](http://localhost:3000)

### Running Experiments
- **Start experiment**: `python experimental_controller.py --participant-id 001 --start-experiment`
- **Resume session**: `python experimental_controller.py --participant-id 001 --resume-block 3`
- **Analyze results**: `cd results && python comprehensive_results_analysis.py`
- **Generate visualizations**: `cd results && python create_visualizations.py`

### Accessing Participant Data
Participant data is password-protected for privacy:
```bash
cd participants
python access_participants.py 001  # Access specific participant
python access_participants.py      # List all participants
```
*Password required: Contact repository maintainer for access*

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
- **5-minute learning blocks** with 30-second breaks (manual progression available)
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
├── results/                       # Analysis outputs and scripts
│   ├── experiment_results_master.csv
│   ├── comprehensive_results_analysis.py
│   ├── create_visualizations.py
│   └── *.png visualization files
├── tests/                         # Test files
│   ├── test_vocab.py
│   ├── test_srs.py
│   └── test_*.js files
├── participants/                  # Password-protected participant data
│   ├── access_participants.py    # Password-protected access script
│   └── participant_XXX/          # Individual participant data
│       ├── vocabulary_conversational.csv
│       ├── vocabulary_flashcard.csv
│       ├── rimms_conversational.json
│       ├── rimms_flashcard.json
│       └── participant_XXX_results.csv
└── src/                          # Application source code
```

## Core Contributors
- Noah MacCallum - [noahmacca](https://x.com/noahmacca)
- Ilan Bigio - [ibigio](https://github.com/ibigio)

## Research Citation
This system demonstrated that conversational AI tutoring achieves equivalent learning outcomes to traditional flashcards while providing significantly higher motivation and engagement, suggesting promising applications for educational technology development.
