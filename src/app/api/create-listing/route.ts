import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/create-listing
 * Create a new listing and return auto-generated ID
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      drugName,
      genericName,
      manufacturer,
      ndcCode,
      dosageForm,
      strength,
      routeOfAdministration,
      activeIngredient,
      therapeuticClass,
      prescriptionRequired,
      controlledSubstanceSchedule,
    } = body;

    if (!drugName || !genericName || !manufacturer || !ndcCode) {
      return NextResponse.json(
        { error: 'Drug name, generic name, manufacturer, and NDC code are required' },
        { status: 400 },
      );
    }

    // In production, use the database service
    // const { dbService } = await import('@/backend/src/db/database');
    // const listingId = await dbService.createListing({
    //   drugName,
    //   genericName,
    //   manufacturer,
    //   ndcCode,
    //   dosageForm,
    //   strength,
    //   routeOfAdministration,
    //   activeIngredient,
    //   therapeuticClass,
    //   prescriptionRequired: prescriptionRequired ?? true,
    //   controlledSubstanceSchedule,
    // });

    // For now, simulate auto-increment (in production this comes from DB)
    // This would be handled by PostgreSQL SERIAL type
    const listingId = Math.floor(Math.random() * 10000) + 1; // Mock for development

    return NextResponse.json({
      success: true,
      listingId,
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing', details: (error as Error).message },
      { status: 500 },
    );
  }
}
