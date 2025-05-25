import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI();

// Path to the language words CSV file
const LANGUAGE_WORDS_PATH = path.join(process.cwd(), 'languageWords.csv');

// Interface for language word entries
interface LanguageWord {
  word: string;
  base_form: string;
  part_of_speech: string;
  frequency: string;
  first_seen: string;
  last_seen: string;
}

/**
 * Process conversation text to extract basic word forms
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: "Invalid request: text is required" },
        { status: 400 }
      );
    }

    // Ensure the CSV file exists
    if (!fs.existsSync(LANGUAGE_WORDS_PATH)) {
      // Create the file with headers if it doesn't exist
      fs.writeFileSync(
        LANGUAGE_WORDS_PATH, 
        'word,base_form,part_of_speech,frequency,first_seen,last_seen\n'
      );
    }

    // Process the text with GPT-4.1-mini to extract basic word forms
    const processedWords = await processTextWithAI(text);
    
    if (!processedWords || processedWords.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Failed to extract words from the text"
      }, { status: 500 });
    }

    // Update the CSV file with the extracted words
    const updatedWords = await updateLanguageWordsCSV(processedWords);

    return NextResponse.json({
      success: true,
      processed: true,
      text,
      wordsExtracted: processedWords,
      wordsUpdated: updatedWords,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error in POST /language/words:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Get all language words from the CSV file
 */
export async function GET(request: NextRequest) {
  try {
    // Check if the file exists
    if (!fs.existsSync(LANGUAGE_WORDS_PATH)) {
      return NextResponse.json({
        success: true,
        words: [],
        count: 0
      });
    }

    // Read the CSV file
    const fileContent = fs.readFileSync(LANGUAGE_WORDS_PATH, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as LanguageWord[];

    return NextResponse.json({
      success: true,
      words: records,
      count: records.length
    });
  } catch (error: any) {
    console.error('Error in GET /language/words:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Process text with GPT-4.1-mini to extract basic word forms
 */
async function processTextWithAI(text: string): Promise<Array<{word: string, base_form: string, part_of_speech: string}>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a language analysis assistant that extracts words from text and returns them in their basic, unconjugated form.
          For each word, identify:
          1. The original word as it appears in the text
          2. The base form (lemma) of the word
          3. The part of speech (noun, verb, adjective, adverb, etc.)
          
          Only include content words (nouns, verbs, adjectives, adverbs) and ignore function words (articles, prepositions, etc.) unless they are important vocabulary words.
          Format your response as a JSON array of objects with the properties: word, base_form, and part_of_speech.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      console.error("Empty response from language model");
      return [];
    }

    try {
      const parsedContent = JSON.parse(content);
      if (Array.isArray(parsedContent.words)) {
        return parsedContent.words;
      } else {
        console.error("Unexpected response format:", parsedContent);
        return [];
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw response:", content);
      return [];
    }
  } catch (error) {
    console.error("Error calling language model:", error);
    return [];
  }
}

/**
 * Update the language words CSV file with new words
 */
async function updateLanguageWordsCSV(words: Array<{word: string, base_form: string, part_of_speech: string}>): Promise<string[]> {
  // Read existing records
  let existingRecords: LanguageWord[] = [];
  
  if (fs.existsSync(LANGUAGE_WORDS_PATH)) {
    const fileContent = fs.readFileSync(LANGUAGE_WORDS_PATH, 'utf-8');
    existingRecords = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as LanguageWord[];
  }

  // Create a map of existing words for easy lookup
  const wordMap = new Map<string, LanguageWord>();
  for (const record of existingRecords) {
    wordMap.set(record.base_form.toLowerCase(), record);
  }

  const currentTime = Date.now().toString();
  const updatedWords: string[] = [];

  // Update the map with the new words
  for (const word of words) {
    const baseForm = word.base_form.toLowerCase();
    
    if (wordMap.has(baseForm)) {
      // Update existing word
      const existingWord = wordMap.get(baseForm)!;
      existingWord.last_seen = currentTime;
      
      // Increment frequency
      const frequency = parseInt(existingWord.frequency || '0') + 1;
      existingWord.frequency = frequency.toString();
      
      wordMap.set(baseForm, existingWord);
      updatedWords.push(`${baseForm} (frequency: ${frequency})`);
    } else {
      // Add new word
      wordMap.set(baseForm, {
        word: word.word,
        base_form: baseForm,
        part_of_speech: word.part_of_speech,
        frequency: '1',
        first_seen: currentTime,
        last_seen: currentTime
      });
      updatedWords.push(`${baseForm} (new)`);
    }
  }

  // Convert the map back to an array
  const updatedRecords = Array.from(wordMap.values());

  // Write the updated records to the CSV file
  const csv = stringify(updatedRecords, {
    header: true,
    columns: [
      'word',
      'base_form',
      'part_of_speech',
      'frequency',
      'first_seen',
      'last_seen',
    ],
  });

  fs.writeFileSync(LANGUAGE_WORDS_PATH, csv);
  return updatedWords;
}
