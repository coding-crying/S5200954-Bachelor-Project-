import { NextRequest, NextResponse } from 'next/server';
import { verifyConnectivity, executeQuery } from '../../../../../lib/neo4j.js';

/**
 * Test Neo4j connectivity and basic functionality
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing Neo4j connectivity...');

    // Test 1: Verify connectivity
    const connectivityResult = await verifyConnectivity();

    if (!connectivityResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Connectivity verification failed',
        details: connectivityResult,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Test 2: Simple query
    console.log('🔍 Testing basic query...');
    const queryResult = await executeQuery(
      'RETURN "Hello Neo4j!" as message, timestamp() as serverTime'
    );

    const message = queryResult[0]?.message;
    const serverTime = queryResult[0]?.serverTime;

    // Test 3: Check database info (optional)
    let dbInfo = null;
    try {
      const dbResult = await executeQuery('CALL dbms.components() YIELD name, versions, edition');
      if (dbResult.length > 0) {
        dbInfo = {
          name: dbResult[0].name,
          version: dbResult[0].versions?.[0],
          edition: dbResult[0].edition
        };
      }
    } catch (error) {
      console.log('⚠️ Could not get database info (this is normal for some Neo4j versions)');
    }

    // Test 4: Check existing schema
    let schemaInfo = null;
    try {
      const constraintsResult = await executeQuery('SHOW CONSTRAINTS');
      const indexesResult = await executeQuery('SHOW INDEXES');
      const languagesResult = await executeQuery('MATCH (l:Language) RETURN count(l) as count');

      schemaInfo = {
        constraints: constraintsResult.length,
        indexes: indexesResult.length,
        languages: languagesResult[0]?.count || 0
      };
    } catch (error) {
      console.log('⚠️ Could not get schema info');
    }

    console.log('✅ Neo4j connectivity test completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Neo4j connectivity test passed',
      results: {
        connectivity: connectivityResult,
        basicQuery: {
          message,
          serverTime: serverTime ? new Date(Number(serverTime)) : null
        },
        database: dbInfo,
        schema: schemaInfo
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Neo4j connectivity test failed:', error);

    let troubleshooting = [];
    if (error.code === 'Neo.ClientError.Security.Unauthorized') {
      troubleshooting = [
        'Verify username and password in .env.local',
        'Check if Neo4j AuraDB instance is running',
        'Ensure IP address is whitelisted in Neo4j Aura',
        'Try logging into Neo4j Browser with same credentials'
      ];
    } else if (error.code === 'ServiceUnavailable') {
      troubleshooting = [
        'Check if Neo4j URI is correct in .env.local',
        'Verify internet connection',
        'Ensure Neo4j instance is running'
      ];
    } else {
      troubleshooting = [
        'Check server logs for detailed error information',
        'Verify all environment variables are set correctly',
        'Ensure Neo4j driver is properly installed'
      ];
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error during connectivity test',
      code: error.code,
      troubleshooting,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Test specific Neo4j functionality
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testType = 'basic' } = body;

    console.log(`🔍 Running Neo4j test: ${testType}`);

    let results = {};

    switch (testType) {
      case 'basic':
        // Basic connectivity and query test
        const basicResult = await executeQuery('RETURN 1 as number, "test" as text');
        results = { basic: basicResult[0] };
        break;

      case 'schema':
        // Test schema elements
        const constraints = await executeQuery('SHOW CONSTRAINTS');
        const indexes = await executeQuery('SHOW INDEXES');
        results = {
          constraints: constraints.length,
          indexes: indexes.length,
          constraintDetails: constraints.slice(0, 5), // First 5 for brevity
          indexDetails: indexes.slice(0, 5)
        };
        break;

      case 'data':
        // Test data queries
        const userCount = await executeQuery('MATCH (u:User) RETURN count(u) as count');
        const lexemeCount = await executeQuery('MATCH (l:Lexeme) RETURN count(l) as count');
        const srsCount = await executeQuery('MATCH (s:SRS_Item) RETURN count(s) as count');
        results = {
          users: userCount[0]?.count || 0,
          lexemes: lexemeCount[0]?.count || 0,
          srsItems: srsCount[0]?.count || 0
        };
        break;

      default:
        throw new Error(`Unknown test type: ${testType}`);
    }

    return NextResponse.json({
      success: true,
      testType,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error(`❌ Neo4j test failed:`, error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
