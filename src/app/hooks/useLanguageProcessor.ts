/**
 * Hook for processing conversation text to extract basic word forms
 * and update the language words CSV file.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranscript } from '@/app/contexts/TranscriptContext';
import { languageProcessor, processLanguageText } from '@/app/lib/languageProcessor';

export function useLanguageProcessor() {
  const { transcriptItems } = useTranscript();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastProcessedItemId, setLastProcessedItemId] = useState<string | null>(null);
  const [processorStatus, setProcessorStatus] = useState<{
    running: boolean;
    lastProcessed: number;
    bufferSize: number;
  }>({
    running: false,
    lastProcessed: 0,
    bufferSize: 0
  });

  // Start the language processor service when the hook is first used
  useEffect(() => {
    // Start the language processor service
    languageProcessor.start();
    
    // Update the status
    setProcessorStatus({
      running: languageProcessor.isRunning(),
      lastProcessed: languageProcessor.getTimeSinceLastProcessing(),
      bufferSize: 0
    });

    // Clean up when the component unmounts
    return () => {
      languageProcessor.stop();
    };
  }, []);

  // Update the processor status periodically
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setProcessorStatus({
        running: languageProcessor.isRunning(),
        lastProcessed: languageProcessor.getTimeSinceLastProcessing(),
        bufferSize: 0 // We don't have direct access to buffer size
      });
    }, 5000); // Update every 5 seconds

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  // Process a single message manually
  const processMessage = useCallback(async (itemId: string, text: string) => {
    if (!text || itemId === lastProcessedItemId) {
      return;
    }

    setIsProcessing(true);
    setLastProcessedItemId(itemId);

    try {
      // Process the message
      const result = await processLanguageText(text);
      
      if (result.processed) {
        console.log(`Processed message: ${itemId.slice(0, 8)}... Words extracted: ${result.wordsExtracted?.length || 0}`);
      } else {
        console.error(`Failed to process message: ${result.error}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [lastProcessedItemId]);

  // Monitor transcript items for new messages and add them to the processor
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
      // Add the text to the language processor buffer
      languageProcessor.addText(latestItem.title);
      
      // Update the last processed item ID
      setLastProcessedItemId(latestItem.itemId);
      
      // Log that the text was added to the buffer (hidden from UI)
      console.log(`Added message to language processor buffer: ${latestItem.itemId.slice(0, 8)}...`);
    }
  }, [transcriptItems, lastProcessedItemId]);

  // Function to manually start/stop the processor
  const toggleProcessor = useCallback(() => {
    if (languageProcessor.isRunning()) {
      languageProcessor.stop();
    } else {
      languageProcessor.start();
    }
    
    setProcessorStatus({
      running: languageProcessor.isRunning(),
      lastProcessed: languageProcessor.getTimeSinceLastProcessing(),
      bufferSize: 0
    });
  }, []);

  return {
    isProcessing,
    processMessage,
    processorStatus,
    toggleProcessor
  };
}
