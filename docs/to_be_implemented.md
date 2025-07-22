# To Be Implemented - Experimental Features

This document outlines missing components that need to be implemented to complete the experimental setup for the Bachelor's thesis on memory-augmented conversational agents.

## 1. Flashcard Control Condition (HIGH PRIORITY)

### Description
Traditional flashcard learning condition to compare against the conversational agent system in the ABAB/BABA counterbalanced design.

### Implementation Details
- **Format**: Static flashcard presentation with word definitions + 1-2 contextual usage examples
- **Timing**: Same constraints as conversational condition (6 minutes per block, max 1 word/minute)
- **Content**: Uses same personalized 24-word vocabulary set from pretest
- **Interface**: Simple web interface with next/previous navigation
- **No Adaptive Features**: No memory scheduling, no conversational interaction

### Technical Requirements
```typescript
interface FlashcardCondition {
  words: PersonalizedVocabulary[];
  currentIndex: number;
  timePerBlock: 6 * 60 * 1000; // 6 minutes in milliseconds
  maxWordsPerMinute: 1;
  
  // Card content structure
  card: {
    word: string;
    definition: string;
    contextExamples: string[]; // 1-2 examples
  };
}
```

### Files to Create/Modify
- `/src/app/conditions/flashcard/page.tsx` - Main flashcard interface
- `/src/app/conditions/flashcard/components/FlashcardDisplay.tsx`
- `/src/app/lib/flashcardManager.ts` - Timing and progression logic
- Update routing in `/src/app/layout.tsx`

## 2. ABAB/BABA Counterbalanced Design Implementation (HIGH PRIORITY)

### Description
Implement the full experimental protocol with condition ordering, timing blocks, and automatic transitions.

### Current Gap
The system only implements conversational learning. Need full experimental flow with:
- Random assignment to ABAB or BABA groups
- Automatic timing for 6-minute blocks
- Condition transitions with intervening tasks
- RIMMS administration after each condition's final block

### Implementation Details

#### Experimental Flow Controller
```typescript
interface ExperimentalSession {
  participantId: string;
  conditionOrder: 'ABAB' | 'BABA';
  currentBlock: number;
  blocks: ExperimentalBlock[];
  startTime: Date;
}

interface ExperimentalBlock {
  type: 'conversational' | 'flashcard' | 'intervening_task';
  duration: number; // 6 minutes = 360000ms
  isFirstExposure: boolean; // true for initial learning, false for re-retrieval
  vocabularySet: string[]; // 24 personalized words
}
```

#### Files to Create
- `/src/app/experiment/controller/ExperimentController.tsx`
- `/src/app/experiment/components/BlockTimer.tsx`
- `/src/app/experiment/components/ConditionTransition.tsx`
- `/src/app/experiment/utils/randomAssignment.ts`
- `/src/app/experiment/utils/blockScheduler.ts`

#### Example Implementation Structure
```typescript
// ExperimentController.tsx
const ExperimentController = ({ participantId }: { participantId: string }) => {
  const [session, setSession] = useState<ExperimentalSession>();
  const [currentBlock, setCurrentBlock] = useState(0);
  
  const initializeExperiment = () => {
    const conditionOrder = Math.random() < 0.5 ? 'ABAB' : 'BABA';
    const blocks = generateBlocks(conditionOrder);
    // ... setup logic
  };
  
  const advanceToNextBlock = () => {
    // Timer completion logic
    // Automatic RIMMS trigger after re-retrieval blocks
    // Condition switching
  };
  
  return (
    <div>
      <BlockTimer duration={session.blocks[currentBlock].duration} onComplete={advanceToNextBlock} />
      {renderCurrentCondition()}
    </div>
  );
};
```

## 3. RIMMS Survey Implementation (MEDIUM PRIORITY)

### Description
Reduced Instructional Materials Motivation Survey for measuring user experience across four dimensions: Attention, Relevance, Confidence, Satisfaction.

### Current Gap
Only mentioned in documentation (`/RIMMS_information.md`) but no actual implementation exists.

### Implementation Details

#### RIMMS Question Structure
Based on ARCS model, implement 12-item reduced survey:

```typescript
interface RIMMSQuestion {
  id: string;
  dimension: 'attention' | 'relevance' | 'confidence' | 'satisfaction';
  text: string;
  scale: 1 | 2 | 3 | 4 | 5; // 5-point Likert scale
}

const rimmsQuestions: RIMMSQuestion[] = [
  // Attention (3 questions)
  { id: 'A1', dimension: 'attention', text: 'The vocabulary learning system captured my attention.', scale: 5 },
  { id: 'A2', dimension: 'attention', text: 'The learning activities were engaging and interesting.', scale: 5 },
  { id: 'A3', dimension: 'attention', text: 'The system maintained my focus throughout the session.', scale: 5 },
  
  // Relevance (3 questions)
  { id: 'R1', dimension: 'relevance', text: 'The vocabulary learning approach was relevant to my learning goals.', scale: 5 },
  { id: 'R2', dimension: 'relevance', text: 'The content was appropriate for my learning level.', scale: 5 },
  { id: 'R3', dimension: 'relevance', text: 'The learning method was useful for vocabulary acquisition.', scale: 5 },
  
  // Confidence (3 questions)
  { id: 'C1', dimension: 'confidence', text: 'I felt confident using this learning system.', scale: 5 },
  { id: 'C2', dimension: 'confidence', text: 'The system helped me feel successful in learning new vocabulary.', scale: 5 },
  { id: 'C3', dimension: 'confidence', text: 'I believe I can effectively learn vocabulary using this method.', scale: 5 },
  
  // Satisfaction (3 questions)
  { id: 'S1', dimension: 'satisfaction', text: 'I was satisfied with my learning experience.', scale: 5 },
  { id: 'S2', dimension: 'satisfaction', text: 'I would recommend this learning method to other students.', scale: 5 },
  { id: 'S3', dimension: 'satisfaction', text: 'Overall, I enjoyed using this vocabulary learning system.', scale: 5 }
];
```

#### Files to Create
- `/src/app/survey/rimms/page.tsx` - Main RIMMS survey interface
- `/src/app/survey/rimms/components/RIMMSQuestion.tsx`
- `/src/app/survey/rimms/components/RIMMSResults.tsx`
- `/src/app/lib/rimmsAnalysis.ts` - Scoring and analysis logic
- `/src/app/api/rimms/route.ts` - Data collection endpoint

#### Integration Points
- Trigger after each condition's re-retrieval block in ExperimentController
- Store responses with participant ID and condition type
- Calculate ARCS dimension scores for analysis

## 4. 24-Hour Automated Scheduling System (MEDIUM PRIORITY)

### Description
Automated system to schedule and deliver posttest Google Forms exactly 23-25 hours after experimental session completion.

### Current Gap
Manual process - researcher must manually run script and send form URL to participants.

### Implementation Details

#### Scheduling System
```typescript
interface ScheduledTest {
  participantId: string;
  sessionCompleteTime: Date;
  scheduledTestTime: Date; // 24 hours later
  googleFormUrl: string;
  emailSent: boolean;
  testCompleted: boolean;
}
```

#### Components to Implement
1. **Email Service Integration**
   ```typescript
   // /src/app/lib/emailService.ts
   export class EmailService {
     async scheduleDelayedTest(participant: Participant, formUrl: string) {
       const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
       // Integration with email service (SendGrid, Nodemailer, etc.)
     }
   }
   ```

2. **Cron Job for Test Delivery**
   ```typescript
   // /src/app/api/scheduled-tests/route.ts
   export async function GET() {
     const pendingTests = await getPendingScheduledTests();
     for (const test of pendingTests) {
       if (shouldSendTest(test)) {
         await sendTestEmail(test);
       }
     }
   }
   ```

3. **Database Schema Updates**
   ```sql
   CREATE TABLE scheduled_tests (
     id SERIAL PRIMARY KEY,
     participant_id VARCHAR(255),
     session_complete_time TIMESTAMP,
     scheduled_test_time TIMESTAMP,
     google_form_url TEXT,
     email_sent BOOLEAN DEFAULT FALSE,
     test_completed BOOLEAN DEFAULT FALSE
   );
   ```

#### Files to Create/Modify
- `/src/app/lib/emailService.ts`
- `/src/app/api/scheduled-tests/route.ts`
- `/src/app/lib/database/scheduledTests.ts`
- Update `/post_test_generator.py` to integrate with scheduling system
- Add cron job configuration

## 5. Enhanced Experimental Data Collection (LOW PRIORITY)

### Description
Comprehensive data logging for experimental analysis beyond current CSV tracking.

### Implementation Details

#### Additional Metrics to Track
```typescript
interface ExperimentalSession {
  // Timing data
  blockStartTimes: Date[];
  blockEndTimes: Date[];
  transitionTimes: Date[];
  
  // Interaction data
  conversationTurns: number;
  wordsIntroduced: string[];
  wordsReviewed: string[];
  errorPatterns: string[];
  
  // Engagement metrics
  speechDuration: number;
  pauseDurations: number[];
  interactionQuality: number; // 1-5 scale
}
```

#### Files to Create
- `/src/app/lib/experimentalLogger.ts`
- `/src/app/lib/analytics/sessionAnalytics.ts`
- `/src/app/api/experimental-data/route.ts`

## 6. Implementation Priority and Dependencies

### Phase 1 (Essential for Thesis)
1. **Flashcard Control Condition** - Required for comparative analysis
2. **ABAB/BABA Controller** - Core experimental design

### Phase 2 (Important for Validity)
3. **RIMMS Implementation** - User experience measurement
4. **Enhanced Data Collection** - Detailed analysis capability

### Phase 3 (Convenience Features)
5. **Automated Scheduling** - Reduces manual intervention

## 7. Testing Requirements

Each implementation should include:
- Unit tests for core logic
- Integration tests with existing vocabulary system
- User acceptance testing with sample participants
- Performance testing for timing-critical components

## 8. Documentation Updates Needed

After implementation:
- Update `/EXPERIMENTAL_DESIGN.md` with actual implementation details
- Create user guide for experimental administrators
- Document data analysis procedures
- Update `/README.md` with complete experimental setup instructions

## Notes for Implementation

- Maintain compatibility with existing vocabulary tracking system
- Ensure all timing is precise and validated
- Include error handling for network issues during automated scheduling
- Consider participant privacy and data protection requirements
- Test thoroughly with sample participants before actual experiments