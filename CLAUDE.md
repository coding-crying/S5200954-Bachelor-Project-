# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Conversational Tutor** - An interactive language learning application built on Next.js that extends OpenAI's Realtime API with a sophisticated vocabulary instruction system and CSV-based memory using spaced repetition (SM-2 algorithm).

## Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build  
npm run start        # Start production server
npm run lint         # ESLint code checking
```

### Testing Commands
```bash
node test_conversation_pipeline.js  # Test conversation processing
node test_batch_processing.js       # Test batch processing efficiency
python test_vocab.py                # Test Python vocabulary components
python test_srs.py                 # Test spaced repetition system
```

### Vocabulary Management
```bash
node reset_vocabulary_for_testing.js    # Reset vocabulary for testing
node migrate_vocabulary_csv.js          # Migrate CSV schema
python agents/vocab_instructor/test_effectiveness.py  # Test effectiveness analyzer
```

## Core Architecture

### Technology Stack
- **Frontend**: Next.js 15.3.1 + React 19 + TypeScript + TailwindCSS
- **AI**: OpenAI GPT-4.1-mini (vocabulary analysis) + OpenAI GPT-4o-mini-realtime (conversational agents) + OpenAI Realtime API (voice)
- **Memory**: CSV files with SM-2 spaced repetition algorithm
- **Backend**: Next.js API routes + Python processing modules

### Key Entry Points
- **`/src/app/page.tsx`** - Main application entry with context providers
- **`/src/app/App.tsx`** - Core realtime connection and agent management
- **`/vocabulary.csv`** - Primary memory system data store

## VocabularyInstructor Agent Framework

The primary agent system located in `/src/app/agentConfigs/vocabularyInstructor/index.ts`:

### Core Agents
- **`wordIntroducer`**: Introduces 1-2 new vocabulary words at a time from CSV database, fetching up to 4 words for paced learning
- **`reviewAgent`**: Reviews high-priority words using spaced repetition algorithm in engaging roleplay scenarios

### Agent Tools
- **`fetchRandomWords(count)`**: Gets new unintroduced words from CSV
- **`fetchHighPriorityWords(count)`**: Gets words due for review via SRS algorithm  
- **`searchVocabularyWords(term)`**: Searches vocabulary database

## Memory System Architecture

### CSV Schema (`/vocabulary.csv`)
```csv
word,time_last_seen,correct_uses,total_uses,user_correct_uses,user_total_uses,system_correct_uses,system_total_uses,next_due,EF,interval,repetitions
```

### Key Components
- **`/agents/srs.py`**: SM-2 spaced repetition algorithm implementation
- **`/agents/vocab_instructor/vocab_store.py`**: CSV CRUD operations and SRS integration
- **`/src/app/api/vocabulary/route.ts`**: API endpoint for vocabulary management

## Conversation Processing Pipeline

### Batch Processing System (`/src/app/hooks/useVocabularyProcessor.ts`)
- **3-second inactivity timer** for automatic batch processing
- **10-message buffer limit** for forced processing
- **Speaker differentiation**: Tracks user vs assistant vocabulary usage separately
- **Enhanced word form detection**: Handles plurals, conjugations, past tense

### Processing Flow
1. User speaks → Realtime transcription → Vocabulary analysis
2. GPT-4.1-mini background analysis → Word detection → Usage correctness evaluation
3. CSV updates → SRS calculation → Next review scheduling
4. Agent selection based on new words vs review words

## API Routes Structure

- **`/api/conversation/process`**: GPT-4.1-mini conversation analysis pipeline
- **`/api/vocabulary`**: CSV-based vocabulary management 
- **`/api/chat/completions`**: OpenAI completions proxy
- **`/api/session`**: Realtime API session management

## Configuration Requirements

- **Environment**: `.env` file with `OPENAI_API_KEY`
- **TypeScript**: Path aliases configured as `@/*` pointing to `/src/*`
- **Default agent**: `vocabularyInstructor` in dropdown selection

## Multi-Agent System

Agent configurations in `/src/app/agentConfigs/` include:
- **`vocabularyInstructor/`**: Primary vocabulary teaching framework
- **`languageLearning/`**: Language learning scenarios
- **`customerServiceRetail/`**: Demo customer service agents
- **`frontDeskAuthentication/`**: Demo authentication flow

Agents support seamless handoffs via transfer tools and maintain state across transitions.

## Key Implementation Notes

- **Real-time voice integration** via WebRTC connection to OpenAI Realtime API
- **Word form recognition** handles inflections (running → run, children → child)
- **Learning effectiveness metrics** scored 0.0-1.0 scale
- **Automatic vocabulary processing** in real-time during conversations
- **CSV-based persistence** with Python backend processing for SRS calculations