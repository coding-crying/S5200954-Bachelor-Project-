import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeWriteTransaction } from '../../../../lib/neo4j.js';
import neo4j from 'neo4j-driver';

interface SRSItem {
  itemId: string;
  userId: string;
  lexemeLemma: string;
  lexemeLanguage: string;
  lastReviewed: number;
  nextReview: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  status: 'new' | 'learning' | 'learned' | 'lapsed' | 'suspended';
}

interface UpdateSRSRequest {
  itemId: string;
  qualityOfResponse: number; // 0-5 scale (0-2 incorrect, 3 difficult, 4 correct, 5 easy)
}

interface GetDueItemsRequest {
  userId: string;
  targetLanguage: string;
  limit?: number;
}

/**
 * SM-2 Algorithm Implementation
 * Based on the SuperMemo SM-2 algorithm for spaced repetition
 */
function calculateNextReview(
  currentInterval: number,
  easeFactor: number,
  repetitions: number,
  qualityOfResponse: number
): { interval: number; easeFactor: number; repetitions: number; status: string } {
  let newInterval = currentInterval;
  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let status = 'learning';

  if (qualityOfResponse < 3) {
    // Incorrect response
    newRepetitions = 0;
    newInterval = 1;
    status = repetitions > 0 ? 'lapsed' : 'learning';
  } else {
    // Correct response
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * easeFactor);
    }

    newRepetitions += 1;

    // Update ease factor
    newEaseFactor = easeFactor + (0.1 - (5 - qualityOfResponse) * (0.08 + (5 - qualityOfResponse) * 0.02));

    // Ensure ease factor doesn't go below 1.3
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3;
    }

    // Determine status based on repetitions and performance
    if (newRepetitions >= 3 && qualityOfResponse >= 4) {
      status = 'learned';
    } else {
      status = 'learning';
    }
  }

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
    status
  };
}

/**
 * Update SRS item after review
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body: UpdateSRSRequest = await req.json();
    const { itemId, qualityOfResponse } = body;

    if (!itemId || qualityOfResponse === undefined) {
      return NextResponse.json({
        success: false,
        error: "itemId and qualityOfResponse are required"
      }, { status: 400 });
    }

    if (qualityOfResponse < 0 || qualityOfResponse > 5) {
      return NextResponse.json({
        success: false,
        error: "qualityOfResponse must be between 0 and 5"
      }, { status: 400 });
    }

    console.log(`🔄 Updating SRS item ${itemId} with quality ${qualityOfResponse}`);

    const result = await executeWriteTransaction(async (tx) => {
      // Get current SRS item data
      const currentResult = await tx.run(`
        MATCH (srs:SRS_Item {itemId: $itemId})
        RETURN srs.interval as interval,
               srs.easeFactor as easeFactor,
               srs.repetitions as repetitions,
               srs.lapses as lapses,
               srs.status as status
      `, { itemId });

      if (currentResult.records.length === 0) {
        throw new Error('SRS item not found');
      }

      const current = currentResult.records[0];
      const currentInterval = current.get('interval');
      const currentEaseFactor = current.get('easeFactor');
      const currentRepetitions = current.get('repetitions');
      const currentLapses = current.get('lapses');

      // Calculate new values using SM-2 algorithm
      const { interval, easeFactor, repetitions, status } = calculateNextReview(
        currentInterval,
        currentEaseFactor,
        currentRepetitions,
        qualityOfResponse
      );

      const newLapses = qualityOfResponse < 3 ? currentLapses + 1 : currentLapses;
      const nextReviewTimestamp = Date.now() + (interval * 24 * 60 * 60 * 1000); // Convert days to milliseconds

      // Update the SRS item
      const updateResult = await tx.run(`
        MATCH (srs:SRS_Item {itemId: $itemId})
        SET srs.lastReviewed = timestamp(),
            srs.nextReview = $nextReview,
            srs.interval = $interval,
            srs.easeFactor = $easeFactor,
            srs.repetitions = $repetitions,
            srs.lapses = $lapses,
            srs.status = $status
        RETURN srs.itemId as itemId,
               srs.lexemeLemma as lexemeLemma,
               srs.status as newStatus
      `, {
        itemId,
        nextReview: nextReviewTimestamp,
        interval,
        easeFactor,
        repetitions,
        lapses: newLapses,
        status
      });

      return updateResult.records[0];
    });

    const updatedItem = result;
    console.log(`✅ SRS item updated: ${updatedItem.get('lexemeLemma')} -> ${updatedItem.get('newStatus')}`);

    return NextResponse.json({
      success: true,
      itemId: updatedItem.get('itemId'),
      lexeme: updatedItem.get('lexemeLemma'),
      newStatus: updatedItem.get('newStatus'),
      message: `SRS item updated successfully`
    });

  } catch (error: any) {
    console.error('❌ Error updating SRS item:', error);

    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
}

/**
 * Get due SRS items for review
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const targetLanguage = searchParams.get('targetLanguage');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (!userId || !targetLanguage) {
      return NextResponse.json({
        success: false,
        error: "userId and targetLanguage are required"
      }, { status: 400 });
    }

    console.log(`📚 Getting due SRS items for user ${userId} in ${targetLanguage}`);

    const result = await executeQuery(`
      MATCH (u:User {userId: $userId})-[:HAS_SRS_ITEM]->(srs:SRS_Item)-[:FOR_LEXEME]->(l:Lexeme)
      WHERE srs.nextReview <= timestamp()
        AND l.language = $targetLanguage
        AND (srs.status <> 'suspended' OR srs.status IS NULL)
      OPTIONAL MATCH (l)-[:TRANSLATES_TO]->(translation:Lexeme)
      WHERE translation.language = u.nativeLanguage
      RETURN l.lemma as lemma,
             l.language as language,
             l.partOfSpeech as partOfSpeech,
             srs.itemId as itemId,
             srs.status as status,
             srs.repetitions as repetitions,
             srs.lapses as lapses,
             srs.nextReview as nextReview,
             collect(translation.lemma) as translations
      ORDER BY
        CASE srs.status
          WHEN 'lapsed' THEN 1
          WHEN 'new' THEN 2
          ELSE 3
        END,
        srs.nextReview ASC
      LIMIT $limit
    `, { userId, targetLanguage, limit: neo4j.int(limit) });

    const dueItems = result.map(record => ({
      itemId: record.get('itemId'),
      lemma: record.get('lemma'),
      language: record.get('language'),
      partOfSpeech: record.get('partOfSpeech'),
      status: record.get('status'),
      repetitions: record.get('repetitions'),
      lapses: record.get('lapses'),
      nextReview: record.get('nextReview'),
      translations: record.get('translations').filter((t: string) => t) // Remove null translations
    }));

    console.log(`📊 Found ${dueItems.length} due items for review`);

    return NextResponse.json({
      success: true,
      dueItems,
      count: dueItems.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error getting due SRS items:', error);

    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
}

/**
 * Get SRS statistics for a user
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { userId, targetLanguage } = body;

    if (!userId || !targetLanguage) {
      return NextResponse.json({
        success: false,
        error: "userId and targetLanguage are required"
      }, { status: 400 });
    }

    const result = await executeQuery(`
      MATCH (u:User {userId: $userId})-[:HAS_SRS_ITEM]->(srs:SRS_Item)-[:FOR_LEXEME]->(l:Lexeme {language: $targetLanguage})
      RETURN
        count(*) as totalItems,
        sum(CASE WHEN srs.status = 'new' THEN 1 ELSE 0 END) as newItems,
        sum(CASE WHEN srs.status = 'learning' THEN 1 ELSE 0 END) as learningItems,
        sum(CASE WHEN srs.status = 'learned' THEN 1 ELSE 0 END) as learnedItems,
        sum(CASE WHEN srs.status = 'lapsed' THEN 1 ELSE 0 END) as lapsedItems,
        sum(CASE WHEN srs.nextReview <= timestamp() THEN 1 ELSE 0 END) as dueItems
    `, { userId, targetLanguage });

    const stats = result[0];

    return NextResponse.json({
      success: true,
      statistics: {
        totalItems: stats.get('totalItems'),
        newItems: stats.get('newItems'),
        learningItems: stats.get('learningItems'),
        learnedItems: stats.get('learnedItems'),
        lapsedItems: stats.get('lapsedItems'),
        dueItems: stats.get('dueItems')
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error getting SRS statistics:', error);

    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
}
