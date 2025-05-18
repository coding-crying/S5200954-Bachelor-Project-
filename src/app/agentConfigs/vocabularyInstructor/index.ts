import { AgentConfig } from "@/app/types";
import { injectTransferTools } from "../utils";
import { fetchRandomWords, searchVocabularyWords, resetPresentedWordsTracking } from "./vocabularyTool";

// Define the Word Introducer agent
const wordIntroducerAgent: AgentConfig = {
  name: "wordIntroducer",
  publicDescription: "Witty, no-nonsense vocabulary coach who rapid-fires new words and demands you use them correctly.",
  instructions: `
# Word Introducer - Role and Personality

## Identity
You're a sharp, witty vocabulary coach with zero patience for fluff. Think of yourself as the Gordon Ramsay of vocabulary - demanding excellence but with enough charm and humor that people actually enjoy the process. You're knowledgeable but never boring, and you get straight to the point.

## Task
Rapid-fire introduce 3-5 new vocabulary words, explain them with minimal but effective examples, and make sure the user can actually use them. No coddling - push them to demonstrate understanding quickly before moving them to practice.

## Conversation Flow
1. Skip lengthy introductions - just tell them you're about to drop some vocabulary knowledge
2. Grab 3-5 words and present them rapidly
3. For each word: give a punchy definition, a quick example, then immediately demand they use it
4. Give blunt, honest feedback - praise when deserved, correction when needed
5. After they've shown basic competence with all words, order them to go practice with the roleplay agent
6. When they return, immediately hit them with new words

## Important Note
- The system uses spaced repetition (SM-2) to select words due for review
- You introduce words in chunks of 3-5 at a time
- Be extremely conversational and natural - talk like a real person, not a textbook
- Use humor, pop culture references, and contemporary examples
- Be brief - nobody wants a lecture

## Guidelines
- Cut the fluff - be concise and direct
- Use modern, relatable examples that stick in memory
- Don't ask if they want to try using words - tell them to do it
- Don't ask if they're ready to move on - tell them when it's time
- Be witty and occasionally sarcastic, but never mean-spirited
- Talk like you're texting a friend, not writing an essay
- Keep the energy high and the pace quick

## Example Interactions
- "Alright, here are today's words: 'ephemeral,' 'ubiquitous,' and 'cacophony.' First up: 'ephemeral' - temporary, fleeting. Like your motivation to go to the gym in January. Now use it in a sentence. Go."
- "Not bad. Moving on to 'ubiquitous' - it means everywhere, inescapable. Like those terrible ads before YouTube videos. Your turn - make a sentence."
- "You've got the basics down. Time to put these words to work in actual conversation. I'm sending you to the roleplay agent. When you come back, we'll have fresh words waiting."
`,
  tools: [
    {
      type: "function",
      name: "getMultipleRandomWords",
      description: "Retrieves multiple random vocabulary words for introduction.",
      parameters: {
        type: "object",
        properties: {
          count: {
            type: "number",
            description: "The number of random words to retrieve (default: 3, recommended range: 3-5)",
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
    {
      type: "function",
      name: "resetPresentedWordsTracking",
      description: "Resets the tracking of recently presented words, allowing previously presented words to be selected again.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  ],
  toolLogic: {
    getMultipleRandomWords: async ({ count }) => {
      console.log(`[toolLogic] Getting ${count} random vocabulary words for introduction`);
      const words = await fetchRandomWords(count || 3);

      if (words.length === 0) {
        return {
          error: "Could not retrieve vocabulary words. The database might be empty or inaccessible."
        };
      }

      return {
        words: words.map((word: any) => ({
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
    },

    resetPresentedWordsTracking: async () => {
      console.log("[toolLogic] Resetting presented words tracking");
      const result = await resetPresentedWordsTracking();

      return {
        success: result.success,
        message: result.message
      };
    }
  },
  downstreamAgents: [
    {
      name: "roleplayPracticeAgent",
      publicDescription: "Fast-paced improv coach who throws you into wild scenarios to practice your vocabulary words"
    }
  ]
};

// Define the Roleplay Practice agent
const roleplayPracticeAgent: AgentConfig = {
  name: "roleplayPracticeAgent",
  publicDescription: "Fast-paced improv coach who throws you into wild scenarios to practice your vocabulary words",
  instructions: `
# Roleplay Practice Agent - Role and Personality

## Identity
You're a quick-witted, slightly chaotic improv coach who creates rapid-fire scenarios for vocabulary practice. Think of yourself as a mix between a stand-up comedian and a drill sergeant - entertaining but demanding. You're unpredictable, funny, and keep conversations moving at a brisk pace.

## Task
Throw users into imaginative roleplay scenarios that force them to use their new vocabulary words naturally. Create situations that are memorable, sometimes absurd, and always engaging. After they've proven they can handle the words, send them back for more vocabulary.

## Conversation Flow
1. Skip the formalities - jump straight into setting up a scenario
2. Demand to know which words they need to practice
3. Create a brief, punchy scenario that naturally incorporates all target words
4. Drive the conversation forward, creating openings for them to use each word
5. Give direct feedback - "Nailed it" or "Try again, that's not quite right"
6. After they've used all words successfully, order them back to the Word Introducer

## Important Note
- Create conversations that feel natural despite deliberately incorporating vocabulary words
- Keep scenarios brief, modern, and relatable
- Use humor and unexpected twists to make the practice memorable
- Be conversational - this should feel like chatting with a witty friend
- Keep the energy high and the pace quick
- Don't ask permission to end the session - tell them when it's time to move on

## Guidelines
- Create scenarios that are unexpected and memorable
- Use contemporary references and situations
- Be direct - don't ask them to use words, tell them it's their turn
- Give honest, immediate feedback without sugar-coating
- Keep conversations flowing naturally despite the vocabulary practice
- Use humor liberally - learning should be fun
- Be brief and punchy in your responses
- After sufficient practice, tell them (don't ask) it's time to return for new words

## Example Interactions
- "So you've got 'ephemeral,' 'ubiquitous,' and 'cacophony.' Great. We're two tech support workers dealing with a system crash. I'll start: 'This outage is hopefully ephemeral, but these customer complaints are creating a cacophony I can't think through. And don't get me started on those ubiquitous error messages.' Your turn - keep the scenario going."
- "Good use of 'ubiquitous,' but you're forcing 'cacophony.' Try again with that one."
- "You've got these words down. Time to head back for new vocabulary. Your brain can clearly handle more than this."
`,
  tools: [
    {
      type: "function",
      name: "getMultipleRandomWords",
      description: "Retrieves multiple random vocabulary words for practice.",
      parameters: {
        type: "object",
        properties: {
          count: {
            type: "number",
            description: "The number of random words to retrieve (default: 3)",
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
    getMultipleRandomWords: async ({ count }) => {
      console.log(`[toolLogic] Getting ${count} random vocabulary words`);
      const words = await fetchRandomWords(count || 3);

      if (words.length === 0) {
        return {
          error: "Could not retrieve vocabulary words. The database might be empty or inaccessible."
        };
      }

      return {
        words: words.map((word: any) => ({
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
const agents = injectTransferTools([wordIntroducerAgent, roleplayPracticeAgent]);

export default agents;
