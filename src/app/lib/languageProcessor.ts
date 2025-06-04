/**
 * Language Processor Module
 *
 * This module processes conversation text to extract basic word forms
 * and update the language words CSV file. It runs on a timer to automatically
 * process conversation text every minute.
 */

interface LanguageWord {
  word: string;
  base_form: string;
  part_of_speech: string;
  frequency: string;
  first_seen: string;
  last_seen: string;
}

interface ProcessingResult {
  processed: boolean;
  text?: string;
  wordsExtracted?: Array<{word: string, base_form: string, part_of_speech: string}>;
  wordsUpdated?: string[];
  error?: string;
  timestamp?: number;
}

/**
 * Submit text for language processing using the new Neo4j-based utterance processing
 *
 * @param text The text to process
 * @param userId The user ID (optional, will use default if not provided)
 * @param targetLanguage The target language (optional, will use default if not provided)
 * @param userNativeLanguage The user's native language (optional, will use default if not provided)
 * @returns Promise that resolves to the processing result
 */
export async function processLanguageText(
  text: string,
  userId?: string,
  targetLanguage?: string,
  userNativeLanguage?: string
): Promise<ProcessingResult> {
  try {
    if (!text || !text.trim()) {
      return { processed: false, error: 'Empty text' };
    }

    // Use default values if not provided
    const defaultUserId = userId || 'default-user';
    const defaultTargetLanguage = targetLanguage || 'es'; // Spanish as default
    const defaultNativeLanguage = userNativeLanguage || 'en'; // English as default

    const response = await fetch('/api/utterance/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: defaultUserId,
        utteranceText: text,
        speaker: 'user',
        targetLanguage: defaultTargetLanguage,
        userNativeLanguage: defaultNativeLanguage
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        processed: false,
        error: errorData.error || `API error: ${response.status}`,
      };
    }

    const result = await response.json();

    if (result.success) {
      return {
        processed: true,
        text,
        wordsExtracted: result.analysis ? [
          {
            word: `${result.analysis.lexemes_processed} lexemes processed`,
            base_form: 'analysis',
            part_of_speech: 'result'
          }
        ] : [],
        wordsUpdated: [`${result.analysis?.new_srs_items || 0} SRS items created`],
        timestamp: Date.now(),
      };
    } else {
      return {
        processed: false,
        error: result.error || 'Failed to process utterance',
      };
    }
  } catch (error) {
    console.error('Error processing language text:', error);
    return {
      processed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get all language words from the CSV file
 *
 * @returns Promise that resolves to an array of language words
 */
export async function getLanguageWords(): Promise<LanguageWord[]> {
  try {
    const response = await fetch('/api/language/words');

    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return [];
    }

    const result = await response.json();
    return result.success ? result.words : [];
  } catch (error) {
    console.error('Error getting language words:', error);
    return [];
  }
}

/**
 * Class for managing automatic language processing
 */
export class LanguageProcessorService {
  private processingInterval: NodeJS.Timeout | null = null;
  private intervalMs: number;
  private textBuffer: string[] = [];
  private isProcessing: boolean = false;
  private lastProcessedTime: number = 0;

  /**
   * Initialize the language processor service
   *
   * @param intervalMs The interval in milliseconds between processing runs (default: 60000 = 1 minute)
   */
  constructor(intervalMs: number = 60000) {
    this.intervalMs = intervalMs;
  }

  /**
   * Start the automatic processing service
   */
  start(): void {
    if (this.processingInterval) {
      return; // Already running
    }

    this.processingInterval = setInterval(() => {
      this.processBufferedText();
    }, this.intervalMs);

    console.log(`Language processor service started (interval: ${this.intervalMs}ms)`);
  }

  /**
   * Stop the automatic processing service
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Language processor service stopped');
    }
  }

  /**
   * Add text to the processing buffer
   *
   * @param text The text to add to the buffer
   */
  addText(text: string): void {
    if (text && text.trim()) {
      this.textBuffer.push(text);
    }
  }

  /**
   * Process all text in the buffer
   */
  private async processBufferedText(): Promise<void> {
    // Skip if already processing or buffer is empty
    if (this.isProcessing || this.textBuffer.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Combine all text in the buffer
      const combinedText = this.textBuffer.join(' ');
      this.textBuffer = []; // Clear the buffer

      // Process the combined text
      console.log(`Processing ${combinedText.length} characters of text...`);
      const result = await processLanguageText(combinedText);

      if (result.processed) {
        console.log(`Processed text successfully. Words extracted: ${result.wordsExtracted?.length || 0}`);
        this.lastProcessedTime = Date.now();
      } else {
        console.error(`Failed to process text: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in automatic language processing:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get the time since the last processing run
   *
   * @returns The time in milliseconds since the last processing run
   */
  getTimeSinceLastProcessing(): number {
    return this.lastProcessedTime ? Date.now() - this.lastProcessedTime : -1;
  }

  /**
   * Check if the service is currently running
   *
   * @returns True if the service is running, false otherwise
   */
  isRunning(): boolean {
    return this.processingInterval !== null;
  }
}

// Create a singleton instance for easy access
export const languageProcessor = new LanguageProcessorService();
