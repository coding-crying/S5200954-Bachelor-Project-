# Experimental Design: LLM Conversational Tutor vs Traditional Flashcards

## Overview

This study compares the effectiveness of an AI-powered conversational vocabulary tutor using GPT-4o-mini-realtime against traditional digital flashcards for vocabulary learning. The research employs a within-subjects ABAB design with 24-hour delayed testing.

## Research Questions

**Primary**: To what extent do conversational LLM agents outperform traditional flashcards in vocabulary learning effectiveness and learner engagement?

**Secondary**: What is the relationship between engagement differences and learning outcome differences across knowledge types (contextual vs definitional)?

## Design

### Participants
- **Target**: University students aged 18-25, ESL learners
- **Sample Size**: 15 participants
- **Inclusion**: Intermediate+ English proficiency, unfamiliar with C2-level vocabulary

### Design Type
- **Within-subjects ABAB design** with counterbalancing
- **Independent Variables**: Learning method (Conversational vs Flashcard), Word set (12 per condition)
- **Dependent Variables**: Contextual knowledge, Explicit knowledge, Engagement (Short RIMMS per condition)

## Materials & Technology

### Vocabulary
- **Source**: 34 curated C2-level words + "happy" attention check
- **Personalization**: GUI tool for familiar word exclusion → 24 final words
- **Allocation**: Random assignment to conditions (12 each)

### Systems
- **Conversational Tutor**: GPT-4o-mini-realtime, WebRTC voice, real-time vocabulary analysis
- **Flashcard Condition**: Digital cards with user-guided study
- **Assessment**: Automated Google Forms generation from participant vocabulary

## Procedure

### Session 1: Laboratory (40 minutes)
1. **Pretest** (2 min): Vocabulary selection via GUI, attention check validation
2. **Setup** (1 min): ABAB counterbalancing, word allocation (6 per block)
3. **Learning Blocks** (32 min): A1-B1-A2-B2 (7 min each + 1 min breaks with micro-questionnaires)
4. **Assessment** (5 min): Short RIMMS for both conditions (12 items each), preference ratings

### Session 2: 24-Hour Online Test (15 minutes)
**Automated Generation**: Participant-specific Google Forms with 48 questions

**Part A - Contextual (24 items)**: Fill-in-blank with word bank visible
- Example: "The politician's _____ speech convinced nobody." 

**Part B - Definitional (24 items)**: Define each word
- Tests explicit knowledge of same vocabulary

**Scoring**: 48 total points (1 per question), analyzed by condition and knowledge type

## Data Collection

### Primary Measures
- **Learning Outcomes**: 24h delayed test scores (contextual + definitional)
- **Engagement**: Short RIMMS difference scores between conditions

### Automated Systems
- **Usage Quality**: GPT-4.1-mini analysis of conversational vocabulary usage
- **Real-time tracking**: Vocabulary usage, interaction patterns, timing
- **Test generation**: Participant-specific Google Forms from vocabulary selections
- **Data organization**: Structured participant folders with all session data

## Controls & Analysis

### Experimental Controls
- **ABAB Counterbalancing**: Group 1 (CONV-CARD-CONV-CARD) vs Group 2 (CARD-CONV-CARD-CONV)
- **Randomization**: Word assignment to blocks, assessment question order
- **Attention Validation**: "Happy" word pretest check, completion monitoring
- **Technical Standardization**: Controlled lab environment, consistent equipment

### Statistical Analysis
**Primary**: Repeated measures ANOVA (method × knowledge type), Paired t-tests for direct comparisons

**Secondary**: RIMMS difference scores, Engagement-learning correlations, Usage quality predictors

**Power**: n=15 adequate for large effects (d > 0.8) with within-subjects design

## Hypotheses & Implications

### Primary Hypotheses
1. **H1**: Conversational condition shows superior 24h retention
2. **H2**: Conversational condition demonstrates higher Short RIMMS engagement scores  
3. **H3**: RIMMS difference scores predict learning outcome differences
4. **H4**: Conversational advantage stronger for contextual vs definitional knowledge

### Expected Impact
**Educational Technology**: Evidence for AI-enhanced vocabulary learning and design principles for conversational tutoring systems

**Second Language Learning**: Optimal conditions for vocabulary acquisition and role of contextual vs explicit instruction

### Limitations
- **Sample**: Small n=15, university ESL learners only
- **Scope**: Single session, 24h retention, C2-level vocabulary only  
- **Technology**: Potential AI consistency and connectivity issues