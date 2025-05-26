import { NextRequest, NextResponse } from 'next/server';
import { getRandomWord, getRandomWords, searchWords, resetPresentedWordsTracking, getIntroducedWords, getHighPriorityWords } from '@/app/agentConfigs/vocabularyInstructor/vocabularyTool.server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { VocabularyWord } from '@/app/types';

// Path to the vocabulary CSV file
const VOCAB_PATH = path.join(process.cwd(), 'vocabulary.csv');

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'random':
        const word = getRandomWord();

        // Update the word's next_due date if it was retrieved successfully
        if (word) {
          // Read the CSV file
          const fileContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
          const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
          }) as VocabularyWord[];

          // Find the word and update its next_due date
          for (let i = 0; i < records.length; i++) {
            if (records[i].word.toLowerCase() === word.word.toLowerCase()) {
              // Calculate next due date (1 day from now)
              const currentTime = Date.now();
              const oneDayInMs = 24 * 60 * 60 * 1000;
              const nextDue = currentTime + oneDayInMs;

              // Update the record
              records[i].time_last_seen = currentTime.toString();
              records[i].next_due = nextDue.toString();

              // Write the updated records to the CSV file
              const csv = stringify(records, {
                header: true,
                columns: [
                  'word',
                  'time_last_seen',
                  'correct_uses',
                  'total_uses',
                  'next_due',
                  'EF',
                  'interval',
                  'repetitions',
                ],
              });

              fs.writeFileSync(VOCAB_PATH, csv);
              console.log(`Updated next_due for word: ${word.word}, next_due: ${new Date(nextDue).toLocaleString()}`);
              break;
            }
          }
        }

        return NextResponse.json({ success: true, data: word });

      case 'multiple':
        const count = parseInt(searchParams.get('count') || '3', 10);
        const words = getRandomWords(count);

        // Update the next_due dates for all retrieved words
        if (words.length > 0) {
          // Read the CSV file
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

          let updated = false;

          // Update each word's next_due date
          for (const word of words) {
            const index = recordMap.get(word.word.toLowerCase());
            if (index !== undefined) {
              // Calculate next due date (1 day from now)
              const currentTime = Date.now();
              const oneDayInMs = 24 * 60 * 60 * 1000;
              const nextDue = currentTime + oneDayInMs;

              // Update the record
              records[index].time_last_seen = currentTime.toString();
              records[index].next_due = nextDue.toString();
              updated = true;

              console.log(`Updated next_due for word: ${word.word}, next_due: ${new Date(nextDue).toLocaleString()}`);
            }
          }

          // Write the updated records to the CSV file if any were updated
          if (updated) {
            const csv = stringify(records, {
              header: true,
              columns: [
                'word',
                'time_last_seen',
                'correct_uses',
                'total_uses',
                'next_due',
                'EF',
                'interval',
                'repetitions',
              ],
            });

            fs.writeFileSync(VOCAB_PATH, csv);
          }
        }

        return NextResponse.json({ success: true, data: words });

      case 'search':
        const searchTerm = searchParams.get('term') || '';
        const matchingWords = searchWords(searchTerm);
        return NextResponse.json({
          success: true,
          data: matchingWords,
          count: matchingWords.length
        });

      case 'srs':
        // Get all vocabulary words from the CSV file
        if (!fs.existsSync(VOCAB_PATH)) {
          return NextResponse.json(
            { success: false, error: "Vocabulary file not found" },
            { status: 404 }
          );
        }

        // Read the CSV file
        const fileContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
        });

        return NextResponse.json({ success: true, words: records });

      case 'introduced':
        // Get only introduced words (words that have been seen before)
        const introducedCount = parseInt(searchParams.get('count') || '3', 10);
        const introducedWords = getIntroducedWords(introducedCount);

        if (introducedWords.length === 0) {
          return NextResponse.json({
            success: false,
            data: [],
            message: "No introduced words found. The user needs to learn some words first."
          });
        }

        return NextResponse.json({
          success: true,
          data: introducedWords,
          count: introducedWords.length
        });

      case 'high-priority':
        // Get high priority words for review
        const priorityCount = parseInt(searchParams.get('count') || '5', 10);
        const priorityWords = getHighPriorityWords(priorityCount);

        if (priorityWords.length === 0) {
          return NextResponse.json({
            success: false,
            data: [],
            message: "No high priority words found. The user needs to learn some words first."
          });
        }

        return NextResponse.json({
          success: true,
          data: priorityWords,
          count: priorityWords.length
        });

      case 'reset-tracking':
        // Reset the tracking of recently presented words
        const result = resetPresentedWordsTracking();
        return NextResponse.json(result);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "random", "multiple", "search", "srs", "introduced", "high-priority", or "reset-tracking".'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing vocabulary request:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process vocabulary request'
    }, { status: 500 });
  }
}

/**
 * Update vocabulary words in the CSV file
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { words } = body;

    if (!Array.isArray(words)) {
      return NextResponse.json(
        { success: false, error: "Invalid request: words must be an array" },
        { status: 400 }
      );
    }

    // Check if the file exists
    if (!fs.existsSync(VOCAB_PATH)) {
      return NextResponse.json(
        { success: false, error: "Vocabulary file not found" },
        { status: 404 }
      );
    }

    // Read the current CSV file to get the header and existing words
    const fileContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
    const existingRecords = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as VocabularyWord[];

    // Create a map of existing words for easy lookup
    const wordMap = new Map<string, VocabularyWord>();
    for (const record of existingRecords) {
      wordMap.set(record.word.toLowerCase(), record);
    }

    // Update the map with the new words
    for (const word of words) {
      wordMap.set(word.word.toLowerCase(), word);
    }

    // Convert the map back to an array
    const updatedRecords = Array.from(wordMap.values());

    // Write the updated records to the CSV file
    const csv = stringify(updatedRecords, {
      header: true,
      columns: [
        'word',
        'time_last_seen',
        'correct_uses',
        'total_uses',
        'next_due',
        'EF',
        'interval',
        'repetitions',
      ],
    });

    fs.writeFileSync(VOCAB_PATH, csv);

    return NextResponse.json({
      success: true,
      message: `Updated ${words.length} vocabulary words`,
    });
  } catch (error: any) {
    console.error('Error in POST /vocabulary:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Process user text to identify vocabulary words using enhanced lemmatization
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { text, useGPTAnalysis = false } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: "Invalid request: text is required" },
        { status: 400 }
      );
    }

    // Check if the file exists
    if (!fs.existsSync(VOCAB_PATH)) {
      return NextResponse.json(
        { success: false, error: "Vocabulary file not found" },
        { status: 404 }
      );
    }

    // Read the CSV file
    const fileContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as VocabularyWord[];

    let wordsFound: string[] = [];
    let wordsUpdated: string[] = [];

    if (useGPTAnalysis) {
      // Use GPT-4.1-mini for enhanced analysis
      const gptResult = await processTextWithGPT(text, records);
      if (gptResult.success) {
        wordsFound = gptResult.wordsFound || [];
        wordsUpdated = gptResult.wordsUpdated || [];

        // Update records with GPT analysis results
        if (gptResult.updates) {
          for (const update of gptResult.updates) {
            const recordIndex = records.findIndex(r => r.word.toLowerCase() === update.word.toLowerCase());
            if (recordIndex !== -1) {
              records[recordIndex] = { ...records[recordIndex], ...update.data };
            }
          }
        }
      }
    } else {
      // Use local lemmatization processing
      const localResult = await processTextLocally(text, records);
      if (localResult.success) {
        wordsFound = localResult.wordsFound || [];
        wordsUpdated = localResult.wordsUpdated || [];

        // Update records with local analysis results
        if (localResult.updates) {
          for (const update of localResult.updates) {
            const recordIndex = records.findIndex(r => r.word.toLowerCase() === update.word.toLowerCase());
            if (recordIndex !== -1) {
              records[recordIndex] = { ...records[recordIndex], ...update.data };
            }
          }
        }
      }
    }

    // Only write to the file if we found and updated words
    if (wordsUpdated.length > 0) {
      // Write the updated records to the CSV file
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
      console.log(`Wrote updated vocabulary to ${VOCAB_PATH}`);
    }

    return NextResponse.json({
      success: true,
      processed: true,
      text,
      wordsFound,
      wordsUpdated,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error in PUT /vocabulary:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Process text with GPT-4.1-mini for enhanced vocabulary analysis
 */
async function processTextWithGPT(text: string, records: VocabularyWord[]) {
  try {
    const openai = await import('openai').then(m => new m.default({
      apiKey: process.env.OPENAI_API_KEY,
    }));

    // Create vocabulary word list for the prompt
    const vocabWords = records.map(r => r.word).slice(0, 100); // Limit to avoid token limits

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a vocabulary analysis assistant. Analyze text to identify vocabulary words and their usage.

          Return ONLY a valid JSON object with this exact structure:
          {
            "words_found": [
              {
                "word": "vocabulary_word_from_list",
                "found_form": "actual_word_in_text",
                "used_correctly": true,
                "confidence": 0.9
              }
            ]
          }

          Rules:
          - Only include words that appear in the vocabulary list
          - Include different forms (plurals, conjugations, etc.)
          - Set used_correctly to true if used properly in context
          - Set confidence between 0.0 and 1.0`
        },
        {
          role: "user",
          content: `Text: "${text}"

          Vocabulary words: ${vocabWords.join(', ')}`
        }
      ],
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { success: false, error: "Empty response from GPT" };
    }

    const analysis = JSON.parse(content);
    const wordsFound: string[] = [];
    const wordsUpdated: string[] = [];
    const updates: Array<{word: string, data: Partial<VocabularyWord>}> = [];

    const currentTime = Date.now().toString();

    for (const wordInfo of analysis.words_found || []) {
      const vocabWord = wordInfo.word?.toLowerCase();
      const foundForm = wordInfo.found_form?.toLowerCase();
      const usedCorrectly = wordInfo.used_correctly === true;

      if (vocabWord && foundForm) {
        wordsFound.push(`${foundForm} → ${vocabWord}`);

        // Find the record to update
        const record = records.find(r => r.word.toLowerCase() === vocabWord);
        if (record) {
          const totalUses = parseInt(record.total_uses || '0') + 1;
          const correctUses = parseInt(record.correct_uses || '0') + (usedCorrectly ? 1 : 0);

          updates.push({
            word: vocabWord,
            data: {
              time_last_seen: currentTime,
              total_uses: totalUses.toString(),
              correct_uses: correctUses.toString()
            }
          });

          wordsUpdated.push(`${vocabWord} (${foundForm}): total=${totalUses}, correct=${correctUses}`);
        }
      }
    }

    return {
      success: true,
      wordsFound,
      wordsUpdated,
      updates
    };

  } catch (error) {
    console.error('Error in GPT processing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      wordsFound: [],
      wordsUpdated: [],
      updates: []
    };
  }
}

/**
 * Process text locally using lemmatization
 */
async function processTextLocally(text: string, records: VocabularyWord[]) {
  try {
    // Import the word lemmatizer
    const { wordLemmatizer } = await import('@/app/lib/wordLemmatizer');

    // Create vocabulary word set
    const vocabWords = new Set(records.map(r => r.word.toLowerCase()));

    // Find vocabulary matches using lemmatization
    const matches = wordLemmatizer.findVocabularyMatches(text, vocabWords);

    const wordsFound: string[] = [];
    const wordsUpdated: string[] = [];
    const updates: Array<{word: string, data: Partial<VocabularyWord>}> = [];

    const currentTime = Date.now().toString();

    // Process each match
    for (const match of matches) {
      const vocabWord = match.vocabularyWord.toLowerCase();
      const foundForm = match.foundWord.toLowerCase();

      wordsFound.push(match.isExactMatch ? vocabWord : `${foundForm} → ${vocabWord}`);

      // Find the record to update
      const record = records.find(r => r.word.toLowerCase() === vocabWord);
      if (record) {
        const totalUses = parseInt(record.total_uses || '0') + 1;

        updates.push({
          word: vocabWord,
          data: {
            time_last_seen: currentTime,
            total_uses: totalUses.toString()
          }
        });

        wordsUpdated.push(`${vocabWord}${!match.isExactMatch ? ` (${foundForm})` : ''}: total=${totalUses}`);
      }
    }

    return {
      success: true,
      wordsFound,
      wordsUpdated,
      updates
    };

  } catch (error) {
    console.error('Error in local processing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      wordsFound: [],
      wordsUpdated: [],
      updates: []
    };
  }
}
