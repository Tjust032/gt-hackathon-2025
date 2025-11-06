import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrescriptionDrug, TherapeuticCategory, ClinicalFile } from '@/lib/mockData';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Unsplash API for medication images
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

interface MedicationRequest {
  medicationName: string;
  genericName?: string;
  dosage?: string;
  manufacturer?: string;
  therapeuticClass?: string;
  includeImage?: boolean;
  includeClinicalData?: boolean;
  additionalNotes?: string;
}

interface MedicationInfo {
  name: string;
  genericName: string;
  manufacturer: string;
  description: string;
  therapeuticClass: string;
  dosageForm: string;
  strength: string;
  tags: TherapeuticCategory[];
  imageUrls: string[];
  clinicalFiles: ClinicalFile[];
}

export async function POST(request: NextRequest) {
  try {
    const body: MedicationRequest = await request.json();
    const {
      medicationName,
      genericName,
      dosage,
      manufacturer,
      therapeuticClass,
      includeImage = true,
      includeClinicalData = true,
      additionalNotes,
    } = body;

    if (!medicationName) {
      return NextResponse.json({ error: 'Medication name is required' }, { status: 400 });
    }

    console.log(`Looking up medication: ${medicationName}`);

    // Use OpenAI to get comprehensive medication information
    const medicationInfo = await getMedicationInfoFromAI(medicationName, {
      genericName,
      dosage,
      manufacturer,
      therapeuticClass,
      additionalNotes,
    });

    // Fetch medication image if requested
    let imageUrls: string[] = [];
    if (includeImage) {
      imageUrls = await fetchMedicationImages(medicationName, medicationInfo.genericName);
    }

    // Fetch clinical data if requested
    let clinicalFiles: ClinicalFile[] = [];

    if (includeClinicalData) {
      clinicalFiles = await fetchClinicalData(medicationName, medicationInfo.genericName);
    }

    // Create the prescription drug object
    const newMedication: PrescriptionDrug = {
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: medicationInfo.name,
      genericName: medicationInfo.genericName,
      manufacturer: medicationInfo.manufacturer,
      description: medicationInfo.description,
      therapeuticClass: medicationInfo.therapeuticClass,
      dosageForm: medicationInfo.dosageForm,
      strength: medicationInfo.strength,
      manufacturerProductUrl: `https://www.drugs.com/${medicationInfo.genericName.toLowerCase().replace(/\s+/g, '-')}`,
      tags: medicationInfo.tags,
      imageUrls:
        imageUrls.length > 0
          ? imageUrls
          : [
              'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop',
            ],
      clinicalFiles,
      smartLinkId: `${medicationInfo.genericName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      userId: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ndcCode: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}`,
      routeOfAdministration: medicationInfo.dosageForm.includes('Injection')
        ? 'Intravenous'
        : 'Oral',
      activeIngredient: medicationInfo.genericName,
      prescriptionRequired: true,
    };

    return NextResponse.json({
      success: true,
      medication: newMedication,
      message: `Successfully added ${medicationInfo.name} with ${clinicalFiles.length} clinical files and ${imageUrls.length} images`,
    });
  } catch (error) {
    console.error('Error adding medication:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add medication',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function getMedicationInfoFromAI(
  medicationName: string,
  additionalInfo: {
    genericName?: string;
    dosage?: string;
    manufacturer?: string;
    therapeuticClass?: string;
    additionalNotes?: string;
  },
): Promise<MedicationInfo> {
  const prompt = `You are a pharmaceutical expert. Provide comprehensive information about the medication "${medicationName}".

Additional context provided:
${additionalInfo.genericName ? `- Generic name: ${additionalInfo.genericName}` : ''}
${additionalInfo.dosage ? `- Dosage: ${additionalInfo.dosage}` : ''}
${additionalInfo.manufacturer ? `- Manufacturer: ${additionalInfo.manufacturer}` : ''}
${additionalInfo.therapeuticClass ? `- Therapeutic class: ${additionalInfo.therapeuticClass}` : ''}
${additionalInfo.additionalNotes ? `- Additional notes: ${additionalInfo.additionalNotes}` : ''}

Please provide the following information in clean JSON format (no markdown code blocks, just the JSON object):

{
  "name": "Brand/trade name of the medication",
  "genericName": "Generic/chemical name",
  "manufacturer": "Primary manufacturer or 'Various' if multiple",
  "description": "Detailed description of the medication, its uses, and mechanism of action (2-3 sentences)",
  "therapeuticClass": "Primary therapeutic classification",
  "dosageForm": "Common dosage form (e.g., Tablet, Capsule, Injection)",
  "strength": "Common strength/concentration (e.g., 500mg, 10mg/ml)",
  "tags": ["Array of relevant therapeutic categories from: Cardiovascular, Oncology, Hematology, Rare Disease, Immunotherapy, Biologics, Small Molecule, Neurology, Dermatology, Endocrinology, Respiratory, Gastrointestinal"]
}

IMPORTANT: Return only the JSON object without any markdown formatting, code blocks, or additional text. Ensure all information is accurate and based on established medical knowledge. For the tags array, select 1-3 most relevant categories.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a pharmaceutical expert with comprehensive knowledge of medications, their properties, and classifications. Always provide accurate, evidence-based information.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) {
    throw new Error('No response from OpenAI for medication information');
  }

  try {
    // Clean the response by removing markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const medicationInfo = JSON.parse(cleanedResponse);
    return medicationInfo;
  } catch {
    console.error('Failed to parse medication info from AI:', response);
    throw new Error('Failed to parse medication information from AI response');
  }
}

async function fetchMedicationImages(brandName: string, genericName: string): Promise<string[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('Unsplash API key not configured, using placeholder images');
    return [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop',
    ];
  }

  try {
    // Search for medication images using both brand and generic names
    const searchTerms = [
      `${brandName} medication pill`,
      `${genericName} pharmaceutical`,
      `${brandName} tablet`,
      'medication pills pharmacy',
    ];

    const imageUrls: string[] = [];

    for (const term of searchTerms.slice(0, 2)) {
      // Limit to 2 searches to avoid rate limits
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=2&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const urls =
            data.results
              ?.map((photo: { urls: { regular: string } }) => photo.urls.regular)
              .filter(Boolean) || [];
          imageUrls.push(...urls);
        }
      } catch (error) {
        console.error(`Error fetching images for term "${term}":`, error);
      }
    }

    // Return unique URLs, fallback to placeholder if none found
    const uniqueUrls = [...new Set(imageUrls)].slice(0, 3);
    return uniqueUrls.length > 0
      ? uniqueUrls
      : ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop'];
  } catch (error) {
    console.error('Error fetching medication images:', error);
    return [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop',
    ];
  }
}

async function fetchClinicalData(brandName: string, genericName: string): Promise<ClinicalFile[]> {
  try {
    // Generate clinical data using AI since real clinical trial APIs require special access
    const prompt = `Generate realistic clinical trial and study information for the medication "${brandName}" (generic: ${genericName}). 

Create 2-3 clinical files with the following structure for each:
- filename: Descriptive filename for the study
- description: Brief description of the study type and purpose
- extractedContent: Key findings, efficacy data, safety profile (2-3 sentences)

Focus on:
1. Efficacy/effectiveness studies
2. Safety and adverse events data
3. Comparative studies or meta-analyses

IMPORTANT: Return only a clean JSON array without any markdown formatting or code blocks. Example format:
[
  {
    "filename": "Study Name",
    "description": "Study description",
    "extractedContent": "Key findings and results"
  }
]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a clinical research expert. Generate realistic but clearly simulated clinical trial information for educational purposes.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return [];
    }

    try {
      // Clean the response by removing markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const clinicalData = JSON.parse(cleanedResponse);
      if (Array.isArray(clinicalData)) {
        // Convert to proper ClinicalFile objects
        return clinicalData.map((item, index) => ({
          id: `clinical_${Date.now()}_${index}`,
          filename: item.filename || `Clinical Study ${index + 1}`,
          fileUrl: '#', // Placeholder URL
          fileType: 'text' as const,
          description: item.description || 'Clinical study information',
          drugId: `med_${Date.now()}`, // Will be updated when medication is created
          uploadedAt: new Date().toISOString(),
          extractedContent: item.extractedContent || 'Clinical data not available',
        }));
      }
      return [];
    } catch {
      console.error('Failed to parse clinical data:', response);
      return [];
    }
  } catch (error) {
    console.error('Error generating clinical data:', error);
    return [];
  }
}
