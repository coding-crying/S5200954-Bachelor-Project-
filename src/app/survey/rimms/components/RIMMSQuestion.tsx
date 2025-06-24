'use client';

import React, { useState } from 'react';
// Using plain HTML/CSS components

interface RIMMSQuestionData {
  id: string;
  dimension: 'attention' | 'relevance' | 'confidence' | 'satisfaction';
  text: string;
}

interface RIMMSQuestionProps {
  question: RIMMSQuestionData;
  response?: number;
  onResponse: (rating: number) => void;
}

const dimensionColors = {
  attention: 'bg-blue-100 text-blue-800',
  relevance: 'bg-green-100 text-green-800',
  confidence: 'bg-purple-100 text-purple-800',
  satisfaction: 'bg-orange-100 text-orange-800'
};

const dimensionDescriptions = {
  attention: 'How well did the learning method capture and maintain your attention?',
  relevance: 'How relevant and applicable was the learning method to your goals?',
  confidence: 'How confident did you feel while using this learning method?',
  satisfaction: 'How satisfied were you with your overall learning experience?'
};

export const RIMMSQuestion: React.FC<RIMMSQuestionProps> = ({ 
  question, 
  response, 
  onResponse 
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleRatingClick = (rating: number) => {
    onResponse(rating);
  };

  const getRatingLabel = (rating: number): string => {
    const labels = {
      1: 'Strongly Disagree',
      2: 'Disagree',
      3: 'Neutral',
      4: 'Agree',
      5: 'Strongly Agree'
    };
    return labels[rating as keyof typeof labels];
  };

  const displayRating = hoveredRating || response || 0;

  return (
    <div className="space-y-6">
      {/* Dimension indicator */}
      <div className="text-center">
        <span className={`inline-block text-sm px-3 py-1 mb-2 rounded-md font-medium ${dimensionColors[question.dimension]}`}>
          {question.dimension.charAt(0).toUpperCase() + question.dimension.slice(1)}
        </span>
        <p className="text-sm text-gray-600 italic">
          {dimensionDescriptions[question.dimension]}
        </p>
      </div>

      {/* Question text */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg bg-white">
        <div className="p-6">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-1">
              {question.text}
            </p>
            <p className="text-sm text-gray-500">
              Question {question.id}
            </p>
          </div>
        </div>
      </div>

      {/* Rating scale */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 mb-4">
            Rate your agreement with this statement:
          </p>
        </div>

        {/* Interactive rating buttons */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingClick(rating)}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
              className={`
                w-16 h-16 rounded-full border-2 transition-all duration-200
                flex items-center justify-center text-lg font-bold
                ${response === rating || hoveredRating === rating
                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-110'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
            >
              {rating}
            </button>
          ))}
        </div>

        {/* Rating labels */}
        <div className="flex justify-between text-xs text-gray-500 px-2">
          <span>Strongly<br />Disagree</span>
          <span>Disagree</span>
          <span>Neutral</span>
          <span>Agree</span>
          <span>Strongly<br />Agree</span>
        </div>

        {/* Preview text below buttons */}
        <div className="text-center h-6 flex items-center justify-center">
          {displayRating > 0 && (
            <p className="text-sm text-gray-600">
              Selected: <span className="font-semibold">{getRatingLabel(displayRating)}</span>
            </p>
          )}
        </div>

        {/* Visual feedback */}
        {response && (
          <div className="text-center">
            <div className="flex justify-center items-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= response
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>
            <p className="text-sm text-green-600 font-medium">
              ✓ Response recorded
            </p>
          </div>
        )}
      </div>

      {/* Instruction text */}
      <div className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p>
          Please rate how much you agree or disagree with the statement above.
          Your honest feedback helps improve the learning system.
        </p>
      </div>
    </div>
  );
};