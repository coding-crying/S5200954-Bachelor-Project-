/**
 * Word Lemmatizer Module
 * 
 * This module provides basic word lemmatization functionality to detect different forms
 * of vocabulary words (conjugations, plurals, etc.) in conversation text.
 * Uses rule-based approach for lightweight client-side processing.
 */

interface WordMatch {
  foundWord: string;
  vocabularyWord: string;
  isExactMatch: boolean;
}

interface LemmatizationRule {
  suffix: string;
  replacements: string[];
  minLength?: number;
}

export class WordLemmatizer {
  private lemmatizationRules: LemmatizationRule[];
  private cache: Map<string, string>;

  constructor() {
    this.cache = new Map();
    this.lemmatizationRules = this.createLemmatizationRules();
  }

  /**
   * Create rule-based lemmatization rules for common word forms
   */
  private createLemmatizationRules(): LemmatizationRule[] {
    return [
      // Verb forms
      { suffix: 'ing', replacements: [''], minLength: 4 },     // running -> run
      { suffix: 'ed', replacements: [''], minLength: 4 },      // walked -> walk
      { suffix: 'es', replacements: [''], minLength: 4 },      // goes -> go
      { suffix: 's', replacements: [''], minLength: 3 },       // runs -> run
      
      // Noun plurals
      { suffix: 'ies', replacements: ['y'], minLength: 5 },    // cities -> city
      { suffix: 'ves', replacements: ['f', 'fe'], minLength: 5 }, // wolves -> wolf, knives -> knife
      
      // Adjective/adverb forms
      { suffix: 'er', replacements: [''], minLength: 4 },      // bigger -> big
      { suffix: 'est', replacements: [''], minLength: 5 },     // biggest -> big
      { suffix: 'ly', replacements: [''], minLength: 4 },      // quickly -> quick
      
      // Past participle forms
      { suffix: 'en', replacements: [''], minLength: 4 },      // taken -> take
      
      // Gerund/present participle special cases
      { suffix: 'ying', replacements: ['ie'], minLength: 5 },  // lying -> lie
      { suffix: 'ting', replacements: ['t'], minLength: 5 },   // sitting -> sit
      { suffix: 'ning', replacements: ['n'], minLength: 5 },   // running -> run
      { suffix: 'ming', replacements: ['m'], minLength: 5 },   // swimming -> swim
    ];
  }

  /**
   * Lemmatize a single word to its base form using rule-based approach
   */
  lemmatizeWord(word: string): string {
    const normalizedWord = word.toLowerCase().trim();
    
    // Check cache first
    if (this.cache.has(normalizedWord)) {
      return this.cache.get(normalizedWord)!;
    }

    let lemma = normalizedWord;

    // Apply lemmatization rules
    for (const rule of this.lemmatizationRules) {
      if (normalizedWord.endsWith(rule.suffix) && 
          normalizedWord.length >= (rule.minLength || rule.suffix.length + 1)) {
        
        for (const replacement of rule.replacements) {
          const candidate = normalizedWord.slice(0, -rule.suffix.length) + replacement;
          
          // Basic validation: ensure the candidate is reasonable
          if (candidate.length >= 2 && this.isValidCandidate(candidate)) {
            lemma = candidate;
            break;
          }
        }
        
        // If we found a match, stop processing other rules
        if (lemma !== normalizedWord) {
          break;
        }
      }
    }

    // Cache the result
    this.cache.set(normalizedWord, lemma);
    return lemma;
  }

  /**
   * Basic validation for lemmatization candidates
   */
  private isValidCandidate(word: string): boolean {
    // Ensure the word contains at least one vowel and doesn't end with impossible combinations
    const hasVowel = /[aeiou]/.test(word);
    const validEnding = !/[bcdfghjklmnpqrstvwxyz]{3,}$/.test(word);
    
    return hasVowel && validEnding && word.length >= 2;
  }

  /**
   * Find vocabulary word matches in text, including different word forms
   */
  findVocabularyMatches(text: string, vocabularyWords: Set<string>): WordMatch[] {
    if (!text || !vocabularyWords.size) {
      return [];
    }

    // Tokenize text (extract words)
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const matches: WordMatch[] = [];
    const processedWords = new Set<string>();

    // Create a mapping of lemmatized vocabulary words to original words
    const vocabLemmaMap = new Map<string, string>();
    for (const vocabWord of vocabularyWords) {
      const lemma = this.lemmatizeWord(vocabWord);
      if (!vocabLemmaMap.has(lemma)) {
        vocabLemmaMap.set(lemma, vocabWord);
      }
    }

    // Check each word in the text
    for (const word of words) {
      // Skip if we've already processed this word form
      if (processedWords.has(word)) {
        continue;
      }
      processedWords.add(word);

      // First check exact match
      if (vocabularyWords.has(word)) {
        matches.push({
          foundWord: word,
          vocabularyWord: word,
          isExactMatch: true
        });
        continue;
      }

      // Then check lemmatized form
      const lemma = this.lemmatizeWord(word);
      if (vocabLemmaMap.has(lemma)) {
        const vocabularyWord = vocabLemmaMap.get(lemma)!;
        matches.push({
          foundWord: word,
          vocabularyWord: vocabularyWord,
          isExactMatch: false
        });
      }
    }

    return matches;
  }

  /**
   * Generate possible word forms for a base word
   */
  generateWordForms(baseWord: string): Set<string> {
    const forms = new Set<string>([baseWord.toLowerCase()]);
    const word = baseWord.toLowerCase();

    // Add common inflections
    forms.add(word + 's');      // plural/3rd person
    forms.add(word + 'es');     // plural
    forms.add(word + 'ed');     // past tense
    forms.add(word + 'ing');    // present participle
    forms.add(word + 'er');     // comparative
    forms.add(word + 'est');    // superlative
    forms.add(word + 'ly');     // adverb

    // Handle words ending in 'y'
    if (word.endsWith('y') && word.length > 1) {
      const stem = word.slice(0, -1);
      forms.add(stem + 'ies');     // cities
      forms.add(stem + 'ied');     // carried
    }

    // Handle words ending in 'e'
    if (word.endsWith('e')) {
      const stem = word.slice(0, -1);
      forms.add(stem + 'ing');     // making
      forms.add(stem + 'ed');      // baked
    }

    // Handle consonant doubling
    if (word.length >= 3) {
      const lastChar = word[word.length - 1];
      const secondLastChar = word[word.length - 2];
      
      // Double consonant for words ending in consonant-vowel-consonant pattern
      if (this.isConsonant(lastChar) && this.isVowel(secondLastChar) && 
          this.isConsonant(word[word.length - 3])) {
        forms.add(word + lastChar + 'ing');  // running
        forms.add(word + lastChar + 'ed');   // stopped
      }
    }

    return forms;
  }

  /**
   * Check if a character is a vowel
   */
  private isVowel(char: string): boolean {
    return 'aeiou'.includes(char.toLowerCase());
  }

  /**
   * Check if a character is a consonant
   */
  private isConsonant(char: string): boolean {
    return /[bcdfghjklmnpqrstvwxyz]/.test(char.toLowerCase());
  }

  /**
   * Clear the lemmatization cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate?: number } {
    return {
      size: this.cache.size
    };
  }
}

// Create a singleton instance for easy access
export const wordLemmatizer = new WordLemmatizer();
