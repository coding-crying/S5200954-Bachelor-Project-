'use client';

import React, { useState } from 'react';

interface FlashcardWord {
  word: string;
  definition: string;
  contextExamples: string[];
}

interface FlashcardDisplayProps {
  word: FlashcardWord;
  isActive: boolean;
}

export const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({ word, isActive }) => {
  const [showDefinition, setShowDefinition] = useState(true);
  const [showExamples, setShowExamples] = useState(true);

  const handlePronounce = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.voice = speechSynthesis.getVoices().find(voice => 
        voice.lang.includes('en') && voice.name.includes('Female')
      ) || speechSynthesis.getVoices()[0];
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`bg-white rounded-lg shadow-md transition-all duration-300 ${isActive ? 'shadow-lg' : 'opacity-75'}`}>
        {/* Header */}
        <div className="text-center p-6 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h2 className="text-4xl font-bold text-gray-800">{word.word}</h2>
            <button
              onClick={handlePronounce}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
              title="Pronounce word"
            >
              🔊
            </button>
          </div>
          <div className="flex justify-center space-x-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              C2 Level
            </span>
            <span className="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs">
              Advanced Vocabulary
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Definition Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                <span>📖</span>
                <span>Definition</span>
              </h3>
              <button
                onClick={() => setShowDefinition(!showDefinition)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
              >
                {showDefinition ? '🙈' : '👁️'}
              </button>
            </div>
            
            {showDefinition && (
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-800 leading-relaxed">{word.definition}</p>
              </div>
            )}
          </div>

          {/* Context Examples Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                Context Examples
              </h3>
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
              >
                {showExamples ? '🙈' : '👁️'}
              </button>
            </div>
            
            {showExamples && (
              <div className="space-y-3">
                {word.contextExamples.map((example, index) => (
                  <div 
                    key={index}
                    className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400"
                  >
                    <p className="text-gray-800 leading-relaxed italic">
                      "{example}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Study Tips */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Study Tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Try to create your own sentence using this word</li>
              <li>• Notice how the word is used in different contexts</li>
              <li>• Pay attention to word parts and etymology if familiar</li>
              <li>• Use the pronunciation button to learn correct pronunciation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};