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
 * Gets a random unintroduced vocabulary word
 * @returns A vocabulary word that has not been introduced yet
 */
export function getRandomWord() {
  const words = readVocabularyFile();
  if (words.length === 0) {
    return null;
  }

  // Filter words that have NOT been introduced (time_last_seen = 0 or undefined)
  const unintroducedWords = words.filter(word =>
    !word.time_last_seen || word.time_last_seen === '0'
  );

  if (unintroducedWords.length === 0) {
    console.log('No unintroduced words found in the vocabulary file');
    return null;
  }

  // Select a random unintroduced word
  const randomIndex = Math.floor(Math.random() * unintroducedWords.length);
  const selectedWord = unintroducedWords[randomIndex];

  console.log(`Selected random unintroduced word: ${selectedWord.word}`);
  return selectedWord;
}

/**
 * Gets multiple new vocabulary words that have not been introduced yet
 * @param count The number of new words to retrieve
 * @returns An array of unintroduced vocabulary words
 */
export function getRandomWords(count: number) {
  const words = readVocabularyFile();
  if (words.length === 0) {
    return [];
  }

  // Filter words that have NOT been introduced (time_last_seen = 0 or undefined)
  const unintroducedWords = words.filter(word =>
    !word.time_last_seen || word.time_last_seen === '0'
  );

  if (unintroducedWords.length === 0) {
    console.log('No unintroduced words found in the vocabulary file');
    return [];
  }

  // Randomize the order of unintroduced words
  const shuffledWords = [...unintroducedWords].sort(() => Math.random() - 0.5);

  // Get the requested number of words
  const selectedWords = shuffledWords.slice(0, Math.min(count, shuffledWords.length));

  console.log(`Selected ${selectedWords.length} new unintroduced words for introduction`);
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
 * Gets only introduced vocabulary words (words that have been seen before)
 * @param count The number of words to retrieve
 * @returns An array of introduced vocabulary words
 */
export function getIntroducedWords(count: number) {
  const words = readVocabularyFile();
  if (words.length === 0) {
    return [];
  }

  // Filter words that have been introduced (time_last_seen > 0)
  const introducedWords = words.filter(word =>
    word.time_last_seen && word.time_last_seen !== '0'
  );

  if (introducedWords.length === 0) {
    return [];
  }

  // Sort by least recently seen (oldest first)
  const sortedWords = [...introducedWords].sort((a, b) => {
    return parseInt(a.time_last_seen) - parseInt(b.time_last_seen);
  });

  // Get the requested number of words
  const selectedWords = sortedWords.slice(0, Math.min(count, sortedWords.length));

  console.log(`Selected ${selectedWords.length} introduced words for roleplay, prioritizing least recently used`);
  return selectedWords;
}

/**
 * Gets high priority words for review based on next_due date and usage statistics
 * @param count The number of words to retrieve
 * @returns An array of high priority vocabulary words for review
 */
export function getHighPriorityWords(count: number) {
  const words = readVocabularyFile();
  if (words.length === 0) {
    return [];
  }

  // Filter words that have been introduced (time_last_seen > 0)
  const introducedWords = words.filter(word =>
    word.time_last_seen && word.time_last_seen !== '0'
  );

  if (introducedWords.length === 0) {
    return [];
  }

  const currentTime = Date.now().toString();

  // First prioritize words that are due for review (next_due <= current time)
  // Then prioritize words with lower correct_uses/total_uses ratio
  const sortedWords = [...introducedWords].sort((a, b) => {
    // Check if either word is due for review
    const aIsDue = parseInt(a.next_due) <= parseInt(currentTime);
    const bIsDue = parseInt(b.next_due) <= parseInt(currentTime);

    // If one is due and the other isn't, prioritize the due one
    if (aIsDue && !bIsDue) return -1;
    if (!aIsDue && bIsDue) return 1;

    // If both are due or both are not due, sort by next_due date
    if (parseInt(a.next_due) !== parseInt(b.next_due)) {
      return parseInt(a.next_due) - parseInt(b.next_due);
    }

    // If next_due dates are the same, sort by correct usage ratio (ascending)
    const aRatio = parseInt(a.correct_uses) / Math.max(1, parseInt(a.total_uses));
    const bRatio = parseInt(b.correct_uses) / Math.max(1, parseInt(b.total_uses));
    return aRatio - bRatio;
  });

  // Get the requested number of words
  const selectedWords = sortedWords.slice(0, Math.min(count, sortedWords.length));

  console.log(`Selected ${selectedWords.length} high priority words for review`);
  return selectedWords;
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
