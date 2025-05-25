/**
 * Hook for processing conversation text to identify vocabulary words
 * and analyze vocabulary usage effectiveness
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranscript } from '@/app/contexts/TranscriptContext';
import { VocabularyWord, VocabularyProcessingResult } from '@/app/types';
import { processConversationText } from '@/app/lib/effectivenessAnalyzer';

export function useVocabularyProcessor() {
  const { transcriptItems, addTranscriptBreadcrumb } = useTranscript();
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastProcessedItemId, setLastProcessedItemId] = useState<string | null>(null);

  // Load vocabulary words from the API
  const loadVocabularyWords = useCallback(async () => {
    try {
      const response = await fetch('/api/vocabulary?action=srs');
      const data = await response.json();

      if (data.success && Array.isArray(data.words)) {
        setVocabularyWords(data.words);
      }
    } catch (error) {
      console.error('Error loading vocabulary words:', error);
    }
  }, []);

  // Process a single message to identify vocabulary words and analyze effectiveness
  const processMessage = useCallback(async (itemId: string, text: string) => {
    if (!text || itemId === lastProcessedItemId) {
      return;
    }

    // Set a debounce to avoid processing the same message multiple times
    setLastProcessedItemId(itemId);

    try {
      // First, process the message to identify vocabulary words
      const response = await fetch('/api/vocabulary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (result.success && result.processed && result.wordsFound.length > 0) {
        console.log(`Vocabulary words found: ${result.wordsFound.join(', ')}`);

        // Only show a visible breadcrumb if words were actually updated
        if (result.wordsUpdated && result.wordsUpdated.length > 0) {
          addTranscriptBreadcrumb('Vocabulary Words Updated', {
            text,
            wordsFound: result.wordsFound,
            wordsUpdated: result.wordsUpdated,
            timestamp: result.timestamp,
            hidden: true // Hide this from the UI to avoid clutter
          });

          // Reload vocabulary words to get the updated data
          loadVocabularyWords();
        }

        // Then, automatically process the text with the effectiveness analyzer in the background
        processConversationText(text).catch(err => {
          console.error('Error in background effectiveness analysis:', err);
        });
      }
    } catch (error) {
      console.error('Error processing message for vocabulary:', error);
    }
  }, [lastProcessedItemId, addTranscriptBreadcrumb, loadVocabularyWords]);

  // Process a message with a language model for more accurate analysis
  const processMessageWithModel = useCallback(async (itemId: string, text: string) => {
    if (!text || isProcessing || itemId === lastProcessedItemId) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a language analysis assistant that identifies vocabulary words in text and evaluates their usage.
              Analyze the text for any of these vocabulary words: ${vocabularyWords.slice(0, 50).map(w => w.word).join(', ')}.
              For each word found, determine if it was used correctly in context.`
            },
            { role: 'user', content: text }
          ],
          temperature: 0.3,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;

      // Add a breadcrumb to show the analysis
      addTranscriptBreadcrumb('Vocabulary Analysis', {
        text,
        analysis: content,
        timestamp: Date.now(),
      });

      setLastProcessedItemId(itemId);
    } catch (error) {
      console.error('Error processing message with model:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, lastProcessedItemId, addTranscriptBreadcrumb, vocabularyWords]);

  // Monitor transcript items for new messages
  useEffect(() => {
    // Load vocabulary words when the component mounts
    loadVocabularyWords();
  }, [loadVocabularyWords]);

  // Automatically process new messages
  useEffect(() => {
    // Skip if there are no transcript items
    if (transcriptItems.length === 0) return;

    // Get the latest message
    const latestItem = transcriptItems[transcriptItems.length - 1];

    // Only process MESSAGE type items that have text content
    if (
      latestItem.type === 'MESSAGE' &&
      latestItem.title &&
      latestItem.itemId !== lastProcessedItemId
    ) {
      // Process both user and assistant messages
      processMessage(latestItem.itemId, latestItem.title);

      // Log that automatic processing occurred (hidden from UI)
      console.log(`Auto-processed message: ${latestItem.itemId.slice(0, 8)}...`);
    }
  }, [transcriptItems, lastProcessedItemId, processMessage]);

  // Function to manually process the latest user message
  const processLatestUserMessage = useCallback(() => {
    // Find the latest user message
    const userMessages = transcriptItems.filter(
      item => item.type === 'MESSAGE' && item.role === 'user'
    );

    if (userMessages.length === 0) {
      return;
    }

    const latestUserMessage = userMessages[userMessages.length - 1];

    if (latestUserMessage.itemId !== lastProcessedItemId && latestUserMessage.title) {
      processMessage(latestUserMessage.itemId, latestUserMessage.title);
    }
  }, [transcriptItems, lastProcessedItemId, processMessage]);

  return {
    vocabularyWords,
    loadVocabularyWords,
    processMessage,
    processMessageWithModel,
    processLatestUserMessage,
    isProcessing,
  };
}
