import { executeQuery, executeWriteTransaction } from '../../lib/neo4j.js';

/**
 * API route to test Neo4j connectivity and basic operations
 *
 * GET: Creates a test node and returns it
 * POST: Accepts custom query and parameters
 */
export default async function handler(req, res) {
  // Set CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Start with a simple read-only query to test connectivity
      const simpleQuery = `
        RETURN
          'Hello from Next.js!' AS message,
          1 AS id,
          datetime() AS timestamp
      `;

      console.log('🧪 Testing Neo4j connection with simple query...');
      const records = await executeQuery(simpleQuery);

      if (records.length === 0) {
        return res.status(500).json({
          success: false,
          error: 'No records returned from test query',
          data: null
        });
      }

      const result = records[0];

      console.log('✅ Simple query successful:', result);

      return res.status(200).json({
        success: true,
        message: 'Neo4j connection test successful!',
        data: {
          result,
          timestamp: new Date().toISOString(),
          recordCount: records.length
        }
      });

    } else if (req.method === 'POST') {
      // Allow custom queries via POST request
      const { query, params = {} } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required',
          data: null
        });
      }

      console.log('🔍 Executing custom query:', query);
      console.log('📝 With parameters:', params);

      const records = await executeQuery(query, params);

      return res.status(200).json({
        success: true,
        message: 'Custom query executed successfully',
        data: {
          records,
          recordCount: records.length,
          timestamp: new Date().toISOString()
        }
      });

    } else {
      // Method not allowed
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
        data: null
      });
    }

  } catch (error) {
    console.error('❌ Neo4j API error:', error);

    // Determine error type and provide helpful messages
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;

    if (error.message.includes('authentication')) {
      errorMessage = 'Authentication failed. Please check your Neo4j credentials.';
      statusCode = 401;
    } else if (error.message.includes('connection')) {
      errorMessage = 'Connection failed. Please check your Neo4j URI and network connectivity.';
      statusCode = 503;
    } else if (error.message.includes('syntax')) {
      errorMessage = 'Cypher syntax error. Please check your query.';
      statusCode = 400;
    } else if (error.code === 'Neo.ClientError.Security.Unauthorized') {
      errorMessage = 'Unauthorized access. Please check your Neo4j username and password.';
      statusCode = 401;
    } else if (error.code === 'ServiceUnavailable') {
      errorMessage = 'Neo4j service is unavailable. Please try again later.';
      statusCode = 503;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        stack: error.stack
      } : undefined,
      data: null
    });
  }
}
