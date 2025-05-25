/**
 * Effectiveness Analyzer Module
 * 
 * This module provides client-side utilities for analyzing vocabulary word usage
 * effectiveness and retrieving analysis results.
 */

interface EffectivenessResult {
  word: string;
  time_last_seen: number;
  correct_uses: number;
  total_uses: number;
  effectiveness_score: number;
  next_due: number;
  interval: number;
}

/**
 * Submit text for background effectiveness analysis
 * 
 * @param text The text to analyze
 * @param includeHistory Whether to include conversation history for context
 * @returns Promise that resolves to the submission result
 */
export async function submitTextForAnalysis(text: string, includeHistory: boolean = true): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch('/api/vocabulary/effectiveness', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        includeHistory,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `API error: ${response.status}`,
      };
    }
    
    const result = await response.json();
    return {
      success: true,
      message: result.message || 'Text submitted for analysis',
    };
  } catch (error) {
    console.error('Error submitting text for analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get the latest effectiveness analysis results
 * 
 * @returns Promise that resolves to the analysis results
 */
export async function getEffectivenessResults(): Promise<{ success: boolean; data?: EffectivenessResult[]; error?: string }> {
  try {
    const response = await fetch('/api/vocabulary/effectiveness');
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `API error: ${response.status}`,
      };
    }
    
    const result = await response.json();
    return {
      success: true,
      data: result.data || [],
    };
  } catch (error) {
    console.error('Error getting effectiveness results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Process conversation text automatically in the background
 * 
 * This function can be called whenever new conversation text is available,
 * such as after a user or assistant message.
 * 
 * @param text The conversation text to process
 */
export async function processConversationText(text: string): Promise<void> {
  try {
    // Submit the text for background analysis
    const result = await submitTextForAnalysis(text);
    
    if (!result.success) {
      console.error('Failed to process conversation text:', result.error);
    }
  } catch (error) {
    console.error('Error processing conversation text:', error);
  }
}
