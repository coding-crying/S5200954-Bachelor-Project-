import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../../lib/neo4j.js';

interface TranslationRequest {
  lemma: string;
  sourceLanguage: string;
  targetLanguage: string;
}

interface TranslationResponse {
  success: boolean;
  lemma?: string;
  translations?: Array<{
    translation: string;
    confidence: number;
    partOfSpeech?: string;
  }>;
  examples?: Array<{
    sourceText: string;
    targetText: string;
    context?: string;
  }>;
  relatedWords?: Array<{
    lemma: string;
    relationship: string;
    language: string;
  }>;
  error?: string;
  timestamp: string;
}

/**
 * Get translations and contextual information for a vocabulary word
 */
export async function GET(req: NextRequest): Promise<NextResponse<TranslationResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const lemma = searchParams.get('lemma');
    const sourceLanguage = searchParams.get('sourceLanguage');
    const targetLanguage = searchParams.get('targetLanguage');

    if (!lemma || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({
        success: false,
        error: "lemma, sourceLanguage, and targetLanguage are required",
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log(`🔍 Getting translations for "${lemma}" from ${sourceLanguage} to ${targetLanguage}`);

    // Query Neo4j for translation relationships
    const translationResult = await executeQuery(`
      MATCH (sourceLex:Lexeme {lemma: $lemma, language: $sourceLanguage})
      OPTIONAL MATCH (sourceLex)-[rel:TRANSLATES_TO]->(targetLex:Lexeme {language: $targetLanguage})
      RETURN sourceLex.lemma as sourceLemma,
             sourceLex.partOfSpeech as sourcePos,
             targetLex.lemma as translation,
             targetLex.partOfSpeech as targetPos,
             rel.confidence as confidence
      ORDER BY rel.confidence DESC
    `, { lemma, sourceLanguage, targetLanguage });

    // Query for related words (synonyms, antonyms, etc.)
    const relatedResult = await executeQuery(`
      MATCH (sourceLex:Lexeme {lemma: $lemma, language: $sourceLanguage})
      OPTIONAL MATCH (sourceLex)-[rel:SEMANTIC_RELATION]->(relatedLex:Lexeme)
      WHERE relatedLex.language = $sourceLanguage
      RETURN relatedLex.lemma as relatedLemma,
             rel.relationshipType as relationship,
             relatedLex.language as language
      LIMIT 5
    `, { lemma, sourceLanguage });

    // Query for example usage in utterances
    const exampleResult = await executeQuery(`
      MATCH (sourceLex:Lexeme {lemma: $lemma, language: $sourceLanguage})
      MATCH (utt:Utterance)-[:CONTAINS_LEXEME]->(sourceLex)
      RETURN utt.text as utteranceText,
             utt.speaker as speaker
      ORDER BY utt.timestamp DESC
      LIMIT 3
    `, { lemma, sourceLanguage });

    // Process translations
    const translations = translationResult.map(record => ({
      translation: record.get('translation'),
      confidence: record.get('confidence') || 0.8,
      partOfSpeech: record.get('targetPos')
    })).filter(t => t.translation); // Remove null translations

    // Process related words
    const relatedWords = relatedResult.map(record => ({
      lemma: record.get('relatedLemma'),
      relationship: record.get('relationship') || 'related',
      language: record.get('language')
    })).filter(r => r.lemma);

    // Process examples
    const examples = exampleResult.map(record => ({
      sourceText: record.get('utteranceText'),
      targetText: '', // Would need translation service for this
      context: record.get('speaker') === 'user' ? 'User conversation' : 'AI response'
    })).filter(e => e.sourceText);

    // If no translations found, provide a helpful message
    if (translations.length === 0) {
      console.log(`⚠️ No translations found for "${lemma}" in Neo4j database`);
      
      return NextResponse.json({
        success: true,
        lemma,
        translations: [],
        examples: examples,
        relatedWords: relatedWords,
        error: `No translations found for "${lemma}" in the database. This word may need to be added to the translation system.`,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ Found ${translations.length} translations for "${lemma}"`);

    return NextResponse.json({
      success: true,
      lemma,
      translations,
      examples,
      relatedWords,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error getting word translations:', error);

    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Create or update translation relationships
 */
export async function POST(req: NextRequest): Promise<NextResponse<TranslationResponse>> {
  try {
    const body: TranslationRequest & { 
      translation: string; 
      confidence?: number; 
      partOfSpeech?: string;
    } = await req.json();
    
    const { 
      lemma, 
      sourceLanguage, 
      targetLanguage, 
      translation, 
      confidence = 0.8,
      partOfSpeech 
    } = body;

    if (!lemma || !sourceLanguage || !targetLanguage || !translation) {
      return NextResponse.json({
        success: false,
        error: "lemma, sourceLanguage, targetLanguage, and translation are required",
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log(`📝 Creating translation: "${lemma}" (${sourceLanguage}) -> "${translation}" (${targetLanguage})`);

    // Create or update translation relationship in Neo4j
    const result = await executeQuery(`
      MERGE (sourceLang:Language {code: $sourceLanguage})
      MERGE (targetLang:Language {code: $targetLanguage})
      MERGE (sourceLex:Lexeme {lemma: $lemma, language: $sourceLanguage})
      MERGE (targetLex:Lexeme {lemma: $translation, language: $targetLanguage})
      ON CREATE SET targetLex.partOfSpeech = $partOfSpeech
      MERGE (sourceLex)-[:IN_LANGUAGE]->(sourceLang)
      MERGE (targetLex)-[:IN_LANGUAGE]->(targetLang)
      MERGE (sourceLex)-[rel:TRANSLATES_TO]->(targetLex)
      ON CREATE SET rel.confidence = $confidence, rel.createdAt = timestamp()
      ON MATCH SET rel.confidence = CASE 
        WHEN $confidence > rel.confidence THEN $confidence 
        ELSE rel.confidence 
      END
      RETURN sourceLex.lemma as sourceLemma,
             targetLex.lemma as targetLemma,
             rel.confidence as confidence
    `, { 
      lemma, 
      sourceLanguage, 
      targetLanguage, 
      translation, 
      confidence,
      partOfSpeech: partOfSpeech || 'UNKNOWN'
    });

    console.log(`✅ Translation relationship created/updated successfully`);

    return NextResponse.json({
      success: true,
      lemma,
      translations: [{
        translation,
        confidence,
        partOfSpeech
      }],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error creating translation:', error);

    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
