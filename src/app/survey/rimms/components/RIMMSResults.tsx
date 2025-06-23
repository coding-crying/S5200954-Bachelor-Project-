'use client';

import React from 'react';
// Using plain HTML/CSS components

interface RIMMSResultsProps {
  condition: string;
  participantId: string;
  responses: Record<string, number>;
  scores: Record<string, number>;
}

const dimensionInfo = {
  attention: {
    name: 'Attention',
    description: 'Ability to capture and maintain learner interest',
    color: 'bg-blue-100 text-blue-800',
    icon: '🎯'
  },
  relevance: {
    name: 'Relevance',
    description: 'Perceived usefulness and applicability to learning goals',
    color: 'bg-green-100 text-green-800',
    icon: '🎯'
  },
  confidence: {
    name: 'Confidence',
    description: 'Learner\'s belief in their ability to succeed',
    color: 'bg-purple-100 text-purple-800',
    icon: '💪'
  },
  satisfaction: {
    name: 'Satisfaction',
    description: 'Overall enjoyment and positive feelings about the experience',
    color: 'bg-orange-100 text-orange-800',
    icon: '😊'
  }
};

export const RIMMSResults: React.FC<RIMMSResultsProps> = ({
  condition,
  participantId,
  responses,
  scores
}) => {
  const formatScore = (score: number): string => {
    return score.toFixed(2);
  };

  const getScoreInterpretation = (score: number): { level: string; color: string } => {
    if (score >= 4.5) return { level: 'Excellent', color: 'text-green-600' };
    if (score >= 3.5) return { level: 'Good', color: 'text-blue-600' };
    if (score >= 2.5) return { level: 'Moderate', color: 'text-yellow-600' };
    if (score >= 1.5) return { level: 'Low', color: 'text-orange-600' };
    return { level: 'Very Low', color: 'text-red-600' };
  };

  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
  const overallInterpretation = getScoreInterpretation(overallScore);

  const handlePrintResults = () => {
    window.print();
  };

  const handleDownloadData = () => {
    const data = {
      participantId,
      condition,
      timestamp: new Date().toISOString(),
      responses,
      scores,
      overallScore
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rimms_results_${participantId}_${condition}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-2 border-green-200 bg-green-50 rounded-lg shadow-md">
        <div className="text-center p-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 text-green-600 text-6xl">✅</div>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Survey Complete!
          </h2>
          <p className="text-green-700">
            Thank you for completing the RIMMS motivation survey.
          </p>
        </div>
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-600">👤</span>
              <span className="text-sm">
                <strong>Participant:</strong> {participantId}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-600">📊</span>
              <span className="text-sm">
                <strong>Condition:</strong> {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-600">📅</span>
              <span className="text-sm">
                <strong>Completed:</strong> {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-center">Overall Motivation Score</h3>
        </div>
        <div className="p-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-gray-800">
              {formatScore(overallScore)}
            </div>
            <div className="text-sm text-gray-600">out of 5.0</div>
            <span className={`inline-block px-4 py-2 rounded-full text-lg font-medium ${overallInterpretation.color} bg-gray-100`}>
              {overallInterpretation.level}
            </span>
          </div>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">ARCS Motivation Dimensions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(scores).map(([dimension, score]) => {
              const info = dimensionInfo[dimension as keyof typeof dimensionInfo];
              const interpretation = getScoreInterpretation(score);
              
              return (
                <div key={dimension} className="border-2 rounded-lg bg-white">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{info.icon}</span>
                        <span className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${info.color}`}>
                          {info.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">
                          {formatScore(score)}
                        </div>
                        <div className={`text-sm font-semibold ${interpretation.color}`}>
                          {interpretation.level}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {info.description}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(score / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Responses */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">Detailed Response Summary</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {Object.entries(responses).map(([questionId, rating]) => (
              <div key={questionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="border border-gray-300 px-2 py-1 rounded text-xs">
                    {questionId}
                  </span>
                  <span className="text-sm text-gray-700">
                    Question {questionId}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">{rating}</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-3 h-3 rounded-full ${
                          star <= rating ? 'bg-yellow-400' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-4">
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handlePrintResults}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Print Results
            </button>
            <button 
              onClick={handleDownloadData}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Download Data
            </button>
            <button 
              onClick={() => window.close()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Close Survey
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg">
        <div className="p-4">
          <div className="text-center text-sm text-blue-700">
            <p className="font-semibold mb-1">Next Steps:</p>
            <p>
              Your responses have been recorded. You may now close this window and 
              return to the experimental controller to continue with the next learning block.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};