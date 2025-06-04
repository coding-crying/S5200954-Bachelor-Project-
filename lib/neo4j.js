import neo4j from 'neo4j-driver';

let driver = null;

// Function to get or create driver instance
function getDriver() {
  if (!driver) {
    // Read environment variables
    const NEO4J_URI = process.env.NEO4J_URI;
    const NEO4J_USERNAME = process.env.NEO4J_USERNAME;
    const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;

    console.log('🔧 Initializing Neo4j driver...');
    console.log('📍 URI:', NEO4J_URI);
    console.log('👤 Username:', NEO4J_USERNAME);
    console.log('🔑 Password:', NEO4J_PASSWORD ? '[REDACTED]' : 'NOT SET');

    // Validate environment variables
    if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD) {
      throw new Error(
        'Missing required Neo4j environment variables. Please check NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD in your .env.local file.'
      );
    }

    // Create driver instance with enhanced configuration
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
      {
        // Connection pool settings
        maxConnectionPoolSize: 50,
        maxTransactionRetryTime: 30000,
        connectionAcquisitionTimeout: 60000,
        // Note: Encryption is handled by the +s in the URI, don't specify here
        // Logging
        logging: {
          level: 'info',
          logger: (level, message) => console.log(`[Neo4j ${level}] ${message}`)
        }
      }
    );

    console.log('✅ Neo4j driver created successfully');
  }

  return driver;
}

/**
 * Execute a Cypher query with optional parameters
 * @param {string} query - The Cypher query to execute
 * @param {Object} params - Optional parameters for the query
 * @param {string} database - Optional database name (defaults to 'neo4j')
 * @returns {Promise<Array>} - Array of result records
 */
export async function executeQuery(query, params = {}, database = 'neo4j') {
  const currentDriver = getDriver();
  const session = currentDriver.session({ database });

  try {
    console.log('🔍 Executing Neo4j query:', query);
    console.log('📝 With parameters:', params);

    const result = await session.run(query, params);

    // Convert result records to plain JavaScript objects
    const records = result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => {
        const value = record.get(key);
        // Handle Neo4j types conversion
        if (value && typeof value === 'object' && value.constructor.name === 'Integer') {
          obj[key] = value.toNumber();
        } else if (value && typeof value === 'object' && value.properties) {
          // Handle Node objects
          obj[key] = { ...value.properties, id: value.identity.toNumber() };
        } else if (value && typeof value === 'object' && value.start && value.end) {
          // Handle Relationship objects
          obj[key] = {
            ...value.properties,
            id: value.identity.toNumber(),
            startNodeId: value.start.toNumber(),
            endNodeId: value.end.toNumber(),
            type: value.type
          };
        } else {
          obj[key] = value;
        }
      });
      return obj;
    });

    console.log('✅ Query executed successfully, returned', records.length, 'records');
    return records;

  } catch (error) {
    console.error('❌ Neo4j query failed:', error);
    throw error;
  } finally {
    // Always close the session
    await session.close();
  }
}

/**
 * Execute a write transaction (for data modification)
 * @param {Function} transactionWork - Function that receives a transaction object
 * @param {string} database - Optional database name (defaults to 'neo4j')
 * @returns {Promise<any>} - Result of the transaction
 */
export async function executeWriteTransaction(transactionWork, database = 'neo4j') {
  const currentDriver = getDriver();
  const session = currentDriver.session({ database });

  try {
    console.log('📝 Executing Neo4j write transaction');

    const result = await session.executeWrite(transactionWork);

    console.log('✅ Write transaction completed successfully');
    return result;

  } catch (error) {
    console.error('❌ Neo4j write transaction failed:', error);
    throw error;
  } finally {
    await session.close();
  }
}

/**
 * Execute a read transaction (for data querying)
 * @param {Function} transactionWork - Function that receives a transaction object
 * @param {string} database - Optional database name (defaults to 'neo4j')
 * @returns {Promise<any>} - Result of the transaction
 */
export async function executeReadTransaction(transactionWork, database = 'neo4j') {
  const currentDriver = getDriver();
  const session = currentDriver.session({ database });

  try {
    console.log('🔍 Executing Neo4j read transaction');

    const result = await session.executeRead(transactionWork);

    console.log('✅ Read transaction completed successfully');
    return result;

  } catch (error) {
    console.error('❌ Neo4j read transaction failed:', error);
    throw error;
  } finally {
    await session.close();
  }
}

/**
 * Verify Neo4j connectivity
 */
export async function verifyConnectivity() {
  try {
    const currentDriver = getDriver();
    console.log('🔍 Verifying Neo4j connectivity...');

    await currentDriver.verifyConnectivity();
    console.log('✅ Neo4j connectivity verified successfully');

    return { success: true, message: 'Connection verified' };
  } catch (error) {
    console.error('❌ Neo4j connectivity verification failed:', error);

    let troubleshooting = [];
    if (error.code === 'Neo.ClientError.Security.Unauthorized') {
      troubleshooting = [
        'Verify username and password are correct',
        'Check if Neo4j AuraDB instance is running',
        'Ensure IP address is whitelisted in Neo4j Aura',
        'Try logging into Neo4j Browser with same credentials'
      ];
    } else if (error.code === 'ServiceUnavailable') {
      troubleshooting = [
        'Check if Neo4j URI is correct',
        'Verify internet connection',
        'Ensure Neo4j instance is running'
      ];
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      troubleshooting
    };
  }
}

/**
 * Close the driver connection (call this when shutting down the application)
 */
export async function closeDriver() {
  try {
    if (driver) {
      await driver.close();
      driver = null;
      console.log('✅ Neo4j driver closed successfully');
    }
  } catch (error) {
    console.error('❌ Error closing Neo4j driver:', error);
  }
}

// Export the driver getter for advanced use cases
export { getDriver };

// Default export for convenience
export default {
  executeQuery,
  executeWriteTransaction,
  executeReadTransaction,
  verifyConnectivity,
  closeDriver,
  getDriver
};
