/**
 * Test script for the language processor pipeline
 * 
 * This script tests the language processor API endpoint by sending sample text
 * and verifying that it correctly extracts basic word forms.
 * 
 * Run with: node test-language-processor.js
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Sample text to process
const sampleText = `
I was walking through the forest yesterday when I saw a beautiful deer. 
It was eating some berries from a bush. When it noticed me, it ran away quickly.
I tried to follow it, but it disappeared among the trees. 
I hope I'll see it again someday.
`;

// Function to test the language processor API
async function testLanguageProcessor() {
  try {
    console.log('Testing language processor API...');
    console.log('Sample text:', sampleText);
    
    // Call the API
    const response = await fetch('http://localhost:3000/api/language/words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: sampleText }),
    });
    
    // Parse the response
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API call successful');
      console.log('Words extracted:', result.wordsExtracted.length);
      console.log('Words updated:', result.wordsUpdated.length);
      
      // Print the extracted words
      console.log('\nExtracted words:');
      result.wordsExtracted.forEach(word => {
        console.log(`- ${word.word} → ${word.base_form} (${word.part_of_speech})`);
      });
      
      // Check if the CSV file exists
      const csvPath = path.join(process.cwd(), 'languageWords.csv');
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        console.log('\nCSV file content:');
        console.log(csvContent);
      } else {
        console.log('\n❌ CSV file not found');
      }
    } else {
      console.log('❌ API call failed:', result.error);
    }
  } catch (error) {
    console.error('Error testing language processor:', error);
  }
}

// Run the test
testLanguageProcessor();
