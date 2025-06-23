import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface RIMMSSubmission {
  participantId: string;
  condition: string;
  responses: Record<string, number>;
  timestamp: string;
  scores: Record<string, number>;
}

export async function POST(request: NextRequest) {
  try {
    const data: RIMMSSubmission = await request.json();
    
    // Validate required fields
    if (!data.participantId || !data.condition || !data.responses || !data.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create participant directory if it doesn't exist
    const participantDir = path.join(process.cwd(), `participant_${data.participantId}`);
    if (!existsSync(participantDir)) {
      await mkdir(participantDir, { recursive: true });
    }

    // Save RIMMS data as JSON
    const rimmsFilePath = path.join(participantDir, `rimms_${data.condition}.json`);
    await writeFile(rimmsFilePath, JSON.stringify(data, null, 2));

    // Also save a human-readable summary
    const summaryContent = generateRIMMSSummary(data);
    const summaryFilePath = path.join(participantDir, `rimms_${data.condition}_summary.txt`);
    await writeFile(summaryFilePath, summaryContent);

    console.log(`RIMMS survey saved for participant ${data.participantId}, condition: ${data.condition}`);

    return NextResponse.json({
      success: true,
      message: 'RIMMS survey submitted successfully',
      participantId: data.participantId,
      condition: data.condition
    });

  } catch (error) {
    console.error('Error saving RIMMS survey:', error);
    return NextResponse.json(
      { error: 'Failed to save survey data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const participantId = searchParams.get('participant');
  const condition = searchParams.get('condition');

  if (!participantId || !condition) {
    return NextResponse.json(
      { error: 'Missing participant ID or condition' },
      { status: 400 }
    );
  }

  try {
    const participantDir = path.join(process.cwd(), `participant_${participantId}`);
    const rimmsFilePath = path.join(participantDir, `rimms_${condition}.json`);

    if (!existsSync(rimmsFilePath)) {
      return NextResponse.json(
        { error: 'RIMMS data not found' },
        { status: 404 }
      );
    }

    const { readFile } = await import('fs/promises');
    const data = await readFile(rimmsFilePath, 'utf-8');
    
    return NextResponse.json(JSON.parse(data));

  } catch (error) {
    console.error('Error retrieving RIMMS data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve survey data' },
      { status: 500 }
    );
  }
}

function generateRIMMSSummary(data: RIMMSSubmission): string {
  const { participantId, condition, responses, timestamp, scores } = data;
  
  const dimensionNames = {
    attention: 'Attention',
    relevance: 'Relevance', 
    confidence: 'Confidence',
    satisfaction: 'Satisfaction'
  };

  const getScoreInterpretation = (score: number): string => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Moderate';
    if (score >= 1.5) return 'Low';
    return 'Very Low';
  };

  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;

  let summary = `RIMMS Survey Results Summary
========================================

Participant ID: ${participantId}
Condition: ${condition.charAt(0).toUpperCase() + condition.slice(1)}
Completion Time: ${new Date(timestamp).toLocaleString()}

OVERALL MOTIVATION SCORE: ${overallScore.toFixed(2)}/5.0 (${getScoreInterpretation(overallScore)})

DIMENSION SCORES:
`;

  // Add dimension scores
  Object.entries(scores).forEach(([dimension, score]) => {
    const name = dimensionNames[dimension as keyof typeof dimensionNames];
    const interpretation = getScoreInterpretation(score);
    summary += `${name}: ${score.toFixed(2)}/5.0 (${interpretation})\n`;
  });

  summary += `\nDETAILED RESPONSES:
`;

  // Add individual question responses
  const questionLabels = {
    1: 'Strongly Disagree',
    2: 'Disagree', 
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree'
  };

  Object.entries(responses).forEach(([questionId, rating]) => {
    const label = questionLabels[rating as keyof typeof questionLabels];
    summary += `Question ${questionId}: ${rating}/5 (${label})\n`;
  });

  summary += `\nSURVEY STATISTICS:
Total Questions: ${Object.keys(responses).length}
Average Response: ${(Object.values(responses).reduce((sum, val) => sum + val, 0) / Object.keys(responses).length).toFixed(2)}
Response Range: ${Math.min(...Object.values(responses))} - ${Math.max(...Object.values(responses))}

Generated: ${new Date().toLocaleString()}
`;

  return summary;
}