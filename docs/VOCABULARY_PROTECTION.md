# Vocabulary Protection System

## Problem Fixed

Previously, the main `vocabulary.csv` file was being overwritten during experiments when conversation processing updated vocabulary usage statistics. This caused the loss of the complete vocabulary set.

## Solution Implemented

### 1. Participant-Specific Vocabulary Files

**Before**: All vocabulary updates went to main `vocabulary.csv`
```
vocabulary.csv ← Updated during experiments (WRONG!)
```

**After**: Each participant gets their own vocabulary copy
```
vocabulary.csv ← Read-only master list
participant_001/vocabulary.csv ← Updated during experiments
participant_002/vocabulary.csv ← Updated during experiments
```

### 2. Modified Components

#### `experimental_controller.py`
- **Line 55-67**: `_initialize_participant_vocabulary()` function
- Automatically copies main vocabulary to participant folder at session start
- Ensures participant-specific vocabulary exists before experiment begins

#### `src/app/lib/csvUpdater.ts`
- **Line 42-65**: `initializeParticipantVocabulary()` function
- **Line 70**: Modified `applyCsvUpdates()` to require `participantId` parameter
- **Line 79-85**: Uses participant-specific vocabulary path
- **Line 275**: Modified `processAndUpdateVocabulary()` to require `participantId`
- **Line 332**: Modified `getVocabularyWordsForProcessing()` to use participant vocabulary

#### `src/app/api/vocabulary/route.ts`
- **Line 15-17**: Added `getParticipantVocabPath()` function
- **Line 22**: Added `participantId` parameter extraction
- **Line 32-35**: Uses participant-specific vocabulary path for updates
- **Line 72**: Writes updates to participant file, not main vocabulary

### 3. Data Flow Protection

```
┌─────────────────┐    Copy     ┌──────────────────────────┐
│ vocabulary.csv  │────────────▶│ participant_XXX/         │
│ (Master - RO)   │             │ vocabulary.csv           │
└─────────────────┘             └──────────────────────────┘
                                          │
                                          ▼
                                   ┌─────────────────┐
                                   │ Conversation    │
                                   │ Processing      │
                                   │ Updates         │
                                   └─────────────────┘
```

### 4. API Integration

All vocabulary-related API calls now require a `participantId` parameter:

```typescript
// OLD (unsafe)
applyCsvUpdates(updates)

// NEW (safe)
applyCsvUpdates(updates, participantId)
```

### 5. Experimental Workflow

1. **Session Start**: 
   - Main vocabulary copied to `participant_XXX/vocabulary.csv`
   - All updates target participant file

2. **During Experiment**:
   - Conversation processing updates participant vocabulary
   - Main vocabulary remains untouched

3. **Session End**:
   - Participant vocabulary contains personalized usage data
   - Main vocabulary preserved for future participants

### 6. Verification

To verify the protection is working:

```bash
# Check main vocabulary is complete
wc -l vocabulary.csv
# Should show 34 lines (33 words + header)

# Check participant vocabulary exists
ls participant_001/vocabulary.csv

# Compare files (should be identical at start)
diff vocabulary.csv participant_001/vocabulary.csv
```

### 7. Recovery

If main vocabulary gets corrupted again:

```bash
# Restore from post_test_questions.json
python restore_vocabulary.py

# Or manually verify all words are present:
grep -c "obfuscate\|disparage\|perfunctory" vocabulary.csv
```

## Benefits

1. **Data Integrity**: Main vocabulary never modified
2. **Participant Isolation**: Each participant's usage data separate
3. **Experiment Continuity**: Vocabulary corruption won't affect ongoing studies
4. **Easy Recovery**: Main vocabulary always available as backup
5. **Analysis Support**: Participant-specific data enables detailed analysis

## Future Considerations

- Consider making main vocabulary.csv read-only at filesystem level
- Add validation checks to ensure participant vocabulary initialization
- Implement automatic backup of main vocabulary before experiments