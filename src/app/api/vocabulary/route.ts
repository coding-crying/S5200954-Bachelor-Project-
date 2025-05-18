import { NextRequest, NextResponse } from 'next/server';
import { getRandomWord, getRandomWords, searchWords, resetPresentedWordsTracking } from '@/app/agentConfigs/vocabularyInstructor/vocabularyTool.server';
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

      case 'reset-tracking':
        // Reset the tracking of recently presented words
        const result = resetPresentedWordsTracking();
        return NextResponse.json(result);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "random", "multiple", "search", "srs", or "reset-tracking".'
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
 * Process user text to identify vocabulary words
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

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

    // Create a set of vocabulary words for faster lookup
    const vocabWords = new Map<string, number>();
    for (let i = 0; i < records.length; i++) {
      vocabWords.set(records[i].word.toLowerCase(), i);
    }

    // Normalize text and find vocabulary words
    const normalizedText = text.toLowerCase();
    const words = normalizedText.match(/\b[a-z]+\b/g) || [];
    const wordsFound: string[] = [];
    const wordsUpdated: string[] = [];

    // Find words that are in the vocabulary
    for (const word of words) {
      if (vocabWords.has(word)) {
        wordsFound.push(word);
        const index = vocabWords.get(word)!;

        // Update the word's usage statistics
        const currentTime = Date.now().toString();
        const totalUses = parseInt(records[index].total_uses) + 1;

        records[index].time_last_seen = currentTime;
        records[index].total_uses = totalUses.toString();

        wordsUpdated.push(`${word} (total_uses: ${totalUses})`);

        // Log to server console for debugging
        console.log(`Updated vocabulary word: ${word}, total_uses: ${totalUses}, time: ${currentTime}`);
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
