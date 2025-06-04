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
<<<<<<< HEAD
=======
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
 * Calculate priority score for a vocabulary word optimized for 20-minute learning sessions
 * @param word The vocabulary word data
 * @param currentTime Current timestamp in milliseconds
 * @returns Priority score (higher = more priority)
 */
function calculateWordPriority(word: any, currentTime: number): number {
  const timeLastSeen = parseInt(word.time_last_seen) || 0;
  const correctUses = parseInt(word.correct_uses) || 0;
  const totalUses = parseInt(word.total_uses) || 0;
  const nextDue = parseInt(word.next_due) || 0;

  // 1. Time urgency factor (0-100 points)
  // Words overdue get maximum urgency, recent words get minimum
  const timeSinceLastSeen = currentTime - timeLastSeen;
  const daysSinceLastSeen = timeSinceLastSeen / (1000 * 60 * 60 * 24);

  let urgencyScore = 0;
  if (nextDue <= currentTime) {
    // Overdue words get high urgency based on how overdue they are
    const daysOverdue = (currentTime - nextDue) / (1000 * 60 * 60 * 24);
    urgencyScore = Math.min(100, 50 + (daysOverdue * 10)); // 50-100 points
  } else if (daysSinceLastSeen >= 1) {
    // Words not seen recently get moderate urgency
    urgencyScore = Math.min(50, daysSinceLastSeen * 5); // 0-50 points
  }

  // 2. Mastery deficit factor (0-100 points)
  // Words with lower mastery get higher priority
  let masteryDeficit = 0;
  if (totalUses > 0) {
    const masteryRatio = correctUses / totalUses;
    // Invert the ratio: lower mastery = higher priority
    masteryDeficit = (1 - masteryRatio) * 100;
  } else {
    // Never practiced words get high priority
    masteryDeficit = 80;
  }

  // 3. Learning efficiency factor (0-50 points)
  // Words with some exposure but not mastered are most efficient to review
  let efficiencyBonus = 0;
  if (totalUses >= 1 && totalUses <= 5) {
    // Sweet spot for 20-minute sessions: words that have been introduced but need reinforcement
    efficiencyBonus = 50;
  } else if (totalUses > 5 && totalUses <= 10) {
    // Still good for review
    efficiencyBonus = 30;
  } else if (totalUses === 0) {
    // New words get moderate bonus (they need introduction first)
    efficiencyBonus = 20;
  }

  // 4. Recency penalty (0 to -30 points)
  // Slightly penalize words reviewed very recently to encourage variety
  const hoursRecent = timeSinceLastSeen / (1000 * 60 * 60);
  let recencyPenalty = 0;
  if (hoursRecent < 2) {
    recencyPenalty = -30; // Just reviewed
  } else if (hoursRecent < 6) {
    recencyPenalty = -15; // Recently reviewed
  }

  const totalScore = urgencyScore + masteryDeficit + efficiencyBonus + recencyPenalty;

  return Math.max(0, totalScore); // Ensure non-negative score
}

/**
 * Gets high priority words for review optimized for 20-minute learning sessions
 * Prioritizes words based on:
 * - Time since last review (urgency)
 * - Mastery level (correct_uses ratio)
 * - Learning efficiency (optimal exposure count for short sessions)
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

  const currentTime = Date.now();

  // Calculate priority scores for all words
  const wordsWithPriority = introducedWords.map(word => ({
    ...word,
    priorityScore: calculateWordPriority(word, currentTime)
  }));

  // Sort by priority score (highest first)
  const sortedWords = wordsWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);

  // Get the requested number of words
  const selectedWords = sortedWords.slice(0, Math.min(count, sortedWords.length));

  console.log(`Selected ${selectedWords.length} high priority words for review:`);
  selectedWords.forEach((word, index) => {
    const correctRatio = parseInt(word.correct_uses) / Math.max(1, parseInt(word.total_uses));
    const daysSinceLastSeen = (currentTime - parseInt(word.time_last_seen)) / (1000 * 60 * 60 * 24);
    console.log(`  ${index + 1}. ${word.word} (score: ${word.priorityScore.toFixed(1)}, mastery: ${(correctRatio * 100).toFixed(1)}%, days since: ${daysSinceLastSeen.toFixed(1)})`);
  });

  return selectedWords;
}

/**
>>>>>>> be1e1eb (working vocab instructor pipeline with updated scheduling)
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
