import fs from 'fs';
import path from 'path';

/**
 * Saves Duolingo data to a JSON file on the server
 * @param data The Duolingo data to save
 * @returns Object indicating success or failure
 */
export function saveDuolingoData(data: string): { success: boolean; message: string } {
  try {
    // Create the file path
    const filePath = path.join(process.cwd(), 'user_duolingo_data.json');
    
    // Format the data as JSON
    const jsonData = JSON.stringify({
      timestamp: new Date().toISOString(),
      data: data
    }, null, 2);
    
    // Write the file
    fs.writeFileSync(filePath, jsonData, 'utf8');
    
    console.log(`Duolingo data saved to ${filePath}`);
    
    return {
      success: true,
      message: `Duolingo data successfully saved to ${filePath}`
    };
  } catch (error) {
    console.error('Error saving Duolingo data:', error);
    return {
      success: false,
      message: `Failed to save Duolingo data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
