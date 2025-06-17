# Experimental Design: LLM Conversational Tutor vs Traditional Flashcards

## Overview

This study compares the effectiveness of an AI-powered conversational vocabulary tutor using GPT-4o-mini-realtime against traditional digital flashcards for vocabulary learning. The research employs a within-subjects design with 2×7 minute learning blocks per condition and 24-hour delayed testing.

## Research Question

**Primary**: Does conversational interaction with an LLM agent improve vocabulary learning compared to traditional flashcard study?

**Secondary**: Which learning method produces better contextual understanding versus explicit definitional knowledge?

## Participants

- **Target Population**: University students aged 18-25, English as second language learners
- **Sample Size**: 30-40 participants (sufficient for within-subjects design)
- **Recruitment**: University participant pools, ESL programs
- **Inclusion Criteria**: Intermediate+ English proficiency, unfamiliar with C2-level vocabulary

## Experimental Design

### Design Type
- **Within-subjects** (repeated measures)
- **Counterbalanced** condition order
- **Randomized** word assignment to conditions

### Independent Variables
- **Learning Method**: Conversational LLM Tutor vs Digital Flashcards
- **Word Set**: 12 words per condition (24 total per participant)

### Dependent Variables
- **Contextual Knowledge**: Fill-in-the-blank accuracy
- **Explicit Knowledge**: Definition production accuracy
- **Overall Learning**: Combined score across both measures
- **Engagement**: RIMMS intrinsic motivation scores per condition

## Materials

### Vocabulary Selection
- **Source**: Curated list of 34 advanced C2-level words
- **Pretest Selection**: Participants exclude familiar words using GUI tool
- **Final Set**: 24 words per participant (12 per condition)
- **Attention Check**: "Happy" test word to validate participant attention

### Technology Stack
- **Conversational Tutor**: 
  - GPT-4o-mini-realtime API
  - WebRTC real-time voice processing
  - Next.js 15.3.1 + React 19 + TypeScript
  - CSV-based vocabulary tracking with simplified spaced repetition
- **Flashcard Condition**: Digital flashcards with user-guided study
- **Assessment Platform**: Google Forms (24h delayed test)

## Memory System Design

### Simplified SRS Approach
- **Individual message processing** (batch processing removed)
- **Time-based review priority** (earliest due first)
- **Session-optimized intervals** for 24h retention focus
- **Clean experimental variables** (no complex algorithms confounding results)

### Vocabulary Processing
- **GPT-4.1-mini analysis** for usage correctness evaluation
- **Real-time feedback** on word usage quality
- **Speaker differentiation** (user vs assistant tracking)
- **Automatic CSV updates** for learning analytics

## Procedure

### Session 1: Laboratory Study (45 minutes)

#### 1. Pretest Word Selection (2 minutes)
- Participant reviews all 34 vocabulary words
- Excludes familiar words through GUI interface
- System randomly trims to exactly 24 words
- Attention check validation (must not select "happy")

#### 2. Condition Assignment (1 minute)
- Counterbalanced order (ABAB design)
- Random assignment of 6 words to each block
- Brief instruction for upcoming learning blocks

#### 3. Learning Block A1 (7 minutes)
**Condition A (6 words):**
- First exposure to condition A method
- 6 vocabulary words introduced/studied

#### 4. Break + Questionnaire (1 minute)
- Brief learning experience questionnaire
- Prevent condition interference

#### 5. Learning Block B1 (7 minutes)
**Condition B (6 words):**
- First exposure to condition B method
- 6 vocabulary words introduced/studied

#### 6. Break + Questionnaire (1 minute)
- Brief learning experience questionnaire
- Condition comparison notes

#### 7. Learning Block A2 (7 minutes)
**Condition A (6 words):**
- Return to condition A method
- Additional 6 vocabulary words
- Total: 12 words for condition A

#### 8. Break + Questionnaire (1 minute)
- Brief learning experience questionnaire
- Fatigue and engagement check

#### 9. Learning Block B2 (7 minutes)
**Condition B (6 words):**
- Return to condition B method
- Additional 6 vocabulary words
- Total: 12 words for condition B

#### 10. Final Feedback (5 minutes)
- Comprehensive experience questionnaire
- Preference ratings between conditions
- Technical difficulties assessment
- Full RIMMS (36 items) for conversational tutor condition only
- Comparative engagement questions:
  - "Which condition was more engaging?" (forced choice)
  - "Rate relative engagement" (7-point scale)

### Session 2: 24-Hour Delayed Test (15 minutes)

#### Automated Test Generation System
- **Post-test generator** creates participant-specific Google Forms
- **Comprehensive assessment** of all 24 learned words
- **Randomized question order** within each section
- **Google Apps Script** deployment for seamless online delivery

#### Balanced Dual Assessment (48 total questions)
**Part A: Contextual Fill-in-the-Blank (24 items)**
- Every learned word tested in meaningful sentence context
- **Word bank provided** with all 24 vocabulary words visible for each question
- Example: "The politician's _____ speech convinced nobody." (perfunctory)
- Pre-written sentences clearly indicating target word meaning
- Tests applied contextual understanding and word recognition
- Scoring: 1 point per correct word

**Part B: Definition Production (24 items)**  
- Every learned word tested for explicit knowledge
- Example: "Define: perfunctory"
- Same 24 words as contextual section
- Tests explicit declarative knowledge
- Scoring: 1 point per accurate definition

#### Technical Implementation
- **Participant-specific forms** generated from vocabulary selections
- **Automated script creation** for Google Forms deployment
- **Standardized delivery** via personalized URLs
- **Response collection** to Google Sheets for analysis

#### Scoring Rubric
- **Total Points**: 48 (24 contextual + 24 definitional)
- **Dual measures per word**: Both contextual and definitional knowledge
- **Condition Comparison**: Sum scores for each condition's 12 words across both knowledge types
- **Knowledge Type Analysis**: Compare contextual vs definitional performance within and across conditions

## Data Collection

### Quantitative Measures
1. **Learning Scores**
   - Immediate post-test accuracy (%)
   - 24-hour delayed test accuracy (%)
   - Learning efficiency (score per minute)

2. **Engagement Metrics**
   - RIMMS intrinsic motivation scores
   - Time-on-task measurements
   - Interaction frequency (CONV condition)

3. **Usage Quality (CONV only)**
   - Word usage correctness ratings
   - Contextual appropriateness scores
   - Conversation fluency metrics

### Qualitative Measures
1. **Participant Feedback**
   - Preference ratings between conditions
   - Perceived difficulty assessments
   - Learning strategy descriptions

2. **Attention Validation**
   - Test word selection tracking
   - Engagement pattern analysis
   - Quality control flagging

### Automated Tracking
- **Vocabulary Usage**: Real-time processing during conversational sessions
- **Word Correctness**: GPT-4.1-mini analysis of usage accuracy
- **Timing Data**: Session duration, word exposure frequency
- **Interaction Patterns**: Turn-taking, clarification requests

### File Organization
```
participant_[ID]/
├── vocabulary.csv (personalized word set)
├── word_selections.txt (pretest log)
├── session_transcript.txt (conversation data)
├── timing_data.json (learning block metrics)
├── post_test.json (complete test data)
├── post_test_readable.txt (human-readable test)
├── google_forms_script.js (deployment script)
├── assessment_results.json (post-test scores)
└── rimms_scores.json (engagement ratings per condition)
```

## Experimental Controls

### Counterbalancing
- **ABAB Design**: Alternating conditions with repeated exposure
  - **Group 1**: CONV-CARD-CONV-CARD (A1-B1-A2-B2)
  - **Group 2**: CARD-CONV-CARD-CONV (B1-A1-B2-A2)
- **Word Assignment**: Random assignment of 6 words to each block
- **Assessment Order**: Randomized word presentation in post-test

### Attention Validation
- **Pretest Check**: "Happy" word inclusion test
- **Engagement Monitoring**: Session completion rates
- **Data Quality**: Response time analysis, completion patterns

### Technical Controls
- **Consistent Interface**: Same digital platform for both conditions
- **Audio Quality**: Standardized recording equipment
- **Network Stability**: Controlled laboratory environment
- **Data Backup**: Automated session recording and transcription

## Statistical Analysis Plan

### Primary Analyses
- **Repeated measures ANOVA**: Learning method × Time interaction
- **Paired t-tests**: Direct condition comparisons
- **Effect size calculations**: Cohen's d for practical significance

### Secondary Analyses
- **Correlation analysis**: Engagement and learning outcomes
- **Regression modeling**: Predictors of 24-hour retention
- **Individual differences**: Attention check as moderator variable
- **RIMMS Analysis**: Engagement scores vs. learning outcomes

### Power Analysis
- **Effect Size**: Medium effect (d = 0.5) expected
- **Power**: 80% with α = 0.05
- **Sample Size**: 30-35 participants adequate for within-subjects design

## Timeline

### Week 1-2: Participant Recruitment
- Ethics approval
- Participant scheduling
- Technical setup validation

### Week 3-6: Data Collection
- Laboratory sessions (45 min each)
- 24h follow-up assessments
- Data quality monitoring

### Week 7-8: Analysis
- Statistical analysis
- Results interpretation
- Report preparation

## Ethical Considerations

### Informed Consent
- Full disclosure of AI interaction
- Data usage and storage policies
- Right to withdraw at any time

### Data Protection
- Anonymized participant IDs
- Secure data storage
- Limited access protocols

### Participant Welfare
- Break periods to prevent fatigue
- Technical support availability
- Debriefing after completion

## Limitations

### Methodology
- **Short-term Assessment**: Only 24h retention tested
- **Laboratory Setting**: May not reflect natural learning contexts
- **Single Session**: Limited to one learning episode per condition

### Technology
- **AI Consistency**: GPT model responses may vary
- **Technical Failures**: Potential connectivity issues
- **Learning Curve**: Participants unfamiliar with conversational AI

### Generalizability
- **Population**: Limited to university ESL learners
- **Vocabulary Type**: Only advanced C2-level words
- **Language**: English vocabulary only

## Expected Outcomes

### Primary Hypotheses
1. **H1**: CONV condition will show superior 24-hour retention compared to CARD condition
2. **H2**: CONV condition will demonstrate higher engagement scores (RIMMS) than CARD condition
3. **H3**: Learning efficiency (words retained per minute) will be higher in CONV condition

### Secondary Hypotheses
1. **H4**: Participants will show preference for CONV over CARD condition
2. **H5**: Word usage quality will predict long-term retention in CONV condition
3. **H6**: Individual differences in attention (test word selection) will moderate learning outcomes
4. **H7**: Higher RIMMS engagement scores will correlate with better learning outcomes across both conditions

### Knowledge Type Predictions
- **Contextual Knowledge**: Conversational tutor advantage due to contextual interaction
- **Explicit Knowledge**: Potentially more balanced, with flashcards showing strength in definitional learning

## Implications

### Educational Technology
- Evidence for AI-enhanced vocabulary learning
- Design principles for conversational tutoring systems
- Integration strategies for traditional and AI-based methods

### Second Language Learning
- Optimal conditions for vocabulary acquisition
- Role of contextual vs. explicit instruction
- Personalized learning system effectiveness

### Future Research
- Long-term retention studies
- Broader vocabulary types and difficulty levels
- Cross-linguistic applications
- Scalability and cost-effectiveness analysis