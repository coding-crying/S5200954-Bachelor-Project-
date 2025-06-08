import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Process conversation text to analyze vocabulary word usage effectiveness
 * DISABLED: This endpoint is no longer used to prevent duplicate processing
 */
export async function POST(req: Request) {
  return NextResponse.json(
    {
      success: false,
      error: "This endpoint is disabled. Use /api/conversation/process instead."
    },
    { status: 410 } // Gone
  );
}

/**
 * Get the latest effectiveness analysis results
 * DISABLED: This endpoint is no longer used to prevent duplicate processing
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "This endpoint is disabled. Use /api/conversation/process instead."
    },
    { status: 410 } // Gone
  );
}
