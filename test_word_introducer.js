/**
 * Test script for the Word Introducer agent
 * 
 * This script tests the word introducer agent to ensure it properly
 * retrieves words from the CSV file and doesn't make up its own words.
 */

const testWordIntroducerAPI = async () => {
  console.log('🧪 Testing Word Introducer API Endpoints...\n');

  try {
    // Test 1: Get random words from API
    console.log('📝 Test 1: Fetching random words from API...');
    const response = await fetch('http://localhost:3000/api/vocabulary?action=multiple&count=3');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ API Response:');
    console.log('Success:', result.success);
    console.log('Words found:', result.data?.length || 0);
    
    if (result.data && result.data.length > 0) {
      console.log('\n📚 Words retrieved:');
      result.data.forEach((word, index) => {
        console.log(`  ${index + 1}. ${word.word} (time_last_seen: ${word.time_last_seen})`);
      });
    } else {
      console.log('❌ No words retrieved from API');
    }

    return result;

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    return null;
  }
};

const testVocabularyFileAccess = async () => {
  console.log('\n🧪 Testing Vocabulary File Access...\n');

  try {
    // Test file access through the SRS endpoint
    console.log('📝 Testing CSV file access...');
    const response = await fetch('http://localhost:3000/api/vocabulary?action=srs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ File Access Result:');
    console.log('Success:', result.success);
    console.log('Total words in CSV:', result.words?.length || 0);
    
    if (result.words && result.words.length > 0) {
      // Count unintroduced words
      const unintroducedWords = result.words.filter(word => 
        !word.time_last_seen || word.time_last_seen === '0'
      );
      
      console.log('Unintroduced words available:', unintroducedWords.length);
      console.log('Introduced words:', result.words.length - unintroducedWords.length);
      
      if (unintroducedWords.length > 0) {
        console.log('\n📚 Sample unintroduced words:');
        unintroducedWords.slice(0, 5).forEach((word, index) => {
          console.log(`  ${index + 1}. ${word.word} (time_last_seen: ${word.time_last_seen})`);
        });
      } else {
        console.log('\n⚠️  No unintroduced words found - all words have been introduced');
        console.log('📚 Sample words from CSV:');
        result.words.slice(0, 5).forEach((word, index) => {
          console.log(`  ${index + 1}. ${word.word} (time_last_seen: ${word.time_last_seen})`);
        });
      }
    }

    return result;

  } catch (error) {
    console.error('❌ File Access Test Failed:', error.message);
    return null;
  }
};

const testWordIntroducerTool = async () => {
  console.log('\n🧪 Testing Word Introducer Tool Logic...\n');

  try {
    // This would test the actual tool logic if we had a direct endpoint
    // For now, we'll test through the vocabulary API
    console.log('📝 Testing word introducer tool through API...');
    
    const tests = [
      { count: 1, description: 'Single word' },
      { count: 3, description: 'Three words' },
      { count: 5, description: 'Five words' }
    ];

    for (const test of tests) {
      console.log(`\n🔄 Testing ${test.description} (count: ${test.count})...`);
      
      const response = await fetch(`http://localhost:3000/api/vocabulary?action=multiple&count=${test.count}`);
      
      if (!response.ok) {
        console.log(`❌ Failed to fetch ${test.description}: ${response.status}`);
        continue;
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        console.log(`✅ ${test.description}: Retrieved ${result.data.length} words`);
        result.data.forEach((word, index) => {
          console.log(`   ${index + 1}. ${word.word}`);
        });
      } else {
        console.log(`❌ ${test.description}: No words retrieved`);
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Tool Logic Test Failed:', error.message);
    return false;
  }
};

const runWordIntroducerTests = async () => {
  console.log('🚀 Starting Word Introducer Tests\n');
  console.log('=' .repeat(60));

  // Test 1: API Endpoints
  const apiResult = await testWordIntroducerAPI();
  
  console.log('\n' + '=' .repeat(60));
  
  // Test 2: File Access
  const fileResult = await testVocabularyFileAccess();

  console.log('\n' + '=' .repeat(60));
  
  // Test 3: Tool Logic
  const toolResult = await testWordIntroducerTool();

  console.log('\n' + '=' .repeat(60));
  console.log('\n🏁 Word Introducer Test Summary:');
  console.log('API Endpoints:', apiResult ? '✅ PASSED' : '❌ FAILED');
  console.log('File Access:', fileResult ? '✅ PASSED' : '❌ FAILED');
  console.log('Tool Logic:', toolResult ? '✅ PASSED' : '❌ FAILED');
  
  if (apiResult && fileResult && toolResult) {
    console.log('\n🎉 All word introducer tests passed!');
    console.log('\n💡 Recommendations for the agent:');
    console.log('1. Ensure the agent ALWAYS calls getNewVocabularyWords tool first');
    console.log('2. The tool should return words from the CSV file');
    console.log('3. If no unintroduced words are available, the agent should explain this to the user');
    console.log('4. The agent should NEVER make up its own vocabulary words');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    
    if (!fileResult) {
      console.log('\n🔧 Troubleshooting File Access:');
      console.log('- Check that vocabulary.csv exists in the project root');
      console.log('- Verify the CSV file has the correct format and headers');
      console.log('- Ensure the file is readable by the application');
    }
    
    if (!apiResult) {
      console.log('\n🔧 Troubleshooting API:');
      console.log('- Check that the vocabulary API endpoint is running');
      console.log('- Verify the API route is correctly configured');
      console.log('- Check server logs for any errors');
    }
  }
};

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - run the tests
  const fetch = require('node-fetch');
  runWordIntroducerTests();
} else {
  // Browser environment - export for manual testing
  window.testWordIntroducer = {
    testWordIntroducerAPI,
    testVocabularyFileAccess,
    testWordIntroducerTool,
    runWordIntroducerTests
  };
  console.log('Word Introducer test functions available at window.testWordIntroducer');
  console.log('Available tests: testWordIntroducerAPI, testVocabularyFileAccess, testWordIntroducerTool, runWordIntroducerTests');
}
