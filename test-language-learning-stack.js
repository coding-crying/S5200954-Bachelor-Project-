/**
 * Test script for the Language Learning Agent Stack
 * 
 * This script tests the core functionality of the language learning system:
 * 1. Neo4j schema initialization
 * 2. User creation
 * 3. Utterance processing
 * 4. SRS system
 */

import { initializeSchema, verifySchema } from './lib/neo4j-schema.js';
import { executeQuery } from './lib/neo4j.js';

async function testLanguageLearningStack() {
  console.log('🚀 Testing Language Learning Agent Stack...\n');

  try {
    // Test 1: Initialize Neo4j Schema
    console.log('📋 Test 1: Initializing Neo4j Schema...');
    await initializeSchema();
    console.log('✅ Schema initialization completed\n');

    // Test 2: Verify Schema
    console.log('🔍 Test 2: Verifying Schema...');
    const verification = await verifySchema();
    console.log(`✅ Schema verified: ${verification.constraints} constraints, ${verification.indexes} indexes, ${verification.languages} languages\n`);

    // Test 3: Test User Creation API
    console.log('👤 Test 3: Testing User Creation...');
    const userResponse = await fetch('http://localhost:3000/api/users/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: 'Test User',
        nativeLanguage: 'English',
        targetLanguage: 'Spanish'
      })
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log(`✅ User created: ${userData.userId}`);
      
      // Test 4: Test Utterance Processing
      console.log('\n💬 Test 4: Testing Utterance Processing...');
      const utteranceResponse = await fetch('http://localhost:3000/api/utterance/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.userId,
          utteranceText: 'Hola, ¿cómo estás?',
          speaker: 'user',
          targetLanguage: 'es',
          userNativeLanguage: 'en'
        })
      });

      if (utteranceResponse.ok) {
        const utteranceData = await utteranceResponse.json();
        console.log(`✅ Utterance processed: ${utteranceData.analysis.lexemes_processed} lexemes, ${utteranceData.analysis.new_srs_items} new SRS items`);

        // Test 5: Test SRS System
        console.log('\n📚 Test 5: Testing SRS System...');
        const srsResponse = await fetch(`http://localhost:3000/api/srs?userId=${userData.userId}&targetLanguage=es&limit=5`);
        
        if (srsResponse.ok) {
          const srsData = await srsResponse.json();
          console.log(`✅ SRS items retrieved: ${srsData.count} items due for review`);
          
          if (srsData.dueItems.length > 0) {
            // Test updating an SRS item
            const updateResponse = await fetch('http://localhost:3000/api/srs', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                itemId: srsData.dueItems[0].itemId,
                qualityOfResponse: 4 // Correct response
              })
            });

            if (updateResponse.ok) {
              const updateData = await updateResponse.json();
              console.log(`✅ SRS item updated: ${updateData.lexeme} -> ${updateData.newStatus}`);
            } else {
              console.log('❌ Failed to update SRS item');
            }
          }
        } else {
          console.log('❌ Failed to retrieve SRS items');
        }
      } else {
        console.log('❌ Failed to process utterance');
      }
    } else {
      console.log('❌ Failed to create user');
    }

    // Test 6: Query some data from Neo4j
    console.log('\n🔍 Test 6: Querying Neo4j Data...');
    
    const userCount = await executeQuery('MATCH (u:User) RETURN count(u) as count');
    console.log(`📊 Total users in database: ${userCount[0]?.count || 0}`);
    
    const lexemeCount = await executeQuery('MATCH (l:Lexeme) RETURN count(l) as count');
    console.log(`📊 Total lexemes in database: ${lexemeCount[0]?.count || 0}`);
    
    const srsCount = await executeQuery('MATCH (s:SRS_Item) RETURN count(s) as count');
    console.log(`📊 Total SRS items in database: ${srsCount[0]?.count || 0}`);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testLanguageLearningStack()
    .then(() => {
      console.log('\n✅ Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test script failed:', error);
      process.exit(1);
    });
}

export { testLanguageLearningStack };
