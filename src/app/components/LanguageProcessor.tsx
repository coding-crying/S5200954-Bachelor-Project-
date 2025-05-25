"use client";

import React, { useState, useEffect } from "react";
import { useLanguageProcessor } from "@/app/hooks/useLanguageProcessor";

interface LanguageProcessorProps {
  isVisible: boolean;
}

export default function LanguageProcessor({ isVisible }: LanguageProcessorProps) {
  const {
    isProcessing,
    processorStatus,
    toggleProcessor
  } = useLanguageProcessor();

  const [languageWords, setLanguageWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Format the time since last processing
  const formatTimeSince = (ms: number): string => {
    if (ms < 0) return "Never";
    
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  };

  // Load language words from the API
  const loadLanguageWords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/language/words');
      const data = await response.json();

      if (data.success && Array.isArray(data.words)) {
        setLanguageWords(data.words);
      }
    } catch (error) {
      console.error('Error loading language words:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load language words when the component becomes visible
  useEffect(() => {
    if (isVisible) {
      loadLanguageWords();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Language Processor</h2>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${processorStatus.running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {processorStatus.running ? 'Running' : 'Stopped'}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Last processed:</span>
          <span>{formatTimeSince(processorStatus.lastProcessed)}</span>
        </div>
        
        <button
          onClick={toggleProcessor}
          className={`w-full py-2 px-4 rounded font-medium ${
            processorStatus.running
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          disabled={isProcessing}
        >
          {processorStatus.running ? 'Stop Processor' : 'Start Processor'}
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Language Words</h3>
          <button
            onClick={loadLanguageWords}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="max-h-60 overflow-y-auto border rounded">
          {languageWords.length === 0 ? (
            <p className="p-4 text-gray-500">No language words found.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Form</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part of Speech</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {languageWords.map((word, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap">{word.word}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{word.base_form}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{word.part_of_speech}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{word.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>The language processor automatically extracts basic word forms from conversations every minute.</p>
        <p>Words are stored in languageWords.csv with their base forms and parts of speech.</p>
      </div>
    </div>
  );
}
