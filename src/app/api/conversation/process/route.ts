import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ConversationProcessingResult {
  success: boolean;
  processed: boolean;
  text: string;
  analysis?: {
    vocabulary_words: Array<{
      word: string;
      found_form: string;
      used_correctly: boolean;
      confidence: number;
      context: string;
    }>;
    summary: string;
    learning_effectiveness: number;
  };
  csv_updates?: Array<{
    word: string;
    action: 'increment_total' | 'increment_correct' | 'update_timing';
    value: string | number;
    timestamp: string;
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
    const { text, vocabularyWords = [], includeAnalysis = true } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: "Invalid request: text is required" },
        { status: 400 }
      );
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

          Return ONLY a valid JSON object with this exact structure:
          {
            "vocabulary_words": [
              {
                "word": "base_vocabulary_word",
                "found_form": "actual_word_in_text",
                "used_correctly": true,
                "confidence": 0.95,
                "context": "surrounding sentence or phrase"
              }
            ],
            "csv_updates": [
              {
                "word": "vocabulary_word",
                "action": "increment_total",
                "value": 1,
                "timestamp": "${new Date().toISOString()}"
              },
              {
                "word": "vocabulary_word", 
                "action": "increment_correct",
                "value": 1,
                "timestamp": "${new Date().toISOString()}"
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
          - Generate csv_updates for each word found
          - learning_effectiveness should be 0.0-1.0 based on overall usage quality`
        },
        {
          role: "user",
          content: `Analyze this conversation text for vocabulary usage:

          Text: "${text}"

          Vocabulary words to look for: ${limitedVocabWords.join(', ')}

          Provide structured analysis for CSV updates.`
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
      analysis: {
        vocabulary_words: analysis.vocabulary_words || [],
        summary: analysis.summary || "No analysis provided",
        learning_effectiveness: analysis.learning_effectiveness || 0.0
      },
      csv_updates: analysis.csv_updates || [],
      timestamp: Date.now()
    };

    // Log the processing for debugging
    console.log(`Processed conversation text: ${text.length} characters`);
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
