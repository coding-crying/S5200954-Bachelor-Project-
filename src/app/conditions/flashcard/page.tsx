'use client';

import React, { useState, useEffect } from 'react';

interface FlashcardWord {
  word: string;
  definition: string;
  contextExamples: string[];
}

// Complete vocabulary set (all 12 words for flashcard condition)
const FLASHCARD_WORDS: FlashcardWord[] = [
  {
    word: "obfuscate",
    definition: "To deliberately make something unclear, confusing, or difficult to understand.",
    contextExamples: [
      "The lawyer tried to obfuscate the evidence with complex legal jargon.",
      "Rather than explain clearly, he chose to obfuscate the issue further."
    ]
  },
  {
    word: "disparage", 
    definition: "To regard or represent as being of little worth; to criticize unfairly.",
    contextExamples: [
      "It's unprofessional to disparage your competitors in public.",
      "She would never disparage someone's efforts, even if unsuccessful."
    ]
  },
  {
    word: "perfunctory",
    definition: "Carried out with a minimum of effort or reflection; superficial or mechanical.", 
    contextExamples: [
      "His perfunctory apology lacked any genuine remorse.",
      "The security check was merely perfunctory and missed obvious issues."
    ]
  },
  {
    word: "precocious",
    definition: "Having developed certain abilities or inclinations at an earlier age than is usual.",
    contextExamples: [
      "The precocious child was reading novels by age six.",
      "Her precocious understanding of mathematics impressed her teachers."
    ]
  },
  {
    word: "circumspect",
    definition: "Wary and unwilling to take risks; careful to consider all circumstances.",
    contextExamples: [
      "The diplomat was circumspect in his response to avoid controversy.",
      "Being circumspect with investments helped her avoid major losses."
    ]
  },
  {
    word: "capitulate",
    definition: "To cease resistance and submit to an opponent or overwhelming force.",
    contextExamples: [
      "The city was forced to capitulate after a long siege.",
      "Rather than capitulate to pressure, she stood firm in her principles."
    ]
  },
  {
    word: "vociferous",
    definition: "Expressing opinions or feelings in a loud and forceful way.",
    contextExamples: [
      "The vociferous crowd demanded answers from the politician.",
      "His vociferous objections to the plan were heard throughout the building."
    ]
  },
  {
    word: "intractable",
    definition: "Hard to control or deal with; stubborn and difficult to manage.",
    contextExamples: [
      "The conflict seemed intractable despite years of negotiations.",
      "Her intractable attitude made collaboration nearly impossible."
    ]
  },
  {
    word: "abrogate",
    definition: "To repeal or do away with a law, right, or formal agreement.",
    contextExamples: [
      "The new government moved quickly to abrogate the unpopular treaty.",
      "The court's decision would effectively abrogate decades of precedent."
    ]
  },
  {
    word: "admonish",
    definition: "To warn or reprimand someone firmly but not severely.",
    contextExamples: [
      "The teacher had to admonish the students for their disruptive behavior.",
      "She would gently admonish anyone who arrived late to meetings."
    ]
  },
  {
    word: "bolster",
    definition: "To support or strengthen; to prop up or reinforce.",
    contextExamples: [
      "The positive reviews helped bolster confidence in the new product.",
      "Additional funding would bolster the research program significantly."
    ]
  },
  {
    word: "cacophony",
    definition: "A harsh, discordant mixture of sounds; unpleasant noise.",
    contextExamples: [
      "The construction site created a cacophony of drilling and hammering.",
      "The orchestra's warm-up created a cacophony before the beautiful performance."
    ]
  }
];

export default function SimpleFlashcard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [sessionActive, setSessionActive] = useState(true);
  const [showDefinition, setShowDefinition] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<FlashcardWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [participantId, setParticipantId] = useState<string | null>(null);

  // Load participant-specific vocabulary for flashcard condition
  const loadParticipantVocabulary = async (participantId: string): Promise<FlashcardWord[]> => {
    try {
      // First try to get current participant ID from URL params or session storage
      const urlParams = new URLSearchParams(window.location.search);
      const urlParticipant = urlParams.get('participant');
      const sessionParticipant = sessionStorage.getItem('currentParticipant');
      
      const activeParticipant = participantId || urlParticipant || sessionParticipant || '001';
      
      // Call vocabulary API to get participant's words
      const response = await fetch(`/api/vocabulary/flashcard-words?participant=${activeParticipant}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.words || [];
      } else {
        console.warn('Could not load participant vocabulary, using fallback');
        return FLASHCARD_WORDS; // Use the hardcoded fallback
      }
    } catch (error) {
      console.error('Error loading participant vocabulary:', error);
      return FLASHCARD_WORDS; // Use the hardcoded fallback
    }
  };

  // Shuffle function
  const shuffleArray = (array: FlashcardWord[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize shuffled words on mount
  useEffect(() => {
    const initializeVocabulary = async () => {
      try {
        setIsLoading(true);
        console.log('Initializing flashcard vocabulary...');
        
        // Get participant ID from various sources
        const urlParams = new URLSearchParams(window.location.search);
        const urlParticipant = urlParams.get('participant');
        const sessionParticipant = sessionStorage.getItem('currentParticipant');
        const activeParticipant = urlParticipant || sessionParticipant || '001'; // Default to 001 for testing
        
        console.log('Active participant:', activeParticipant);
        setParticipantId(activeParticipant);
        
        // Try to load participant-specific vocabulary
        try {
          console.log('Attempting to load vocabulary for participant:', activeParticipant);
          const response = await fetch(`/api/vocabulary/flashcard-words?participant=${activeParticipant}`);
          console.log('API response status:', response.status);
          console.log('API response ok:', response.ok);
          
          if (response.ok) {
            const data = await response.json();
            console.log('API response data:', data);
            
            if (data.words && data.words.length > 0) {
              console.log('Setting vocabulary words:', data.words.length);
              setShuffledWords(shuffleArray(data.words));
              setIsLoading(false);
              return;
            } else {
              console.warn('No words returned from API, using fallback');
            }
          } else {
            const errorText = await response.text();
            console.error('API response error:', response.status, errorText);
          }
        } catch (apiError) {
          console.error('API call failed with error:', apiError);
        }
        
        // Fallback to hardcoded words
        console.log('Using fallback vocabulary with', FLASHCARD_WORDS.length, 'words');
        setShuffledWords(shuffleArray(FLASHCARD_WORDS));
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error initializing vocabulary:', error);
        // Final fallback to hardcoded words
        setShuffledWords(shuffleArray(FLASHCARD_WORDS));
        setIsLoading(false);
      }
    };

    initializeVocabulary();
  }, []);

  const currentWord = shuffledWords[currentIndex];
  const totalWords = shuffledWords.length;
  const progress = totalWords > 0 ? ((currentIndex + 1) / totalWords) * 100 : 0;

  // Timer effect
  useEffect(() => {
    if (!sessionActive) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setSessionActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(currentIndex + 1);
      // Reset card state for new word
      setShowDefinition(false);
      setShowExamples(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Reset card state for previous word
      setShowDefinition(false);
      setShowExamples(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowDefinition(false);
    setShowExamples(false);
    // Reshuffle words
    if (shuffledWords.length > 0) {
      setShuffledWords(shuffleArray(shuffledWords));
    }
  };

  const handleRevealDefinition = () => {
    setShowDefinition(true);
  };

  const handleRevealExamples = () => {
    setShowExamples(true);
  };

  const handleRevealAll = () => {
    setShowDefinition(true);
    setShowExamples(true);
  };

  const pronounceWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (!sessionActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Complete!</h2>
          <p className="text-gray-600 mb-4">You've completed the flashcard learning session.</p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Cards Studied:</strong> {totalWords}<br />
              <strong>Duration:</strong> 6 minutes
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
          <p className="text-xs text-gray-500 mt-2">Preparing 12 vocabulary words for study</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">🕒</span>
                <span className="text-lg font-semibold">{formatTime(timeRemaining)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">📖</span>
                <span className="text-lg font-semibold">{currentIndex + 1} / {totalWords}</span>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-800">Flashcard Study</h1>
              <p className="text-sm text-gray-600">Learn vocabulary through repetition</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          {/* Word header */}
          <div className="text-center p-6 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <h2 className="text-4xl font-bold text-gray-800">{currentWord.word}</h2>
              <button
                onClick={pronounceWord}
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
            {/* Reveal buttons */}
            {(!showDefinition || !showExamples) && (
              <div className="flex justify-center space-x-4 pb-4 border-b border-gray-200">
                {!showDefinition && (
                  <button
                    onClick={handleRevealDefinition}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    📖 Show Definition
                  </button>
                )}
                {!showExamples && (
                  <button
                    onClick={handleRevealExamples}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    💡 Show Examples
                  </button>
                )}
                {!showDefinition || !showExamples ? (
                  <button
                    onClick={handleRevealAll}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    🎯 Show All
                  </button>
                ) : null}
              </div>
            )}

            {/* Definition */}
            {showDefinition ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                  <span>📖</span>
                  <span>Definition</span>
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-gray-800 leading-relaxed">{currentWord.definition}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🤔</div>
                <p className="text-gray-500 italic">Click "Show Definition" to reveal the meaning</p>
              </div>
            )}

            {/* Examples */}
            {showExamples ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Context Examples</h3>
                <div className="space-y-3">
                  {currentWord.contextExamples.map((example, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                      <p className="text-gray-800 leading-relaxed italic">"{example}"</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : showDefinition ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">💡</div>
                <p className="text-gray-500 italic">Click "Show Examples" to see how it's used in context</p>
              </div>
            ) : null}

            {/* Study tips - only show when both definition and examples are revealed */}
            {showDefinition && showExamples && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Study Tips:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Try to create your own sentence using this word</li>
                  <li>• Notice how the word is used in different contexts</li>
                  <li>• Pay attention to word parts and etymology if familiar</li>
                  <li>• Use the pronunciation button to learn correct pronunciation</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              <button
                onClick={handleRestart}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Restart</span>
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentIndex === totalWords - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p><strong>How to use:</strong> See the word → Try to recall its meaning → Reveal definition/examples</p>
              <p>Navigate back and forth to review all 12 words. Use the remaining time to reinforce your learning.</p>
              <p className="text-xs text-gray-500 mt-2">💡 Tip: All 12 words for this condition are available to study!</p>
            </div>
          </div>
        </div>

        {/* Warning for last minute */}
        {timeRemaining <= 60 && (
          <div className="mt-4 border border-orange-200 bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-orange-700">
              <span>⏰</span>
              <span className="font-semibold">
                Less than 1 minute remaining! Continue studying.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}