import { NextRequest, NextResponse } from 'next/server';

interface DocumentRecord {
  document_id: string;
  listing_id: string;
  original_filename: string;
  storage_url: string;
  upload_timestamp: string;
  extracted_text?: string;
  embedding?: number[];
}

/**
 * GET /api/documents?listingId=xxx
 * Retrieve all documents for a specific listing ID
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // In production, fetch from PostgreSQL database
    // const dbService = new DatabaseService();
    // const documents = await dbService.getDocumentsByListingId(listingId);

    // For now, return mock data
    const documents: DocumentRecord[] = [];

    return NextResponse.json({
      success: true,
      listingId,
      documents,
      count: documents.length,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: (error as Error).message },
      { status: 500 },
    );
  }
}
