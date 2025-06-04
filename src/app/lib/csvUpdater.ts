/**
 * CSV Updater Utility
 *
 * This module provides utilities to apply structured updates to the vocabulary CSV
 * based on GPT-4.1-mini analysis results.
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { VocabularyWord } from '@/app/types';

const VOCAB_PATH = path.join(process.cwd(), 'vocabulary.csv');

interface CSVUpdate {
  word: string;
  action: 'increment_total' | 'increment_correct' | 'update_timing' | 'set_value' | 'increment_user_total' | 'increment_user_correct' | 'increment_system_total' | 'increment_system_correct';
  value: string | number;
  timestamp: string;
  speaker?: 'user' | 'assistant';
  field?: string; // For set_value actions
}

interface UpdateResult {
  success: boolean;
  updatesApplied: number;
  wordsUpdated: string[];
  errors: string[];
}

/**
 * Apply structured CSV updates from conversation processing
 */
export async function applyCsvUpdates(updates: CSVUpdate[]): Promise<UpdateResult> {
  const result: UpdateResult = {
    success: false,
    updatesApplied: 0,
    wordsUpdated: [],
    errors: []
  };

  try {
    // Check if the vocabulary file exists
    if (!fs.existsSync(VOCAB_PATH)) {
      result.errors.push("Vocabulary CSV file not found");
      return result;
    }

    // Read the current CSV data
    const fileContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as VocabularyWord[];

    // Create a map for faster lookups
    const recordMap = new Map<string, number>();
    for (let i = 0; i < records.length; i++) {
      recordMap.set(records[i].word.toLowerCase(), i);
    }

    // Apply each update
    for (const update of updates) {
      try {
        const wordKey = update.word.toLowerCase();
        const recordIndex = recordMap.get(wordKey);

        if (recordIndex === undefined) {
          result.errors.push(`Word not found in vocabulary: ${update.word}`);
          continue;
        }

        const record = records[recordIndex];
        let updated = false;

        switch (update.action) {
          case 'increment_total':
            const currentTotal = parseInt(record.total_uses || '0');
            record.total_uses = (currentTotal + Number(update.value)).toString();
            record.time_last_seen = update.timestamp;
            updated = true;
            break;

          case 'increment_correct':
            const currentCorrect = parseInt(record.correct_uses || '0');
            record.correct_uses = (currentCorrect + Number(update.value)).toString();
            updated = true;
            break;

          case 'increment_user_total':
            const currentUserTotal = parseInt(record.user_total_uses || '0');
            record.user_total_uses = (currentUserTotal + Number(update.value)).toString();
            // Also update overall total for backward compatibility
            const overallTotal = parseInt(record.total_uses || '0');
            record.total_uses = (overallTotal + Number(update.value)).toString();
            record.time_last_seen = update.timestamp;
            updated = true;
            break;

          case 'increment_user_correct':
            const currentUserCorrect = parseInt(record.user_correct_uses || '0');
            record.user_correct_uses = (currentUserCorrect + Number(update.value)).toString();
            // Also update overall correct for backward compatibility
            const overallCorrect = parseInt(record.correct_uses || '0');
            record.correct_uses = (overallCorrect + Number(update.value)).toString();
            updated = true;
            break;

          case 'increment_system_total':
            const currentSystemTotal = parseInt(record.system_total_uses || '0');
            record.system_total_uses = (currentSystemTotal + Number(update.value)).toString();
            record.time_last_seen = update.timestamp;
            updated = true;
            break;

          case 'increment_system_correct':
            const currentSystemCorrect = parseInt(record.system_correct_uses || '0');
            record.system_correct_uses = (currentSystemCorrect + Number(update.value)).toString();
            updated = true;
            break;

          case 'update_timing':
            record.time_last_seen = update.timestamp;
            updated = true;
            break;

          case 'set_value':
            if (update.field && update.field in record) {
              (record as any)[update.field] = update.value.toString();
              updated = true;
            } else {
              result.errors.push(`Invalid field for set_value: ${update.field}`);
            }
            break;

          default:
            result.errors.push(`Unknown action: ${update.action}`);
        }

        if (updated) {
          result.updatesApplied++;
          result.wordsUpdated.push(update.word);
        }

      } catch (error) {
        result.errors.push(`Error updating ${update.word}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Write the updated data back to the CSV file
    if (result.updatesApplied > 0) {
      const csv = stringify(records, {
        header: true,
        columns: [
          'word',
          'time_last_seen',
          'correct_uses',
          'total_uses',
          'user_correct_uses',
          'user_total_uses',
          'system_correct_uses',
          'system_total_uses',
          'next_due',
          'EF',
          'interval',
          'repetitions',
        ],
      });

      fs.writeFileSync(VOCAB_PATH, csv);
      console.log(`Applied ${result.updatesApplied} updates to vocabulary CSV`);
    }

    result.success = result.updatesApplied > 0 || updates.length === 0;
    return result;

  } catch (error) {
    result.errors.push(`Failed to process CSV updates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Check if the context suggests the user is asking about word meaning rather than using it correctly
 */
function isAskingAboutWordMeaning(context: string, word: string): boolean {
  const lowerContext = context.toLowerCase();
  const lowerWord = word.toLowerCase();

  // Common patterns for asking about word meanings
  const questionPatterns = [
    `what is ${lowerWord}`,
    `what does ${lowerWord} mean`,
    `what's ${lowerWord}`,
    `meaning of ${lowerWord}`,
    `define ${lowerWord}`,
    `${lowerWord}?`,
    `what is the meaning of ${lowerWord}`,
    `i don't know what ${lowerWord} means`,
    `i don't understand ${lowerWord}`,
    `what's the definition of ${lowerWord}`,
    `can you explain ${lowerWord}`,
    `help me understand ${lowerWord}`
  ];

  // Check if any question pattern matches
  for (const pattern of questionPatterns) {
    if (lowerContext.includes(pattern)) {
      return true;
    }
  }

  // Check for question marks near the word (within 10 characters)
  const wordIndex = lowerContext.indexOf(lowerWord);
  if (wordIndex !== -1) {
    const contextAroundWord = lowerContext.substring(
      Math.max(0, wordIndex - 10),
      Math.min(lowerContext.length, wordIndex + lowerWord.length + 10)
    );
    if (contextAroundWord.includes('?')) {
      return true;
    }
  }

  return false;
}

/**
 * Convert GPT analysis to CSV updates
 */
export function convertAnalysisToUpdates(analysis: any, defaultSpeaker: 'user' | 'assistant' = 'user'): CSVUpdate[] {
  const updates: CSVUpdate[] = [];
  const timestamp = new Date().toISOString();

  if (analysis.vocabulary_words && Array.isArray(analysis.vocabulary_words)) {
    for (const wordInfo of analysis.vocabulary_words) {
      const word = wordInfo.word;
      let usedCorrectly = wordInfo.used_correctly === true;
      const speaker = wordInfo.speaker || defaultSpeaker;
      const context = wordInfo.context || '';

      // Secondary validation: Check if user is asking about word meaning
      // This catches cases that might slip through GPT analysis
      if (usedCorrectly && speaker === 'user' && isAskingAboutWordMeaning(context, word)) {
        console.log(`Post-processor caught question about word meaning: "${context}" - marking as incorrect usage`);
        usedCorrectly = false;
      }

      // Use speaker-specific actions
      const totalAction = speaker === 'user' ? 'increment_user_total' : 'increment_system_total';
      const correctAction = speaker === 'user' ? 'increment_user_correct' : 'increment_system_correct';

      // Always increment total uses for the specific speaker
      updates.push({
        word,
        action: totalAction,
        value: 1,
        timestamp,
        speaker
      });

      // Increment correct uses if used correctly
      if (usedCorrectly) {
        updates.push({
          word,
          action: correctAction,
          value: 1,
          timestamp,
          speaker
        });
      }

      // Update timing
      updates.push({
        word,
        action: 'update_timing',
        value: Date.now().toString(),
        timestamp,
        speaker
      });
    }
  }

  return updates;
}

/**
 * Process conversation text and apply updates automatically
 */
export async function processAndUpdateVocabulary(text: string, vocabularyWords: string[] = []): Promise<{
  success: boolean;
  analysis?: any;
  updateResult?: UpdateResult;
  error?: string;
}> {
  try {
    // Call the conversation processing API
    const response = await fetch('/api/conversation/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        vocabularyWords,
        includeAnalysis: true
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status}`
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Processing failed'
      };
    }

    // Apply the CSV updates
    const csvUpdates = result.csv_updates || convertAnalysisToUpdates(result.analysis);
    const updateResult = await applyCsvUpdates(csvUpdates);

    return {
      success: true,
      analysis: result.analysis,
      updateResult
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get vocabulary words from CSV for processing
 */
export function getVocabularyWordsForProcessing(): string[] {
  try {
    if (!fs.existsSync(VOCAB_PATH)) {
      return [];
    }

    const fileContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as VocabularyWord[];

    return records.map(record => record.word);
  } catch (error) {
    console.error('Error reading vocabulary words:', error);
    return [];
  }
}
