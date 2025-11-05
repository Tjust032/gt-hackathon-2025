import { NextRequest, NextResponse } from 'next/server';
import { getDrugById } from '@/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { drugId, campaignType, targetHCPs, tone, emailLength, additionalContext } = body;

    // Validate required fields
    if (!drugId || !campaignType || !targetHCPs) {
      return NextResponse.json(
        { error: 'Missing required fields: drugId, campaignType, and targetHCPs are required' },
        { status: 400 },
      );
    }

    // Get drug information
    const drug = getDrugById(drugId);
    if (!drug) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    // Generate campaign email using AI (simulated for now)
    const subject = generateSubject(drug.name, campaignType, targetHCPs);
    const content = generateEmailContent({
      drug,
      campaignType,
      targetHCPs,
      tone,
      emailLength,
      additionalContext,
    });

    const generatedEmail = {
      id: `email_${Date.now()}`,
      subject,
      content,
      drugId,
      campaignType,
      targetHCPs,
      tone,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      email: generatedEmail,
    });
  } catch (error) {
    console.error('Error generating campaign email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateSubject(drugName: string, campaignType: string, targetHCPs: string): string {
  const subjectTemplates = {
    awareness: `Introducing ${drugName}: Breakthrough Therapy for ${targetHCPs}`,
    'product-launch': `Now Available: ${drugName} - Advanced Treatment for ${targetHCPs}`,
    educational: `Clinical Evidence Update: ${drugName} Outcomes for ${targetHCPs}`,
    'follow-up': `Following Up: ${drugName} Implementation for ${targetHCPs}`,
  };

  return (
    subjectTemplates[campaignType as keyof typeof subjectTemplates] ||
    `${drugName} - Important Update for ${targetHCPs}`
  );
}

function generateEmailContent({
  drug,
  campaignType,
  targetHCPs,
  tone,
  emailLength,
  additionalContext,
}: {
  drug: any;
  campaignType: string;
  targetHCPs: string;
  tone: string;
  emailLength: string;
  additionalContext?: string;
}): string {
  const greeting = getGreeting(tone);
  const clinicalData =
    drug.clinicalFiles?.[0]?.extractedContent || 'outstanding clinical outcomes';
  const drugSpecs = getDrugHighlights(drug, emailLength);
  const callToAction = getCallToAction(campaignType, tone);

  const content = `${greeting} ${targetHCPs},

I hope this message finds you well. I'm reaching out to share ${getCampaignOpening(campaignType)} about ${drug.name}.

${getMainContent(campaignType, drug, clinicalData, emailLength)}

${drugSpecs}

${additionalContext ? `\nAdditional Information:\n${additionalContext}\n` : ''}

${callToAction}

Best regards,
[Your Name]
Pharmaceutical Sales Specialist

${getPostScript(drug, campaignType)}`;

  return content.trim();
}

function getGreeting(tone: string): string {
  const greetings = {
    professional: 'Dear',
    educational: 'Dear Dr.',
    urgent: 'Dear',
    friendly: 'Hello',
  };
  return greetings[tone as keyof typeof greetings] || 'Dear';
}

function getCampaignOpening(campaignType: string): string {
  const openings = {
    awareness: 'exciting information',
    'product-launch': 'the latest announcement',
    educational: 'important clinical updates',
    'follow-up': 'additional information',
  };
  return openings[campaignType as keyof typeof openings] || 'important information';
}

function getMainContent(
  campaignType: string,
  drug: any,
  clinicalData: string,
  emailLength: string,
): string {
  const isDetailed = emailLength === 'detailed';
  const isStandard = emailLength === 'standard';

  let content = '';

  if (campaignType === 'awareness') {
    content = `${drug.name} represents a significant advancement in pharmaceutical therapy, offering enhanced patient outcomes and improved quality of life.`;
  } else if (campaignType === 'product-launch') {
    content = `We're excited to announce the availability of ${drug.name}, our latest breakthrough therapy designed specifically for your patients' needs.`;
  } else if (campaignType === 'educational') {
    content = `Recent clinical studies have demonstrated exceptional outcomes with ${drug.name}.`;
  } else {
    content = `Following our previous discussion about ${drug.name}, I wanted to provide you with additional insights.`;
  }

  if (isStandard || isDetailed) {
    content += `\n\nKey Clinical Highlights:
• ${clinicalData.substring(0, isDetailed ? 200 : 100)}${clinicalData.length > 100 ? '...' : ''}
• FDA-approved with proven safety profile
• Enhanced patient outcomes and satisfaction`;

    if (isDetailed) {
      content += `
• Comprehensive clinical trial data available
• Post-market surveillance confirming safety
• Patient assistance programs available`;
    }
  }

  return content;
}

function getDrugHighlights(drug: any, emailLength: string): string {
  const isDetailed = emailLength === 'detailed';

  let highlights = `Why ${drug.name} Matters for Your Practice:`;

  if (isDetailed) {
    highlights += `\n• Proven clinical efficacy with strong trial data
• Simple dosing and administration
• Comprehensive prescriber support
• Patient assistance and reimbursement support`;
  } else {
    highlights += `\n• Proven clinical efficacy
• Straightforward patient management`;
  }

  return highlights;
}

function getCallToAction(campaignType: string, tone: string): string {
  const isUrgent = tone === 'urgent';

  if (campaignType === 'follow-up') {
    return isUrgent
      ? 'I would appreciate the opportunity to discuss this further at your earliest convenience. When would be a good time for a brief call this week?'
      : 'I would welcome the opportunity to discuss how this can benefit your patients. Would you be available for a conversation this week?';
  }

  return isUrgent
    ? 'Given the clinical benefits, I recommend we schedule a demonstration soon. Are you available for a brief meeting this week?'
    : 'I would be delighted to arrange a demonstration or provide additional clinical data. Would you be interested in learning more?';
}

function getPostScript(drug: any, campaignType: string): string {
  if (campaignType === 'educational') {
    return `P.S. I have additional peer-reviewed studies and case reports available that demonstrate the effectiveness of ${drug.name} in clinical practice.`;
  }

  return `P.S. I have comprehensive clinical data and testimonials from colleagues who are already prescribing ${drug.name} successfully.`;
}
