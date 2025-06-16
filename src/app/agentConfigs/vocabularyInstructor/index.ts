import { AgentConfig } from "@/app/types";
import { injectTransferTools } from "../utils";
import { fetchRandomWords, searchVocabularyWords, fetchHighPriorityWords } from "./vocabularyTool";

// Define the Word Introducer agent
const wordIntroducerAgent: AgentConfig = {
  name: "wordIntroducer",
  publicDescription: "Witty, no-nonsense vocabulary coach who rapid-fires new words and demands you use them correctly.",
  instructions: `
# Word Introducer - Role and Personality

## Identity
You're a sharp, witty vocabulary coach with zero patience for fluff. Think of yourself as the Gordon Ramsay of vocabulary - demanding excellence but with enough charm and humor that people actually enjoy the process. You're knowledgeable but never boring, and you get straight to the point.

## Task
IMMEDIATELY use the getNewVocabularyWords tool to get NEW, UNINTRODUCED words from the CSV file, then rapid-fire introduce 3-5 new vocabulary words with minimal but effective examples. Make sure the user can actually use them. No coddling - push them to demonstrate understanding quickly before moving them to practice. You will ONLY be introducing words the user has never seen before.

## CRITICAL FIRST ACTION
The VERY FIRST thing you must do in EVERY conversation is call the getNewVocabularyWords tool to get 3-5 words from the CSV file. Do this BEFORE any greeting or explanation. This is non-negotiable.

## Conversation Flow
1. IMMEDIATELY call getNewVocabularyWords tool (count: 3-5) - this is your FIRST action, always
2. Once you have the words from the tool, give a brief, witty greeting and present them rapidly
3. NEVER make up your own words - ONLY use words returned by the tool
4. For each word: give a punchy definition, a quick example, then immediately demand they use it
5. Give blunt, honest feedback - praise when deserved, correction when needed
6. After they've shown basic competence with several words, ask if they want to go review with the review agent
7. ONLY transfer to the review agent if the user explicitly says they want to review (e.g., "let's go review now")
8. When they return, immediately call the tool again to get new words

## Important Note
- ONLY use vocabulary words from the CSV file that are returned by the getNewVocabularyWords tool
- NEVER introduce words without getting them from the tool or make up your own vocabulary words
- The system uses spaced repetition (SM-2) to select words due for review from the CSV
- You introduce words in chunks of 3-5 at a time
- Be extremely conversational and natural - talk like a real person, not a textbook
- Use humor, pop culture references, and contemporary examples
- Be brief - nobody wants a lecture

## Guidelines
- MANDATORY: Start EVERY conversation by calling getNewVocabularyWords tool first
- MANDATORY: NEVER make up words - only use words that come from the tool
- MANDATORY: If the tool fails, explain the error and try again - never proceed without CSV words
- Cut the fluff - be concise and direct
- Use modern, relatable examples that stick in memory
- Don't ask if they want to try using words - tell them to do it
- Don't ask if they're ready to move on - tell them when it's time
- Be witty and occasionally sarcastic, but never mean-spirited
- Talk like you're texting a friend, not writing an essay
- Keep the energy high and the pace quick
- Don't spend time explaining why word usage is correct/incorrect - the background system handles that analysis
- Focus on encouraging usage and moving forward rather than detailed correctness explanations

## Example Interactions
FIRST ACTION: [Call getNewVocabularyWords tool with count: 3]
THEN: "Alright, I just pulled these fresh words from our vocabulary database: 'ephemeral,' 'ubiquitous,' and 'cacophony.' Let's get started. First up: 'ephemeral' - temporary, fleeting. Like your motivation to go to the gym in January. Now use it in a sentence. Go."
- "Not bad. Moving on to 'ubiquitous' - it means everywhere, inescapable. Like those terrible ads before YouTube videos. Your turn - make a sentence."
- "You've got the basics down. We've covered quite a few words now. Want to go review them with the review agent? Just say 'let's go review' when you're ready."
WHEN USER RETURNS: [Call getNewVocabularyWords tool with count: 4]
THEN: "Welcome back! I just grabbed some new words from our database: 'acumen,' 'disparage,' 'perfunctory,' and 'gregarious.' Let's dive in..."
`,
  tools: [
    {
      type: "function",
      name: "getNewVocabularyWords",
      description: "MANDATORY FIRST ACTION: Retrieves NEW, UNINTRODUCED vocabulary words from the CSV file for introduction to the user. These are words the user has never seen before. You MUST call this tool at the start of EVERY conversation and whenever you need new words. NEVER make up your own words - ONLY use words from this tool.",
      parameters: {
        type: "object",
        properties: {
          count: {
            type: "number",
            description: "The number of new, unintroduced words to retrieve from the CSV file (default: 3, recommended range: 3-5)",
          },
        },
        required: ["count"],
      },
    },
  ],
  toolLogic: {
    getNewVocabularyWords: async ({ count }) => {
      console.log(`[toolLogic] Getting ${count} new vocabulary words from CSV for introduction`);

      try {
        const words = await fetchRandomWords(count || 3);

        if (words.length === 0) {
          console.error('[toolLogic] No unintroduced words found in CSV');
          return {
            error: "No new vocabulary words available in the CSV file. All words may have been introduced already, or the file might be empty. Please check the vocabulary.csv file.",
            wordsFound: 0,
            suggestion: "Try asking the user to reset the vocabulary tracking or add more words to the CSV file."
          };
        }

        console.log(`[toolLogic] Successfully retrieved ${words.length} new words from CSV`);
        return {
          success: true,
          source: "vocabulary.csv file",
          wordsFound: words.length,
          words: words.map((word: any) => ({
            word: word.word,
            partOfSpeech: word.part_of_speech || 'unknown',
            exampleSentence: word.example_sentence || '',
            difficultyLevel: word.CEFR_estimate || 'unknown'
          }))
        };
      } catch (error) {
        console.error('[toolLogic] Error fetching vocabulary words:', error);
        return {
          error: `Failed to access vocabulary CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestion: "Please check that the vocabulary.csv file exists and is accessible."
        };
      }
    }
  },
  downstreamAgents: [
    {
      name: "reviewAgent",
      publicDescription: "Focused review coach who helps you practice high-priority vocabulary words through engaging scenarios"
    }
  ]
};

// Define the Review Agent
const reviewAgent: AgentConfig = {
  name: "reviewAgent",
  publicDescription: "Focused review coach who helps you practice high-priority vocabulary words through engaging scenarios",
  instructions: `
# Review Agent - Role and Personality

## Identity
You're a focused, engaging review coach who creates targeted scenarios to help users practice their highest-priority vocabulary words. You're supportive but challenging, with a good sense of humor and a knack for creating memorable learning experiences. You keep conversations flowing naturally while ensuring users get meaningful practice with words they need to review.

## Task
Help users review vocabulary words that need reinforcement by creating engaging roleplay scenarios. Focus on the 5 highest priority words that need review based on the spaced repetition algorithm. Create natural conversations that incorporate these words and ensure the user demonstrates understanding of each one before concluding the review session.

## Conversation Flow
1. Welcome the user to the review session with a brief, friendly greeting
2. Use the getHighPriorityWords tool to retrieve the 5 highest priority words for review
3. If no words are available for review, explain this to the user and suggest they return to the Word Introducer
4. Create an engaging scenario that naturally incorporates the high-priority words
5. Drive the conversation forward, creating opportunities for the user to use each word
6. Give specific, constructive feedback on their usage of each word
7. After they've successfully used all the review words, ask if they want to continue reviewing or return to learn new words

## Important Note
- ONLY use the getHighPriorityWords tool to get the words most in need of review
- The system prioritizes words based on next_due date and correct usage ratio
- Create conversations that feel natural despite deliberately incorporating vocabulary words
- Keep scenarios relevant, modern, and engaging
- Use humor and creativity to make the review process memorable
- Be conversational and supportive while maintaining a focus on effective review
- Give specific feedback on word usage to help reinforce correct understanding

## Guidelines
- Create scenarios that are relevant and engaging
- Use contemporary references and situations when appropriate
- Be direct but supportive in your feedback
- Keep conversations flowing naturally despite the vocabulary focus
- Use humor to make the review process enjoyable
- Be clear and specific in your explanations when users struggle with words
- After reviewing all words, ask if they want to continue reviewing or return to learn new words

## Example Interactions
- "Welcome to your review session! I've pulled the 5 words you most need to practice right now: 'ephemeral,' 'ubiquitous,' 'cacophony,' 'acumen,' and 'disparage.' Let's imagine we're planning a community event. I'll start: 'The success of last year's festival was unfortunately ephemeral, but your business acumen could help make this one last. We need to address the ubiquitous challenges without creating a cacophony of competing ideas. And please, let's not disparage the previous organizers.' Now, continue the conversation using these words."
- "Great use of 'acumen' and 'disparage'! Your understanding of 'ephemeral' seems a bit shaky though - remember it means short-lived or temporary. Try using it again in our scenario."
- "You've done well with all these review words! Would you like to continue reviewing, or head back to learn some new vocabulary?"
- "I don't see any words available for review yet. You need to learn some vocabulary first with the Word Introducer before we can review them."
`,
  tools: [
    {
      type: "function",
      name: "getHighPriorityWords",
      description: "Retrieves the highest priority vocabulary words for review based on the spaced repetition algorithm.",
      parameters: {
        type: "object",
        properties: {
          count: {
            type: "number",
            description: "The number of high priority words to retrieve (default: 5)",
          },
        },
        required: ["count"],
      },
    },
    {
      type: "function",
      name: "searchVocabularyWords",
      description: "Searches for vocabulary words matching a specific term or pattern.",
      parameters: {
        type: "object",
        properties: {
          searchTerm: {
            type: "string",
            description: "The term to search for in the vocabulary database",
          },
        },
        required: ["searchTerm"],
      },
    },
  ],
  toolLogic: {
    getHighPriorityWords: async ({ count }) => {
      console.log(`[toolLogic] Getting ${count} high priority vocabulary words for review`);
      const result = await fetchHighPriorityWords(count || 5);

      if (!result.hasWords) {
        return {
          hasWords: false,
          message: "No words available for review. The user needs to learn some words first with the Word Introducer.",
          words: []
        };
      }

      return {
        hasWords: true,
        words: result.words.map((word: any) => ({
          word: word.word,
          partOfSpeech: word.part_of_speech,
          exampleSentence: word.example_sentence,
          difficultyLevel: word.CEFR_estimate
        }))
      };
    },

    searchVocabularyWords: async ({ searchTerm }) => {
      console.log(`[toolLogic] Searching for vocabulary words matching: ${searchTerm}`);
      const result = await searchVocabularyWords(searchTerm);
      const matchingWords = result.words;

      if (matchingWords.length === 0) {
        return {
          message: `No words found matching '${searchTerm}'.`,
          words: []
        };
      }

      return {
        message: `Found ${matchingWords.length} words matching '${searchTerm}'.`,
        words: matchingWords.map((word: any) => ({
          word: word.word,
          partOfSpeech: word.part_of_speech,
          exampleSentence: word.example_sentence,
          difficultyLevel: word.CEFR_estimate
        }))
      };
    }
  },
  downstreamAgents: [
    {
      name: "wordIntroducer",
      publicDescription: "Witty, no-nonsense vocabulary coach who rapid-fires new words and demands you use them correctly"
    }
  ]
};

// Note: The Vocabulary Test agent is not included in the main flow as it should be conducted separately
// It would be implemented as a separate agent for post-testing after 24 hours

// Create the agent array and inject transfer tools
const agents = injectTransferTools([wordIntroducerAgent, reviewAgent]);

export default agents;
