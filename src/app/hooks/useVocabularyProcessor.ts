/**
 * Hook for processing conversation text to identify vocabulary words
 * and analyze vocabulary usage effectiveness
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranscript } from '@/app/contexts/TranscriptContext';
import { VocabularyWord, VocabularyProcessingResult } from '@/app/types';
import { processConversationText } from '@/app/lib/effectivenessAnalyzer';

export function useVocabularyProcessor() {
  const { transcriptItems, addTranscriptBreadcrumb } = useTranscript();
  const searchParams = useSearchParams();
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastProcessedItemId, setLastProcessedItemId] = useState<string | null>(null);

  // Get participant and condition from URL parameters
  const participantId = searchParams.get('participant');
  const condition = searchParams.get('condition');

  // Load vocabulary words from the API
  const loadVocabularyWords = useCallback(async () => {
    try {
      // Build API URL with participant and condition parameters
      const params = new URLSearchParams({ action: 'srs' });
      if (participantId) params.append('participant', participantId);
      if (condition) params.append('condition', condition);
      
      const response = await fetch(`/api/vocabulary?${params.toString()}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.words)) {
        setVocabularyWords(data.words);
      }
    } catch (error) {
      console.error('Error loading vocabulary words:', error);
    }
  }, [participantId, condition]);




  // Individual message processing
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
            // Use the existing vocabulary API to apply updates
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
    isProcessing,
  };
}
