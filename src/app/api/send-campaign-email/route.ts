import { NextRequest, NextResponse } from 'next/server';

interface EmailSendRequest {
  html: string;
  subject: string;
  recipient?: string;
  senderName?: string;
  senderEmail?: string;
  deviceName?: string;
  campaignType?: string;
  targetHCPs?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EmailSendRequest;
    const {
      html,
      subject,
      recipient,
      senderName,
      senderEmail,
      deviceName,
      campaignType,
      targetHCPs,
    } = body;

    // Validate required fields
    if (!html || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: html and subject are required' },
        { status: 400 },
      );
    }

    // Prepare the email data for the Gmail HTML Email API
    const emailData = {
      html,
      subject,
      apiKey: 'test-key-123', // Using the test key as shown in the example
      // Add metadata for tracking
      metadata: {
        deviceName,
        campaignType,
        targetHCPs,
        senderName,
        senderEmail,
        recipient,
        sentAt: new Date().toISOString(),
      },
    };

    // Send email via Gmail HTML Email API
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbzMkPeRYlAO8F6wo_-6IQ7Cbg7QSI6q2fM7z7tveo__nlCBrRJgawN6T5nyHJiju_27/exec',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gmail API Error:', errorText);
      throw new Error(`Gmail API responded with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    // Log successful send for tracking
    console.log('Email sent successfully:', {
      subject,
      deviceName,
      campaignType,
      targetHCPs,
      sentAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: `email_${Date.now()}`,
      sentAt: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error('Error sending campaign email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
