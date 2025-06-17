# Experimental Design: Audio-Based LLM Agents for Vocabulary Learning

## Study Overview

**Title:** Investigating the effectiveness of Audio-Based LLM agents for increasing language fluency and vocabulary acquisition

**Objective:** Compare the effectiveness of conversational LLM agents versus traditional flashcards for vocabulary learning in controlled experimental conditions.

## Research Question

Do audio-based conversational LLM agents provide superior vocabulary learning outcomes compared to traditional flashcard methods when measured by immediate retention, engagement, and 24-hour delayed recall?

## Experimental Design

### **Design Type**
- **Within-subjects design** with counterbalanced conditions
- **Repeated measures** with immediate and delayed testing
- **Controlled comparison** between two learning modalities

### **Independent Variables**
1. **Learning Method** (2 levels):
   - **CONV:** Conversational LLM agent-based learning
   - **CARD:** Traditional flashcard learning

2. **Time** (3 levels):
   - Immediate post-test
   - RIMMS engagement test
   - 24-hour delayed test

### **Dependent Variables**
- **Primary:** Vocabulary retention scores (immediate and delayed)
- **Secondary:** Learning engagement (RIMMS scores)
- **Exploratory:** Learning efficiency, word usage quality

## Participant Flow

### **Phase 1: Pre-Test Setup (5 minutes)**
1. **Participant Registration**
   - Assign participant ID number
   - Run `python experiment_word_selector.py`
   - Enter participant number for file organization

2. **Vocabulary Personalization**
   - Present 35 vocabulary words (34 advanced + 1 test word "happy")
   - Participant clicks familiar words for removal
   - **Attention check:** Flag participants who don't select "happy"
   - System randomly trims to 24 words for experiment
   - Creates personalized vocabulary set

3. **Word Allocation**
   - 24 personalized words split into two sets of 12
   - **Set A:** 12 words for first condition
   - **Set B:** 12 words for second condition
   - Random assignment to sets

### **Phase 2: Learning Blocks (28 minutes total)**

**Counterbalanced Design:**
- **Group 1:** CONV → CARD
- **Group 2:** CARD → CONV

**Block Structure (per condition):**
- **Block 1:** 7 minutes learning (6 words)
- **Block 2:** 7 minutes learning (6 words)
- Total: 14 minutes per condition, 12 words learned

#### **CONV Condition (Conversational Agent)**
- **Block 1:** Word Introduction phase
  - Agent introduces 6 new words through conversation
  - Real-time vocabulary usage analysis
  - Natural conversation scenarios
  - Background GPT-4.1-mini processing for usage correctness

- **Block 2:** Word Review phase
  - Agent creates roleplay scenarios using introduced words
  - Practice through contextual conversations
  - Immediate feedback and encouragement
  - Focus on natural usage patterns

#### **CARD Condition (Traditional Flashcards)**
- **Block 1:** Flashcard learning session 1
  - 6 words presented with definitions
  - Study/test cycles
  - Traditional memorization approach
  - Self-paced within time limit

- **Block 2:** Flashcard learning session 2
  - 6 words presented with definitions
  - Review and reinforcement
  - Traditional study methods
  - Self-paced within time limit

### **Phase 3: Immediate Testing (10 minutes)**
1. **Post-Test Assessment**
   - Test all 24 learned words (12 per condition)
   - Multiple choice and definition matching
   - Immediate recall measurement
   - Counterbalanced word order

2. **RIMMS Engagement Test**
   - Measure intrinsic motivation and engagement
   - Separate questionnaire for each learning condition
   - Compare engagement levels between CONV and CARD

### **Phase 4: 24-Hour Delayed Testing (10 minutes)**
- **Online follow-up test** administered 24 hours later
- Same vocabulary assessment format as immediate test
- Long-term retention measurement
- Automated reminder system for participant compliance

## Experimental Controls

### **Counterbalancing**
- **Learning order:** Half start with CONV, half with CARD
- **Word sets:** Set A and Set B randomly assigned to conditions
- **Test order:** Randomized presentation within tests

### **Time Controls**
- **Fixed duration:** Exactly 7 minutes per learning block
- **Consistent exposure:** 12 words per condition
- **Standardized testing:** Same time limits for all assessments

### **Attention Controls**
- **Test word validation:** "Happy" word attention check in pre-test
- **Engagement monitoring:** RIMMS scores track participant attention
- **Quality control:** Automatic flagging of inattentive participants

### **Technical Controls**
- **Standardized environment:** Same computer/headphone setup
- **Audio quality:** Consistent voice synthesis and recording
- **Response logging:** All interactions automatically recorded
- **Randomization:** Computer-controlled word and condition assignment

## Memory System Design

### **Simplified SRS Approach**
- **Individual message processing** (batch processing removed)
- **Time-based review priority** (earliest due first)
- **Session-optimized intervals** for 24h retention focus
- **Clean experimental variables** (no complex algorithms confounding results)

### **Vocabulary Processing**
- **GPT-4.1-mini analysis** for usage correctness evaluation
- **Real-time feedback** on word usage quality
- **Speaker differentiation** (user vs assistant tracking)
- **Automatic CSV updates** for learning analytics

## Data Collection

### **Quantitative Measures**
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

### **Qualitative Measures**
1. **Participant Feedback**
   - Preference ratings between conditions
   - Perceived difficulty assessments
   - Learning strategy descriptions

2. **Attention Validation**
   - Test word selection tracking
   - Engagement pattern analysis
   - Quality control flagging

## File Organization

### **Participant-Specific Data**
```
participant_001/
├── vocabulary.csv              # Personalized word set
├── word_selections.txt         # Selection log with attention check
├── learning_session_log.csv    # Real-time learning data
├── test_responses.csv          # All test responses
└── rimms_scores.csv           # Engagement measurements
```

### **Experimental Control Files**
- **vocabulary.csv:** Active vocabulary for current participant
- **vocabulary_backup.csv:** Original 34-word set
- **counterbalancing_log.txt:** Condition assignment tracking

## Expected Outcomes

### **Primary Hypotheses**
1. **H1:** CONV condition will show superior 24-hour retention compared to CARD condition
2. **H2:** CONV condition will demonstrate higher engagement scores (RIMMS) than CARD condition
3. **H3:** Learning efficiency (words retained per minute) will be higher in CONV condition

### **Secondary Hypotheses**
1. **H4:** Participants will show preference for CONV over CARD condition
2. **H5:** Word usage quality will predict long-term retention in CONV condition
3. **H6:** Individual differences in attention (test word selection) will moderate learning outcomes

## Statistical Analysis Plan

### **Primary Analyses**
- **Repeated measures ANOVA:** Learning method × Time interaction
- **Paired t-tests:** Direct condition comparisons
- **Effect size calculations:** Cohen's d for practical significance

### **Secondary Analyses**
- **Correlation analysis:** Engagement and learning outcomes
- **Regression modeling:** Predictors of 24-hour retention
- **Individual differences:** Attention check as moderator variable

This experimental design provides rigorous control while testing the practical effectiveness of conversational AI for vocabulary learning in realistic educational timeframes.