# Vocabulary Data Reset Script

This standalone Node.js script resets usage statistics and SRS (Spaced Repetition System) data in the `vocabulary.csv` file while preserving the vocabulary words themselves.

## 🎯 Purpose

The script is designed for the language learning system to reset vocabulary tracking data when you want to:
- Start fresh with vocabulary practice statistics
- Clear all usage history and SRS progress
- Reset learning progress while keeping the vocabulary words

## 📁 Files

- `reset-vocabulary-data.js` - Main reset script
- `test-reset-script.js` - Test script to verify functionality
- `README-vocabulary-reset.md` - This documentation

## 🚀 Usage

### Basic Usage
```bash
node reset-vocabulary-data.js
```

### Test the Script (Safe)
```bash
node test-reset-script.js
```

## 🔄 What Gets Reset

The script resets the following columns to their default values:

| Column | Reset Value | Description |
|--------|-------------|-------------|
| `time_last_seen` | `""` (empty) | Last time word was encountered |
| `correct_uses` | `"0"` | Number of correct uses |
| `total_uses` | `"0"` | Total number of uses |
| `user_correct_uses` | `"0"` | User's correct uses |
| `user_total_uses` | `"0"` | User's total uses |
| `system_correct_uses` | `"0"` | System's correct uses |
| `system_total_uses` | `"0"` | System's total uses |
| `next_due` | `""` (empty) | Next review due date |
| `EF` | `"2.5"` | Easiness Factor (Anki default) |
| `interval` | `"1"` | Review interval in days |
| `repetitions` | `"0"` | Number of repetitions |

## ✅ What's Preserved

- **Vocabulary words** (`word` column) - All vocabulary words remain unchanged
- **File structure** - CSV format and column order maintained
- **File location** - Original file is updated in place

## 🛡️ Safety Features

1. **Confirmation Prompt** - Asks for user confirmation before proceeding
2. **Automatic Backup** - Creates a timestamped backup file before making changes
3. **Error Handling** - Comprehensive error checking and reporting
4. **Validation** - Verifies file exists and has expected structure

## 📊 Example Output

```
🔄 VOCABULARY DATA RESET
=====================================
📁 Target file: vocabulary.csv
📋 Columns to reset: time_last_seen, correct_uses, total_uses, ...
⚠️  This will reset all usage statistics and SRS data!
✅ Vocabulary words themselves will be preserved
💾 A backup will be created automatically

Are you sure you want to proceed? (yes/no): yes

🚀 Starting vocabulary data reset...

✅ Backup created: vocabulary_backup_1704067200000.csv
📖 Reading vocabulary file...
📊 Found 100 vocabulary entries
🔄 Resetting vocabulary data...
💾 Writing updated file...

✅ RESET COMPLETED SUCCESSFULLY!
=====================================
📊 Words processed: 100
📋 Columns reset: 11
💾 Backup saved as: vocabulary_backup_1704067200000.csv
📁 Updated file: vocabulary.csv
```

## 🔧 Requirements

- Node.js (any recent version)
- `vocabulary.csv` file in the same directory as the script

## ⚠️ Important Notes

- **Irreversible**: Once reset, the original data can only be recovered from the backup
- **Backup Location**: Backup files are created in the same directory with timestamp
- **No Dependencies**: Uses only Node.js built-in modules
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🧪 Testing

Before running the actual reset, you can test the functionality:

```bash
node test-reset-script.js
```

This will show you what the reset would do without actually modifying the file.

## 🆘 Recovery

If you need to restore from a backup:

1. Find the backup file (e.g., `vocabulary_backup_1704067200000.csv`)
2. Copy it over the current `vocabulary.csv`:
   ```bash
   cp vocabulary_backup_1704067200000.csv vocabulary.csv
   ```

## 📝 License

This script is part of the language learning system project.
