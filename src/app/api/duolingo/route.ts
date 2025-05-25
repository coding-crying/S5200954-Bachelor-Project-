import { NextRequest, NextResponse } from 'next/server';
import { saveDuolingoData } from '@/app/agentConfigs/languageLearning/duolingoDataHandler.server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.data) {
      return NextResponse.json({ 
        success: false, 
        message: 'No data provided' 
      }, { status: 400 });
    }
    
    const result = saveDuolingoData(body.data);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });
  } catch (error) {
    console.error('Error in /api/duolingo:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
}
