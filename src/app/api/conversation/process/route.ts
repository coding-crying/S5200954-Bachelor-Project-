import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { VocabularyWord } from '@/app/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Path to the vocabulary CSV file
const VOCAB_PATH = path.join(process.cwd(), 'vocabulary.csv');

interface ConversationProcessingResult {
  success: boolean;
  processed: boolean;
  text: string;
  speaker?: 'user' | 'assistant';
  analysis?: {
    vocabulary_words: Array<{
      word: string;
      found_form: string;
      used_correctly: boolean;
      confidence: number;
      context: string;
      speaker: 'user' | 'assistant';
    }>;
    summary: string;
    learning_effectiveness: number;
  };
  csv_updates?: Array<{
    word: string;
    action: 'increment_total' | 'increment_correct' | 'update_timing' | 'increment_user_total' | 'increment_user_correct' | 'increment_system_total' | 'increment_system_correct';
    value: string | number;
    timestamp: string;
    speaker: 'user' | 'assistant';
  }>;
  error?: string;
  timestamp: number;
}

/**
 * Process realtime conversation transcript with GPT-4.1-mini
 * Returns structured data that can be easily parsed for CSV updates
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, vocabularyWords = [], includeAnalysis = true, speaker = 'user', batchMode = false, messageCount = 1 } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: "Invalid request: text is required" },
        { status: 400 }
      );
    }

    if (speaker && !['user', 'assistant'].includes(speaker)) {
      return NextResponse.json(
        { success: false, error: "Invalid speaker: must be 'user' or 'assistant'" },
        { status: 400 }
      );
    }

    // LANGUAGE LEARNING SYSTEM: Only process USER messages for vocabulary analysis
    // Assistant messages are system-generated teaching content, not user learning demonstrations
    if (speaker === 'assistant') {
      return NextResponse.json({
        success: true,
        processed: false,
        text,
        speaker,
        analysis: {
          vocabulary_words: [],
          summary: "Assistant messages are not processed for vocabulary analysis",
          learning_effectiveness: 0.0
        },
        csv_updates: [],
        timestamp: Date.now()
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Limit vocabulary words to avoid token limits
    const limitedVocabWords = vocabularyWords.slice(0, 100);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a vocabulary learning analysis assistant. Analyze conversation text to identify vocabulary words and provide structured data for CSV updates.

          ${batchMode ? `BATCH MODE: You are analyzing ${messageCount} messages combined into a single text. This provides better context for vocabulary analysis and reduces API calls.` : ''}

          IMPORTANT: Differentiate between USER speech and SYSTEM/ASSISTANT speech. Only USER vocabulary usage should count toward learning progress.

          Return ONLY a valid JSON object with this exact structure:
          {
            "vocabulary_words": [
              {
                "word": "base_vocabulary_word",
                "found_form": "actual_word_in_text",
                "used_correctly": true,
                "confidence": 0.95,
                "context": "surrounding sentence or phrase",
                "speaker": "user"
              }
            ],
            "csv_updates": [
              {
                "word": "vocabulary_word",
                "action": "increment_user_total",
                "value": 1,
                "timestamp": "${new Date().toISOString()}",
                "speaker": "user"
              },
              {
                "word": "vocabulary_word",
                "action": "increment_user_correct",
                "value": 1,
                "timestamp": "${new Date().toISOString()}",
                "speaker": "user"
              }
            ],
            "summary": "Brief analysis of vocabulary usage",
            "learning_effectiveness": 0.8
          }

          Rules:
          - Only include words from the provided vocabulary list
          - Include different word forms (plurals, conjugations, past tense, etc.)
          - Set used_correctly based on proper context usage
          - Set confidence between 0.0 and 1.0
          - Use "increment_user_total" and "increment_user_correct" for USER speech
          - Use "increment_system_total" and "increment_system_correct" for ASSISTANT speech
          - learning_effectiveness should be 0.0-1.0 based on USER vocabulary usage quality only
          - System/assistant vocabulary usage should be tracked separately but not count toward learning progress`
        },
        {
          role: "user",
          content: `Analyze this conversation text for vocabulary usage:

          ${batchMode ? `BATCH ANALYSIS: Processing ${messageCount} combined messages` : 'SINGLE MESSAGE ANALYSIS'}
          Text: "${text}"
          Speaker: ${speaker} (${speaker === 'user' ? 'learner' : 'system/assistant'})
          ${batchMode ? `Text Length: ${text.length} characters from ${messageCount} messages` : ''}

          Vocabulary words to look for: ${limitedVocabWords.join(', ')}

          Provide structured analysis for CSV updates. Remember to use the correct action types based on the speaker:
          - For USER/learner speech: use "increment_user_total" and "increment_user_correct"
          - For ASSISTANT/system speech: use "increment_system_total" and "increment_system_correct"

          ${batchMode ? 'BATCH BENEFITS: Better context understanding, more accurate usage assessment, reduced API calls.' : ''}`
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json({
        success: false,
        error: "Empty response from GPT-4.1-mini"
      }, { status: 500 });
    }

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError);
      return NextResponse.json({
        success: false,
        error: "Failed to parse GPT response as JSON"
      }, { status: 500 });
    }

    // Validate and structure the response
    const result: ConversationProcessingResult = {
      success: true,
      processed: true,
      text,
      speaker,
      analysis: {
        vocabulary_words: (analysis.vocabulary_words || []).map((word: any) => ({
          ...word,
          speaker: word.speaker || speaker // Ensure speaker is set
        })),
        summary: analysis.summary || "No analysis provided",
        learning_effectiveness: analysis.learning_effectiveness || 0.0
      },
      csv_updates: (analysis.csv_updates || []).map((update: any) => ({
        ...update,
        speaker: update.speaker || speaker // Ensure speaker is set
      })),
      timestamp: Date.now()
    };

    // Apply CSV updates directly
    if (result.csv_updates && result.csv_updates.length > 0) {
      try {
        await applyCsvUpdates(result.csv_updates);
        console.log(`Applied ${result.csv_updates.length} CSV updates`);
      } catch (error) {
        console.error('Error applying CSV updates:', error);
        // Don't fail the request if CSV updates fail
      }
    }

    // Log the processing for debugging
    console.log(`${batchMode ? '[BATCH]' : '[SINGLE]'} Processed conversation text: ${text.length} characters${batchMode ? ` from ${messageCount} messages` : ''}`);
    console.log(`Found ${result.analysis.vocabulary_words.length} vocabulary words`);
    console.log(`Generated ${result.csv_updates?.length || 0} CSV updates`);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error processing conversation:', error);

    return NextResponse.json({
      success: false,
      processed: false,
      text: "",
      error: error.message || "Internal server error",
      timestamp: Date.now()
    }, { status: 500 });
  }
}

/**
 * Get processing status and statistics
 */
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      status: "active",
      model: "gpt-4o-mini",
      features: [
        "vocabulary_detection",
        "word_form_recognition",
        "usage_correctness_analysis",
        "csv_update_generation",
        "learning_effectiveness_scoring"
      ],
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
}

/**
 * Apply CSV updates directly to the vocabulary file
 */
async function applyCsvUpdates(csvUpdates: Array<{
  word: string;
  action: string;
  value: string | number;
  timestamp: string;
  speaker: string;
}>) {
  if (!fs.existsSync(VOCAB_PATH)) {
    console.error('Vocabulary CSV file not found');
    return;
  }

  // Read the current CSV file
  const fileContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as VocabularyWord[];

  let updated = false;

  // Apply each update
  for (const update of csvUpdates) {
    const recordIndex = records.findIndex(r => r.word.toLowerCase() === update.word.toLowerCase());

    if (recordIndex !== -1) {
      const record = records[recordIndex];

      switch (update.action) {
        case 'increment_user_total':
          record.user_total_uses = (parseInt(record.user_total_uses || '0') + 1).toString();
          record.time_last_seen = update.timestamp;
          updated = true;
          break;
        case 'increment_user_correct':
          record.user_correct_uses = (parseInt(record.user_correct_uses || '0') + 1).toString();
          updated = true;
          break;
        case 'increment_system_total':
          record.system_total_uses = (parseInt(record.system_total_uses || '0') + 1).toString();
          record.time_last_seen = update.timestamp;
          updated = true;
          break;
        case 'increment_system_correct':
          record.system_correct_uses = (parseInt(record.system_correct_uses || '0') + 1).toString();
          updated = true;
          break;
        case 'update_timing':
          record.time_last_seen = update.timestamp;
          updated = true;
          break;
        default:
          console.warn(`Unknown CSV update action: ${update.action}`);
      }
    }
  }

  // Write the updated records back to the CSV file if any were updated
  if (updated) {
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
    console.log(`Updated vocabulary CSV with ${csvUpdates.length} changes`);
  }
}
