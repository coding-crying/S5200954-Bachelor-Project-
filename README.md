# Conversational AI Vocabulary Learning System - Experimental Version

> **Note**: This is the experimental/simplified version of the system used for controlled testing. For the full production system with Neo4j graph database and complete spaced repetition implementation, see: [realtime-agents-language-tutor](https://github.com/coding-crying/realtime-agents-language-tutor)

This is a comprehensive vocabulary learning application featuring conversational AI tutors with an integrated experimental research platform. The system includes:

## Features
- **Two-Agent Handoff System**: IntroducerAgent for new vocabulary, ReviewAgent for practice
- **Voice-Based Learning**: Real-time conversational interaction using OpenAI Realtime API
- **Traditional Flashcard Control**: Definitions with 1-2 contextual examples per word
- **Experimental Controller**: Automated ABAB/BABA counterbalanced study management
- **Priority-Based Scheduling**: Recently introduced words with lowest frequency receive review priority
- **RIMMS Motivation Assessment**: Four dimensions (Attention, Relevance, Confidence, Satisfaction)

## Experimental Research Platform

This system was designed to conduct within-subjects experiments comparing conversational AI tutoring with traditional flashcard learning. Key findings from our completed study:

### Study Results (N=11 participants)
- **Learning Performance**: No significant difference in learning outcomes (Conversational AI: 62.7%, Flashcards: 70.9%, p = .281, r = 0.357)
- **Motivation**: Conversational AI showed higher engagement with moderate effect sizes:
  - Attention capture (r = 0.402, moderate effect)
  - Learning satisfaction (r = 0.405, moderate effect)
- **Individual Learning Profiles**: Three distinct patterns emerged:
  - Conversational learners (27%): 20-30% advantage with AI agents
  - Traditional learners (36%): 30-50% advantage with flashcards  
  - Method-agnostic learners (36%): Similar performance across conditions

### Research Documentation
- `docs/COMPLETE_EXPERIMENTAL_RESULTS.md` - Comprehensive research report
- Documentation of experimental design and findings

## Quick Start

### Setup and Running Experiments
1. Add your `OPENAI_API_KEY` to `.env` file
2. Install dependencies: `npm install`
3. Run experimental controller: `python experimental_controller.py --participant-id 001 --start-experiment`
4. **Participant Instructions**: See `instruction.md` for the complete 1-minute briefing script

### Testing Components
```bash
# Test vocabulary system
cd tests && python test_vocab.py

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

### Experimental Vocabulary System
- **CSV-based Memory**: Simplified storage adapted for single-session constraints  
- **Two-Agent Architecture**: Specialized IntroducerAgent and ReviewAgent using OpenAI Swarm handoffs
- **Priority Queue Scheduling**: Recently introduced words with lowest user frequency receive priority
- **Direct Function Calls**: getNewWords() and getReviewWords() replace complex supervisor coordination
- **Language Processor**: Analyzes conversations and generates CSV updates tracking usage patterns

### Experimental Design  
- **Within-subjects**: ABAB/BABA counterbalanced design (N=11 participants)
- **6-minute learning blocks** with 30-second breaks between blocks
- **C2-level vocabulary**: 29 advanced English words plus control word "happy"
- **Multiple-choice assessment**: 12-24 hours post-session via Google Forms
- **RIMMS motivation survey**: Administered after third and fourth blocks
- **Automated Master Controller**: Eliminates manual administration and timing errors

### Statistical Analysis
- **Wilcoxon signed-rank tests** for non-parametric within-subjects comparisons
- **Effect sizes (r = z/√n)** for magnitude quantification  
- **Individual learning profiles** revealing distinct method preferences
- **Correlation analysis** between motivational dimensions and performance outcomes
- **Post-hoc power analysis**: 34% power for performance, 54% for motivation effects

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
*Experimental two-agent handoff system with IntroducerAgent and ReviewAgent coordination via OpenAI Swarm*

**Technical Implementation**: Built on OpenAI's Realtime Agents demo (Swarm framework), restructured for continuous linguistic analysis. Uses gpt-4o-mini-realtime for responsive conversation and CSV storage with priority-queue scheduling for experimental validation.

## Research Citation
**Hermann, W. (2025).** *Architecture and Testing of AI Tutors that Remember Past Interactions for Language Learning.* Bachelor's Thesis, University of Groningen.

**Key Findings**: No significant learning difference detected (p = .281), but conversational agents achieved higher attention (r = 0.402) and satisfaction (r = 0.405) scores. Individual learning profiles ranged from -50% to +30% performance differences, suggesting learner-method fit may be more important than universal method superiority. Study was underpowered (34%) - approximately 21 participants needed for 80% power to detect moderate effects.
