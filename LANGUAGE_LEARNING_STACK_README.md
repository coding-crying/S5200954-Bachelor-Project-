# Language Learning Agent Stack

A comprehensive language learning system that combines conversational AI with spaced repetition and real-time linguistic analysis using Neo4j and GPT-4.1-mini.

## 🎯 Overview

This system enables users to learn languages conversationally with an AI tutor while automatically tracking vocabulary progress, creating personalized learning paths, and implementing spaced repetition for optimal retention.

## 🏗️ Architecture

### Core Components

1. **Introduction Agent** - Welcomes users and collects language preferences
2. **New Language Intro Agent** - Guides complete beginners through first steps
3. **Existing Language Intro Agent** - Assesses users with prior knowledge
4. **AI Tutor Agent (Carlos)** - Provides personalized conversational tutoring
5. **Utterance Processor** - Analyzes conversation for linguistic data
6. **SRS System** - Manages spaced repetition for vocabulary learning

### Data Flow

```
User Input → Utterance Processor → GPT-4.1-mini Analysis → Neo4j Storage
                                                              ↓
AI Tutor ← Context & SRS Data ← Neo4j Query ← Vocabulary Extraction
```

## 🗄️ Database Schema (Neo4j)

### Node Types

- **User**: `{userId, name, nativeLanguage, targetLanguage, createdAt}`
- **Language**: `{code, name}` (e.g., 'es', 'Spanish')
- **Lexeme**: `{lemma, language, partOfSpeech}`
- **Conversation**: `{conversationId, startTime, endTime, userId}`
- **Utterance**: `{utteranceId, text, speaker, timestamp, sequenceInConversation}`
- **SRS_Item**: `{itemId, userId, lastReviewed, nextReview, interval, easeFactor, repetitions, lapses, status}`

### Relationships

- `(User)-[:SPEAKS_NATIVELY]->(Language)`
- `(User)-[:LEARNING_LANGUAGE]->(Language)`
- `(User)-[:HAS_SRS_ITEM]->(SRS_Item)`
- `(SRS_Item)-[:FOR_LEXEME]->(Lexeme)`
- `(Lexeme)-[:IN_LANGUAGE]->(Language)`
- `(Lexeme)-[:TRANSLATES_TO]->(Lexeme)`
- `(Conversation)-[:HAS_UTTERANCE]->(Utterance)`
- `(Utterance)-[:CONTAINS_LEXEME]->(Lexeme)`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Neo4j AuraDB instance
- OpenAI API key

### Environment Variables

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize Neo4j schema:
```bash
curl -X POST http://localhost:3000/api/neo4j/setup
```

3. Start the development server:
```bash
npm run dev
```

4. Navigate to `http://localhost:3000?agentConfig=languageLearning`

## 📡 API Endpoints

### User Management
- `POST /api/users/initialize` - Create new user
- `GET /api/users/initialize?userId=...` - Get user profile

### Utterance Processing
- `POST /api/utterance/process` - Process conversation utterances

### SRS System
- `GET /api/srs?userId=...&targetLanguage=...` - Get due vocabulary items
- `PUT /api/srs` - Update SRS item after review
- `POST /api/srs` - Get SRS statistics

### Schema Management
- `POST /api/neo4j/setup` - Initialize database schema

## 🤖 Agent Workflow

### 1. User Onboarding
```
Introduction Agent → Collect user info → Create Neo4j user profile
                  ↓
Assess experience level → Route to appropriate intro agent
```

### 2. Language Introduction
```
New/Existing Language Intro → Assess current level → Transfer to AI Tutor
```

### 3. Conversational Learning
```
AI Tutor ← Get user context & due SRS items ← Neo4j
    ↓
Generate personalized response incorporating vocabulary review
    ↓
Process user response → Extract linguistic data → Update SRS items
```

## 🧠 SRS Algorithm (SM-2)

The system implements the SuperMemo SM-2 algorithm for optimal vocabulary retention:

- **Quality Scale**: 0-5 (0-2 incorrect, 3 difficult, 4 correct, 5 easy)
- **Ease Factor**: Starts at 2.5, adjusts based on performance
- **Intervals**: 1 day → 6 days → previous interval × ease factor
- **Status Tracking**: new → learning → learned (with lapse handling)

## 🔧 Testing

Run the comprehensive test suite:

```bash
node test-language-learning-stack.js
```

This tests:
- Schema initialization
- User creation
- Utterance processing
- SRS functionality
- Data integrity

## 📊 Features

### Real-time Linguistic Analysis
- Lemmatization and POS tagging
- Vocabulary extraction
- Translation relationship creation
- Semantic relationship mapping

### Personalized AI Tutoring
- Context-aware responses based on user's vocabulary knowledge
- Natural incorporation of due vocabulary items
- Adaptive difficulty based on SRS data
- Gentle error correction and encouragement

### Spaced Repetition System
- Automatic vocabulary item creation from conversations
- SM-2 algorithm implementation
- Performance tracking and adaptation
- Status-based review prioritization

### Conversation Tracking
- Complete conversation history storage
- Speaker identification and sequencing
- Linguistic data extraction and storage
- Progress analytics and insights

## 🔮 Future Enhancements

- **Relationship Building Agent**: Calculate co-occurrence weights and semantic relationships
- **Advanced Analytics**: Learning progress visualization and insights
- **Multi-modal Support**: Audio processing and pronunciation feedback
- **Cultural Context**: Integration of cultural learning alongside language
- **Gamification**: Achievement systems and learning streaks

## 🛠️ Development Notes

### Model Configuration
- Currently using `gpt-4o-mini` (will upgrade to `gpt-4.1-mini` when available)
- Temperature: 0.2 for consistent linguistic analysis
- JSON response format for structured data extraction

### Performance Considerations
- Asynchronous utterance processing to avoid blocking conversations
- Efficient Neo4j queries with proper indexing
- Batch processing capabilities for conversation analysis

### Error Handling
- Graceful degradation when APIs are unavailable
- Comprehensive logging for debugging
- Data consistency checks and recovery mechanisms

## 📝 License

This project is part of the Bachelor Project and is intended for educational and research purposes.
