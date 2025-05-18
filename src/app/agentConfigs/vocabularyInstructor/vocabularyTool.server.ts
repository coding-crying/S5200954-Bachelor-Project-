import fs from 'fs';
import path from 'path';

/**
 * Simple CSV parser function
 * @param csvString The CSV string to parse
 * @returns An array of objects representing the CSV data
 */
function parseCSV(csvString: string) {
  // Split the CSV string into lines
  const lines = csvString.split('\n').filter(line => line.trim() !== '');

  // Extract headers from the first line
  const headers = lines[0].split(',').map(header => header.trim());

  // Parse each line into an object
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = values[index].trim();
      });
      records.push(record);
    }
  }

  return records;
}

/**
 * Reads and processes the vocabulary CSV file
 * @returns An array of vocabulary words with their details
 */
export function readVocabularyFile() {
  try {
    // Read the vocabulary CSV file
    const filePath = path.join(process.cwd(), 'vocabulary.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse the CSV content
    const records = parseCSV(fileContent);

    return records;
  } catch (error) {
    console.error('Error reading vocabulary file:', error);
    return [];
  }
}

/**
 * Gets the next word due for review based on the SM-2 spaced repetition algorithm
 * @returns A vocabulary word that is due for review
 */
export function getRandomWord() {
  const words = readVocabularyFile();
  if (words.length === 0) {
    return null;
  }

  const currentTime = Date.now().toString();

  // Sort words by next_due (oldest first)
  // Words with next_due = 0 (never seen) come first, then words that are due
  const sortedWords = [...words].sort((a, b) => {
    // If both are 0 (never seen), sort randomly
    if (a.next_due === '0' && b.next_due === '0') {
      return Math.random() - 0.5;
    }

    // If one is 0 (never seen), prioritize it
    if (a.next_due === '0') return -1;
    if (b.next_due === '0') return 1;

    // Otherwise sort by next_due (oldest first)
    return parseInt(a.next_due) - parseInt(b.next_due);
  });

  // Get the first word (most due for review)
  const selectedWord = sortedWords[0];

  console.log(`Selected word for review: ${selectedWord.word} (next_due: ${selectedWord.next_due})`);
  return selectedWord;
}

/**
 * Gets multiple words due for review based on the SM-2 spaced repetition algorithm
 * @param count The number of words to retrieve
 * @returns An array of vocabulary words that are due for review
 */
export function getRandomWords(count: number) {
  const words = readVocabularyFile();
  if (words.length === 0) {
    return [];
  }

  const currentTime = Date.now().toString();

  // Sort words by next_due (oldest first)
  // Words with next_due = 0 (never seen) come first, then words that are due
  const sortedWords = [...words].sort((a, b) => {
    // If both are 0 (never seen), sort randomly
    if (a.next_due === '0' && b.next_due === '0') {
      return Math.random() - 0.5;
    }

    // If one is 0 (never seen), prioritize it
    if (a.next_due === '0') return -1;
    if (b.next_due === '0') return 1;

    // Otherwise sort by next_due (oldest first)
    return parseInt(a.next_due) - parseInt(b.next_due);
  });

  // Get the requested number of words (most due for review)
  const selectedWords = sortedWords.slice(0, Math.min(count, sortedWords.length));

  console.log(`Selected ${selectedWords.length} words for review`);
  return selectedWords;
}

/**
 * Searches for words in the vocabulary list
 * @param searchTerm The term to search for
 * @returns An array of matching vocabulary words
 */
export function searchWords(searchTerm: string) {
  const words = readVocabularyFile();
  if (words.length === 0 || !searchTerm) {
    return [];
  }

  const term = searchTerm.toLowerCase();
  return words.filter(word =>
    word.word.toLowerCase().includes(term) ||
    (word.part_of_speech && word.part_of_speech.toLowerCase().includes(term))
  );
}

/**
 * Resets the next_due dates for all vocabulary words
 * @returns A success message
 */
export function resetPresentedWordsTracking() {
  try {
    const filePath = path.join(process.cwd(), 'vocabulary.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse the CSV content
    const records = parseCSV(fileContent);

    // Reset next_due to 0 for all words
    for (const record of records) {
      record.next_due = '0';
    }

    // Write the updated records back to the file
    const headers = ['word', 'time_last_seen', 'correct_uses', 'total_uses', 'next_due', 'EF', 'interval', 'repetitions'];
    let csvContent = headers.join(',') + '\n';

    for (const record of records) {
      const values = headers.map(header => record[header] || '0');
      csvContent += values.join(',') + '\n';
    }

    fs.writeFileSync(filePath, csvContent);

    return {
      success: true,
      message: `Reset next_due dates for ${records.length} vocabulary words`
    };
  } catch (error) {
    console.error('Error resetting vocabulary next_due dates:', error);
    return {
      success: false,
      message: 'Failed to reset vocabulary next_due dates'
    };
  }
}
