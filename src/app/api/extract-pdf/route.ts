import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    const deviceRegistrationId = formData.get('deviceRegistrationId') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer and save temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a temporary file path
    const tempDir = path.join(process.cwd(), 'temp');
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${file.name}`);
    
    // Ensure temp directory exists
    const fs = require('fs');
    if (!fs.existsSync(tempDir)) {
      console.log('Creating temp directory:', tempDir);
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    console.log('Temp directory exists:', fs.existsSync(tempDir));
    
    // Write file to temp location
    fs.writeFileSync(tempFilePath, buffer);
    
    try {
      // Call the Python PDF extractor using system Python
      const pythonScriptPath = path.join(process.cwd(), 'src', 'backend', 'pdf_extractor.py');
      
      console.log('Python script path:', pythonScriptPath);
      console.log('Temp file path:', tempFilePath);
      console.log('File exists:', require('fs').existsSync(tempFilePath));
      console.log('File size:', require('fs').statSync(tempFilePath).size);
      
      // Use the full path to python3 to ensure we're using the right environment
      const pythonPath = '/opt/homebrew/opt/python@3.11/bin/python3.11';
      const { stdout, stderr } = await execAsync(`"${pythonPath}" "${pythonScriptPath}" "${tempFilePath}" "${deviceRegistrationId || 'unknown'}"`);
      
      console.log('Python stdout:', stdout);
      if (stderr) {
        console.error('Python script error:', stderr);
      }
      
      if (!stdout || stdout.trim() === '') {
        throw new Error('Python script returned empty output');
      }
      
      // Parse the JSON response from Python script
      const result = JSON.parse(stdout);
      
      // Clean up temporary file
      fs.unlinkSync(tempFilePath);
      
      if (result.success) {
        // Extract first 5 lines from the text
        const lines = result.text.split('\n').filter((line: string) => line.trim() !== '');
        const firstFiveLines = lines.slice(0, 5).join('\n');
        
        return NextResponse.json({
          success: true,
          extractedText: result.text,
          content: result.text, // Also include as 'content' for consistency
          firstFiveLines: firstFiveLines,
          pageCount: result.page_count,
          characterCount: result.character_count,
          fileName: file.name,
          database_inserted: result.database_inserted,
          database_error: result.database_error
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }
      
    } catch (error) {
      // Clean up temporary file in case of error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      console.error('Error calling PDF extractor:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to extract PDF text: ${error instanceof Error ? error.message : 'Unknown error'}` 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
