/**
 * FlashcardManager - Controls flashcard condition timing and vocabulary progression
 * 
 * Implements the flashcard control condition for the experimental study:
 * - 6-minute timed sessions
 * - Static vocabulary presentation with definitions and examples
 * - Navigation controls for review and repetition
 * - No adaptive features or memory scheduling
 */

interface FlashcardWord {
  word: string;
  definition: string;
  contextExamples: string[];
}

export class FlashcardManager {
  private words: FlashcardWord[];
  private currentIndex: number;
  private sessionDuration: number; // 6 minutes in milliseconds
  private sessionStartTime: number;
  private sessionEndTime: number;

  constructor() {
    this.words = [];
    this.currentIndex = 0;
    this.sessionDuration = 6 * 60 * 1000; // 6 minutes
    this.sessionStartTime = 0;
    this.sessionEndTime = 0;
  }

  /**
   * Initialize flashcard session with participant's vocabulary set
   */
  async initialize(): Promise<void> {
    try {
      // Load vocabulary from participant's personalized set or use defaults
      this.words = await this.loadVocabularySet();
      
      // Start session timer
      this.sessionStartTime = Date.now();
      this.sessionEndTime = this.sessionStartTime + this.sessionDuration;
      
      console.log(`Flashcard session initialized: ${this.words.length} words, ${this.sessionDuration / 1000}s duration`);
    } catch (error) {
      console.error('Failed to initialize flashcard session:', error);
      // Fallback to default vocabulary
      this.words = this.getDefaultVocabulary();
      this.sessionStartTime = Date.now();
      this.sessionEndTime = this.sessionStartTime + this.sessionDuration;
    }
  }

  /**
   * Load participant-specific vocabulary or generate from current block
   */
  private async loadVocabularySet(): Promise<FlashcardWord[]> {
    try {
      // Try to load from participant's vocabulary.csv
      const response = await fetch('/api/vocabulary/current-block');
      if (response.ok) {
        const blockData = await response.json();
        return this.generateFlashcards(blockData.words);
      }
    } catch (error) {
      console.warn('Could not load participant vocabulary, using defaults');
    }

    // Fallback to default vocabulary set
    return this.getDefaultVocabulary();
  }

  /**
   * Generate flashcard objects with definitions and context examples
   */
  private generateFlashcards(words: string[]): FlashcardWord[] {
    const definitions = this.getWordDefinitions();
    const examples = this.getContextExamples();

    return words.map(word => ({
      word,
      definition: definitions[word] || `Advanced vocabulary word: ${word}`,
      contextExamples: examples[word] || [
        `The ${word} was evident in the situation.`,
        `Her ${word} approach proved effective.`
      ]
    }));
  }

  /**
   * Default vocabulary set for flashcard condition
   */
  private getDefaultVocabulary(): FlashcardWord[] {
    const defaultWords = [
      'obfuscate', 'disparage', 'perfunctory', 'precocious', 'circumspect', 'capitulate'
    ];
    
    return this.generateFlashcards(defaultWords);
  }

  /**
   * Word definitions for flashcard display
   */
  private getWordDefinitions(): Record<string, string> {
    return {
      obfuscate: "To deliberately make something unclear, confusing, or difficult to understand.",
      disparage: "To regard or represent as being of little worth; to criticize unfairly.",
      perfunctory: "Carried out with a minimum of effort or reflection; superficial or mechanical.",
      precocious: "Having developed certain abilities or inclinations at an earlier age than is usual.",
      circumspect: "Wary and unwilling to take risks; careful to consider all circumstances.",
      capitulate: "To cease resistance and submit to an opponent or overwhelming force.",
      vociferous: "Expressing opinions or feelings in a loud and forceful way.",
      intractable: "Hard to control or deal with; stubborn and difficult to manage.",
      abrogate: "To repeal or do away with a law, right, or formal agreement.",
      admonish: "To warn or reprimand someone firmly but not severely.",
      bolster: "To support or strengthen; to prop up or reinforce.",
      cacophony: "A harsh, discordant mixture of sounds; unpleasant noise.",
      candor: "The quality of being open and honest in expression; frankness.",
      capricious: "Given to sudden and unaccountable changes of mood or behavior.",
      conciliatory: "Intended or likely to placate or pacify; appeasing.",
      copious: "Abundant in supply or quantity; plentiful and extensive.",
      cursory: "Hasty and therefore not thorough or detailed; superficial.",
      deleterious: "Causing harm or damage; having a harmful effect.",
      despot: "A ruler or other person who holds absolute power, typically exercising it cruelly.",
      ephemeral: "Lasting for a very short time; transitory and fleeting.",
      eschew: "To deliberately avoid or abstain from something.",
      garrulous: "Excessively talkative, especially on trivial matters.",
      hackneyed: "Lacking originality or freshness; overused and therefore lacking impact."
    };
  }

  /**
   * Context examples for vocabulary words
   */
  private getContextExamples(): Record<string, string[]> {
    return {
      obfuscate: [
        "The lawyer tried to obfuscate the evidence with complex legal jargon.",
        "Rather than explain clearly, he chose to obfuscate the issue further."
      ],
      disparage: [
        "It's unprofessional to disparage your competitors in public.",
        "She would never disparage someone's efforts, even if unsuccessful."
      ],
      perfunctory: [
        "His perfunctory apology lacked any genuine remorse.",
        "The security check was merely perfunctory and missed obvious issues."
      ],
      precocious: [
        "The precocious child was reading novels by age six.",
        "Her precocious understanding of mathematics impressed her teachers."
      ],
      circumspect: [
        "The diplomat was circumspect in his response to avoid controversy.",
        "Being circumspect with investments helped her avoid major losses."
      ],
      capitulate: [
        "The city was forced to capitulate after a long siege.",
        "Rather than capitulate to pressure, she stood firm in her principles."
      ],
      vociferous: [
        "The vociferous crowd demanded answers from the politician.",
        "His vociferous objections to the plan were heard throughout the building."
      ],
      intractable: [
        "The conflict seemed intractable despite years of negotiations.",
        "Her intractable attitude made collaboration nearly impossible."
      ],
      abrogate: [
        "The new government moved quickly to abrogate the unpopular treaty.",
        "The court's decision would effectively abrogate decades of precedent."
      ],
      admonish: [
        "The teacher had to admonish the students for their disruptive behavior.",
        "She would gently admonish anyone who arrived late to meetings."
      ],
      bolster: [
        "The positive reviews helped bolster confidence in the new product.",
        "Additional funding would bolster the research program significantly."
      ],
      cacophony: [
        "The construction site created a cacophony of drilling and hammering.",
        "The orchestra's warm-up created a cacophony before the beautiful performance."
      ],
      candor: [
        "Her candor about the company's problems was refreshing but alarming.",
        "The politician's unusual candor won him both praise and criticism."
      ],
      capricious: [
        "The weather has been particularly capricious this spring.",
        "His capricious decision-making made him unreliable as a leader."
      ],
      conciliatory: [
        "She adopted a conciliatory tone to ease tensions in the room.",
        "The conciliatory gesture helped repair the damaged relationship."
      ],
      copious: [
        "The detective took copious notes during the lengthy interview.",
        "Copious rainfall this month has ended the drought conditions."
      ],
      cursory: [
        "A cursory glance at the report revealed several obvious errors.",
        "The cursory inspection failed to identify the structural problems."
      ],
      deleterious: [
        "The medication's deleterious side effects outweighed its benefits.",
        "Smoking has well-documented deleterious effects on health."
      ],
      despot: [
        "The despot ruled with an iron fist, crushing all opposition.",
        "History books are filled with accounts of cruel despots and their regimes."
      ],
      ephemeral: [
        "The beauty of cherry blossoms is ephemeral, lasting only days.",
        "Social media fame can be ephemeral, disappearing as quickly as it arrives."
      ],
      eschew: [
        "The monk chose to eschew all worldly possessions.",
        "Many investors eschew risky stocks in favor of stable bonds."
      ],
      garrulous: [
        "The garrulous host kept guests entertained with endless stories.",
        "His garrulous nature made him popular at parties but tiresome in meetings."
      ],
      hackneyed: [
        "The movie's plot was hackneyed and entirely predictable.",
        "She avoided hackneyed phrases in favor of original expressions."
      ]
    };
  }

  /**
   * Get current flashcard
   */
  getCurrentCard(): FlashcardWord | null {
    if (this.words.length === 0) return null;
    return this.words[this.currentIndex];
  }

  /**
   * Move to next flashcard
   */
  nextCard(): FlashcardWord | null {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
    }
    return this.getCurrentCard();
  }

  /**
   * Move to previous flashcard
   */
  previousCard(): FlashcardWord | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
    return this.getCurrentCard();
  }

  /**
   * Restart from beginning
   */
  restartFromBeginning(): FlashcardWord | null {
    this.currentIndex = 0;
    return this.getCurrentCard();
  }

  /**
   * Get time remaining in session (seconds)
   */
  getTimeRemaining(): number {
    const now = Date.now();
    const remaining = Math.max(0, this.sessionEndTime - now);
    return Math.floor(remaining / 1000);
  }

  /**
   * Check if session is still active
   */
  isSessionActive(): boolean {
    return Date.now() < this.sessionEndTime;
  }

  /**
   * Get current card index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get total number of cards
   */
  getTotalCards(): number {
    return this.words.length;
  }

  /**
   * Get session progress (0-1)
   */
  getSessionProgress(): number {
    if (this.words.length === 0) return 0;
    return (this.currentIndex + 1) / this.words.length;
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const timeElapsed = Date.now() - this.sessionStartTime;
    const timeRemaining = this.getTimeRemaining();
    
    return {
      totalWords: this.words.length,
      currentWord: this.currentIndex + 1,
      timeElapsedSeconds: Math.floor(timeElapsed / 1000),
      timeRemainingSeconds: timeRemaining,
      sessionDurationSeconds: Math.floor(this.sessionDuration / 1000),
      progress: this.getSessionProgress(),
      isActive: this.isSessionActive()
    };
  }
}