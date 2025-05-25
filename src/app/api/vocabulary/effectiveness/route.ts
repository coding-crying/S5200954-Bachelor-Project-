import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Process conversation text to analyze vocabulary word usage effectiveness
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, includeHistory } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: "Invalid request: text is required" },
        { status: 400 }
      );
    }

    // Path to the Python script
    const scriptPath = path.join(process.cwd(), 'agents', 'vocab_instructor', 'run_background_processor.py');

    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        { success: false, error: "Background processor script not found" },
        { status: 404 }
      );
    }

    // Spawn a Python process to run the background processor
    console.log(`Spawning Python process: ${scriptPath}`);

    const pythonProcess = spawn('python3', [
      scriptPath,
      '--text', text,
      ...(includeHistory ? ['--include-history'] : [])
    ]);

    // Log any errors
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Background processor error: ${data.toString()}`);
    });

    // Log output
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Background processor output: ${data.toString()}`);
    });

    // Handle process exit
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Background processor exited with code ${code}`);
      } else {
        console.log('Background processor completed successfully');
      }
    });

    // Return immediately without waiting for the process to complete
    return NextResponse.json({
      success: true,
      message: "Text submitted for background processing",
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Error in POST /vocabulary/effectiveness:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Get the latest effectiveness analysis results
 */
export async function GET(request: NextRequest) {
  try {
    // Path to the Python script
    const scriptPath = path.join(process.cwd(), 'agents', 'vocab_instructor', 'get_effectiveness_results.py');

    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        { success: false, error: "Effectiveness results script not found" },
        { status: 404 }
      );
    }

    // Create a promise to handle the async process
    const getResults = new Promise<any>((resolve, reject) => {
      const pythonProcess = spawn('python3', [scriptPath]);

      let outputData = '';
      let errorData = '';

      // Collect output data
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      // Collect error data
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Process exited with code ${code}: ${errorData}`));
        } else {
          try {
            const results = JSON.parse(outputData);
            resolve(results);
          } catch (e) {
            reject(new Error(`Failed to parse results: ${e.message}`));
          }
        }
      });
    });

    // Wait for the results
    const results = await getResults;

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Error in GET /vocabulary/effectiveness:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
