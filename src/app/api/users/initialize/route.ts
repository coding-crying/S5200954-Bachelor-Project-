import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { executeWriteTransaction } from '../../../../../lib/neo4j.js';
import { getLanguageCode } from '../../../../../lib/neo4j-schema.js';

/**
 * Initialize a new user in the language learning system
 * 
 * This endpoint creates a new user profile in Neo4j with their language preferences
 * and sets up the initial relationships for language learning.
 */

interface InitializeUserRequest {
  displayName: string;
  nativeLanguage: string;
  targetLanguage: string;
}

interface InitializeUserResponse {
  success: boolean;
  userId?: string;
  userProfile?: {
    displayName: string;
    nativeLanguage: string;
    targetLanguage: string;
    nativeLanguageCode: string;
    targetLanguageCode: string;
  };
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<InitializeUserResponse>> {
  try {
    const body: InitializeUserRequest = await req.json();
    const { displayName, nativeLanguage, targetLanguage } = body;

    // Validate required fields
    if (!displayName || !nativeLanguage || !targetLanguage) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields: displayName, nativeLanguage, and targetLanguage are required" 
        },
        { status: 400 }
      );
    }

    // Validate display name length
    if (displayName.length < 1 || displayName.length > 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Display name must be between 1 and 50 characters" 
        },
        { status: 400 }
      );
    }

    // Generate unique user ID
    const userId = uuidv4();
    
    // Get language codes
    const nativeLanguageCode = getLanguageCode(nativeLanguage);
    const targetLanguageCode = getLanguageCode(targetLanguage);

    console.log(`🔧 Initializing user: ${displayName} (${userId})`);
    console.log(`📚 Native: ${nativeLanguage} (${nativeLanguageCode}) -> Target: ${targetLanguage} (${targetLanguageCode})`);

    // Create user and relationships in Neo4j
    const result = await executeWriteTransaction(async (tx) => {
      // Create the user node
      const userQuery = `
        MERGE (u:User {userId: $userId})
        ON CREATE SET
          u.name = $displayName,
          u.nativeLanguage = $nativeLanguageCode,
          u.targetLanguage = $targetLanguageCode,
          u.createdAt = timestamp(),
          u.lastActive = timestamp()
        RETURN u.userId as userId
      `;

      const userResult = await tx.run(userQuery, {
        userId,
        displayName,
        nativeLanguageCode,
        targetLanguageCode
      });

      if (userResult.records.length === 0) {
        throw new Error('Failed to create user');
      }

      // Ensure language nodes exist and create relationships
      const languageQuery = `
        MATCH (u:User {userId: $userId})
        MERGE (nativeLang:Language {code: $nativeLanguageCode})
        ON CREATE SET nativeLang.name = $nativeLanguage
        MERGE (targetLang:Language {code: $targetLanguageCode})
        ON CREATE SET targetLang.name = $targetLanguage
        MERGE (u)-[:SPEAKS_NATIVELY]->(nativeLang)
        MERGE (u)-[:LEARNING_LANGUAGE]->(targetLang)
        RETURN u.userId as userId
      `;

      await tx.run(languageQuery, {
        userId,
        nativeLanguageCode,
        targetLanguageCode,
        nativeLanguage,
        targetLanguage
      });

      return userResult.records[0].get('userId');
    });

    console.log(`✅ User initialized successfully: ${result}`);

    const userProfile = {
      displayName,
      nativeLanguage,
      targetLanguage,
      nativeLanguageCode,
      targetLanguageCode
    };

    return NextResponse.json({
      success: true,
      userId: result,
      userProfile
    });

  } catch (error: any) {
    console.error('❌ Error initializing user:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error while initializing user" 
      },
      { status: 500 }
    );
  }
}

/**
 * Get user profile information
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const query = `
      MATCH (u:User {userId: $userId})
      OPTIONAL MATCH (u)-[:SPEAKS_NATIVELY]->(nativeLang:Language)
      OPTIONAL MATCH (u)-[:LEARNING_LANGUAGE]->(targetLang:Language)
      RETURN u.name as displayName,
             u.nativeLanguage as nativeLanguageCode,
             u.targetLanguage as targetLanguageCode,
             nativeLang.name as nativeLanguage,
             targetLang.name as targetLanguage,
             u.createdAt as createdAt,
             u.lastActive as lastActive
    `;

    const result = await executeWriteTransaction(async (tx) => {
      const queryResult = await tx.run(query, { userId });
      return queryResult.records;
    });

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const record = result[0];
    const userProfile = {
      displayName: record.get('displayName'),
      nativeLanguage: record.get('nativeLanguage'),
      targetLanguage: record.get('targetLanguage'),
      nativeLanguageCode: record.get('nativeLanguageCode'),
      targetLanguageCode: record.get('targetLanguageCode'),
      createdAt: record.get('createdAt'),
      lastActive: record.get('lastActive')
    };

    return NextResponse.json({
      success: true,
      userId,
      userProfile
    });

  } catch (error: any) {
    console.error('❌ Error fetching user profile:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error while fetching user profile" 
      },
      { status: 500 }
    );
  }
}
