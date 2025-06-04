/**
 * Neo4j Connection Test
 *
 * This script tests the Neo4j connection and verifies credentials
 * before attempting to run the full language learning stack.
 */

import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Override with new credentials for testing
process.env.NEO4J_URI = 'neo4j+s://542fbdb0.databases.neo4j.io';
process.env.NEO4J_USERNAME = 'neo4j';
process.env.NEO4J_PASSWORD = '5vPwQdEmopaIHwx9Nn01_mokU1pwAzMZDXsSbLYlspA';

async function testNeo4jConnection() {
  console.log('🔍 Testing Neo4j Connection...\n');

  const URI = process.env.NEO4J_URI;
  const USERNAME = process.env.NEO4J_USERNAME;
  const PASSWORD = process.env.NEO4J_PASSWORD;

  console.log('📍 URI:', URI);
  console.log('👤 Username:', USERNAME);
  console.log('🔑 Password:', PASSWORD ? '[REDACTED]' : 'NOT SET');
  console.log('');

  if (!URI || !USERNAME || !PASSWORD) {
    console.error('❌ Missing required environment variables!');
    console.log('Please ensure .env.local contains:');
    console.log('NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io');
    console.log('NEO4J_USERNAME=neo4j');
    console.log('NEO4J_PASSWORD=your_password');
    process.exit(1);
  }

  let driver;

  try {
    console.log('🔧 Creating Neo4j driver...');

    // Create driver with explicit configuration
    driver = neo4j.driver(
      URI,
      neo4j.auth.basic(USERNAME, PASSWORD),
      {
        // Connection pool settings
        maxConnectionPoolSize: 50,
        maxTransactionRetryTime: 30000,
        connectionAcquisitionTimeout: 60000
        // Note: Encryption is handled by the +s in the URI, don't specify here
      }
    );

    console.log('✅ Driver created successfully');

    console.log('🔍 Verifying connectivity...');

    // Verify connectivity
    await driver.verifyConnectivity();
    console.log('✅ Connectivity verified successfully');

    console.log('🔍 Testing basic query...');

    // Test a simple query
    const session = driver.session();
    try {
      const result = await session.run('RETURN "Hello Neo4j!" as message, timestamp() as time');
      const record = result.records[0];
      console.log('✅ Query successful:', record.get('message'));
      console.log('📅 Server time:', new Date(record.get('time').toNumber()));
    } finally {
      await session.close();
    }

    console.log('🔍 Checking database info...');

    // Get database information
    const infoSession = driver.session();
    try {
      const dbInfo = await infoSession.run('CALL dbms.components() YIELD name, versions, edition');
      const info = dbInfo.records[0];
      console.log('✅ Database info:');
      console.log('   Name:', info.get('name'));
      console.log('   Version:', info.get('versions')[0]);
      console.log('   Edition:', info.get('edition'));
    } catch (error) {
      console.log('⚠️ Could not get database info (this is normal for some Neo4j versions)');
    } finally {
      await infoSession.close();
    }

    console.log('\n🎉 Neo4j connection test completed successfully!');
    console.log('✅ Your Neo4j database is ready for the Language Learning Stack');

  } catch (error) {
    console.error('\n❌ Neo4j connection test failed:');
    console.error('Error:', error.message);

    if (error.code === 'Neo.ClientError.Security.Unauthorized') {
      console.log('\n🔧 Authentication troubleshooting:');
      console.log('1. Verify your username and password are correct');
      console.log('2. Check if your Neo4j AuraDB instance is running');
      console.log('3. Ensure your IP address is whitelisted in Neo4j Aura');
      console.log('4. Try logging into Neo4j Browser with the same credentials');
    } else if (error.code === 'ServiceUnavailable') {
      console.log('\n🔧 Connection troubleshooting:');
      console.log('1. Check if the Neo4j URI is correct');
      console.log('2. Verify your internet connection');
      console.log('3. Ensure the Neo4j instance is running');
    }

    process.exit(1);
  } finally {
    if (driver) {
      await driver.close();
      console.log('🔌 Driver connection closed');
    }
  }
}

// Run the test
testNeo4jConnection();
