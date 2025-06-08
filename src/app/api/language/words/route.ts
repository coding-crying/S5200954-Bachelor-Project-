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
 * DISABLED: Language processor endpoint - using vocabulary processor only
 */
export async function POST(req: Request) {
  return NextResponse.json({
    success: false,
    error: 'Language processor is disabled - using vocabulary processor only'
  }, { status: 410 }); // Gone



/**
 * Get all language words from the CSV file
 * DISABLED: Language processor endpoint - using vocabulary processor only
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Language processor is disabled - using vocabulary processor only'
  }, { status: 410 }); // Gone
}

// DISABLED: Language processor functions - using vocabulary processor only


