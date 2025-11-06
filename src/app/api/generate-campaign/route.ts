import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { mockDrugs, mockSalesRep, ClinicalFile } from '@/lib/mockData';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { drugId, drug, hcpTags, campaignType } = body;

    // Use the provided drug object, or fallback to lookup in mockDrugs
    let selectedDrug = drug;
    if (!selectedDrug) {
      selectedDrug = mockDrugs.find((d) => d.id === drugId);
      if (!selectedDrug) {
        return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
      }
    }

    // Compile drug information
    const drugInfo = {
      name: selectedDrug.name,
      genericName: selectedDrug.genericName,
      manufacturer: selectedDrug.manufacturer,
      description: selectedDrug.description,
      smartLinkUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/medication/${selectedDrug.smartLinkId}`,
      clinicalEvidence: selectedDrug.clinicalFiles.map((file: ClinicalFile) => ({
        title: file.filename,
        description: file.description,
        content: file.extractedContent?.substring(0, 500) + '...', // Truncate for prompt
      })),
      tags: selectedDrug.tags,
      therapeuticClass: selectedDrug.therapeuticClass,
      dosageForm: selectedDrug.dosageForm,
      strength: selectedDrug.strength,
    };

    // Create the prompt for structured email generation
    const prompt = `You are an expert pharmaceutical sales representative creating a professional email campaign. Generate a structured email template based on the following information:

**Prescription Drug Information:**
- Brand Name: ${drugInfo.name}
- Generic Name: ${drugInfo.genericName}
- Manufacturer: ${drugInfo.manufacturer}
- Description: ${drugInfo.description}
- Therapeutic Class: ${drugInfo.therapeuticClass}
- Dosage Form: ${drugInfo.dosageForm}
- Strength: ${drugInfo.strength}
- Categories: ${drugInfo.tags.join(', ')}
- Drug Information Link: ${drugInfo.smartLinkUrl}

**Clinical Evidence:**
${drugInfo.clinicalEvidence
  .map(
    (evidence: { title: string; description: string; content: string }) =>
      `- ${evidence.title}: ${evidence.description}\n  Key findings: ${evidence.content}`,
  )
  .join('\n')}

**Target Audience:**
- HCP Specialties: ${hcpTags.join(', ')}
- Campaign Type: ${campaignType}

**Sales Representative Information:**
- Name: ${mockSalesRep.name}
- Email: ${mockSalesRep.email}
- Phone: ${mockSalesRep.phone}
- Territory: ${mockSalesRep.territory}
- Company: ${mockSalesRep.company}

**Template Variables (use these in your email):**
- {hospital_name}: The recipient's hospital name
- {doctor_name}: The recipient's doctor name  
- {hospital_size}: Size/type of hospital
- {specialty_focus}: Their specialty focus area

**Instructions:**
Generate a JSON response with the following structure:

{
  "subject": "Compelling subject line mentioning the device",
  "preview": "Brief preview text (1-2 sentences)",
  "greeting": "Professional greeting using {doctor_name}",
  "opening": "Opening paragraph with value proposition",
  "clinicalEvidence": [
    {
      "title": "Evidence section title",
      "content": "Key clinical findings and benefits"
    }
  ],
  "drugBenefits": [
    "Benefit 1 with specific data",
    "Benefit 2 with clinical outcomes",
    "Benefit 3 with therapeutic advantages"
  ],
  "callToAction": "Clear next steps and call to action",
  "drugLink": "${drugInfo.smartLinkUrl}",
  "signature": "Professional closing and signature"
}

Requirements:
- Address ${hcpTags.join(' and ')} professionals specifically
- Match ${campaignType} campaign strategy
- Include actual clinical data points from the evidence
- Use template variables naturally: {doctor_name}, {hospital_name}, {specialty_focus}
- Maintain professional pharmaceutical sales tone
- Include compelling call-to-action
- Reference the drug link naturally in context
- Use the sales rep information in the signature: ${mockSalesRep.name}, ${mockSalesRep.email}, ${mockSalesRep.phone}, ${mockSalesRep.territory}

Return ONLY the JSON object, no other text.`;

    // Make the OpenAI API call
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            "You are an expert pharmaceutical sales representative. Generate professional, personalized email campaigns that convert prospects into customers. Always return valid JSON with 'subject' and 'content' fields.",
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let emailData;
    try {
      emailData = JSON.parse(response);
    } catch {
      // If JSON parsing fails, try to extract content manually
      console.error('Failed to parse OpenAI response as JSON:', response);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          rawResponse: response,
        },
        { status: 500 },
      );
    }

    // Validate the response structure
    const requiredFields = [
      'subject',
      'preview',
      'greeting',
      'opening',
      'clinicalEvidence',
      'drugBenefits',
      'callToAction',
      'signature',
    ];
    const missingFields = requiredFields.filter((field) => !emailData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Invalid response structure from AI. Missing fields: ${missingFields.join(', ')}`,
          response: emailData,
        },
        { status: 500 },
      );
    }

    // Create a fallback plain text content for backward compatibility
    const plainTextContent = `${emailData.greeting}

${emailData.opening}

${emailData.clinicalEvidence
  .map(
    (evidence: { title: string; content: string }) => `**${evidence.title}**\n${evidence.content}`,
  )
  .join('\n\n')}

**Key Benefits:**
${emailData.drugBenefits.map((benefit: string) => `• ${benefit}`).join('\n')}

${emailData.callToAction}

${emailData.signature}`;

    return NextResponse.json({
      success: true,
      email: {
        id: `email_${Date.now()}`,
        subject: emailData.subject,
        content: plainTextContent, // Backward compatibility
        structuredData: emailData, // New structured format
        drugId,
        campaignType,
        targetHCPs: hcpTags.join(', '),
        createdAt: new Date().toISOString(),
        drugInfo: {
          name: drug.name,
          genericName: drug.genericName,
          manufacturer: drug.manufacturer,
          smartLinkUrl: drugInfo.smartLinkUrl,
        },
        salesRep: {
          name: mockSalesRep.name,
          email: mockSalesRep.email,
          phone: mockSalesRep.phone,
          territory: mockSalesRep.territory,
          company: mockSalesRep.company,
        },
      },
    });
  } catch (error) {
    console.error('Error generating campaign email:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate email campaign',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
