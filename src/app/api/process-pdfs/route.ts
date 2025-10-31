import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

interface DocumentRecord {
  document_id: string;
  listing_id: number; // Changed to number
  original_filename: string;
  storage_url: string;
  upload_timestamp: string;
  extracted_text?: string;
  embedding?: number[];
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');
    const listingIdStr = formData.get('listingId') as string;

    if (!listingIdStr) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const listingId = parseInt(listingIdStr, 10);
    if (isNaN(listingId)) {
      return NextResponse.json({ error: 'Listing ID must be a number' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const processedDocuments: DocumentRecord[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      // Only process PDF files
      if (!file.name.endsWith('.pdf')) {
        continue;
      }

      try {
        // Create FormData for Python service
        const pythonFormData = new FormData();
        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer], { type: 'application/pdf' });
        pythonFormData.append('file', blob, file.name);

        // Call Python service to extract text and generate embedding
        const response = await fetch(`${PYTHON_SERVICE_URL}/extract-and-embed`, {
          method: 'POST',
          body: pythonFormData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error processing ${file.name}:`, errorData);
          continue;
        }

        const data = await response.json();

        // Store the file (in production, upload to S3/cloud storage)
        // For now, we'll use a mock storage URL
        const storageUrl = `/uploads/${listingId}/${file.name}`;

        // Prepare document record
        const documentRecord: DocumentRecord = {
          document_id: uuidv4(),
          listing_id: listingId, // Now a number
          original_filename: file.name,
          storage_url: storageUrl,
          upload_timestamp: new Date().toISOString(),
          extracted_text: data.extracted_text,
          embedding: data.embedding,
        };

        // In production, save to PostgreSQL database here
        // For now, return the processed data
        processedDocuments.push(documentRecord);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedDocuments.length,
      documents: processedDocuments,
    });
  } catch (error) {
    console.error('Error in process-pdfs endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process PDFs', details: (error as Error).message },
      { status: 500 },
    );
  }
}
