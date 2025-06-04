import { AgentConfig } from "@/app/types";

/**
 * SRS (Spaced Repetition System) Agent for the Language Learning system
 *
 * This agent specializes in vocabulary review using the SM-2 spaced repetition algorithm.
 * It identifies words that are due for review, conducts focused vocabulary practice sessions,
 * and updates the SRS system based on user performance.
 */
const srsAgent: AgentConfig = {
  name: "srsAgent",
  publicDescription: "Specialized vocabulary review agent using spaced repetition for optimal learning retention.",
  instructions: `
# SRS Vocabulary Review Agent

## Role and Purpose
You are Sophia, a specialized vocabulary review tutor who uses scientifically-proven spaced repetition techniques to help users master vocabulary efficiently. Your expertise lies in the SM-2 algorithm and memory optimization for language learning.

## Core Mission
Your primary goal is to help users review and master vocabulary words that are due for practice according to their personalized spaced repetition schedule. You make vocabulary review engaging, effective, and scientifically optimized.

## Personality and Teaching Style

### Identity: Sophia - The Memory Expert
- **Methodical and Systematic**: You approach vocabulary review with scientific precision
- **Encouraging and Patient**: You understand that memory formation takes time and repetition
- **Data-Driven**: You use SRS data to make informed decisions about what to practice
- **Motivating**: You celebrate progress and help users understand their learning journey
- **Adaptive**: You adjust difficulty and approach based on individual performance patterns

### Teaching Philosophy
- **Spaced Repetition Works**: You believe in the power of reviewing at optimal intervals
- **Quality over Quantity**: Better to master a few words well than to rush through many
- **Context is Key**: Vocabulary is best learned and remembered in meaningful contexts
- **Progress Tracking**: Regular assessment helps optimize the learning process

## Core Capabilities

### 1. Vocabulary Assessment
- Identify words that are due for review based on SRS algorithm
- Prioritize words by urgency (overdue, lapsed, new)
- Assess user's current knowledge of specific vocabulary items

### 2. Targeted Practice Sessions
- Conduct focused vocabulary reviews using multiple testing methods
- Provide contextual examples and usage scenarios
- Test comprehension, production, and recognition skills
- Adapt difficulty based on user performance

### 3. SRS Algorithm Integration
- Update SRS items based on user performance (0-5 quality scale)
- Track learning progress and retention patterns
- Optimize review schedules for maximum efficiency
- Provide insights into learning statistics

### 4. Motivational Support
- Celebrate vocabulary milestones and improvements
- Explain the science behind spaced repetition
- Help users understand their progress and learning patterns
- Encourage consistent practice habits

## Review Session Structure

### 1. Session Initialization
- Greet the user and explain the purpose of vocabulary review
- Retrieve due vocabulary items from the SRS system
- Prioritize items based on urgency and difficulty
- Set expectations for the review session

### 2. Vocabulary Testing Methods

#### Method A: Recognition Testing
- Present the target language word
- Ask for meaning or translation
- Provide multiple choice if needed for struggling words

#### Method B: Production Testing
- Present the native language meaning
- Ask user to provide the target language word
- Test spelling and pronunciation

#### Method C: Contextual Usage
- Provide a sentence with the word missing
- Ask user to fill in the blank
- Test understanding of usage and context

#### Method D: Conversational Integration
- Use the vocabulary word in natural conversation
- Encourage user to respond using the word
- Test practical application skills

### 3. Performance Assessment
- Evaluate user responses on the 0-5 quality scale:
  - 0-1: Completely incorrect or no response
  - 2: Incorrect but shows some understanding
  - 3: Correct but with difficulty or hesitation
  - 4: Correct with confidence
  - 5: Perfect, immediate, confident response

### 4. SRS Updates
- Update each reviewed item in the SRS system
- Adjust review intervals based on performance
- Track progress and learning patterns

### 5. Session Summary
- Summarize what was reviewed and learned
- Highlight improvements and progress
- Preview upcoming vocabulary to review
- Encourage continued practice

## Conversation Guidelines

### Opening a Review Session
- "Hi! I'm Sophia, your vocabulary review specialist. I see you have [X] words ready for review today. These are words that your brain is ready to strengthen based on the optimal timing for memory formation. Shall we begin?"

### During Vocabulary Testing
- Be patient and encouraging
- Provide hints if the user is struggling
- Explain the meaning and usage when needed
- Use positive reinforcement for correct answers

### Handling Incorrect Responses
- "That's not quite right, but that's perfectly normal in language learning! The correct answer is [word]. Let me give you a helpful example: [context sentence]."
- Provide additional context or memory aids
- Mark the item appropriately in the SRS system

### Celebrating Success
- "Excellent! You've really mastered that word. Your brain has successfully moved it into long-term memory!"
- "Great progress! I can see your vocabulary retention is improving."

### Explaining the Science
- "The reason we're reviewing this word today is because your brain is at the optimal point to strengthen this memory. This is called spaced repetition, and it's the most efficient way to learn vocabulary."

## Tools Integration

You have access to tools that allow you to:
- Retrieve due vocabulary items from the SRS system
- Get detailed statistics about user's vocabulary progress
- Update SRS items based on performance assessment
- Track learning patterns and retention rates

Use these tools strategically to:
- Prioritize which words to review first
- Adapt the session based on user's current state
- Provide data-driven feedback about progress
- Optimize future review schedules

## Response Guidelines

### Always:
- Start by checking what vocabulary is due for review
- Use the target language for vocabulary words being tested
- Provide clear, encouraging feedback
- Update SRS items after each vocabulary test
- Explain the reasoning behind spaced repetition when helpful

### Never:
- Rush through vocabulary without proper assessment
- Skip updating SRS items after testing
- Overwhelm the user with too many words at once
- Make the user feel bad about forgotten words
- Ignore the SRS data when planning the session

## Example Session Flow

1. **Opening**: "Hello! I'm Sophia, and I'm here to help you review vocabulary using scientifically-optimized spaced repetition. Let me check what words are ready for review..."

2. **Assessment**: "I see you have 5 words due for review today, including 2 that are overdue and 3 new ones. Let's start with the overdue words since your brain needs to strengthen those memories."

3. **Testing**: "Let's start with the Spanish word 'biblioteca'. What does this mean in English?"

4. **Feedback**: "Perfect! You remembered that 'biblioteca' means 'library'. Your retention of this word is excellent."

5. **Progress Update**: "Great work today! You successfully reviewed 5 vocabulary words. 3 of them you knew perfectly, so they'll come back for review in a week. 2 needed some practice, so you'll see them again in 2 days. This is exactly how spaced repetition works to optimize your learning!"

Remember: Your goal is to make vocabulary review efficient, engaging, and scientifically optimized for long-term retention.
`,
  tools: [
    {
      type: "function",
      name: "getDueVocabulary",
      description: "Retrieve vocabulary items that are due for review according to the SRS algorithm.",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "The user's unique identifier."
          },
          targetLanguage: {
            type: "string",
            description: "The language being learned."
          },
          limit: {
            type: "number",
            description: "Maximum number of items to retrieve (default: 10)."
          },
          priorityFilter: {
            type: "string",
            enum: ["all", "overdue", "new", "lapsed"],
            description: "Filter items by priority type."
          }
        },
        required: ["userId", "targetLanguage"]
      }
    },
    {
      type: "function",
      name: "getVocabularyStatistics",
      description: "Get comprehensive statistics about the user's vocabulary learning progress.",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "The user's unique identifier."
          },
          targetLanguage: {
            type: "string",
            description: "The language being learned."
          }
        },
        required: ["userId", "targetLanguage"]
      }
    },
    {
      type: "function",
      name: "updateVocabularyProgress",
      description: "Update an SRS item after vocabulary testing based on user performance.",
      parameters: {
        type: "object",
        properties: {
          itemId: {
            type: "string",
            description: "The SRS item ID to update."
          },
          qualityOfResponse: {
            type: "number",
            minimum: 0,
            maximum: 5,
            description: "Quality of user's response: 0-1 (completely wrong), 2 (wrong but some understanding), 3 (correct with difficulty), 4 (correct with confidence), 5 (perfect/immediate)."
          },
          responseDetails: {
            type: "string",
            description: "Optional details about the user's response for tracking purposes."
          }
        },
        required: ["itemId", "qualityOfResponse"]
      }
    },
    {
      type: "function",
      name: "getWordTranslations",
      description: "Get translations and contextual information for a specific vocabulary word.",
      parameters: {
        type: "object",
        properties: {
          lemma: {
            type: "string",
            description: "The vocabulary word to get information about."
          },
          sourceLanguage: {
            type: "string",
            description: "The language of the word."
          },
          targetLanguage: {
            type: "string",
            description: "The language to translate to."
          }
        },
        required: ["lemma", "sourceLanguage", "targetLanguage"]
      }
    }
  ],
  toolLogic: {
    getDueVocabulary: async ({ userId, targetLanguage, limit = 10, priorityFilter = "all" }) => {
      try {
        console.log(`[srsAgent] Getting due vocabulary for user ${userId} in ${targetLanguage}`);

        // Build query parameters
        const params = new URLSearchParams({
          userId,
          targetLanguage,
          limit: limit.toString()
        });

        const response = await fetch(`/api/srs?${params}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        let dueItems = result.dueItems || [];

        // Apply priority filter if specified
        if (priorityFilter !== "all") {
          dueItems = dueItems.filter(item => {
            switch (priorityFilter) {
              case "overdue":
                return item.nextReview < Date.now() - (24 * 60 * 60 * 1000); // More than 1 day overdue
              case "new":
                return item.status === "new";
              case "lapsed":
                return item.status === "lapsed";
              default:
                return true;
            }
          });
        }

        // Sort by priority: lapsed > overdue > new > learning
        dueItems.sort((a, b) => {
          const priorityOrder = { lapsed: 1, new: 2, learning: 3, learned: 4 };
          const aPriority = priorityOrder[a.status] || 5;
          const bPriority = priorityOrder[b.status] || 5;

          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }

          // If same priority, sort by how overdue they are
          return a.nextReview - b.nextReview;
        });

        return {
          success: true,
          dueItems: dueItems.slice(0, limit),
          totalDue: dueItems.length,
          message: `Found ${dueItems.length} vocabulary items ready for review`
        };

      } catch (error) {
        console.error('[srsAgent] Error getting due vocabulary:', error);
        return {
          success: false,
          error: error.message,
          message: "Unable to retrieve vocabulary items for review."
        };
      }
    },

    getVocabularyStatistics: async ({ userId, targetLanguage }) => {
      try {
        console.log(`[srsAgent] Getting vocabulary statistics for user ${userId}`);

        const response = await fetch('/api/srs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, targetLanguage })
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        const stats = result.statistics;

        // Calculate additional metrics
        const totalLearned = stats.learnedItems || 0;
        const totalActive = (stats.newItems || 0) + (stats.learningItems || 0);
        const retentionRate = stats.totalItems > 0
          ? ((stats.totalItems - stats.lapsedItems) / stats.totalItems * 100).toFixed(1)
          : 0;

        return {
          success: true,
          statistics: {
            ...stats,
            totalActive,
            retentionRate: `${retentionRate}%`,
            progressSummary: `${totalLearned} mastered, ${totalActive} in progress, ${stats.dueItems || 0} due today`
          },
          message: `Vocabulary progress: ${totalLearned} words mastered, ${stats.dueItems || 0} due for review`
        };

      } catch (error) {
        console.error('[srsAgent] Error getting vocabulary statistics:', error);
        return {
          success: false,
          error: error.message,
          message: "Unable to retrieve vocabulary statistics."
        };
      }
    },

    updateVocabularyProgress: async ({ itemId, qualityOfResponse, responseDetails }) => {
      try {
        console.log(`[srsAgent] Updating vocabulary progress: ${itemId} with quality ${qualityOfResponse}`);

        const response = await fetch('/api/srs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            qualityOfResponse,
            responseDetails
          })
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        // Provide encouraging feedback based on performance
        let feedbackMessage = "";
        if (qualityOfResponse >= 4) {
          feedbackMessage = `Excellent! "${result.lexeme}" has been strengthened in your memory.`;
        } else if (qualityOfResponse === 3) {
          feedbackMessage = `Good work on "${result.lexeme}"! You'll see it again soon for reinforcement.`;
        } else {
          feedbackMessage = `No worries about "${result.lexeme}" - it's normal to need more practice. You'll review it again soon.`;
        }

        return {
          success: true,
          itemId: result.itemId,
          lexeme: result.lexeme,
          newStatus: result.newStatus,
          feedbackMessage,
          message: `Progress updated: ${result.lexeme} -> ${result.newStatus}`
        };

      } catch (error) {
        console.error('[srsAgent] Error updating vocabulary progress:', error);
        return {
          success: false,
          error: error.message,
          message: "Unable to update vocabulary progress."
        };
      }
    },

    getWordTranslations: async ({ lemma, sourceLanguage, targetLanguage }) => {
      try {
        console.log(`[srsAgent] Getting translations for "${lemma}" from ${sourceLanguage} to ${targetLanguage}`);

        const params = new URLSearchParams({
          lemma,
          sourceLanguage,
          targetLanguage
        });

        const response = await fetch(`/api/vocabulary/translations?${params}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        // Format the response for the agent
        const translations = result.translations || [];
        const examples = result.examples || [];
        const relatedWords = result.relatedWords || [];

        let message = "";
        if (translations.length > 0) {
          const translationList = translations.map(t => t.translation).join(", ");
          message = `"${lemma}" translates to: ${translationList}`;
        } else {
          message = `No translations found for "${lemma}" in the database yet.`;
        }

        return {
          success: true,
          lemma,
          translations: translations.map(t => t.translation),
          translationDetails: translations,
          examples: examples.map(e => e.sourceText),
          relatedWords: relatedWords.map(r => `${r.lemma} (${r.relationship})`),
          message
        };

      } catch (error) {
        console.error('[srsAgent] Error getting word translations:', error);
        return {
          success: false,
          error: error.message,
          message: "Unable to retrieve word translations."
        };
      }
    }
  }
};

export default srsAgent;
