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

const MAIN_VOCAB_PATH = path.join(process.cwd(), 'vocabulary.csv');

/**
 * Get the vocabulary CSV path for a specific participant
 */
function getParticipantVocabPath(participantId: string): string {
  return path.join(process.cwd(), `participant_${participantId}`, 'vocabulary.csv');
}

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
 * Copy main vocabulary to participant-specific file
 */
export function initializeParticipantVocabulary(participantId: string): boolean {
  try {
    const participantVocabPath = getParticipantVocabPath(participantId);
    const participantDir = path.dirname(participantVocabPath);
    
    // Create participant directory if it doesn't exist
    if (!fs.existsSync(participantDir)) {
      fs.mkdirSync(participantDir, { recursive: true });
    }
    
    // Copy main vocabulary to participant file
    if (fs.existsSync(MAIN_VOCAB_PATH)) {
      fs.copyFileSync(MAIN_VOCAB_PATH, participantVocabPath);
      console.log(`Initialized vocabulary for participant ${participantId}`);
      return true;
    } else {
      console.error('Main vocabulary.csv not found');
      return false;
    }
  } catch (error) {
    console.error(`Error initializing participant vocabulary: ${error}`);
    return false;
  }
}

/**
 * Apply structured CSV updates from conversation processing to participant-specific vocabulary
 */
export async function applyCsvUpdates(updates: CSVUpdate[], participantId: string): Promise<UpdateResult> {
  const result: UpdateResult = {
    success: false,
    updatesApplied: 0,
    wordsUpdated: [],
    errors: []
  };

  try {
    const participantVocabPath = getParticipantVocabPath(participantId);
    
    // Check if the participant's vocabulary file exists
    if (!fs.existsSync(participantVocabPath)) {
      result.errors.push(`Participant vocabulary CSV file not found: ${participantVocabPath}`);
      return result;
    }

    // Read the current CSV data
    const fileContent = fs.readFileSync(participantVocabPath, 'utf-8');
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

      fs.writeFileSync(participantVocabPath, csv);
      console.log(`Applied ${result.updatesApplied} updates to participant ${participantId} vocabulary CSV (preserved ${records.length} total words)`);
    }

    result.success = result.updatesApplied > 0 || updates.length === 0;
    return result;

  } catch (error) {
    result.errors.push(`Failed to process CSV updates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
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
      const usedCorrectly = wordInfo.used_correctly === true;
      const speaker = wordInfo.speaker || defaultSpeaker;

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
export async function processAndUpdateVocabulary(text: string, participantId: string, vocabularyWords: string[] = []): Promise<{
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
    const updateResult = await applyCsvUpdates(csvUpdates, participantId);

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
 * Get vocabulary words from participant CSV for processing
 */
export function getVocabularyWordsForProcessing(participantId: string): string[] {
  try {
    const participantVocabPath = getParticipantVocabPath(participantId);
    
    if (!fs.existsSync(participantVocabPath)) {
      console.warn(`Participant vocabulary not found: ${participantVocabPath}`);
      return [];
    }

    const fileContent = fs.readFileSync(participantVocabPath, 'utf-8');
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
