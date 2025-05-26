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
  private irregularVerbs: Map<string, string>;

  constructor() {
    this.cache = new Map();
    this.lemmatizationRules = this.createLemmatizationRules();
    this.irregularVerbs = this.createIrregularVerbMap();
  }

  /**
   * Create rule-based lemmatization rules for common word forms
   */
  private createLemmatizationRules(): LemmatizationRule[] {
    return [
      // Complex verb conjugations (order matters - most specific first)
      { suffix: 'ying', replacements: ['ie'], minLength: 5 },  // lying -> lie, dying -> die
      { suffix: 'ting', replacements: ['t'], minLength: 5 },   // sitting -> sit, getting -> get
      { suffix: 'ning', replacements: ['n'], minLength: 5 },   // running -> run, beginning -> begin
      { suffix: 'ming', replacements: ['m'], minLength: 5 },   // swimming -> swim, humming -> hum
      { suffix: 'pping', replacements: ['p'], minLength: 6 },  // stopping -> stop, shopping -> shop
      { suffix: 'gging', replacements: ['g'], minLength: 6 },  // jogging -> jog, hugging -> hug
      { suffix: 'lling', replacements: ['l'], minLength: 6 },  // calling -> call, falling -> fall
      { suffix: 'ssing', replacements: ['ss'], minLength: 6 }, // passing -> pass, missing -> miss

      // Past tense forms
      { suffix: 'ied', replacements: ['y'], minLength: 4 },    // carried -> carry, studied -> study
      { suffix: 'pped', replacements: ['p'], minLength: 5 },   // stopped -> stop, dropped -> drop
      { suffix: 'gged', replacements: ['g'], minLength: 5 },   // jogged -> jog, hugged -> hug
      { suffix: 'lled', replacements: ['l'], minLength: 5 },   // called -> call, filled -> fill
      { suffix: 'ssed', replacements: ['ss'], minLength: 5 },  // passed -> pass, missed -> miss
      { suffix: 'tted', replacements: ['t'], minLength: 5 },   // chatted -> chat, fitted -> fit

      // Regular verb forms
      { suffix: 'ing', replacements: ['e', ''], minLength: 4 }, // making -> make, running -> run
      { suffix: 'ed', replacements: ['e', ''], minLength: 3 },  // baked -> bake, walked -> walk
      { suffix: 'es', replacements: [''], minLength: 4 },       // goes -> go, watches -> watch
      { suffix: 's', replacements: [''], minLength: 3 },        // runs -> run, cats -> cat

      // Noun plurals (specific to general)
      { suffix: 'ies', replacements: ['y'], minLength: 5 },     // cities -> city, babies -> baby
      { suffix: 'ves', replacements: ['f', 'fe'], minLength: 5 }, // wolves -> wolf, knives -> knife
      { suffix: 'ses', replacements: ['s'], minLength: 4 },     // glasses -> glass, buses -> bus
      { suffix: 'ches', replacements: ['ch'], minLength: 5 },   // watches -> watch, beaches -> beach
      { suffix: 'shes', replacements: ['sh'], minLength: 5 },   // dishes -> dish, brushes -> brush
      { suffix: 'xes', replacements: ['x'], minLength: 4 },     // boxes -> box, fixes -> fix
      { suffix: 'oes', replacements: ['o'], minLength: 4 },     // tomatoes -> tomato, heroes -> hero

      // Past participle forms
      { suffix: 'en', replacements: [''], minLength: 4 },       // taken -> take, broken -> break
      { suffix: 'n', replacements: [''], minLength: 3 },        // seen -> see, been -> be

      // Adjective/adverb forms
      { suffix: 'ier', replacements: ['y'], minLength: 5 },     // happier -> happy, easier -> easy
      { suffix: 'iest', replacements: ['y'], minLength: 6 },    // happiest -> happy, easiest -> easy
      { suffix: 'er', replacements: [''], minLength: 4 },       // bigger -> big, faster -> fast
      { suffix: 'est', replacements: [''], minLength: 5 },      // biggest -> big, fastest -> fast
      { suffix: 'ly', replacements: [''], minLength: 4 },       // quickly -> quick, slowly -> slow

      // Additional verb forms
      { suffix: 'ize', replacements: [''], minLength: 5 },      // realize -> real, organize -> organ
      { suffix: 'ise', replacements: [''], minLength: 5 },      // realise -> real, organise -> organ
      { suffix: 'fy', replacements: [''], minLength: 4 },       // simplify -> simpl, beautify -> beauti

      // Gerund forms with 'e' dropping
      { suffix: 'ving', replacements: ['ve'], minLength: 5 },   // having -> have, giving -> give
      { suffix: 'cing', replacements: ['ce'], minLength: 5 },   // dancing -> dance, placing -> place
      { suffix: 'ging', replacements: ['ge'], minLength: 5 },   // changing -> change, judging -> judge
      { suffix: 'zing', replacements: ['ze'], minLength: 5 },   // amazing -> amaze, freezing -> freeze
      { suffix: 'sing', replacements: ['se'], minLength: 5 },   // using -> use, choosing -> choose
    ];
  }

  /**
   * Create mapping for irregular verb forms
   */
  private createIrregularVerbMap(): Map<string, string> {
    const irregulars = new Map<string, string>();

    // Common irregular verbs - past tense and past participle forms
    const irregularMappings = [
      // be verbs
      ['am', 'be'], ['is', 'be'], ['are', 'be'], ['was', 'be'], ['were', 'be'], ['been', 'be'], ['being', 'be'],

      // have verbs
      ['has', 'have'], ['had', 'have'], ['having', 'have'],

      // do verbs
      ['does', 'do'], ['did', 'do'], ['done', 'do'], ['doing', 'do'],

      // go verbs
      ['goes', 'go'], ['went', 'go'], ['gone', 'go'], ['going', 'go'],

      // get verbs
      ['gets', 'get'], ['got', 'get'], ['gotten', 'get'], ['getting', 'get'],

      // come verbs
      ['comes', 'come'], ['came', 'come'], ['coming', 'come'],

      // see verbs
      ['sees', 'see'], ['saw', 'see'], ['seen', 'see'], ['seeing', 'see'],

      // take verbs
      ['takes', 'take'], ['took', 'take'], ['taken', 'take'], ['taking', 'take'],

      // give verbs
      ['gives', 'give'], ['gave', 'give'], ['given', 'give'], ['giving', 'give'],

      // make verbs
      ['makes', 'make'], ['made', 'make'], ['making', 'make'],

      // know verbs
      ['knows', 'know'], ['knew', 'know'], ['known', 'know'], ['knowing', 'know'],

      // think verbs
      ['thinks', 'think'], ['thought', 'think'], ['thinking', 'think'],

      // say verbs
      ['says', 'say'], ['said', 'say'], ['saying', 'say'],

      // tell verbs
      ['tells', 'tell'], ['told', 'tell'], ['telling', 'tell'],

      // find verbs
      ['finds', 'find'], ['found', 'find'], ['finding', 'find'],

      // feel verbs
      ['feels', 'feel'], ['felt', 'feel'], ['feeling', 'feel'],

      // leave verbs
      ['leaves', 'leave'], ['left', 'leave'], ['leaving', 'leave'],

      // put verbs
      ['puts', 'put'], ['putting', 'put'],

      // run verbs
      ['runs', 'run'], ['ran', 'run'], ['running', 'run'],

      // bring verbs
      ['brings', 'bring'], ['brought', 'bring'], ['bringing', 'bring'],

      // buy verbs
      ['buys', 'buy'], ['bought', 'buy'], ['buying', 'buy'],

      // eat verbs
      ['eats', 'eat'], ['ate', 'eat'], ['eaten', 'eat'], ['eating', 'eat'],

      // drink verbs
      ['drinks', 'drink'], ['drank', 'drink'], ['drunk', 'drink'], ['drinking', 'drink'],

      // sleep verbs
      ['sleeps', 'sleep'], ['slept', 'sleep'], ['sleeping', 'sleep'],

      // write verbs
      ['writes', 'write'], ['wrote', 'write'], ['written', 'write'], ['writing', 'write'],

      // read verbs
      ['reads', 'read'], ['reading', 'read'],

      // speak verbs
      ['speaks', 'speak'], ['spoke', 'speak'], ['spoken', 'speak'], ['speaking', 'speak'],

      // hear verbs
      ['hears', 'hear'], ['heard', 'hear'], ['hearing', 'hear'],

      // understand verbs
      ['understands', 'understand'], ['understood', 'understand'], ['understanding', 'understand'],

      // begin verbs
      ['begins', 'begin'], ['began', 'begin'], ['begun', 'begin'], ['beginning', 'begin'],

      // break verbs
      ['breaks', 'break'], ['broke', 'break'], ['broken', 'break'], ['breaking', 'break'],

      // choose verbs
      ['chooses', 'choose'], ['chose', 'choose'], ['chosen', 'choose'], ['choosing', 'choose'],

      // draw verbs
      ['draws', 'draw'], ['drew', 'draw'], ['drawn', 'draw'], ['drawing', 'draw'],

      // drive verbs
      ['drives', 'drive'], ['drove', 'drive'], ['driven', 'drive'], ['driving', 'drive'],

      // fly verbs
      ['flies', 'fly'], ['flew', 'fly'], ['flown', 'fly'], ['flying', 'fly'],

      // forget verbs
      ['forgets', 'forget'], ['forgot', 'forget'], ['forgotten', 'forget'], ['forgetting', 'forget'],

      // grow verbs
      ['grows', 'grow'], ['grew', 'grow'], ['grown', 'grow'], ['growing', 'grow'],

      // hide verbs
      ['hides', 'hide'], ['hid', 'hide'], ['hidden', 'hide'], ['hiding', 'hide'],

      // keep verbs
      ['keeps', 'keep'], ['kept', 'keep'], ['keeping', 'keep'],

      // lose verbs
      ['loses', 'lose'], ['lost', 'lose'], ['losing', 'lose'],

      // meet verbs
      ['meets', 'meet'], ['met', 'meet'], ['meeting', 'meet'],

      // pay verbs
      ['pays', 'pay'], ['paid', 'pay'], ['paying', 'pay'],

      // sell verbs
      ['sells', 'sell'], ['sold', 'sell'], ['selling', 'sell'],

      // send verbs
      ['sends', 'send'], ['sent', 'send'], ['sending', 'send'],

      // sing verbs
      ['sings', 'sing'], ['sang', 'sing'], ['sung', 'sing'], ['singing', 'sing'],

      // sit verbs
      ['sits', 'sit'], ['sat', 'sit'], ['sitting', 'sit'],

      // stand verbs
      ['stands', 'stand'], ['stood', 'stand'], ['standing', 'stand'],

      // swim verbs
      ['swims', 'swim'], ['swam', 'swim'], ['swum', 'swim'], ['swimming', 'swim'],

      // teach verbs
      ['teaches', 'teach'], ['taught', 'teach'], ['teaching', 'teach'],

      // throw verbs
      ['throws', 'throw'], ['threw', 'throw'], ['thrown', 'throw'], ['throwing', 'throw'],

      // wear verbs
      ['wears', 'wear'], ['wore', 'wear'], ['worn', 'wear'], ['wearing', 'wear'],

      // win verbs
      ['wins', 'win'], ['won', 'win'], ['winning', 'win'],

      // Irregular plurals
      ['children', 'child'], ['people', 'person'], ['men', 'man'], ['women', 'woman'],
      ['feet', 'foot'], ['teeth', 'tooth'], ['mice', 'mouse'], ['geese', 'goose'],

      // Comparative/superlative forms
      ['better', 'good'], ['best', 'good'], ['worse', 'bad'], ['worst', 'bad'],
      ['more', 'much'], ['most', 'much'], ['less', 'little'], ['least', 'little'],
      ['further', 'far'], ['furthest', 'far'], ['farther', 'far'], ['farthest', 'far'],
    ];

    // Add all mappings to the map
    for (const [inflected, base] of irregularMappings) {
      irregulars.set(inflected.toLowerCase(), base.toLowerCase());
    }

    return irregulars;
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

    // Check irregular verbs first (highest priority)
    if (this.irregularVerbs.has(normalizedWord)) {
      const lemma = this.irregularVerbs.get(normalizedWord)!;
      this.cache.set(normalizedWord, lemma);
      return lemma;
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
