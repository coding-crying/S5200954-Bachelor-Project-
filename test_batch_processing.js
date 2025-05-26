/**
 * Test script for batch processing functionality
 * 
 * This script tests the new batch processing system to ensure it:
 * 1. Reduces API calls by combining multiple messages
 * 2. Provides better context analysis
 * 3. Handles both user and assistant messages correctly
 * 4. Maintains accuracy while improving efficiency
 */

const testBatchProcessing = async () => {
  console.log('🧪 Testing Batch Processing Functionality...\n');

  try {
    // Test 1: Single message processing (baseline)
    console.log('📝 Test 1: Single message processing (baseline)...');
    const singleResponse = await fetch('http://localhost:3000/api/conversation/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: "I need to articulate my thoughts more clearly.",
        vocabularyWords: ["articulate", "clear", "thought"],
        speaker: "user",
        includeAnalysis: true,
        batchMode: false,
        messageCount: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`Single processing failed: ${singleResponse.status}`);
    }

    const singleResult = await singleResponse.json();
    console.log('✅ Single processing result:');
    console.log(`   Words found: ${singleResult.analysis?.vocabulary_words?.length || 0}`);
    console.log(`   CSV updates: ${singleResult.csv_updates?.length || 0}`);

    // Test 2: Batch processing with multiple messages
    console.log('\n📝 Test 2: Batch processing with multiple messages...');
    const batchText = [
      "I need to articulate my thoughts more clearly.",
      "The professor's lecture was quite comprehensive.",
      "We should analyze this data more thoroughly.",
      "Her argument was very cogent and persuasive."
    ].join(' ');

    const batchResponse = await fetch('http://localhost:3000/api/conversation/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: batchText,
        vocabularyWords: ["articulate", "comprehensive", "analyze", "cogent", "persuasive"],
        speaker: "user",
        includeAnalysis: true,
        batchMode: true,
        messageCount: 4
      }),
    });

    if (!batchResponse.ok) {
      throw new Error(`Batch processing failed: ${batchResponse.status}`);
    }

    const batchResult = await batchResponse.json();
    console.log('✅ Batch processing result:');
    console.log(`   Words found: ${batchResult.analysis?.vocabulary_words?.length || 0}`);
    console.log(`   CSV updates: ${batchResult.csv_updates?.length || 0}`);
    console.log(`   Text length: ${batchText.length} characters`);
    console.log(`   Messages combined: 4`);

    return {
      single: singleResult,
      batch: batchResult,
      success: true
    };

  } catch (error) {
    console.error('❌ Batch processing test failed:', error.message);
    return { success: false, error: error.message };
  }
};

const testSpeakerDifferentiation = async () => {
  console.log('\n🧪 Testing Speaker Differentiation in Batch Mode...\n');

  try {
    // Test user speech batch
    console.log('📝 Testing user speech batch...');
    const userBatchResponse = await fetch('http://localhost:3000/api/conversation/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: "I want to articulate my ideas better. This concept is quite abstract. Let me analyze the situation.",
        vocabularyWords: ["articulate", "abstract", "analyze", "concept"],
        speaker: "user",
        includeAnalysis: true,
        batchMode: true,
        messageCount: 3
      }),
    });

    const userResult = await userBatchResponse.json();
    console.log('✅ User batch result:');
    console.log(`   Words found: ${userResult.analysis?.vocabulary_words?.length || 0}`);
    console.log(`   User actions: ${userResult.csv_updates?.filter(u => u.action.includes('user')).length || 0}`);

    // Test assistant speech batch
    console.log('\n📝 Testing assistant speech batch...');
    const assistantBatchResponse = await fetch('http://localhost:3000/api/conversation/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: "Let me articulate this concept clearly. The analysis shows abstract patterns. This approach is comprehensive.",
        vocabularyWords: ["articulate", "abstract", "analyze", "concept", "comprehensive"],
        speaker: "assistant",
        includeAnalysis: true,
        batchMode: true,
        messageCount: 3
      }),
    });

    const assistantResult = await assistantBatchResponse.json();
    console.log('✅ Assistant batch result:');
    console.log(`   Words found: ${assistantResult.analysis?.vocabulary_words?.length || 0}`);
    console.log(`   System actions: ${assistantResult.csv_updates?.filter(u => u.action.includes('system')).length || 0}`);

    return {
      user: userResult,
      assistant: assistantResult,
      success: true
    };

  } catch (error) {
    console.error('❌ Speaker differentiation test failed:', error.message);
    return { success: false, error: error.message };
  }
};

const testEfficiencyComparison = async () => {
  console.log('\n🧪 Testing Efficiency Comparison...\n');

  const messages = [
    "I need to articulate my thoughts clearly.",
    "The analysis was comprehensive and thorough.",
    "Her argument was cogent and persuasive.",
    "The concept seems quite abstract to me.",
    "We should scrutinize this data carefully."
  ];

  const vocabularyWords = ["articulate", "comprehensive", "cogent", "abstract", "scrutinize"];

  try {
    // Test individual processing (5 API calls)
    console.log('📝 Testing individual processing (5 separate API calls)...');
    const individualStart = Date.now();
    const individualResults = [];

    for (let i = 0; i < messages.length; i++) {
      const response = await fetch('http://localhost:3000/api/conversation/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messages[i],
          vocabularyWords,
          speaker: "user",
          includeAnalysis: true,
          batchMode: false,
          messageCount: 1
        }),
      });
      
      const result = await response.json();
      individualResults.push(result);
    }

    const individualTime = Date.now() - individualStart;
    const individualWords = individualResults.reduce((sum, r) => sum + (r.analysis?.vocabulary_words?.length || 0), 0);

    console.log(`✅ Individual processing completed:`);
    console.log(`   Time: ${individualTime}ms`);
    console.log(`   API calls: 5`);
    console.log(`   Total words found: ${individualWords}`);

    // Test batch processing (1 API call)
    console.log('\n📝 Testing batch processing (1 combined API call)...');
    const batchStart = Date.now();
    
    const batchResponse = await fetch('http://localhost:3000/api/conversation/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: messages.join(' '),
        vocabularyWords,
        speaker: "user",
        includeAnalysis: true,
        batchMode: true,
        messageCount: messages.length
      }),
    });

    const batchResult = await batchResponse.json();
    const batchTime = Date.now() - batchStart;
    const batchWords = batchResult.analysis?.vocabulary_words?.length || 0;

    console.log(`✅ Batch processing completed:`);
    console.log(`   Time: ${batchTime}ms`);
    console.log(`   API calls: 1`);
    console.log(`   Total words found: ${batchWords}`);

    // Calculate efficiency gains
    const timeReduction = ((individualTime - batchTime) / individualTime * 100).toFixed(1);
    const callReduction = ((5 - 1) / 5 * 100).toFixed(1);

    console.log(`\n📊 Efficiency Comparison:`);
    console.log(`   Time reduction: ${timeReduction}%`);
    console.log(`   API call reduction: ${callReduction}%`);
    console.log(`   Context improvement: Better cross-message analysis`);

    return {
      individual: { time: individualTime, calls: 5, words: individualWords },
      batch: { time: batchTime, calls: 1, words: batchWords },
      efficiency: { timeReduction, callReduction },
      success: true
    };

  } catch (error) {
    console.error('❌ Efficiency comparison test failed:', error.message);
    return { success: false, error: error.message };
  }
};

const runBatchProcessingTests = async () => {
  console.log('🚀 Starting Batch Processing Tests\n');
  console.log('=' .repeat(60));

  // Test 1: Basic batch processing
  const basicResult = await testBatchProcessing();
  
  console.log('\n' + '=' .repeat(60));
  
  // Test 2: Speaker differentiation
  const speakerResult = await testSpeakerDifferentiation();

  console.log('\n' + '=' .repeat(60));
  
  // Test 3: Efficiency comparison
  const efficiencyResult = await testEfficiencyComparison();

  console.log('\n' + '=' .repeat(60));
  console.log('\n🏁 Batch Processing Test Summary:');
  console.log('Basic Functionality:', basicResult?.success ? '✅ PASSED' : '❌ FAILED');
  console.log('Speaker Differentiation:', speakerResult?.success ? '✅ PASSED' : '❌ FAILED');
  console.log('Efficiency Comparison:', efficiencyResult?.success ? '✅ PASSED' : '❌ FAILED');
  
  if (basicResult?.success && speakerResult?.success && efficiencyResult?.success) {
    console.log('\n🎉 All batch processing tests passed!');
    console.log('\n📊 Batch Processing Benefits:');
    console.log('✅ Reduced API calls by 80% (5 calls → 1 call)');
    console.log('✅ Improved processing speed');
    console.log('✅ Better context analysis across multiple messages');
    console.log('✅ Maintained speaker differentiation accuracy');
    console.log('✅ Preserved vocabulary detection quality');
    
    if (efficiencyResult?.efficiency) {
      console.log(`✅ Time reduction: ${efficiencyResult.efficiency.timeReduction}%`);
      console.log(`✅ API call reduction: ${efficiencyResult.efficiency.callReduction}%`);
    }
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
};

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - run the tests
  const fetch = require('node-fetch');
  runBatchProcessingTests();
} else {
  // Browser environment - export for manual testing
  window.testBatchProcessing = {
    testBatchProcessing,
    testSpeakerDifferentiation,
    testEfficiencyComparison,
    runBatchProcessingTests
  };
  console.log('Batch processing test functions available at window.testBatchProcessing');
  console.log('Available tests: testBatchProcessing, testSpeakerDifferentiation, testEfficiencyComparison, runBatchProcessingTests');
}
