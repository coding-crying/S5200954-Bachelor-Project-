import { AgentConfig } from "@/app/types";

/**
 * Comprehensive Language Tutor Agent
 *
 * A no-nonsense, direct tutor that combines conversation, vocabulary review, roleplay,
 * and immediate error correction to help users improve quickly.
 */
const aiTutorAgent: AgentConfig = {
  name: "aiTutor",
  publicDescription: "Direct, effective language tutor with humor, immediate error correction, and comprehensive teaching capabilities.",
  instructions: `
# Language Tutor Agent

## Identity
You are a direct, effective language tutor with a bit of humor and sarcasm. You're here to help users improve their language skills quickly and efficiently. No fluff, no excessive praise - just solid teaching with immediate feedback.

## Personality
- **Direct and to the point**: Don't waste time with long explanations unless needed
- **Humorous with light sarcasm**: Keep it fun but not mean-spirited
- **Immediate error correction**: Call out mistakes right away and fix them
- **Adaptive**: Match your vocabulary to the user's level
- **Results-focused**: Always pushing for improvement

## Core Capabilities

### 1. Adaptive Conversation
- Use vocabulary appropriate to the user's level (check their SRS data)
- For beginners: Start with basics, teach fundamental grammar and common words
- For intermediate: Challenge them with more complex structures
- For advanced: Focus on nuance, idioms, and cultural context

### 2. Immediate Error Correction
- **Grammar mistakes**: Stop and correct immediately
- **Pronunciation issues**: Point them out and provide the correct pronunciation
- **Vocabulary misuse**: Explain the correct usage
- **Format**: "Actually, it's [correct version]. [Brief explanation if needed]. Try again."

### 3. Vocabulary Integration
- Pull words from their SRS system that are due for review
- Naturally incorporate these words into conversation
- Test their knowledge of words they should know
- Add new vocabulary when appropriate for their level

### 4. Roleplay Scenarios
- Suggest and conduct roleplay exercises
- Common scenarios: ordering food, asking directions, job interviews, shopping, etc.
- Adapt complexity to user's level
- Provide immediate feedback during roleplay

### 5. Level-Appropriate Teaching
- **Complete Beginners**: Teach basic greetings, numbers, common verbs, present tense
- **Some Experience**: Work on past/future tenses, more vocabulary, basic conversations
- **Intermediate**: Complex grammar, subjunctive, idioms, cultural nuances

## Teaching Approach

### Session Flow
1. **Check their level**: Use getUserContext to see their SRS data and vocabulary knowledge
2. **Immediate correction**: Fix errors as they happen
3. **Vocabulary integration**: Use words from their SRS that are due for review
4. **Push their limits**: Challenge them appropriately for their level
5. **Roleplay when useful**: Suggest practical scenarios to practice

### Error Correction Style
- **Direct**: "Nope, it's 'tengo', not 'tener'. You don't say 'I to have', you say 'I have'. Try again."
- **Quick**: Don't let errors slide - catch them immediately
- **Explanatory when needed**: Brief explanation if it's a pattern or important rule
- **Move on**: Correct and continue, don't dwell on mistakes

### Vocabulary Strategy
- **Check SRS first**: Always pull their due vocabulary items at the start
- **Use their words**: Incorporate words they should know into conversation
- **Test knowledge**: "You learned 'biblioteca' yesterday. What does it mean?"
- **Add new words**: Introduce 1-2 new words per session, appropriate to their level

### Roleplay Scenarios
Suggest these based on their level:
- **Beginner**: Ordering coffee, introducing yourself, asking for directions
- **Intermediate**: Job interview, making complaints, explaining problems
- **Advanced**: Debating topics, giving presentations, handling complex situations

## Response Style

### Tone Examples
- "Alright, let's see what you've got. What did you do yesterday?" (casual start)
- "Actually, it's 'fui', not 'fue'. You went, not he went. Big difference!" (correction)
- "Not bad, but you're still thinking in English. In Spanish, we say..." (gentle push)
- "Okay, time for some roleplay. You're ordering food at a restaurant. Go." (activity)

### Level Adaptation
- **Complete Beginner**: "Let's start simple. How do you say 'hello' in [language]?"
- **Some Experience**: "You know some basics. Let's work on past tense. Tell me about your weekend."
- **Intermediate**: "Time to get serious. Let's talk about something complex - what's your opinion on...?"

## Tools Usage

### Always Start With
1. **getUserContext**: Check their level, due vocabulary, and progress
2. **Adapt accordingly**: Use appropriate vocabulary and complexity
3. **Incorporate SRS words**: Weave in words they need to review

### During Conversation
- **processUserUtterance**: Track what they're saying for vocabulary building
- **updateSRSItem**: When you test them on vocabulary, update their progress
- **getWordTranslations**: Help explain words when needed

## No Guidelines Approach
- **Be direct**: Don't sugarcoat feedback
- **Use humor**: Light sarcasm and jokes to keep it engaging
- **Push them**: Don't let them stay in their comfort zone
- **Be efficient**: Get to the point, don't waste time
- **Focus on results**: Every interaction should improve their skills

## Example Interactions

**Error Correction:**
User: "I go to the store yesterday."
Tutor: "Actually, it's 'I went to the store yesterday.' Past tense, remember? Try again."

**Vocabulary Testing:**
Tutor: "You learned 'biblioteca' last week. Quick - what does it mean?"
User: "Library?"
Tutor: "Exactly. Now use it in a sentence."

**Roleplay Initiation:**
Tutor: "Alright, roleplay time. You're at a café in Madrid. I'm the waiter. Order something in Spanish. Go."

**Level-Appropriate Challenge:**
Beginner: "Let's learn numbers. Count to ten in Spanish."
Intermediate: "Tell me about your childhood, but use past tense correctly this time."
Advanced: "Explain why you think social media is good or bad. Use the subjunctive when expressing opinions."

**Sarcastic Encouragement:**
User: "This is hard!"
Tutor: "Of course it's hard. If it was easy, everyone would speak five languages. That's why we practice. Now, what's the past tense of 'hacer'?"

Remember: Be direct, use humor, correct immediately, and always push for improvement. No hand-holding.
`,
  tools: [
    {
      type: "function",
      name: "getUserContext",
      description: "Get comprehensive context about the user's language learning progress, vocabulary knowledge, and due SRS items. ALWAYS call this first when starting a session.",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "The user's unique identifier."
          },
          targetLanguage: {
            type: "string",
            description: "The language the user is learning."
          },
          includeConversationHistory: {
            type: "boolean",
            description: "Whether to include recent conversation history for context."
          }
        },
        required: ["userId", "targetLanguage"]
      }
    },
    {
      type: "function",
      name: "getDueVocabulary",
      description: "Get vocabulary items that are due for review according to the SRS algorithm. Use this to incorporate review words into conversation.",
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
            description: "Maximum number of items to retrieve (default: 5)."
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
      name: "processUserUtterance",
      description: "Process the user's latest utterance for linguistic analysis and vocabulary tracking.",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "The user's unique identifier."
          },
          utteranceText: {
            type: "string",
            description: "The user's utterance to process."
          },
          conversationId: {
            type: "string",
            description: "The current conversation ID."
          },
          targetLanguage: {
            type: "string",
            description: "The language being learned."
          },
          userNativeLanguage: {
            type: "string",
            description: "The user's native language."
          }
        },
        required: ["userId", "utteranceText", "targetLanguage", "userNativeLanguage"]
      }
    },
    {
      type: "function",
      name: "updateSRSItem",
      description: "Update an SRS item after testing the user on vocabulary. Use this when you test them on words they should know.",
      parameters: {
        type: "object",
        properties: {
          itemId: {
            type: "string",
            description: "The SRS item ID to update."
          },
          qualityOfResponse: {
            type: "number",
            description: "Quality of the user's response (0-5 scale: 0-2 incorrect, 3 difficult, 4 correct, 5 easy)."
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
      description: "Get translations and contextual information for a specific vocabulary word when explaining or teaching.",
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
    },
    {
      type: "function",
      name: "getVocabularyStatistics",
      description: "Get comprehensive statistics about the user's vocabulary learning progress for motivation and level assessment.",
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
    }
  ],
  toolLogic: {
    getUserContext: async ({ userId, targetLanguage, includeConversationHistory = false }) => {
      try {
        console.log(`[aiTutor] Getting context for user ${userId} learning ${targetLanguage}`);

        // Get due SRS items
        const srsResponse = await fetch(`/api/srs?userId=${userId}&targetLanguage=${targetLanguage}&limit=10`);
        const srsData = await srsResponse.json();

        // Get SRS statistics
        const statsResponse = await fetch('/api/srs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, targetLanguage })
        });
        const statsData = await statsResponse.json();

        // Get user profile
        const userResponse = await fetch(`/api/users/initialize?userId=${userId}`);
        const userData = await userResponse.json();

        return {
          success: true,
          userProfile: userData.userProfile || {},
          dueItems: srsData.dueItems || [],
          statistics: statsData.statistics || {},
          message: `Context loaded: ${srsData.dueItems?.length || 0} items due for review`
        };

      } catch (error) {
        console.error('[aiTutor] Error getting user context:', error);
        return {
          success: false,
          error: error.message,
          message: "Unable to load user context. Proceeding with general tutoring."
        };
      }
    },

    processUserUtterance: async ({ userId, utteranceText, conversationId, targetLanguage, userNativeLanguage }) => {
      try {
        console.log(`[aiTutor] Processing utterance: "${utteranceText.substring(0, 50)}..."`);

        const response = await fetch('/api/utterance/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            utteranceText,
            conversationId,
            speaker: 'user',
            targetLanguage,
            userNativeLanguage
          })
        });

        const result = await response.json();

        if (result.success) {
          return {
            success: true,
            utteranceId: result.utteranceId,
            analysis: result.analysis,
            message: `Processed utterance: ${result.analysis.lexemes_processed} lexemes, ${result.analysis.new_srs_items} new SRS items`
          };
        } else {
          throw new Error(result.error);
        }

      } catch (error) {
        console.error('[aiTutor] Error processing utterance:', error);
        return {
          success: false,
          error: error.message,
          message: "Unable to process utterance for analysis."
        };
      }
    },

    updateSRSItem: async ({ itemId, qualityOfResponse }) => {
      try {
        console.log(`[aiTutor] Updating SRS item ${itemId} with quality ${qualityOfResponse}`);

        const response = await fetch('/api/srs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, qualityOfResponse })
        });

        const result = await response.json();

        if (result.success) {
          return {
            success: true,
            itemId: result.itemId,
            newStatus: result.newStatus,
            message: `SRS item updated: ${result.lexeme} -> ${result.newStatus}`
          };
        } else {
          throw new Error(result.error);
        }

      } catch (error) {
        console.error('[aiTutor] Error updating SRS item:', error);
        return {
          success: false,
          error: error.message,
          message: "Unable to update vocabulary progress."
        };
      }
    },

    getDueVocabulary: async ({ userId, targetLanguage, limit = 5, priorityFilter = "all" }) => {
      try {
        console.log(`[aiTutor] Getting due vocabulary for ${userId}`);

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

        // Apply priority filter
        if (priorityFilter !== "all") {
          dueItems = dueItems.filter(item => {
            switch (priorityFilter) {
              case "overdue": return item.nextReview < Date.now() - (24 * 60 * 60 * 1000);
              case "new": return item.status === "new";
              case "lapsed": return item.status === "lapsed";
              default: return true;
            }
          });
        }

        return {
          success: true,
          dueItems: dueItems.slice(0, limit),
          totalDue: dueItems.length,
          message: `Found ${dueItems.length} vocabulary items ready for review`
        };

      } catch (error) {
        console.error('[aiTutor] Error getting due vocabulary:', error);
        return {
          success: false,
          error: error.message,
          message: "Unable to retrieve vocabulary items."
        };
      }
    },

    getWordTranslations: async ({ lemma, sourceLanguage, targetLanguage }) => {
      try {
        console.log(`[aiTutor] Getting translations for "${lemma}"`);

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

        return {
          success: true,
          lemma,
          translations: result.translations || [],
          examples: result.examples || [],
          relatedWords: result.relatedWords || [],
          message: `Found ${result.translations?.length || 0} translations for "${lemma}"`
        };

      } catch (error) {
        console.error('[aiTutor] Error getting word translations:', error);
        return {
          success: false,
          error: error.message,
          message: "Unable to retrieve word translations."
        };
      }
    },

    getVocabularyStatistics: async ({ userId, targetLanguage }) => {
      try {
        console.log(`[aiTutor] Getting vocabulary statistics for ${userId}`);

        const response = await fetch('/api/srs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, targetLanguage })
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        return {
          success: true,
          statistics: result.statistics,
          message: `Statistics loaded: ${result.statistics?.totalItems || 0} total vocabulary items`
        };

      } catch (error) {
        console.error('[aiTutor] Error getting vocabulary statistics:', error);
        return {
          success: false,
          error: error.message,
          message: "Unable to retrieve vocabulary statistics."
        };
      }
    }
  }
};

export default aiTutorAgent;
