import { NextRequest, NextResponse } from 'next/server';
import { getDeviceById } from '@/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, campaignType, targetHCPs, tone, emailLength, additionalContext } = body;

    // Validate required fields
    if (!deviceId || !campaignType || !targetHCPs) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceId, campaignType, and targetHCPs are required' },
        { status: 400 },
      );
    }

    // Get device information
    const device = getDeviceById(deviceId);
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Generate campaign email using AI (simulated for now)
    const subject = generateSubject(device.name, campaignType, targetHCPs);
    const content = generateEmailContent({
      device,
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
      deviceId,
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

function generateSubject(deviceName: string, campaignType: string, targetHCPs: string): string {
  const subjectTemplates = {
    awareness: `Introducing ${deviceName}: Revolutionary Technology for ${targetHCPs}`,
    'product-launch': `Now Available: ${deviceName} - Advanced Solutions for ${targetHCPs}`,
    educational: `Clinical Evidence Update: ${deviceName} Outcomes for ${targetHCPs}`,
    'follow-up': `Following Up: ${deviceName} Implementation for ${targetHCPs}`,
  };

  return (
    subjectTemplates[campaignType as keyof typeof subjectTemplates] ||
    `${deviceName} - Important Update for ${targetHCPs}`
  );
}

function generateEmailContent({
  device,
  campaignType,
  targetHCPs,
  tone,
  emailLength,
  additionalContext,
}: {
  device: any;
  campaignType: string;
  targetHCPs: string;
  tone: string;
  emailLength: string;
  additionalContext?: string;
}): string {
  const greeting = getGreeting(tone);
  const clinicalData =
    device.clinicalFiles?.[0]?.extractedContent || 'outstanding clinical outcomes';
  const deviceSpecs = getDeviceHighlights(device, emailLength);
  const callToAction = getCallToAction(campaignType, tone);

  const content = `${greeting} ${targetHCPs},

I hope this message finds you well. I'm reaching out to share ${getCampaignOpening(campaignType)} about the ${device.name}.

${getMainContent(campaignType, device, clinicalData, emailLength)}

${deviceSpecs}

${additionalContext ? `\nAdditional Information:\n${additionalContext}\n` : ''}

${callToAction}

Best regards,
[Your Name]
Medical Device Specialist

${getPostScript(device, campaignType)}`;

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
  device: any,
  clinicalData: string,
  emailLength: string,
): string {
  const isDetailed = emailLength === 'detailed';
  const isStandard = emailLength === 'standard';

  let content = '';

  if (campaignType === 'awareness') {
    content = `The ${device.name} represents a significant advancement in medical technology, offering enhanced patient outcomes and streamlined clinical workflows.`;
  } else if (campaignType === 'product-launch') {
    content = `We're excited to announce the availability of the ${device.name}, our latest innovation designed specifically for your clinical needs.`;
  } else if (campaignType === 'educational') {
    content = `Recent clinical studies have demonstrated exceptional outcomes with the ${device.name}.`;
  } else {
    content = `Following our previous discussion about the ${device.name}, I wanted to provide you with additional insights.`;
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
• Cost-effective solution for your practice`;
    }
  }

  return content;
}

function getDeviceHighlights(device: any, emailLength: string): string {
  const isDetailed = emailLength === 'detailed';

  let highlights = `Why ${device.name} Matters for Your Practice:`;

  if (isDetailed) {
    highlights += `\n• Advanced technology with proven clinical outcomes
• Streamlined workflow integration
• Comprehensive support and training
• Competitive pricing and reimbursement support`;
  } else {
    highlights += `\n• Proven clinical outcomes
• Easy integration into your workflow`;
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

function getPostScript(device: any, campaignType: string): string {
  if (campaignType === 'educational') {
    return `P.S. I have additional peer-reviewed studies and case reports available that demonstrate the effectiveness of ${device.name} in clinical practice.`;
  }

  return `P.S. I have comprehensive clinical data and testimonials from colleagues who are already using ${device.name} successfully.`;
}
