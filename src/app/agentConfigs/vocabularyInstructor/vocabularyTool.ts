/**
 * Client-side vocabulary tool that fetches data from the API
 */

/**
 * Get participant and condition from current URL parameters
 */
function getUrlParams() {
  if (typeof window === 'undefined') return { participantId: null, condition: null };
  
  const urlParams = new URLSearchParams(window.location.search);
  return {
    participantId: urlParams.get('participant'),
    condition: urlParams.get('condition')
  };
}

/**
 * Build API URL with participant and condition parameters
 */
function buildApiUrl(baseAction: string, additionalParams: Record<string, string> = {}) {
  const { participantId, condition } = getUrlParams();
  const params = new URLSearchParams({ action: baseAction });
  
  if (participantId) params.append('participant', participantId);
  if (condition) params.append('condition', condition);
  
  // Add any additional parameters
  Object.entries(additionalParams).forEach(([key, value]) => {
    params.append(key, value);
  });
  
  return `/api/vocabulary?${params.toString()}`;
}

/**
 * Fetches a random vocabulary word from the API
 * @returns A promise that resolves to a random vocabulary word
 */
export async function fetchRandomWord() {
  try {
    const response = await fetch(buildApiUrl('random'));
    const result = await response.json();

    if (!result.success) {
      console.error('Error fetching random word:', result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching random word:', error);
    return null;
  }
}

/**
 * Fetches multiple unintroduced vocabulary words from the API
 * @param count The number of unintroduced words to retrieve
 * @returns A promise that resolves to an array of unintroduced vocabulary words
 */
export async function fetchRandomWords(count: number) {
  try {
    const response = await fetch(buildApiUrl('unintroduced', { count: count.toString() }));
    const result = await response.json();

    if (!result.success) {
      console.error('Error fetching unintroduced words:', result.error);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching unintroduced words:', error);
    return [];
  }
}

/**
 * Searches for vocabulary words matching a term
 * @param searchTerm The term to search for
 * @returns A promise that resolves to an array of matching vocabulary words
 */
export async function searchVocabularyWords(searchTerm: string) {
  try {
    const response = await fetch(buildApiUrl('search', { term: encodeURIComponent(searchTerm) }));
    const result = await response.json();

    if (!result.success) {
      console.error('Error searching vocabulary words:', result.error);
      return { words: [], count: 0 };
    }

    return {
      words: result.data,
      count: result.count
    };
  } catch (error) {
    console.error('Error searching vocabulary words:', error);
    return { words: [], count: 0 };
  }
}

/**
 * Fetches only introduced vocabulary words (words that have been seen before)
 * @param count The number of introduced words to retrieve
 * @returns A promise that resolves to an array of introduced vocabulary words
 */
export async function fetchIntroducedWords(count: number) {
  try {
    const response = await fetch(buildApiUrl('introduced', { count: count.toString() }));
    const result = await response.json();

    if (!result.success) {
      console.error('Error fetching introduced words:', result.message || result.error);
      return { words: [], count: 0, hasWords: false };
    }

    return {
      words: result.data,
      count: result.count,
      hasWords: result.data.length > 0
    };
  } catch (error) {
    console.error('Error fetching introduced words:', error);
    return { words: [], count: 0, hasWords: false };
  }
}

/**
 * Fetches high priority vocabulary words for review
 * @param count The number of high priority words to retrieve
 * @returns A promise that resolves to an array of high priority vocabulary words
 */
export async function fetchHighPriorityWords(count: number) {
  try {
    const response = await fetch(buildApiUrl('high-priority', { count: count.toString() }));
    const result = await response.json();

    if (!result.success) {
      console.error('Error fetching high priority words:', result.message || result.error);
      return { words: [], count: 0, hasWords: false };
    }

    return {
      words: result.data,
      count: result.count,
      hasWords: result.data.length > 0
    };
  } catch (error) {
    console.error('Error fetching high priority words:', error);
    return { words: [], count: 0, hasWords: false };
  }
}

/**
 * Resets the tracking of recently presented words
 * @returns A promise that resolves to a success message
 */
export async function resetPresentedWordsTracking() {
  try {
    const response = await fetch(buildApiUrl('reset-tracking'));
    const result = await response.json();

    if (!result.success) {
      console.error('Error resetting presented words tracking:', result.error);
      return { success: false, message: 'Failed to reset tracking' };
    }

    console.log('Reset presented words tracking:', result.message);
    return result;
  } catch (error) {
    console.error('Error resetting presented words tracking:', error);
    return { success: false, message: 'Failed to reset tracking due to an error' };
  }
}
