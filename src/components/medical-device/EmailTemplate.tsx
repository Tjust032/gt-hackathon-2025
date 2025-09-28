import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Font,
} from '@react-email/components';
import { MedicalDeviceEmailTemplate } from './MedicalDeviceEmailTemplate';

interface EmailTemplateProps {
  subject: string;
  content: string;
  deviceName: string;
  companyName: string;
  variables: Record<string, string>;
  structuredData?: {
    preview: string;
    greeting: string;
    opening: string;
    clinicalEvidence: Array<{
      title: string;
      content: string;
    }>;
    deviceBenefits: string[];
    callToAction: string;
    deviceLink: string;
    signature: string;
  };
  salesRep?: {
    name: string;
    email: string;
    phone: string;
    territory: string;
    company: string;
  };
}

export function EmailTemplate({
  subject,
  content,
  deviceName,
  companyName,
  variables,
  structuredData,
  salesRep,
}: EmailTemplateProps) {
  // If we have structured data, use the new template
  if (structuredData) {
    return (
      <MedicalDeviceEmailTemplate
        subject={subject}
        preview={structuredData.preview}
        greeting={structuredData.greeting}
        opening={structuredData.opening}
        clinicalEvidence={structuredData.clinicalEvidence}
        deviceBenefits={structuredData.deviceBenefits}
        callToAction={structuredData.callToAction}
        deviceLink={structuredData.deviceLink}
        signature={structuredData.signature}
        deviceName={deviceName}
        companyName={companyName}
        variables={variables}
        salesRep={salesRep}
      />
    );
  }

  // Fallback to original template for backward compatibility
  // Process template variables
  const processedContent = Object.entries(variables).reduce((processed, [key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    return processed.replace(regex, value);
  }, content);

  // Split content into paragraphs
  const paragraphs = processedContent.split('\n\n').filter((p) => p.trim());

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
            format: 'woff2',
          }}
        />
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>{companyName}</Text>
          </Section>

          <Section style={contentStyle}>
            <Text style={subjectLine}>{subject}</Text>

            {paragraphs.map((paragraph, index) => {
              // Check if this paragraph contains bullet points
              if (paragraph.includes('•') || paragraph.includes('**')) {
                // Handle formatted content
                const lines = paragraph.split('\n').filter((line) => line.trim());
                return (
                  <Section key={index} style={section}>
                    {lines.map((line, lineIndex) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        // Bold headers
                        return (
                          <Text key={lineIndex} style={boldText}>
                            {line.replace(/\*\*/g, '')}
                          </Text>
                        );
                      } else if (line.trim().startsWith('•')) {
                        // Bullet points
                        return (
                          <Text key={lineIndex} style={bulletPoint}>
                            {line.trim()}
                          </Text>
                        );
                      } else {
                        // Regular text
                        return (
                          <Text key={lineIndex} style={text}>
                            {line}
                          </Text>
                        );
                      }
                    })}
                  </Section>
                );
              } else {
                // Regular paragraph
                return (
                  <Text key={index} style={text}>
                    {paragraph}
                  </Text>
                );
              }
            })}
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Best regards,
              <br />
              Medical Device Sales Team
              <br />
              {companyName}
            </Text>

            <Button style={button} href="mailto:reply@example.com">
              Reply to this email
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 30px',
  backgroundColor: '#0891b2',
};

const headerText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0',
};

const contentStyle = {
  padding: '30px',
};

const subjectLine = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  marginBottom: '20px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const boldText = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  marginBottom: '12px',
  marginTop: '20px',
};

const bulletPoint = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '8px',
  paddingLeft: '16px',
};

const section = {
  marginBottom: '24px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footer = {
  padding: '0 30px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '16px',
};

const button = {
  backgroundColor: '#0891b2',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '16px auto',
  maxWidth: '200px',
};
