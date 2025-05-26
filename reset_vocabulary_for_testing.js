/**
 * Utility script to reset some vocabulary words to unintroduced status for testing
 * 
 * This script resets the time_last_seen field for some words to '0' so that
 * the word introducer agent has words to introduce.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const VOCAB_PATH = path.join(process.cwd(), 'vocabulary.csv');
const BACKUP_PATH = path.join(process.cwd(), 'vocabulary_backup_before_reset.csv');

function resetVocabularyForTesting(wordsToReset = 10) {
  console.log('🔄 Resetting vocabulary words for testing...\n');

  try {
    // Check if the file exists
    if (!fs.existsSync(VOCAB_PATH)) {
      console.error('❌ vocabulary.csv not found!');
      return false;
    }

    // Read the current CSV file
    console.log('📖 Reading current vocabulary.csv...');
    const fileContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
    
    // Parse the CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`📊 Found ${records.length} vocabulary words`);

    // Create backup
    console.log('💾 Creating backup...');
    fs.copyFileSync(VOCAB_PATH, BACKUP_PATH);
    console.log(`✅ Backup created: ${BACKUP_PATH}`);

    // Find words that have been introduced (time_last_seen > 0)
    const introducedWords = records.filter(record => 
      record.time_last_seen && record.time_last_seen !== '0'
    );

    console.log(`📊 Found ${introducedWords.length} introduced words`);

    if (introducedWords.length === 0) {
      console.log('✅ All words are already unintroduced - no reset needed');
      return true;
    }

    // Reset the specified number of words
    const wordsToResetCount = Math.min(wordsToReset, introducedWords.length);
    console.log(`🔄 Resetting ${wordsToResetCount} words to unintroduced status...`);

    // Shuffle the introduced words and take the first N
    const shuffledWords = [...introducedWords].sort(() => Math.random() - 0.5);
    const wordsToResetList = shuffledWords.slice(0, wordsToResetCount);

    // Create a map for faster lookups
    const resetWordMap = new Set(wordsToResetList.map(w => w.word.toLowerCase()));

    // Reset the selected words
    let resetCount = 0;
    const updatedRecords = records.map(record => {
      if (resetWordMap.has(record.word.toLowerCase())) {
        resetCount++;
        console.log(`   Resetting: ${record.word} (was last seen: ${new Date(parseInt(record.time_last_seen)).toLocaleString()})`);
        return {
          ...record,
          time_last_seen: '0',
          next_due: '0'
        };
      }
      return record;
    });

    // Write the updated CSV
    console.log('\n💾 Writing updated CSV...');
    const csv = stringify(updatedRecords, {
      header: true,
      columns: [
        'word',
        'time_last_seen',
        'correct_uses',
        'total_uses',
        'user_correct_uses',
        'user_total_uses',
        'system_correct_uses',
        'system_total_uses',
        'next_due',
        'EF',
        'interval',
        'repetitions',
      ],
    });

    fs.writeFileSync(VOCAB_PATH, csv);
    console.log('✅ Reset completed successfully!');

    // Verify the reset
    console.log('\n🔍 Verifying reset...');
    const verifyContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
    const verifyRecords = parse(verifyContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const unintroducedCount = verifyRecords.filter(record => 
      !record.time_last_seen || record.time_last_seen === '0'
    ).length;

    console.log(`✅ Reset verified - ${unintroducedCount} words are now unintroduced`);

    console.log('\n🎉 Reset completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Words reset: ${resetCount}`);
    console.log(`   - Unintroduced words available: ${unintroducedCount}`);
    console.log(`   - Backup created: ${BACKUP_PATH}`);
    console.log('\n💡 The word introducer agent should now have words to introduce!');

    return true;

  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    
    // Restore backup if it exists
    if (fs.existsSync(BACKUP_PATH)) {
      console.log('🔄 Restoring backup...');
      fs.copyFileSync(BACKUP_PATH, VOCAB_PATH);
      console.log('✅ Backup restored');
    }
    
    return false;
  }
}

function showVocabularyStatus() {
  console.log('📊 Checking vocabulary status...\n');

  try {
    if (!fs.existsSync(VOCAB_PATH)) {
      console.error('❌ vocabulary.csv not found!');
      return;
    }

    const fileContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const unintroducedWords = records.filter(record => 
      !record.time_last_seen || record.time_last_seen === '0'
    );

    const introducedWords = records.filter(record => 
      record.time_last_seen && record.time_last_seen !== '0'
    );

    console.log(`📊 Vocabulary Status:`);
    console.log(`   Total words: ${records.length}`);
    console.log(`   Unintroduced words: ${unintroducedWords.length}`);
    console.log(`   Introduced words: ${introducedWords.length}`);

    if (unintroducedWords.length > 0) {
      console.log('\n📚 Sample unintroduced words:');
      unintroducedWords.slice(0, 10).forEach((word, index) => {
        console.log(`   ${index + 1}. ${word.word}`);
      });
    } else {
      console.log('\n⚠️  No unintroduced words available for the word introducer!');
      console.log('💡 Run this script with a number to reset some words:');
      console.log('   node reset_vocabulary_for_testing.js 10');
    }

  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  // No arguments - show status
  showVocabularyStatus();
} else if (args[0] === 'status') {
  // Show status
  showVocabularyStatus();
} else {
  // Reset with specified number of words
  const wordsToReset = parseInt(args[0], 10);
  
  if (isNaN(wordsToReset) || wordsToReset <= 0) {
    console.error('❌ Please provide a valid number of words to reset');
    console.log('Usage: node reset_vocabulary_for_testing.js [number]');
    console.log('Example: node reset_vocabulary_for_testing.js 10');
    process.exit(1);
  }
  
  const success = resetVocabularyForTesting(wordsToReset);
  process.exit(success ? 0 : 1);
}

module.exports = { resetVocabularyForTesting, showVocabularyStatus };
