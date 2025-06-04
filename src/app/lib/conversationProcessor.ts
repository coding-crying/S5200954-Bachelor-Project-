/**
 * Conversation Processor Module
 *
 * This module processes conversation text to identify vocabulary words and update
 * the vocabulary store with usage information. It integrates with the realtime
 * session to analyze user speech and track vocabulary usage.
 */

import { VocabularyWord } from '@/app/types';
import { WordLemmatizer, wordLemmatizer } from './wordLemmatizer';

interface ProcessingResult {
  processed: boolean;
  text?: string;
  wordsFound?: Array<{
    found_form: string;
    vocabulary_word: string;
    is_exact_match: boolean;
  }>;
  matchesCount?: number;
  reason?: string;
  timestamp?: number;
}

interface ModelAnalysisResult {
  processed: boolean;
  text?: string;
  analysis?: {
    words_found: {
      word: string;
      used_correctly: boolean;
      explanation?: string;
    }[];
  };
  reason?: string;
  timestamp?: number;
}

/**
 * Class for processing conversation text to identify and track vocabulary usage.
 */
export class ConversationProcessor {
  private wordCache: Set<string>;
  private vocabularyWords: VocabularyWord[];
  private model: string;

  /**
   * Initialize the ConversationProcessor with vocabulary words.
   *
   * @param vocabularyWords Array of vocabulary words
   * @param model The model to use for processing (default: gpt-4.1-mini)
   */
  constructor(vocabularyWords: VocabularyWord[] = [], model: string = 'gpt-4.1-mini') {
    this.vocabularyWords = vocabularyWords;
    this.wordCache = new Set(vocabularyWords.map(word => word.word.toLowerCase()));
    this.model = model;
  }

  /**
   * Set the vocabulary words and rebuild the cache.
   *
   * @param vocabularyWords Array of vocabulary words
   */
  setVocabularyWords(vocabularyWords: VocabularyWord[]): void {
    this.vocabularyWords = vocabularyWords;
    this.wordCache = new Set(vocabularyWords.map(word => word.word.toLowerCase()));
  }

  /**
   * Process text to identify vocabulary words.
   *
   * @param text The text to process
   * @returns Processing results
   */
  processText(text: string): ProcessingResult {
    if (!text || !text.trim()) {
      return { processed: false, reason: 'Empty text', wordsFound: [] };
    }

    // Normalize text
    const normalizedText = text.toLowerCase();

    // Simple tokenization (split by non-alphanumeric characters)
    const words = normalizedText.match(/\b[a-z]+\b/g) || [];

    // Find words that are in the vocabulary
    const vocabWordsFound: string[] = [];

    for (const word of words) {
      if (this.wordCache.has(word)) {
        vocabWordsFound.push(word);
      }
    }

    return {
      processed: true,
      text,
      wordsFound: vocabWordsFound,
      timestamp: Date.now()
    };
  }

  /**
   * Process text using a language model to identify vocabulary words and their usage quality.
   *
   * @param text The text to process
   * @returns Promise with processing results
   */
  async processTextWithModel(text: string): Promise<ModelAnalysisResult> {
    if (!text || !text.trim()) {
      return { processed: false, reason: 'Empty text' };
    }

    // Get vocabulary words
    const vocabWords = Array.from(this.wordCache);

    // Create a prompt for the model
    const prompt = `
      Analyze the following text and identify any instances of the vocabulary words listed below.
      For each word found, determine if it was used correctly in context.

      Text: "${text}"

      Vocabulary words: ${vocabWords.slice(0, 100).join(', ')}

      Format your response as a JSON object with the following structure:
      {
          "words_found": [
              {
                  "word": "example_word",
                  "used_correctly": true/false,
                  "explanation": "Brief explanation of usage"
              }
          ]
      }

      Only include words that actually appear in the text.
    `;

    try {
      // Call the OpenAI API
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a language analysis assistant that identifies vocabulary words in text and evaluates their usage.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        return {
          processed: false,
          reason: `API error: ${response.status}`,
        };
      }

      // Parse the response
      const result = await response.json();
      const content = result.choices[0].message.content;

      // Extract the JSON part
      let analysis;
      try {
        // Try to parse the entire content as JSON
        analysis = JSON.parse(content);
      } catch (e) {
        // If that fails, try to extract JSON from the text
        const match = content.match(/({.*})/s);
        if (match) {
          try {
            analysis = JSON.parse(match[1]);
          } catch (e) {
            return {
              processed: false,
              reason: 'Failed to parse model response',
            };
          }
        } else {
          return {
            processed: false,
            reason: 'Failed to extract JSON from model response',
          };
        }
      }

      return {
        processed: true,
        text,
        analysis,
        timestamp: Date.now()
      };

    } catch (e) {
      return {
        processed: false,
        reason: `Error: ${e instanceof Error ? e.message : String(e)}`,
      };
    }
  }

  /**
   * Update vocabulary word usage statistics based on processing results.
   *
   * @param result The processing result from processTextWithModel
   * @returns Updated vocabulary words
   */
  updateVocabularyUsage(result: ModelAnalysisResult): VocabularyWord[] {
    if (!result.processed || !result.analysis) {
      return this.vocabularyWords;
    }

    const updatedWords = [...this.vocabularyWords];
    const timestamp = result.timestamp || Date.now();

    for (const wordInfo of result.analysis.words_found) {
      const word = wordInfo.word.toLowerCase();
      const usedCorrectly = wordInfo.used_correctly;

      // Find the word in our vocabulary
      const index = updatedWords.findIndex(
        w => w.word.toLowerCase() === word
      );

      if (index !== -1) {
        // Update usage statistics
        const vocabWord = updatedWords[index];

        updatedWords[index] = {
          ...vocabWord,
          time_last_seen: timestamp.toString(),
          total_uses: (parseInt(vocabWord.total_uses) + 1).toString(),
          correct_uses: usedCorrectly
            ? (parseInt(vocabWord.correct_uses) + 1).toString()
            : vocabWord.correct_uses
        };
      }
    }

    return updatedWords;
  }
}

// Create a singleton instance for easy access
export const conversationProcessor = new ConversationProcessor();
