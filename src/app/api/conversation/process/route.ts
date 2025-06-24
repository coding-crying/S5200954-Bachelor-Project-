import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { text, vocabularyWords = [], includeAnalysis = true, speaker = 'user' } = body;
    
    // Extract participant and condition from URL parameters
    const searchParams = req.nextUrl.searchParams;
    const participantId = searchParams.get('participant');
    const condition = searchParams.get('condition');

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

          Evaluation Criteria for "used_correctly":
          
          TRUE (correct usage):
          - Word meaning matches context precisely
          - Demonstrates clear understanding of word's definition
          - Used in appropriate grammatical context
          - Shows familiarity with word's nuances
          
          FALSE (incorrect usage):
          - Word meaning doesn't match context
          - Used generically without understanding (e.g., "He was astute" with no judgment context)
          - Wrong part of speech or grammatical usage
          - Shows confusion about word's actual meaning
          - Used inappropriately trying to sound sophisticated
          
          Assessment Guidelines:
          - Analyze the surrounding context for meaning clarity
          - Consider if a native speaker would use the word this way
          - Look for signs of user confusion or uncertainty
          - Evaluate depth of understanding vs. superficial usage
          - Set confidence based on clarity of correct usage demonstration
          
          Technical Rules:
          - Only include words from the provided vocabulary list
          - Include different word forms (plurals, conjugations, past tense, etc.)
          - Use "increment_user_total" and "increment_user_correct" for USER speech
          - Use "increment_system_total" and "increment_system_correct" for ASSISTANT speech
          - learning_effectiveness should reflect actual demonstration of word knowledge (0.0-1.0)`
        },
        {
          role: "user",
          content: `Analyze this conversation text for vocabulary usage:

          Text: "${text}"
          Speaker: ${speaker} (${speaker === 'user' ? 'learner' : 'system/assistant'})

          Vocabulary words to look for: ${limitedVocabWords.join(', ')}

          Provide structured analysis for CSV updates. Remember to use the correct action types based on the speaker:
          - For USER/learner speech: use "increment_user_total" and "increment_user_correct"
          - For ASSISTANT/system speech: use "increment_system_total" and "increment_system_correct"

`
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
