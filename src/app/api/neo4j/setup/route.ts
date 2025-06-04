import { NextRequest, NextResponse } from 'next/server';
import { initializeSchema, verifySchema } from '../../../../../lib/neo4j-schema.js';

/**
 * Neo4j Database Setup API
 * 
 * This endpoint initializes the Neo4j database schema for the language learning system.
 * It creates all necessary constraints, indexes, and initial data.
 */

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Starting Neo4j schema initialization...');
    
    const result = await initializeSchema();
    
    console.log('✅ Neo4j schema initialization completed');
    
    return NextResponse.json({
      success: true,
      message: 'Neo4j schema initialized successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error initializing Neo4j schema:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to initialize Neo4j schema",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Verify Neo4j schema setup
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Verifying Neo4j schema...');
    
    const verification = await verifySchema();
    
    return NextResponse.json({
      success: true,
      message: 'Schema verification completed',
      schema: verification,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error verifying Neo4j schema:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to verify Neo4j schema",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
