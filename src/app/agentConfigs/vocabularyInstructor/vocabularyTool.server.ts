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
 * @param participantId - Optional participant ID for participant-specific vocabulary
 * @param condition - Optional condition (conversational/flashcard) for condition-specific vocabulary
 * @returns An array of vocabulary words with their details
 */
export function readVocabularyFile(participantId?: string, condition?: string) {
  try {
    // Determine which vocabulary file to read
    let filePath: string;
    
    if (participantId && condition) {
      // Use condition-specific vocabulary file
      filePath = path.join(process.cwd(), `participant_${participantId}`, `vocabulary_${condition}.csv`);
      console.log(`[readVocabularyFile] Reading condition-specific file: ${filePath}`);
    } else if (participantId) {
      // Use participant-specific vocabulary file
      filePath = path.join(process.cwd(), `participant_${participantId}`, 'vocabulary.csv');
      console.log(`[readVocabularyFile] Reading participant-specific file: ${filePath}`);
    } else {
      // Use main vocabulary file
      filePath = path.join(process.cwd(), 'vocabulary.csv');
      console.log(`[readVocabularyFile] Reading main vocabulary file: ${filePath}`);
    }

    if (!fs.existsSync(filePath)) {
      console.error(`[readVocabularyFile] File does not exist: ${filePath}`);
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`[readVocabularyFile] File content length: ${fileContent.length} characters`);

    // Parse the CSV content
    const records = parseCSV(fileContent);
    console.log(`[readVocabularyFile] Parsed ${records.length} records`);

    return records;
  } catch (error) {
    console.error('[readVocabularyFile] Error reading vocabulary file:', error);
    return [];
  }
}

/**
 * Gets a random unintroduced vocabulary word
 * @param participantId - Optional participant ID for participant-specific vocabulary
 * @param condition - Optional condition for condition-specific vocabulary
 * @returns A vocabulary word that has not been introduced yet
 */
export function getRandomWord(participantId?: string, condition?: string) {
  const words = readVocabularyFile(participantId, condition);
  if (words.length === 0) {
    return null;
  }

  // Filter words that have NOT been introduced (total_uses = 0 or undefined)
  const unintroducedWords = words.filter(word => {
    const totalUses = parseInt(word.total_uses || '0');
    return totalUses === 0;
  });

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
export function getRandomWords(count: number, participantId?: string, condition?: string) {
  console.log(`[getRandomWords] Requested ${count} words for participant ${participantId}, condition ${condition}`);
  const words = readVocabularyFile(participantId, condition);

  if (words.length === 0) {
    console.log('[getRandomWords] No words found in vocabulary file');
    return [];
  }

  console.log(`[getRandomWords] Total words in file: ${words.length}`);

  // Filter words that have NOT been introduced (total_uses = 0 or undefined)
  const unintroducedWords = words.filter(word => {
    const totalUses = parseInt(word.total_uses || '0');
    const isUnintroduced = totalUses === 0;
    return isUnintroduced;
  });

  console.log(`[getRandomWords] Unintroduced words found: ${unintroducedWords.length}`);

  if (unintroducedWords.length === 0) {
    console.log('[getRandomWords] No unintroduced words found in the vocabulary file');
    // Log some sample words to debug
    console.log('[getRandomWords] Sample words from file:', words.slice(0, 3).map(w => ({
      word: w.word,
      total_uses: w.total_uses
    })));
    return [];
  }

  // Randomize the order of unintroduced words
  const shuffledWords = [...unintroducedWords].sort(() => Math.random() - 0.5);

  // Get the requested number of words
  const selectedWords = shuffledWords.slice(0, Math.min(count, shuffledWords.length));

  console.log(`[getRandomWords] Selected ${selectedWords.length} new unintroduced words for introduction`);
  console.log(`[getRandomWords] Selected words:`, selectedWords.map(w => w.word));
  return selectedWords;
}

/**
 * Searches for words in the vocabulary list
 * @param searchTerm The term to search for
 * @param participantId - Optional participant ID for participant-specific vocabulary
 * @param condition - Optional condition for condition-specific vocabulary
 * @returns An array of matching vocabulary words
 */
export function searchWords(searchTerm: string, participantId?: string, condition?: string) {
  const words = readVocabularyFile(participantId, condition);
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
 * @param participantId - Optional participant ID for participant-specific vocabulary
 * @param condition - Optional condition for condition-specific vocabulary
 * @returns An array of introduced vocabulary words
 */
export function getIntroducedWords(count: number, participantId?: string, condition?: string) {
  const words = readVocabularyFile(participantId, condition);
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
 * Gets high priority words for review - simplified for single session + 24h test
 * @param count The number of words to retrieve
 * @param participantId - Optional participant ID for participant-specific vocabulary
 * @param condition - Optional condition for condition-specific vocabulary
 * @returns An array of high priority vocabulary words for review
 */
export function getHighPriorityWords(count: number, participantId?: string, condition?: string) {
  const words = readVocabularyFile(participantId, condition);
  if (words.length === 0) {
    return [];
  }

  // Filter words that have been used at least once (total_uses > 0)
  const usedWords = words.filter(word => {
    const totalUses = parseInt(word.total_uses || '0');
    return totalUses > 0;
  });

  if (usedWords.length === 0) {
    return [];
  }

  const currentTime = Date.now();

  // Simple priority: overdue words first, then by next_due time (closest first)
  const sortedWords = usedWords.sort((a, b) => {
    const aNextDue = parseInt(a.next_due || '0');
    const bNextDue = parseInt(b.next_due || '0');
    
    // Sort by next_due time (earliest first)
    return aNextDue - bNextDue;
  });

  // Get the requested number of words
  const selectedWords = sortedWords.slice(0, Math.min(count, sortedWords.length));

  console.log(`Selected ${selectedWords.length} words for review, sorted by next due time`);
  
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
