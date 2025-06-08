#!/usr/bin/env node

/**
 * Vocabulary Data Reset Script
 * 
 * This standalone Node.js script resets usage statistics and SRS data
 * in the vocabulary.csv file while preserving the vocabulary words themselves.
 * 
 * Usage: node reset-vocabulary-data.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const VOCAB_FILE = path.join(__dirname, 'vocabulary.csv');
const BACKUP_FILE = path.join(__dirname, `vocabulary_backup_${Date.now()}.csv`);

// Default values for reset columns
const DEFAULT_VALUES = {
  time_last_seen: '',
  correct_uses: '0',
  total_uses: '0',
  user_correct_uses: '0',
  user_total_uses: '0',
  system_correct_uses: '0',
  system_total_uses: '0',
  next_due: '',
  EF: '2.5',
  interval: '1',
  repetitions: '0'
};

// Columns to reset (excluding 'word' which we preserve)
const COLUMNS_TO_RESET = Object.keys(DEFAULT_VALUES);

/**
 * Parse CSV content into array of objects
 */
function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].split(',');
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue; // Skip empty lines
    
    const values = lines[i].split(',');
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Convert array of objects back to CSV content
 */
function arrayToCSV(headers, rows) {
  const csvLines = [headers.join(',')];
  
  rows.forEach(row => {
    const values = headers.map(header => row[header] || '');
    csvLines.push(values.join(','));
  });
  
  return csvLines.join('\n') + '\n';
}

/**
 * Reset vocabulary data columns to default values
 */
function resetVocabularyData(rows) {
  let resetCount = 0;
  
  rows.forEach(row => {
    if (row.word && row.word.trim() !== '') {
      COLUMNS_TO_RESET.forEach(column => {
        if (row.hasOwnProperty(column)) {
          row[column] = DEFAULT_VALUES[column];
        }
      });
      resetCount++;
    }
  });
  
  return resetCount;
}

/**
 * Create a backup of the original file
 */
function createBackup() {
  try {
    fs.copyFileSync(VOCAB_FILE, BACKUP_FILE);
    console.log(`✅ Backup created: ${path.basename(BACKUP_FILE)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create backup: ${error.message}`);
    return false;
  }
}

/**
 * Prompt user for confirmation
 */
function promptConfirmation() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n🔄 VOCABULARY DATA RESET');
    console.log('=====================================');
    console.log(`📁 Target file: ${VOCAB_FILE}`);
    console.log(`📋 Columns to reset: ${COLUMNS_TO_RESET.join(', ')}`);
    console.log('⚠️  This will reset all usage statistics and SRS data!');
    console.log('✅ Vocabulary words themselves will be preserved');
    console.log('💾 A backup will be created automatically\n');

    rl.question('Are you sure you want to proceed? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Check if vocabulary file exists
    if (!fs.existsSync(VOCAB_FILE)) {
      console.error(`❌ Vocabulary file not found: ${VOCAB_FILE}`);
      process.exit(1);
    }

    // Get user confirmation
    const confirmed = await promptConfirmation();
    if (!confirmed) {
      console.log('❌ Operation cancelled by user');
      process.exit(0);
    }

    console.log('\n🚀 Starting vocabulary data reset...\n');

    // Create backup
    if (!createBackup()) {
      console.error('❌ Cannot proceed without backup');
      process.exit(1);
    }

    // Read and parse CSV file
    console.log('📖 Reading vocabulary file...');
    const content = fs.readFileSync(VOCAB_FILE, 'utf8');
    const { headers, rows } = parseCSV(content);

    console.log(`📊 Found ${rows.length} vocabulary entries`);

    // Validate required columns exist
    const missingColumns = COLUMNS_TO_RESET.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      console.warn(`⚠️  Missing columns: ${missingColumns.join(', ')}`);
    }

    // Reset the data
    console.log('🔄 Resetting vocabulary data...');
    const resetCount = resetVocabularyData(rows);

    // Convert back to CSV and write file
    console.log('💾 Writing updated file...');
    const updatedCSV = arrayToCSV(headers, rows);
    fs.writeFileSync(VOCAB_FILE, updatedCSV);

    // Success summary
    console.log('\n✅ RESET COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log(`📊 Words processed: ${resetCount}`);
    console.log(`📋 Columns reset: ${COLUMNS_TO_RESET.length}`);
    console.log(`💾 Backup saved as: ${path.basename(BACKUP_FILE)}`);
    console.log(`📁 Updated file: ${path.basename(VOCAB_FILE)}`);
    
    console.log('\n🔄 Reset columns:');
    COLUMNS_TO_RESET.forEach(column => {
      console.log(`   • ${column} → "${DEFAULT_VALUES[column]}"`);
    });

    console.log('\n✅ All vocabulary usage statistics and SRS data have been reset to defaults.');
    console.log('📚 Vocabulary words themselves remain unchanged.');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Execute the script
if (require.main === module) {
  main();
}

module.exports = { resetVocabularyData, parseCSV, arrayToCSV };
