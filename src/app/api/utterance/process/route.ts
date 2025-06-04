import { NextRequest, NextResponse } from 'next/server';
import { executeWriteTransaction } from '../../../../../lib/neo4j.js';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory cache to avoid reprocessing similar content
const processedTextCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(text: string, userId: string, targetLanguage: string): string {
  // Create a simple hash of the text content
  const normalizedText = text.toLowerCase().trim().replace(/[^\w\s]/g, '');
  return `${userId}:${targetLanguage}:${normalizedText}`;
}

function getCachedResult(cacheKey: string): any | null {
  const cached = processedTextCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.result;
  }
  if (cached) {
    processedTextCache.delete(cacheKey); // Remove expired cache
  }
  return null;
}

function setCachedResult(cacheKey: string, result: any): void {
  processedTextCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });

  // Clean up old cache entries periodically
  if (processedTextCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of processedTextCache.entries()) {
      if ((now - value.timestamp) > CACHE_TTL) {
        processedTextCache.delete(key);
      }
    }
  }
}
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UtteranceProcessRequest {
  userId: string;
  conversationId?: string;
  utteranceText: string;
  speaker: 'user' | 'AI';
  targetLanguage: string;
  userNativeLanguage: string;
}

interface LemmatizedToken {
  original_form: string;
  lemma: string;
  pos: string;
  language: string;
}

interface SuggestedTranslation {
  source_lemma: string;
  target_lemma: string;
  confidence?: number;
}

interface SemanticRelationship {
  source_lemma: string;
  target_lemma: string;
  relationship_type: string;
}

interface GPTAnalysisResponse {
  lemmatized_tokens: LemmatizedToken[];
  potential_new_lexemes: string[];
  suggested_translations: SuggestedTranslation[];
  semantic_relationships?: SemanticRelationship[];
}

interface UtteranceProcessResponse {
  success: boolean;
  utteranceId?: string;
  conversationId?: string;
  analysis?: {
    lexemes_processed: number;
    new_srs_items: number;
    translations_created: number;
    relationships_created: number;
  };
  error?: string;
  timestamp: string;
}

/**
 * Process utterance with GPT-4.1-mini and store in Neo4j
 */
export async function POST(req: NextRequest): Promise<NextResponse<UtteranceProcessResponse>> {
  try {
    const body: UtteranceProcessRequest = await req.json();
    const {
      userId,
      conversationId,
      utteranceText,
      speaker,
      targetLanguage,
      userNativeLanguage
    } = body;

    // Validate required fields
    if (!userId || !utteranceText || !speaker || !targetLanguage || !userNativeLanguage) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: userId, utteranceText, speaker, targetLanguage, userNativeLanguage",
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log(`🔍 Processing utterance for user ${userId}: "${utteranceText.substring(0, 50)}..."`);

    // Check cache first to avoid reprocessing similar content
    const cacheKey = getCacheKey(utteranceText, userId, targetLanguage);
    const cachedResult = getCachedResult(cacheKey);

    if (cachedResult) {
      console.log(`💾 Using cached result for: "${utteranceText.substring(0, 30)}..."`);
      return NextResponse.json({
        success: true,
        cached: true,
        ...cachedResult
      });
    }

    // Generate IDs
    const utteranceId = uuidv4();
    const finalConversationId = conversationId || uuidv4();

    // Construct GPT-4.1-mini prompt
    const prompt = `You are an NLP processor for a language learning application.
User's native language: ${userNativeLanguage}
Target language of this utterance: ${targetLanguage}
Utterance text: "${utteranceText}"

Analyze the utterance and provide the following information in JSON format:
1. "lemmatized_tokens": An array of objects, where each object represents a token and includes:
   * "original_form": The word as it appeared in the utterance.
   * "lemma": The base/dictionary form of the word.
   * "pos": The part of speech (e.g., "NOUN", "VERB", "ADJ").
   * "language": The language code of this token (e.g., "${targetLanguage}").
2. "potential_new_lexemes": An array of lemmas (from "lemmatized_tokens") that are likely new or important vocabulary for a learner at an intermediate stage.
3. "suggested_translations": An array of objects for lemmas in "potential_new_lexemes", each with:
   * "source_lemma": The lemma in ${targetLanguage}.
   * "target_lemma": The suggested translation in ${userNativeLanguage}.
   * "confidence": A score from 0.0 to 1.0 (optional).
4. (Optional) "semantic_relationships": An array of objects describing relationships between lemmas within the utterance, each with:
   * "source_lemma": The first lemma.
   * "target_lemma": The second lemma.
   * "relationship_type": e.g., "co-occurrence", "possible_collocation".

Output ONLY the JSON object.`;

    // Call GPT-4.1-mini with optimized settings
    console.log('🤖 Calling GPT-4.1-mini for linguistic analysis...');
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using available model - will update when GPT-4.1-mini is available
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: utteranceText }
      ],
      temperature: 0.1, // Lower temperature for more consistent results
      max_tokens: 800, // Reduced token limit to save on usage
      response_format: { type: "json_object" }
    });

    const analysisText = gptResponse.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No response from GPT-4.1-mini');
    }

    let analysis: GPTAnalysisResponse;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('❌ Failed to parse GPT response:', analysisText);
      throw new Error('Invalid JSON response from GPT-4.1-mini');
    }

    console.log(`📊 Analysis complete: ${analysis.lemmatized_tokens.length} tokens, ${analysis.potential_new_lexemes.length} new lexemes`);

    // Store in Neo4j
    const result = await executeWriteTransaction(async (tx) => {
      // Create/update conversation
      await tx.run(`
        MERGE (conv:Conversation {conversationId: $conversationId})
        ON CREATE SET conv.startTime = timestamp(), conv.userId = $userId
        ON MATCH SET conv.lastActivity = timestamp()
      `, { conversationId: finalConversationId, userId });

      // Create utterance
      const utteranceResult = await tx.run(`
        MATCH (conv:Conversation {conversationId: $conversationId})
        OPTIONAL MATCH (conv)-[:HAS_UTTERANCE]->(existing)
        WITH conv, count(existing) as existingCount
        CREATE (utt:Utterance {
          utteranceId: $utteranceId,
          text: $utteranceText,
          speaker: $speaker,
          timestamp: timestamp(),
          sequenceInConversation: existingCount + 1
        })
        MERGE (conv)-[:HAS_UTTERANCE]->(utt)
        RETURN utt.utteranceId as utteranceId
      `, {
        conversationId: finalConversationId,
        utteranceId,
        utteranceText,
        speaker
      });

      // Process lexemes and create relationships
      let lexemesProcessed = 0;
      let newSrsItems = 0;
      let translationsCreated = 0;

      for (const token of analysis.lemmatized_tokens) {
        // Create lexeme and relationship to utterance
        await tx.run(`
          MERGE (lang:Language {code: $language})
          MERGE (lex:Lexeme {lemma: $lemma, language: $language})
          ON CREATE SET lex.partOfSpeech = $pos
          MERGE (lex)-[:IN_LANGUAGE]->(lang)
          WITH lex
          MATCH (utt:Utterance {utteranceId: $utteranceId})
          MERGE (utt)-[:CONTAINS_LEXEME {originalForm: $originalForm}]->(lex)
        `, {
          language: token.language,
          lemma: token.lemma,
          pos: token.pos,
          utteranceId,
          originalForm: token.original_form
        });

        lexemesProcessed++;
      }

      // Create SRS items for new lexemes (only for user utterances)
      if (speaker === 'user') {
        for (const newLemma of analysis.potential_new_lexemes) {
          const srsResult = await tx.run(`
            MATCH (usr:User {userId: $userId})
            MATCH (lex:Lexeme {lemma: $newLemma, language: $targetLanguage})
            MERGE (usr)-[:HAS_SRS_ITEM]->(srs:SRS_Item)-[:FOR_LEXEME]->(lex)
            ON CREATE SET
              srs.itemId = $itemId,
              srs.userId = $userId,
              srs.lexemeLemma = $newLemma,
              srs.lexemeLanguage = $targetLanguage,
              srs.lastReviewed = timestamp(),
              srs.nextReview = $nextReview,
              srs.interval = 1.0,
              srs.easeFactor = 2.5,
              srs.repetitions = 0,
              srs.lapses = 0,
              srs.status = 'new'
            RETURN srs.itemId as itemId
          `, {
            userId,
            newLemma,
            targetLanguage,
            itemId: uuidv4(),
            nextReview: Date.now() + (24 * 60 * 60 * 1000) // 1 day from now
          });

          if (srsResult.records.length > 0) {
            newSrsItems++;
          }
        }
      }

      // Create translation relationships
      for (const translation of analysis.suggested_translations) {
        await tx.run(`
          MATCH (sourceLex:Lexeme {lemma: $sourceLemma, language: $targetLanguage})
          MERGE (nativeLang:Language {code: $userNativeLanguage})
          MERGE (targetLex:Lexeme {lemma: $targetLemma, language: $userNativeLanguage})
          ON CREATE SET targetLex.partOfSpeech = 'TRANSLATION'
          MERGE (targetLex)-[:IN_LANGUAGE]->(nativeLang)
          MERGE (sourceLex)-[rel:TRANSLATES_TO]->(targetLex)
          ON CREATE SET rel.confidence = coalesce($confidence, 0.8)
          ON MATCH SET rel.confidence = CASE
            WHEN rel.confidence IS NULL OR $confidence > rel.confidence
            THEN $confidence
            ELSE rel.confidence
          END
        `, {
          sourceLemma: translation.source_lemma,
          targetLemma: translation.target_lemma,
          targetLanguage,
          userNativeLanguage,
          confidence: translation.confidence || 0.8
        });

        translationsCreated++;
      }

      return {
        utteranceId,
        lexemesProcessed,
        newSrsItems,
        translationsCreated,
        relationshipsCreated: analysis.semantic_relationships?.length || 0
      };
    });

    console.log(`✅ Utterance processed successfully: ${result.utteranceId}`);

    const responseData = {
      utteranceId: result.utteranceId,
      conversationId: finalConversationId,
      analysis: {
        lexemes_processed: result.lexemesProcessed,
        new_srs_items: result.newSrsItems,
        translations_created: result.translationsCreated,
        relationships_created: result.relationshipsCreated
      },
      timestamp: new Date().toISOString()
    };

    // Cache the result for future similar requests
    setCachedResult(cacheKey, responseData);

    return NextResponse.json({
      success: true,
      ...responseData
    });

  } catch (error: any) {
    console.error('❌ Error processing utterance:', error);

    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
