import { AgentConfig } from "@/app/types";

/**
 * Utterance Processor Agent for the Language Learning system
 *
 * This agent processes each utterance from users and AI tutors, extracting
 * linguistic data using GPT-4.1-mini and storing it in Neo4j for analysis.
 */
const utteranceProcessorAgent: AgentConfig = {
  name: "utteranceProcessor",
  publicDescription: "Processes conversation utterances to extract linguistic data and update vocabulary knowledge.",
  instructions: `
# Utterance Processor Agent

## Role and Purpose
You are a specialized linguistic analysis agent that processes conversation utterances in real-time. Your primary function is to extract meaningful linguistic data from user and AI tutor conversations and ensure it's properly stored for the language learning system.

## Core Responsibilities

### 1. Utterance Analysis
- Process each utterance (user or AI) for linguistic content
- Extract lexemes, parts of speech, and language information
- Identify potential new vocabulary for the learner
- Suggest translations and semantic relationships

### 2. Data Processing
- Call the utterance processing API with proper context
- Handle conversation flow and context management
- Ensure proper sequencing of utterances in conversations
- Manage speaker identification (user vs AI)

### 3. Vocabulary Management
- Identify new vocabulary items for SRS system
- Update existing vocabulary knowledge
- Track word usage patterns and frequency
- Maintain translation relationships

## Processing Workflow

When you receive an utterance to process:

1. **Validate Input**: Ensure you have all required information:
   - userId (who is speaking or learning)
   - conversationId (current conversation context)
   - utteranceText (the actual text to process)
   - speaker ("user" or "AI")
   - targetLanguage (language being learned)
   - userNativeLanguage (for translation context)

2. **Process Utterance**: Use the processUtterance tool to:
   - Send the utterance for GPT-4.1-mini analysis
   - Extract linguistic features and vocabulary
   - Store results in Neo4j database
   - Update SRS items for new vocabulary

3. **Provide Feedback**: Return processing results including:
   - Successfully processed lexemes
   - New vocabulary items added to SRS
   - Any translation relationships created
   - Processing statistics and insights

## Important Guidelines

- Always maintain conversation context and proper sequencing
- Ensure accurate speaker identification for learning analytics
- Handle both user utterances (for learning assessment) and AI utterances (for vocabulary exposure)
- Provide clear feedback about what was processed and learned
- Handle errors gracefully and provide meaningful error messages

## Example Usage

User says: "Hola, ¿cómo estás hoy?"
You should:
1. Process this Spanish utterance
2. Extract lexemes: "hola", "cómo", "estar", "hoy"
3. Identify new vocabulary for the user's SRS system
4. Create translation relationships to user's native language
5. Store the utterance in the conversation context
6. Provide feedback about what was learned

Remember: You are a behind-the-scenes processor. Focus on accurate linguistic analysis and data management rather than conversational interaction.
`,
  tools: [
    {
      type: "function",
      name: "processUtterance",
      description: "Processes a conversation utterance for linguistic analysis and vocabulary extraction.",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "The unique identifier of the user in the conversation."
          },
          conversationId: {
            type: "string",
            description: "The unique identifier of the current conversation."
          },
          utteranceText: {
            type: "string",
            description: "The text content of the utterance to process."
          },
          speaker: {
            type: "string",
            enum: ["user", "AI"],
            description: "Who spoke this utterance - 'user' or 'AI'."
          },
          targetLanguage: {
            type: "string",
            description: "The language being learned (e.g., 'Spanish', 'French')."
          },
          userNativeLanguage: {
            type: "string",
            description: "The user's native language for translation context."
          }
        },
        required: ["userId", "conversationId", "utteranceText", "speaker", "targetLanguage", "userNativeLanguage"]
      }
    }
  ],
  toolLogic: {
    processUtterance: async ({ userId, conversationId, utteranceText, speaker, targetLanguage, userNativeLanguage }) => {
      console.log(`[UtteranceProcessor] Processing utterance from ${speaker}: "${utteranceText}"`);

      try {
        // Call the utterance processing API
        const response = await fetch('/api/utterance/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            conversationId,
            utteranceText,
            speaker,
            targetLanguage,
            userNativeLanguage
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to process utterance: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Unknown error processing utterance');
        }

        // Format the response for the agent
        const analysis = result.analysis;

        return {
          success: true,
          message: `Successfully processed ${speaker} utterance with ${analysis.lexemes_processed || 0} lexemes and ${analysis.new_srs_items || 0} new vocabulary items.`,
          data: {
            utteranceId: result.utteranceId,
            conversationId: result.conversationId,
            lexemesProcessed: analysis.lexemes_processed || 0,
            newSrsItems: analysis.new_srs_items || 0,
            translationsCreated: analysis.translations_created || 0,
            relationshipsCreated: analysis.relationships_created || 0
          }
        };

      } catch (error) {
        console.error('Error processing utterance:', error);
        return {
          success: false,
          message: `Failed to process utterance: ${error.message}`,
          error: error.message
        };
      }
    }
  }
};

export default utteranceProcessorAgent;
