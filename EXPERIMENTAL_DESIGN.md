# Experimental Design: LLM Conversational Tutor vs Traditional Flashcards

## Overview

This study compares the effectiveness of an AI-powered conversational vocabulary tutor using GPT-4o-mini-realtime against traditional digital flashcards for vocabulary learning. The research employs a within-subjects ABAB design with 24-hour delayed testing using an automated experimental controller system.

## Research Questions

**Primary**: To what extent do conversational LLM agents outperform traditional flashcards in vocabulary learning effectiveness and learner engagement?

**Secondary**: What is the relationship between engagement differences and learning outcome differences across knowledge types (contextual vs definitional)?

## Design

### Participants
- **Target**: University students aged 18-25, ESL learners
- **Sample Size**: 15 participants
- **Inclusion**: Intermediate+ English proficiency, unfamiliar with C2-level vocabulary

### Design Type
- **Within-subjects ABAB design** with automated counterbalancing (ABAB/BABA)
- **Independent Variables**: Learning method (Conversational vs Flashcard), Word set (10 per condition)
- **Dependent Variables**: Contextual knowledge, Explicit knowledge, Engagement (RIMMS per condition)

## Materials & Technology

### Vocabulary
- **Source**: 29 curated C2-level words + "happy" attention check
- **Personalization**: GUI tool for familiar word exclusion → 20 final words
- **Allocation**: Random assignment to conditions (10 each)
- **Condition-Specific Files**: Separate CSV files maintain vocabulary tracking per condition

### Systems
- **Experimental Controller**: Python script manages entire pipeline with automated timing and condition switching
- **Conversational Tutor**: GPT-4o-mini-realtime, WebRTC voice, real-time vocabulary analysis via GPT-4.1-mini
- **Flashcard Condition**: Digital cards with 5-minute timer, participant-specific vocabulary loading
- **Assessment**: Automated Google Forms generation with JavaScript syntax validation
- **Development Server**: Automatic npm server startup ensures web interface availability

## Procedure

### Session 1: Laboratory (30 minutes)
1. **Pretest** (5 min): Automated vocabulary selection via GUI with fullscreen interface
2. **Automated Setup**: Experimental controller handles ABAB/BABA counterbalancing, random word allocation
3. **Learning Blocks** (22 min): Four 5-minute blocks with 30-second breaks between conditions
4. **Assessment** (3 min): RIMMS surveys automatically triggered after 2nd exposure blocks

### Session 2: 24-Hour Online Test (10 minutes)
**Automated Generation**: Participant-specific Google Forms with 40 questions

**Part A - Contextual (20 items)**: Fill-in-blank with word bank visible
- Example: "The politician's _____ speech convinced nobody." 

**Part B - Definitional (20 items)**: Define each word
- Tests explicit knowledge of same vocabulary

**Scoring**: 40 total points (1 per question), analyzed by condition and knowledge type
**Generation**: Post-test automatically created with properly escaped JavaScript for Google Apps Script

## Data Collection

### Primary Measures
- **Learning Outcomes**: 24h delayed test scores (contextual + definitional)
- **Engagement**: RIMMS difference scores between conditions

### Automated Systems
- **Usage Quality**: GPT-4.1-mini analysis of conversational vocabulary usage with participant/condition routing
- **Real-time tracking**: Vocabulary usage, interaction patterns, timing via condition-specific CSV files
- **Test generation**: Participant-specific Google Forms with syntax validation
- **Data organization**: Structured participant folders with complete session data
- **Pipeline Control**: Experimental controller manages timing, conditions, server startup, and post-test generation

## Controls & Analysis

### Experimental Controls
- **ABAB Counterbalancing**: Automated ABAB/BABA assignment (CONV-CARD-CONV-CARD vs CARD-CONV-CARD-CONV)
- **Randomization**: Automated word assignment to conditions, assessment question order
- **Attention Validation**: "Happy" word pretest check, automated completion monitoring
- **Technical Standardization**: Automated server management, controlled timing, condition-specific data isolation
- **Data Integrity**: Separate vocabulary files prevent cross-condition contamination

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