const neo4j = require('neo4j-driver');

async function testConnection() {
  console.log('🔍 Testing Neo4j Connection...');
  
  const URI = 'neo4j+s://542fbdb0.databases.neo4j.io';
  const USERNAME = 'neo4j';
  const PASSWORD = '5vPwQdEmopaIHwx9Nn01_mokU1pwAzMZDXsSbLYlspA';
  
  console.log('📍 URI:', URI);
  console.log('👤 Username:', USERNAME);
  console.log('🔑 Password: [REDACTED]');
  
  let driver;
  
  try {
    console.log('🔧 Creating driver...');
    driver = neo4j.driver(URI, neo4j.auth.basic(USERNAME, PASSWORD));
    
    console.log('🔍 Verifying connectivity...');
    await driver.verifyConnectivity();
    console.log('✅ Connection successful!');
    
    console.log('🔍 Testing query...');
    const session = driver.session();
    const result = await session.run('RETURN "Hello Neo4j!" as message');
    console.log('✅ Query result:', result.records[0].get('message'));
    await session.close();
    
    console.log('🎉 Neo4j connection test passed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    if (driver) {
      await driver.close();
    }
  }
}

testConnection();
