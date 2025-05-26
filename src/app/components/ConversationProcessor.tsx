"use client";

import React, { useState } from "react";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useVocabularyProcessor } from "@/app/hooks/useVocabularyProcessor";

interface ConversationProcessorProps {
  isVisible: boolean;
}

export default function ConversationProcessor({ isVisible }: ConversationProcessorProps) {
  const { transcriptItems } = useTranscript();
  const {
    processMessage,
    processMessageWithModel,
    processLatestUserMessage,
    processBatchedMessages,
    messageBuffer,
    isProcessing,
  } = useVocabularyProcessor();

  const [model, setModel] = useState<string>("gpt-4o-mini");

  if (!isVisible) return null;

  const handleProcessLatestMessage = () => {
    processLatestUserMessage();
  };

  const handleProcessWithModel = () => {
    // Find the latest user message
    const userMessages = transcriptItems.filter(
      item => item.type === "MESSAGE" && item.role === "user"
    );

    if (userMessages.length === 0) {
      return;
    }

    const latestUserMessage = userMessages[userMessages.length - 1];

    if (latestUserMessage.title) {
      processMessageWithModel(latestUserMessage.itemId, latestUserMessage.title);
    }
  };

  const handleProcessBatch = () => {
    if (messageBuffer.length > 0) {
      processBatchedMessages();
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-2">Vocabulary Processing Status</h3>

      <div className="flex items-center mb-4">
        <div className={`w-3 h-3 rounded-full mr-2 ${isProcessing ? 'bg-yellow-500 animate-pulse' : messageBuffer.length > 0 ? 'bg-blue-500' : 'bg-green-500'}`}></div>
        <span className="text-sm font-medium">
          {isProcessing
            ? 'Processing batch...'
            : messageBuffer.length > 0
              ? `Batch buffer: ${messageBuffer.length} messages`
              : 'Batch processing active'
          }
        </span>
      </div>

      {messageBuffer.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm text-blue-800">
            <div className="font-medium">Batch Buffer Status:</div>
            <div>Messages queued: {messageBuffer.length}</div>
            <div>Processing in: {messageBuffer.length >= 10 ? 'Now (buffer full)' : '3 seconds after last message'}</div>
            <div className="text-xs mt-1 text-blue-600">
              Batch processing reduces API calls and provides better context analysis
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model Used for Analysis
        </label>
        <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
          GPT-4.1-mini (Batch Processing)
        </div>
      </div>

      {messageBuffer.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleProcessBatch}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing Batch...' : `Process Batch Now (${messageBuffer.length} messages)`}
          </button>
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Batch Processing:</span> Messages are automatically collected and processed in batches to reduce API calls and provide better context analysis. Batches process after 3 seconds of inactivity or when 10 messages are collected.
        </p>
      </div>
    </div>
  );
}
