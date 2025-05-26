/**
 * Migration script to add speaker-specific columns to vocabulary.csv
 * 
 * This script adds the new columns for tracking user vs system vocabulary usage:
 * - user_correct_uses
 * - user_total_uses  
 * - system_correct_uses
 * - system_total_uses
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const VOCAB_PATH = path.join(process.cwd(), 'vocabulary.csv');
const BACKUP_PATH = path.join(process.cwd(), 'vocabulary_backup.csv');

function migrateVocabularyCSV() {
  console.log('🔄 Starting vocabulary CSV migration...\n');

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

    // Check if migration is needed
    const firstRecord = records[0];
    if (firstRecord && 'user_correct_uses' in firstRecord) {
      console.log('✅ CSV already migrated - no action needed');
      return true;
    }

    // Create backup
    console.log('💾 Creating backup...');
    fs.copyFileSync(VOCAB_PATH, BACKUP_PATH);
    console.log(`✅ Backup created: ${BACKUP_PATH}`);

    // Migrate records
    console.log('🔄 Migrating records...');
    const migratedRecords = records.map(record => {
      // For existing records, assume all usage was from users (backward compatibility)
      // System usage starts at 0
      return {
        ...record,
        user_correct_uses: record.correct_uses || '0',
        user_total_uses: record.total_uses || '0',
        system_correct_uses: '0',
        system_total_uses: '0'
      };
    });

    // Write the migrated CSV
    console.log('💾 Writing migrated CSV...');
    const csv = stringify(migratedRecords, {
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
    console.log('✅ Migration completed successfully!');

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const verifyContent = fs.readFileSync(VOCAB_PATH, 'utf-8');
    const verifyRecords = parse(verifyContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const sampleRecord = verifyRecords[0];
    if (sampleRecord && 'user_correct_uses' in sampleRecord && 'system_correct_uses' in sampleRecord) {
      console.log('✅ Migration verified - new columns present');
      console.log(`📊 Sample record: ${sampleRecord.word}`);
      console.log(`   - Total uses: ${sampleRecord.total_uses}`);
      console.log(`   - User uses: ${sampleRecord.user_total_uses}`);
      console.log(`   - System uses: ${sampleRecord.system_total_uses}`);
    } else {
      console.error('❌ Migration verification failed');
      return false;
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Records migrated: ${migratedRecords.length}`);
    console.log(`   - Backup created: ${BACKUP_PATH}`);
    console.log(`   - New columns added: user_correct_uses, user_total_uses, system_correct_uses, system_total_uses`);
    console.log('\n💡 Note: All existing usage has been attributed to users for backward compatibility.');
    console.log('   System usage tracking starts fresh from this point forward.');

    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Restore backup if it exists
    if (fs.existsSync(BACKUP_PATH)) {
      console.log('🔄 Restoring backup...');
      fs.copyFileSync(BACKUP_PATH, VOCAB_PATH);
      console.log('✅ Backup restored');
    }
    
    return false;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  const success = migrateVocabularyCSV();
  process.exit(success ? 0 : 1);
}

module.exports = { migrateVocabularyCSV };
