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

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-2">Vocabulary Processing Status</h3>

      <div className="flex items-center mb-4">
        <div className={`w-3 h-3 rounded-full mr-2 ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
        <span className="text-sm font-medium">
          {isProcessing ? 'Processing conversation...' : 'Automatic processing active'}
        </span>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model Used for Analysis
        </label>
        <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
          GPT-4.1-mini
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Automatic Processing:</span> All conversation messages are now automatically analyzed in the background to identify vocabulary words, evaluate usage effectiveness, and determine optimal review timing.
        </p>
      </div>
    </div>
  );
}
