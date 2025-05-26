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
  const [messageBuffer, setMessageBuffer] = useState<Array<{
    itemId: string;
    text: string;
    speaker: 'user' | 'assistant';
    timestamp: number;
  }>>([]);
  const [processingTimer, setProcessingTimer] = useState<NodeJS.Timeout | null>(null);

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

  // Process multiple messages in batch to reduce API calls and improve efficiency
  const processBatchedMessages = useCallback(async () => {
    if (messageBuffer.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);
    console.log(`[Batch Processing] Processing ${messageBuffer.length} messages in batch`);

    try {
      // Group messages by speaker for better analysis
      const userMessages = messageBuffer.filter(msg => msg.speaker === 'user');
      const assistantMessages = messageBuffer.filter(msg => msg.speaker === 'assistant');

      // Process user and assistant messages separately if both exist
      const processingPromises = [];

      if (userMessages.length > 0) {
        const userText = userMessages.map(msg => msg.text).join(' ');
        const userItemIds = userMessages.map(msg => msg.itemId);

        processingPromises.push(
          processBatchText(userText, 'user', userItemIds)
        );
      }

      if (assistantMessages.length > 0) {
        const assistantText = assistantMessages.map(msg => msg.text).join(' ');
        const assistantItemIds = assistantMessages.map(msg => msg.itemId);

        processingPromises.push(
          processBatchText(assistantText, 'assistant', assistantItemIds)
        );
      }

      // Wait for all processing to complete
      const results = await Promise.all(processingPromises);

      // Clear the buffer and update last processed ID
      const lastMessage = messageBuffer[messageBuffer.length - 1];
      setLastProcessedItemId(lastMessage.itemId);
      setMessageBuffer([]);

      console.log(`[Batch Processing] Completed processing ${messageBuffer.length} messages`);

    } catch (error) {
      console.error('[Batch Processing] Error processing batch:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [messageBuffer, isProcessing, vocabularyWords, addTranscriptBreadcrumb, loadVocabularyWords]);

  // Process a batch of text for a specific speaker
  const processBatchText = useCallback(async (text: string, speaker: 'user' | 'assistant', itemIds: string[]) => {
    try {
      console.log(`[Batch Processing] Processing ${text.length} characters for ${speaker}`);

      // Use the enhanced processing pipeline with larger context
      const response = await fetch('/api/conversation/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          vocabularyWords: vocabularyWords.map(w => w.word),
          includeAnalysis: true,
          speaker,
          batchMode: true,
          messageCount: itemIds.length
        }),
      });

      const result = await response.json();

      if (result.success && result.processed) {
        const wordsFound = result.analysis?.vocabulary_words || [];
        const csvUpdates = result.csv_updates || [];

        console.log(`[Batch Processing] ${speaker} analysis: ${wordsFound.length} words found, ${csvUpdates.length} CSV updates`);

        // Show a batch breadcrumb if vocabulary words were found
        if (wordsFound.length > 0) {
          const speakerLabel = speaker === 'user' ? 'User' : 'Assistant';
          const speakerEmoji = speaker === 'user' ? '👤' : '🤖';

          addTranscriptBreadcrumb(
            `${speakerEmoji} ${speakerLabel} Batch Analysis: ${wordsFound.length} word(s) in ${itemIds.length} messages`,
            {
              batchMode: true,
              messageCount: itemIds.length,
              textLength: text.length,
              speaker,
              wordsFound: wordsFound.map((w: any) => `${w.found_form} → ${w.word} (${w.used_correctly ? '✓' : '✗'})`),
              csvUpdates: csvUpdates.length,
              effectiveness: result.analysis?.learning_effectiveness || 0,
              summary: result.analysis?.summary || '',
              timestamp: result.timestamp,
              hidden: true // Hide from UI to avoid clutter
            }
          );

          // Apply CSV updates if available
          if (csvUpdates.length > 0) {
            fetch('/api/vocabulary', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text, useGPTAnalysis: true }),
            }).then(() => {
              console.log(`[Batch Processing] CSV updates applied for ${speaker}`);
              loadVocabularyWords();
            }).catch(err => {
              console.error(`[Batch Processing] Error applying CSV updates for ${speaker}:`, err);
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error(`[Batch Processing] Error processing ${speaker} text:`, error);
      return null;
    }
  }, [vocabularyWords, addTranscriptBreadcrumb, loadVocabularyWords]);

  // Add message to buffer for batch processing (replaces individual processing)
  const addMessageToBuffer = useCallback((itemId: string, text: string, speaker: 'user' | 'assistant' = 'user') => {
    if (!text || itemId === lastProcessedItemId) {
      return;
    }

    console.log(`[Buffer] Adding ${speaker} message to batch buffer: ${itemId.slice(0, 8)}...`);

    // Add message to buffer
    setMessageBuffer(prev => [...prev, {
      itemId,
      text,
      speaker,
      timestamp: Date.now()
    }]);

    // Clear existing timer
    if (processingTimer) {
      clearTimeout(processingTimer);
    }

    // Set new timer for batch processing
    const newTimer = setTimeout(() => {
      processBatchedMessages();
    }, 3000); // Process batch after 3 seconds of inactivity

    setProcessingTimer(newTimer);
  }, [lastProcessedItemId, processingTimer, processBatchedMessages]);

  // Legacy single message processing (kept for manual processing)
  const processMessage = useCallback(async (itemId: string, text: string, speaker: 'user' | 'assistant' = 'user') => {
    if (!text || itemId === lastProcessedItemId) {
      return;
    }

    // Set a debounce to avoid processing the same message multiple times
    setLastProcessedItemId(itemId);

    try {
      // Use the new enhanced processing pipeline with GPT-4.1-mini
      const response = await fetch('/api/conversation/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          vocabularyWords: vocabularyWords.map(w => w.word),
          includeAnalysis: true,
          speaker
        }),
      });

      const result = await response.json();

      if (result.success && result.processed) {
        const wordsFound = result.analysis?.vocabulary_words || [];
        const csvUpdates = result.csv_updates || [];

        console.log(`GPT-4.1-mini analysis complete: ${wordsFound.length} words found, ${csvUpdates.length} CSV updates`);

        // Only show a breadcrumb if vocabulary words were found
        if (wordsFound.length > 0) {
          const speakerLabel = speaker === 'user' ? 'User' : 'Assistant';
          const speakerEmoji = speaker === 'user' ? '👤' : '🤖';

          addTranscriptBreadcrumb(
            `${speakerEmoji} ${speakerLabel} Vocabulary: ${wordsFound.length} word(s) detected`,
            {
              text,
              speaker,
              wordsFound: wordsFound.map((w: any) => `${w.found_form} → ${w.word} (${w.used_correctly ? '✓' : '✗'})`),
              csvUpdates: csvUpdates.length,
              effectiveness: result.analysis?.learning_effectiveness || 0,
              summary: result.analysis?.summary || '',
              timestamp: result.timestamp,
              hidden: true // Hide from UI to avoid clutter
            }
          );

          // Apply CSV updates if available
          if (csvUpdates.length > 0) {
            // For now, we'll use the existing vocabulary API to apply updates
            // In the future, we can create a dedicated CSV update endpoint
            fetch('/api/vocabulary', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text, useGPTAnalysis: true }),
            }).then(() => {
              console.log('CSV updates applied via vocabulary API');
              loadVocabularyWords();
            }).catch(err => {
              console.error('Error applying CSV updates:', err);
            });
          }
        }
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

  // Automatically add new messages to batch buffer
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
      // Add both user and assistant messages to batch buffer
      const speaker = latestItem.role || 'user'; // Default to 'user' if role is not set
      addMessageToBuffer(latestItem.itemId, latestItem.title, speaker);

      // Log that message was added to buffer (hidden from UI)
      console.log(`Auto-added ${speaker} message to batch buffer: ${latestItem.itemId.slice(0, 8)}...`);
    }
  }, [transcriptItems, lastProcessedItemId, addMessageToBuffer]);

  // Force process buffer when component unmounts or when buffer gets too large
  useEffect(() => {
    // Process immediately if buffer gets too large (10+ messages)
    if (messageBuffer.length >= 10) {
      console.log('[Buffer] Buffer size limit reached, processing immediately');
      if (processingTimer) {
        clearTimeout(processingTimer);
        setProcessingTimer(null);
      }
      processBatchedMessages();
    }
  }, [messageBuffer.length, processingTimer, processBatchedMessages]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (processingTimer) {
        clearTimeout(processingTimer);
      }
    };
  }, [processingTimer]);

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
      processMessage(latestUserMessage.itemId, latestUserMessage.title, 'user');
    }
  }, [transcriptItems, lastProcessedItemId, processMessage]);

  return {
    vocabularyWords,
    loadVocabularyWords,
    processMessage,
    processMessageWithModel,
    processLatestUserMessage,
    processBatchedMessages,
    addMessageToBuffer,
    messageBuffer,
    isProcessing,
  };
}
