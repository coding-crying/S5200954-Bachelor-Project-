'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RIMMSQuestion } from './components/RIMMSQuestion';
import { RIMMSResults } from './components/RIMMSResults';
// Using plain HTML/CSS components

interface RIMMSQuestionData {
  id: string;
  dimension: 'attention' | 'relevance' | 'confidence' | 'satisfaction';
  text: string;
  response?: number;
}

const rimmsQuestions: RIMMSQuestionData[] = [
  // Attention (3 questions)
  { id: 'A1', dimension: 'attention', text: 'The vocabulary learning system captured my attention.' },
  { id: 'A2', dimension: 'attention', text: 'The learning activities were engaging and interesting.' },
  { id: 'A3', dimension: 'attention', text: 'The system maintained my focus throughout the session.' },
  
  // Relevance (3 questions)
  { id: 'R1', dimension: 'relevance', text: 'The vocabulary learning approach was relevant to my learning goals.' },
  { id: 'R2', dimension: 'relevance', text: 'The content was appropriate for my learning level.' },
  { id: 'R3', dimension: 'relevance', text: 'The learning method was useful for vocabulary acquisition.' },
  
  // Confidence (3 questions)
  { id: 'C1', dimension: 'confidence', text: 'I felt confident using this learning system.' },
  { id: 'C2', dimension: 'confidence', text: 'The system helped me feel successful in learning new vocabulary.' },
  { id: 'C3', dimension: 'confidence', text: 'I believe I can effectively learn vocabulary using this method.' },
  
  // Satisfaction (3 questions)
  { id: 'S1', dimension: 'satisfaction', text: 'I was satisfied with my learning experience.' },
  { id: 'S2', dimension: 'satisfaction', text: 'I would recommend this learning method to other students.' },
  { id: 'S3', dimension: 'satisfaction', text: 'Overall, I enjoyed using this vocabulary learning system.' }
];

export default function RIMMSSurvey() {
  const searchParams = useSearchParams();
  const condition = searchParams.get('condition') || 'unknown';
  const participantId = searchParams.get('participant') || 'unknown';
  
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [surveyComplete, setSurveyComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentQuestion = rimmsQuestions[currentQuestionIndex];
  const totalQuestions = rimmsQuestions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const answeredQuestions = Object.keys(responses).length;

  useEffect(() => {
    // Load any existing responses from localStorage
    const savedResponses = localStorage.getItem(`rimms_${condition}_${participantId}`);
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  }, [condition, participantId]);

  const handleResponse = (questionId: string, rating: number) => {
    const newResponses = { ...responses, [questionId]: rating };
    setResponses(newResponses);
    
    // Save to localStorage
    localStorage.setItem(`rimms_${condition}_${participantId}`, JSON.stringify(newResponses));
    
    // Auto-advance to next question
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 500);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitSurvey = async () => {
    if (answeredQuestions < totalQuestions) {
      setSubmitError('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const surveyData = {
        participantId,
        condition,
        responses,
        timestamp: new Date().toISOString(),
        scores: calculateDimensionScores(responses)
      };

      const response = await fetch('/api/rimms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      // Clear localStorage
      localStorage.removeItem(`rimms_${condition}_${participantId}`);
      
      setSurveyComplete(true);
    } catch (error) {
      setSubmitError('Failed to submit survey. Please try again.');
      console.error('Survey submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDimensionScores = (responses: Record<string, number>) => {
    const dimensions = ['attention', 'relevance', 'confidence', 'satisfaction'];
    const scores: Record<string, number> = {};

    dimensions.forEach(dimension => {
      const dimensionQuestions = rimmsQuestions.filter(q => q.dimension === dimension);
      const dimensionSum = dimensionQuestions.reduce((sum, q) => sum + (responses[q.id] || 0), 0);
      scores[dimension] = dimensionSum / dimensionQuestions.length;
    });

    return scores;
  };

  if (surveyComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <RIMMSResults 
          condition={condition}
          participantId={participantId}
          responses={responses}
          scores={calculateDimensionScores(responses)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-center text-gray-800">
              RIMMS Motivation Survey
            </h1>
            <div className="text-center text-sm text-gray-600 mt-2">
              <p>Condition: <span className="font-semibold capitalize">{condition}</span></p>
              <p>Participant: {participantId}</p>
            </div>
          </div>
          <div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress: Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <span>{answeredQuestions}/{totalQuestions} answered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{width: `${progressPercentage}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Display */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <RIMMSQuestion
              question={currentQuestion}
              response={responses[currentQuestion.id]}
              onResponse={(rating) => handleResponse(currentQuestion.id, rating)}
            />
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
              <button
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  currentQuestionIndex === 0 
                    ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                ← Previous
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Rate your agreement with each statement
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <span>1: Strongly Disagree</span>
                  <span>•</span>
                  <span>5: Strongly Agree</span>
                </div>
              </div>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !responses[currentQuestion.id]
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={handleNextQuestion}
                  disabled={!responses[currentQuestion.id]}
                >
                  Next →
                </button>
              ) : (
                <button
                  className={`px-4 py-2 rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white flex items-center ${
                    answeredQuestions < totalQuestions || isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={handleSubmitSurvey}
                  disabled={answeredQuestions < totalQuestions || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✓</span>
                      Submit Survey
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error message */}
            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                <span className="text-red-600">⚠</span>
                <span className="text-sm">{submitError}</span>
              </div>
            )}

            {/* Progress indicator */}
            <div className="mt-4 flex justify-center space-x-2">
              {rimmsQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index < currentQuestionIndex
                      ? 'bg-green-500'
                      : index === currentQuestionIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}