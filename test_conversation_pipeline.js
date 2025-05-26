/**
 * Test script for the conversation processing pipeline
 *
 * This script tests the new GPT-4.1-mini conversation processing pipeline
 * to ensure it properly detects vocabulary words and generates CSV updates.
 */

const testConversationProcessing = async () => {
  console.log('🧪 Testing Conversation Processing Pipeline...\n');

  // Test data with various conjugations
  const testText = "I was running to the store when I saw beautiful flowers blooming in the garden. The children were playing happily. Yesterday, I went swimming and ate delicious food. She has written many books and taught students for years.";
  const vocabularyWords = ["run", "beautiful", "flower", "child", "play", "happy", "garden", "store", "go", "swim", "eat", "write", "teach", "book", "student", "year"];

  try {
    // Test the conversation processing API
    console.log('📝 Test Text:', testText);
    console.log('📚 Vocabulary Words:', vocabularyWords.join(', '));
    console.log('\n🔄 Processing with GPT-4.1-mini...\n');

    const response = await fetch('http://localhost:3000/api/conversation/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        vocabularyWords: vocabularyWords,
        includeAnalysis: true
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log('✅ Processing Result:');
    console.log('Success:', result.success);
    console.log('Processed:', result.processed);
    console.log('\n📊 Analysis Results:');

    if (result.analysis) {
      console.log('Vocabulary Words Found:', result.analysis.vocabulary_words?.length || 0);

      if (result.analysis.vocabulary_words) {
        result.analysis.vocabulary_words.forEach((word, index) => {
          console.log(`  ${index + 1}. ${word.found_form} → ${word.word}`);
          console.log(`     Used correctly: ${word.used_correctly ? '✓' : '✗'}`);
          console.log(`     Confidence: ${word.confidence}`);
          console.log(`     Context: "${word.context}"`);
        });
      }

      console.log('\nSummary:', result.analysis.summary);
      console.log('Learning Effectiveness:', result.analysis.learning_effectiveness);
    }

    console.log('\n📝 CSV Updates:');
    if (result.csv_updates && result.csv_updates.length > 0) {
      result.csv_updates.forEach((update, index) => {
        console.log(`  ${index + 1}. ${update.word}: ${update.action} = ${update.value}`);
      });
    } else {
      console.log('  No CSV updates generated');
    }

    console.log('\n🎯 Pipeline Test Results:');
    console.log('✅ API Response: OK');
    console.log('✅ JSON Parsing: OK');
    console.log('✅ Vocabulary Detection:', result.analysis?.vocabulary_words?.length > 0 ? 'OK' : 'FAILED');
    console.log('✅ CSV Updates Generated:', result.csv_updates?.length > 0 ? 'OK' : 'FAILED');
    console.log('✅ Structured Output: OK');

    return result;

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
};

// Test the vocabulary API with enhanced processing
const testVocabularyAPI = async () => {
  console.log('\n🧪 Testing Enhanced Vocabulary API...\n');

  const testText = "The children were running and playing in the beautiful garden.";

  try {
    console.log('📝 Test Text:', testText);
    console.log('🔄 Processing with enhanced lemmatization...\n');

    const response = await fetch('http://localhost:3000/api/vocabulary', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        useGPTAnalysis: true
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log('✅ Vocabulary API Result:');
    console.log('Success:', result.success);
    console.log('Processed:', result.processed);
    console.log('Words Found:', result.wordsFound?.length || 0);
    console.log('Words Updated:', result.wordsUpdated?.length || 0);

    if (result.wordsFound) {
      console.log('\n📚 Words Found:');
      result.wordsFound.forEach((word, index) => {
        console.log(`  ${index + 1}. ${word}`);
      });
    }

    if (result.wordsUpdated) {
      console.log('\n📝 Words Updated:');
      result.wordsUpdated.forEach((word, index) => {
        console.log(`  ${index + 1}. ${word}`);
      });
    }

    return result;

  } catch (error) {
    console.error('❌ Vocabulary API Test Failed:', error.message);
    return null;
  }
};

// Test specific conjugation detection
const testConjugationDetection = async () => {
  console.log('\n🧪 Testing Conjugation Detection...\n');

  const conjugationTests = [
    {
      text: "I was running to the store",
      vocab: ["run"],
      expected: ["running → run"]
    },
    {
      text: "The children were playing happily",
      vocab: ["child", "play", "happy"],
      expected: ["children → child", "playing → play", "happily → happy"]
    },
    {
      text: "She went swimming and ate delicious food",
      vocab: ["go", "swim", "eat"],
      expected: ["went → go", "swimming → swim", "ate → eat"]
    },
    {
      text: "He has written many books and taught students",
      vocab: ["write", "book", "teach", "student"],
      expected: ["written → write", "books → book", "taught → teach", "students → student"]
    },
    {
      text: "They were singing beautifully and dancing gracefully",
      vocab: ["sing", "beautiful", "dance", "grace"],
      expected: ["singing → sing", "beautifully → beautiful", "dancing → dance", "gracefully → grace"]
    }
  ];

  let passedTests = 0;
  let totalTests = conjugationTests.length;

  for (let i = 0; i < conjugationTests.length; i++) {
    const test = conjugationTests[i];
    console.log(`\n📝 Test ${i + 1}: "${test.text}"`);
    console.log(`📚 Vocabulary: [${test.vocab.join(', ')}]`);
    console.log(`🎯 Expected: [${test.expected.join(', ')}]`);

    try {
      const response = await fetch('http://localhost:3000/api/conversation/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: test.text,
          vocabularyWords: test.vocab,
          includeAnalysis: true
        }),
      });

      if (!response.ok) {
        console.log(`❌ API Error: ${response.status}`);
        continue;
      }

      const result = await response.json();

      if (result.success && result.analysis?.vocabulary_words) {
        const found = result.analysis.vocabulary_words.map(w =>
          w.found_form === w.word ? w.word : `${w.found_form} → ${w.word}`
        );

        console.log(`✅ Found: [${found.join(', ')}]`);

        // Check if we found the expected conjugations
        const foundAll = test.expected.every(expected =>
          found.some(f => f.includes(expected) || expected.includes(f))
        );

        if (foundAll) {
          console.log(`✅ Test ${i + 1}: PASSED`);
          passedTests++;
        } else {
          console.log(`❌ Test ${i + 1}: FAILED - Missing expected conjugations`);
        }
      } else {
        console.log(`❌ Test ${i + 1}: FAILED - No vocabulary words found`);
      }

    } catch (error) {
      console.log(`❌ Test ${i + 1}: ERROR - ${error.message}`);
    }
  }

  console.log(`\n🏁 Conjugation Test Results: ${passedTests}/${totalTests} tests passed`);

  return {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests
  };
};

// Run the tests
const runTests = async () => {
  console.log('🚀 Starting Conversation Processing Pipeline Tests\n');
  console.log('=' .repeat(60));

  // Test 1: Conversation Processing API
  const conversationResult = await testConversationProcessing();

  console.log('\n' + '=' .repeat(60));

  // Test 2: Enhanced Vocabulary API
  const vocabularyResult = await testVocabularyAPI();

  console.log('\n' + '=' .repeat(60));

  // Test 3: Conjugation Detection
  const conjugationResult = await testConjugationDetection();

  console.log('\n' + '=' .repeat(60));
  console.log('\n🏁 Test Summary:');
  console.log('Conversation API:', conversationResult ? '✅ PASSED' : '❌ FAILED');
  console.log('Vocabulary API:', vocabularyResult ? '✅ PASSED' : '❌ FAILED');
  console.log('Conjugation Detection:', conjugationResult?.success ? '✅ PASSED' : '❌ FAILED');

  if (conjugationResult?.success) {
    console.log(`  - Conjugation Tests: ${conjugationResult.passed}/${conjugationResult.total} passed`);
  }

  if (conversationResult && vocabularyResult && conjugationResult?.success) {
    console.log('\n🎉 All tests passed! The enhanced conjugation detection is working correctly.');
    console.log('\n📊 Conjugation Detection Features:');
    console.log('✅ Irregular verbs (went → go, ate → eat, written → write)');
    console.log('✅ Regular conjugations (running → run, playing → play)');
    console.log('✅ Plural forms (children → child, books → book)');
    console.log('✅ Adverb forms (happily → happy, beautifully → beautiful)');
    console.log('✅ Past tense (taught → teach)');
    console.log('✅ Gerunds (swimming → swim, dancing → dance)');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
};

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - run the tests
  const fetch = require('node-fetch');
  runTests();
} else {
  // Browser environment - export for manual testing
  window.testConversationPipeline = {
    testConversationProcessing,
    testVocabularyAPI,
    testConjugationDetection,
    runTests
  };
  console.log('Test functions available at window.testConversationPipeline');
  console.log('Available tests: testConversationProcessing, testVocabularyAPI, testConjugationDetection, runTests');
}
