# Experimental Setup Guide

This guide provides complete instructions for running the ABAB/BABA counterbalanced vocabulary learning experiment comparing conversational AI tutors with traditional flashcards.

## Quick Start

```bash
# Setup environment
python run_experiment.py --setup-env

# Start experiment for participant 001
python run_experiment.py --participant-id 001 --start

# Check status
python run_experiment.py --status
```

## System Architecture

### Core Components

1. **Experimental Controller** (`experimental_controller.py`)
   - Manages ABAB/BABA counterbalanced design
   - 6-minute timed learning blocks
   - Automatic condition switching
   - RIMMS survey administration

2. **Conversational Condition** (Next.js app)
   - GPT-4o-mini-realtime voice interface
   - Real-time vocabulary analysis
   - Spaced repetition memory system

3. **Flashcard Condition** (`/src/app/conditions/flashcard/`)
   - Static vocabulary presentation
   - Definition + context examples
   - Navigation controls for review

4. **RIMMS Survey** (`/src/app/survey/rimms/`)
   - 12-item motivation assessment
   - ARCS model dimensions
   - Automated data collection

5. **Automated Scheduler** (`automated_scheduler.py`)
   - 24-hour posttest delivery
   - Email notifications
   - Reminder system

## Experimental Workflow

### Session 1: Laboratory (40 minutes)

1. **Participant Setup**
   ```bash
   python run_experiment.py --participant-id 001 --start
   ```

2. **Vocabulary Selection** (2 min)
   - GUI tool for familiar word exclusion
   - Attention check validation ("happy" word)
   - Random assignment to blocks

3. **Learning Blocks** (32 min)
   - **ABAB Design**: CONV-CARD-CONV-CARD 
   - **BABA Design**: CARD-CONV-CARD-CONV
   - 6 minutes per block + 1 min breaks
   - 6 words per block (24 total)

4. **RIMMS Surveys** (5 min)
   - Administered after 2nd exposure to each condition
   - Automatic browser opening
   - Data saved to participant folder

### Session 2: 24-Hour Online Test (15 minutes)

Automated Google Forms generation and delivery:
- **Part A**: Contextual fill-in-blank (24 items)
- **Part B**: Definition production (24 items)
- Participant-specific vocabulary sets
- Automated scoring and analysis

## File Structure

```
project/
├── experimental_controller.py          # Main experiment controller
├── automated_scheduler.py              # 24-hour posttest system
├── run_experiment.py                   # Master runner script
├── post_test_generator.py             # Google Forms generator
├── src/app/
│   ├── conditions/flashcard/          # Flashcard condition UI
│   ├── survey/rimms/                  # RIMMS survey system
│   └── lib/flashcardManager.ts        # Flashcard timing logic
├── participant_XXX/                   # Individual data folders
│   ├── session_data.json             # Session metadata
│   ├── vocabulary.csv                # Personalized word set
│   ├── rimms_conversational.json     # RIMMS scores
│   ├── rimms_flashcard.json          # RIMMS scores
│   └── post_test.json                # Assessment data
└── scheduled_tests.json              # Posttest scheduling
```

## Usage Examples

### Starting New Experiments

```bash
# Random condition assignment
python run_experiment.py --participant-id 001 --start

# Force specific order
python run_experiment.py --participant-id 002 --start --condition-order BABA

# Resume interrupted session
python run_experiment.py --participant-id 001 --resume-block 3
```

### Monitoring Progress

```bash
# Overall status
python run_experiment.py --status

# Scheduler status
python automated_scheduler.py --status

# Send pending tests
python automated_scheduler.py --check-pending
```

### Data Management

```bash
# Check participant data
ls participant_001/

# View session summary
cat participant_001/session_data.json

# Check RIMMS scores
cat participant_001/rimms_*_summary.txt
```

## Configuration

### Experiment Settings (`experiment_config.json`)

```json
{
  "experiment": {
    "condition_orders": ["ABAB", "BABA"],
    "block_duration_minutes": 6,
    "total_blocks": 4,
    "vocabulary_words_per_block": 6
  },
  "scheduler": {
    "enabled": true,
    "posttest_delay_hours": 24,
    "auto_schedule": true
  }
}
```

### Email Settings (`scheduler_config.json`)

```bash
# Interactive setup
python run_experiment.py --setup-scheduler
```

## Technical Requirements

### Software Dependencies

```bash
# Node.js dependencies
npm install

# Python dependencies  
pip install schedule requests smtplib
```

### Environment Variables

```bash
# .env file
OPENAI_API_KEY=your_openai_api_key
```

### Hardware Requirements

- **Audio**: Microphone and speakers for conversational condition
- **Network**: Stable internet for OpenAI API calls
- **Browser**: Modern browser supporting WebRTC
- **Display**: 1920x1080 minimum resolution

## Data Collection

### Automatic Data Capture

1. **Timing Data**
   - Block start/end times
   - Transition durations
   - Total session time

2. **Vocabulary Usage**
   - Real-time word detection
   - Usage correctness scoring
   - Speaker differentiation

3. **Engagement Metrics**
   - RIMMS motivation scores
   - Interaction patterns
   - Error frequencies

4. **Learning Outcomes**
   - 24-hour delayed test scores
   - Contextual vs definitional knowledge
   - Condition-specific performance

### Data Validation

```bash
# Validate participant data
python validate_data.py --participant-id 001

# Check attention validation
grep "happy" participant_*/word_selections.txt

# Verify RIMMS completion
ls participant_*/rimms_*.json
```

## Troubleshooting

### Common Issues

1. **Development Server Won't Start**
   ```bash
   # Kill existing processes
   pkill -f "npm run dev"
   
   # Restart
   npm run dev
   ```

2. **OpenAI API Errors**
   ```bash
   # Check API key
   echo $OPENAI_API_KEY
   
   # Test connection
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models
   ```

3. **Microphone Issues**
   - Check browser permissions
   - Test with different browsers
   - Verify audio device settings

4. **Scheduler Email Failures**
   ```bash
   # Test email configuration
   python automated_scheduler.py --test-email
   
   # Check logs
   tail -f scheduler.log
   ```

### Recovery Procedures

1. **Resume Interrupted Session**
   ```bash
   # Check last completed block
   grep "blocks_completed" participant_001/session_data.json
   
   # Resume from next block
   python run_experiment.py --participant-id 001 --resume-block 3
   ```

2. **Regenerate Posttest**
   ```bash
   python post_test_generator.py --participant-id 001 --force-regenerate
   ```

3. **Manual RIMMS Administration**
   ```bash
   # Open RIMMS survey manually
   open "http://localhost:3000/survey/rimms?condition=conversational&participant=001"
   ```

## Quality Assurance

### Pre-Session Checklist

- [ ] Development server running (localhost:3000)
- [ ] OpenAI API key configured
- [ ] Audio devices tested
- [ ] Participant ID format validated (3 digits)
- [ ] Previous session data backed up

### During Session Monitoring

- [ ] Timer accuracy verified
- [ ] Condition switching successful
- [ ] RIMMS surveys completed
- [ ] Audio quality maintained
- [ ] Data files being created

### Post-Session Verification

- [ ] Session marked complete
- [ ] RIMMS data saved
- [ ] Posttest scheduled
- [ ] Vocabulary usage logged
- [ ] Backup data created

## Analysis Pipeline

### Data Extraction

```bash
# Extract all participant data
python extract_data.py --output results.csv

# Generate summary statistics
python analyze_results.py --input results.csv
```

### Statistical Analysis

1. **Primary Comparisons**
   - Repeated measures ANOVA (condition × knowledge type)
   - Paired t-tests for direct condition comparisons
   - Effect size calculations (Cohen's d)

2. **Secondary Analyses**
   - RIMMS dimension correlations
   - Usage quality predictors
   - Individual difference moderators

## Security & Privacy

### Data Protection

- Participant IDs anonymized (numeric only)
- No personal information in data files
- Local storage only (no cloud uploads)
- Automatic data encryption options

### Access Control

- Researcher authentication required
- Session logs maintained
- Data access auditing
- Secure deletion procedures

## Support

### Getting Help

- Check logs: `tail -f *.log`
- Review documentation: `EXPERIMENTAL_DESIGN.md`
- Test components individually
- Contact research supervisor

### Reporting Issues

Include the following information:
- Participant ID and session stage
- Error messages and logs
- System configuration details
- Steps to reproduce issue