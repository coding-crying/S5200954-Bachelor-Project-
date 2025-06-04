/**
 * Hook for processing language learning conversations with Neo4j integration
 *
 * This hook integrates the new Neo4j-based utterance processing with the existing
 * conversation flow to automatically analyze and store linguistic data.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranscript } from '@/app/contexts/TranscriptContext';

interface UserProfile {
  userId: string;
  name: string;
  nativeLanguage: string;
  nativeLanguageCode: string;
  targetLanguage: string;
  targetLanguageCode: string;
}

interface UtteranceAnalysis {
  utteranceId: string;
  conversationId: string;
  lexemes_processed: number;
  new_srs_items: number;
  translations_created: number;
  relationships_created: number;
}

export function useLanguageLearningProcessor() {
  const { transcriptItems, addTranscriptBreadcrumb } = useTranscript();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastProcessedItemId, setLastProcessedItemId] = useState<string | null>(null);
  const [messageBuffer, setMessageBuffer] = useState<Array<{
    itemId: string;
    text: string;
    speaker: 'user' | 'assistant';
    timestamp: number;
  }>>([]);
  const [processingTimer, setProcessingTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastApiCall, setLastApiCall] = useState<number>(0);

  // Initialize user profile from session storage or create a default one
  const initializeUserProfile = useCallback(async () => {
    try {
      // Try to get user profile from session storage first
      const storedProfile = sessionStorage.getItem('languageLearningProfile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        setUserProfile(profile);
        console.log('📋 Loaded user profile from session:', profile.name);
        return profile;
      }

      // If no stored profile, create a default one for demo purposes
      const defaultProfile: UserProfile = {
        userId: 'demo-user-' + Date.now(),
        name: 'Demo User',
        nativeLanguage: 'English',
        nativeLanguageCode: 'en',
        targetLanguage: 'Spanish',
        targetLanguageCode: 'es'
      };

      // Create user in Neo4j
      const response = await fetch('/api/users/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: defaultProfile.name,
          nativeLanguage: defaultProfile.nativeLanguage,
          targetLanguage: defaultProfile.targetLanguage
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          defaultProfile.userId = result.userId;
          setUserProfile(defaultProfile);
          sessionStorage.setItem('languageLearningProfile', JSON.stringify(defaultProfile));
          console.log('✅ Created new user profile:', defaultProfile.name, 'ID:', defaultProfile.userId);
          return defaultProfile;
        }
      }

      // Fallback to default profile even if API fails
      setUserProfile(defaultProfile);
      sessionStorage.setItem('languageLearningProfile', JSON.stringify(defaultProfile));
      console.log('⚠️ Using fallback user profile:', defaultProfile.name);
      return defaultProfile;

    } catch (error) {
      console.error('❌ Error initializing user profile:', error);
      return null;
    }
  }, []);

  // Smart filtering to avoid processing trivial content
  const shouldProcessText = useCallback((text: string): boolean => {
    if (!text || text.trim().length < 3) return false;

    // Skip common greetings and filler words
    const trivialPatterns = [
      /^(hi|hello|hey|ok|okay|yes|no|yeah|yep|nope|thanks|thank you)\.?$/i,
      /^(um|uh|hmm|ah|oh)\.?$/i,
      /^(good|great|nice|cool|awesome)\.?$/i
    ];

    const normalizedText = text.trim().toLowerCase();
    return !trivialPatterns.some(pattern => pattern.test(normalizedText));
  }, []);

  // Rate limiting helper
  const canMakeApiCall = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    const minInterval = 2000; // Minimum 2 seconds between API calls

    return timeSinceLastCall >= minInterval;
  }, [lastApiCall]);

  // Batch processing of messages
  const processBatchedMessages = useCallback(async (): Promise<void> => {
    if (messageBuffer.length === 0 || isProcessing || !userProfile) {
      return;
    }

    // Filter out trivial messages
    const meaningfulMessages = messageBuffer.filter(msg => shouldProcessText(msg.text));

    if (meaningfulMessages.length === 0) {
      console.log('🔍 No meaningful content to process, skipping batch');
      setMessageBuffer([]);
      return;
    }

    // Check rate limiting
    if (!canMakeApiCall()) {
      console.log('⏱️ Rate limiting: delaying API call');
      return;
    }

    setIsProcessing(true);
    setLastApiCall(Date.now());

    try {
      // Combine user messages for batch processing
      const userMessages = meaningfulMessages.filter(msg => msg.speaker === 'user');

      if (userMessages.length > 0) {
        const combinedText = userMessages.map(msg => msg.text).join(' ');
        console.log(`🔍 Batch processing ${userMessages.length} user messages: "${combinedText.substring(0, 100)}..."`);

        const response = await fetch('/api/utterance/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userProfile.userId,
            conversationId: conversationId,
            utteranceText: combinedText,
            speaker: 'user',
            targetLanguage: userProfile.targetLanguageCode,
            userNativeLanguage: userProfile.nativeLanguageCode
          })
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            // Update conversation ID if it was created
            if (result.conversationId && !conversationId) {
              setConversationId(result.conversationId);
            }

            const analysis: UtteranceAnalysis = {
              utteranceId: result.utteranceId,
              conversationId: result.conversationId,
              lexemes_processed: result.analysis.lexemes_processed,
              new_srs_items: result.analysis.new_srs_items,
              translations_created: result.analysis.translations_created,
              relationships_created: result.analysis.relationships_created
            };

            // Add breadcrumb to show processing results
            addTranscriptBreadcrumb(
              `🧠 Batch Analysis: ${analysis.lexemes_processed} lexemes, ${analysis.new_srs_items} new vocabulary`,
              {
                batchSize: userMessages.length,
                utteranceId: analysis.utteranceId,
                conversationId: analysis.conversationId,
                analysis: analysis,
                userProfile: userProfile,
                timestamp: Date.now(),
                hidden: false
              }
            );

            console.log(`✅ Batch processed: ${analysis.lexemes_processed} lexemes, ${analysis.new_srs_items} new SRS items`);
          }
        }
      }

      // Clear the buffer
      setMessageBuffer([]);

    } catch (error) {
      console.error('❌ Error in batch processing:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [messageBuffer, isProcessing, userProfile, conversationId, shouldProcessText, canMakeApiCall, addTranscriptBreadcrumb]);

  // Add message to buffer for batch processing
  const addMessageToBuffer = useCallback((text: string, itemId: string, speaker: 'user' | 'assistant' = 'user') => {
    if (!text || itemId === lastProcessedItemId || !shouldProcessText(text)) {
      return;
    }

    console.log(`📝 Adding ${speaker} message to buffer: "${text.substring(0, 30)}..."`);

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

    // Set new timer for batch processing (longer delay to accumulate more messages)
    const newTimer = setTimeout(() => {
      processBatchedMessages();
    }, 8000); // Process batch after 8 seconds of inactivity

    setProcessingTimer(newTimer);
  }, [lastProcessedItemId, shouldProcessText, processingTimer, processBatchedMessages]);

  // Legacy single message processing (now optimized)
  const processUserUtterance = useCallback(async (text: string, itemId: string): Promise<UtteranceAnalysis | null> => {
    if (!userProfile || !text.trim()) {
      return null;
    }

    setIsProcessing(true);

    try {
      console.log(`🔍 Processing user utterance: "${text.substring(0, 50)}..."`);

      const response = await fetch('/api/utterance/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.userId,
          conversationId: conversationId,
          utteranceText: text,
          speaker: 'user',
          targetLanguage: userProfile.targetLanguageCode,
          userNativeLanguage: userProfile.nativeLanguageCode
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update conversation ID if it was created
        if (result.conversationId && !conversationId) {
          setConversationId(result.conversationId);
        }

        const analysis: UtteranceAnalysis = {
          utteranceId: result.utteranceId,
          conversationId: result.conversationId,
          lexemes_processed: result.analysis.lexemes_processed,
          new_srs_items: result.analysis.new_srs_items,
          translations_created: result.analysis.translations_created,
          relationships_created: result.analysis.relationships_created
        };

        // Add breadcrumb to show processing results
        addTranscriptBreadcrumb(
          `🧠 Language Analysis: ${analysis.lexemes_processed} lexemes, ${analysis.new_srs_items} new vocabulary`,
          {
            utteranceId: analysis.utteranceId,
            conversationId: analysis.conversationId,
            analysis: analysis,
            userProfile: userProfile,
            timestamp: Date.now(),
            hidden: false // Show this in UI for language learning
          }
        );

        console.log(`✅ Utterance processed: ${analysis.lexemes_processed} lexemes, ${analysis.new_srs_items} new SRS items`);
        return analysis;

      } else {
        throw new Error(result.error || 'Failed to process utterance');
      }

    } catch (error) {
      console.error('❌ Error processing user utterance:', error);

      addTranscriptBreadcrumb(
        `❌ Processing Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          error: error instanceof Error ? error.message : String(error),
          text: text.substring(0, 100),
          timestamp: Date.now(),
          hidden: false
        }
      );

      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [userProfile, conversationId, addTranscriptBreadcrumb]);

  // Process AI tutor response
  const processAIResponse = useCallback(async (text: string, itemId: string): Promise<UtteranceAnalysis | null> => {
    if (!userProfile || !text.trim()) {
      return null;
    }

    try {
      console.log(`🤖 Processing AI response: "${text.substring(0, 50)}..."`);

      const response = await fetch('/api/utterance/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.userId,
          conversationId: conversationId,
          utteranceText: text,
          speaker: 'AI',
          targetLanguage: userProfile.targetLanguageCode,
          userNativeLanguage: userProfile.nativeLanguageCode
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`✅ AI response processed: ${result.analysis.lexemes_processed} lexemes`);
          return {
            utteranceId: result.utteranceId,
            conversationId: result.conversationId,
            lexemes_processed: result.analysis.lexemes_processed,
            new_srs_items: result.analysis.new_srs_items,
            translations_created: result.analysis.translations_created,
            relationships_created: result.analysis.relationships_created
          };
        }
      }
    } catch (error) {
      console.error('❌ Error processing AI response:', error);
    }

    return null;
  }, [userProfile, conversationId]);

  // Monitor transcript items for new messages (now using batching)
  useEffect(() => {
    if (transcriptItems.length === 0 || !userProfile) return;

    const latestItem = transcriptItems[transcriptItems.length - 1];

    // Add completed user messages to batch buffer
    if (
      latestItem.type === 'MESSAGE' &&
      latestItem.role === 'user' &&
      latestItem.status === 'DONE' &&
      latestItem.title &&
      latestItem.itemId !== lastProcessedItemId
    ) {
      addMessageToBuffer(latestItem.title, latestItem.itemId, 'user');
      setLastProcessedItemId(latestItem.itemId);
    }

    // Add completed assistant messages to batch buffer (for context)
    if (
      latestItem.type === 'MESSAGE' &&
      latestItem.role === 'assistant' &&
      latestItem.status === 'DONE' &&
      latestItem.title &&
      latestItem.itemId !== lastProcessedItemId
    ) {
      addMessageToBuffer(latestItem.title, latestItem.itemId, 'assistant');
      setLastProcessedItemId(latestItem.itemId);
    }
  }, [transcriptItems, lastProcessedItemId, userProfile, addMessageToBuffer]);

  // Force process buffer when it gets too large
  useEffect(() => {
    if (messageBuffer.length >= 5) { // Process immediately if buffer gets too large
      console.log('📦 Buffer size limit reached, processing immediately');
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

  // Initialize user profile on mount
  useEffect(() => {
    initializeUserProfile();
  }, [initializeUserProfile]);

  // Get due SRS items for review
  const getDueSRSItems = useCallback(async () => {
    if (!userProfile) return [];

    try {
      const response = await fetch(
        `/api/srs?userId=${userProfile.userId}&targetLanguage=${userProfile.targetLanguageCode}&limit=10`
      );

      if (response.ok) {
        const result = await response.json();
        return result.dueItems || [];
      }
    } catch (error) {
      console.error('❌ Error getting due SRS items:', error);
    }

    return [];
  }, [userProfile]);

  return {
    userProfile,
    conversationId,
    isProcessing,
    processUserUtterance,
    processAIResponse,
    getDueSRSItems,
    initializeUserProfile,
    addMessageToBuffer,
    processBatchedMessages,
    messageBuffer: messageBuffer.length
  };
}
