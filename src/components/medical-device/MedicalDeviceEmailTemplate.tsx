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
  Heading,
  Preview,
} from '@react-email/components';

interface MedicalDeviceEmailTemplateProps {
  subject: string;
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
  deviceName: string;
  companyName: string;
  variables: Record<string, string>;
  salesRep?: {
    name: string;
    email: string;
    phone: string;
    territory: string;
    company: string;
  };
}

export function MedicalDeviceEmailTemplate({
  preview,
  greeting,
  opening,
  clinicalEvidence,
  deviceBenefits,
  callToAction,
  deviceLink,
  signature,
  companyName,
  variables,
  salesRep,
}: MedicalDeviceEmailTemplateProps) {
  // Process template variables
  const processText = (text: string): string => {
    return Object.entries(variables).reduce((processed, [key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      return processed.replace(regex, value);
    }, text);
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>{processText(preview)}</Preview>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>{companyName}</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Greeting */}
            <Text style={greeting_style}>{processText(greeting)}</Text>

            {/* Opening */}
            <Text style={paragraph}>{processText(opening)}</Text>

            {/* Clinical Evidence */}
            {clinicalEvidence.map((evidence, index) => (
              <Section key={index} style={evidenceSection}>
                <Heading style={evidenceTitle}>{evidence.title}</Heading>
                <Text style={evidenceContent}>{processText(evidence.content)}</Text>
              </Section>
            ))}

            {/* Device Benefits */}
            <Section style={benefitsSection}>
              <Heading style={sectionHeading}>Key Benefits</Heading>
              {deviceBenefits.map((benefit, index) => (
                <Text key={index} style={bulletPoint}>
                  • {processText(benefit)}
                </Text>
              ))}
            </Section>

            {/* Call to Action */}
            <Section style={ctaSection}>
              <Text style={paragraph}>{processText(callToAction)}</Text>
              <Button style={button} href={deviceLink}>
                Learn More About This Device
              </Button>
            </Section>

            <Hr style={hr} />

            {/* Signature */}
            {salesRep ? (
              <div style={signature_style}>
                <Text style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Best regards,</Text>
                <Text style={{ margin: '0 0 4px 0' }}>{salesRep.name}</Text>
                <Text style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                  Medical Device Sales Representative
                </Text>
                <Text style={{ margin: '0 0 4px 0' }}>{salesRep.company}</Text>
                <Text style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                  Email: {salesRep.email}
                </Text>
                <Text style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                  Phone: {salesRep.phone}
                </Text>
                <Text style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                  Territory: {salesRep.territory}
                </Text>
              </div>
            ) : (
              <Text style={signature_style}>{processText(signature)}</Text>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              {companyName}
              <br />
              Medical Device Sales Division
              <br />
              This email was sent to a healthcare professional regarding medical device information.
            </Text>
            <Text style={disclaimerText}>
              This communication is intended for healthcare professionals only. Please consult
              device labeling for complete indications, contraindications, and warnings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  border: '1px solid #e6ebf1',
};

const header = {
  backgroundColor: '#0891b2',
  padding: '20px 30px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'center' as const,
};

const content = {
  padding: '30px',
};

const greeting_style = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#1f2937',
  marginBottom: '16px',
  fontWeight: '600',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '16px',
};

const evidenceSection = {
  marginBottom: '24px',
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const evidenceTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e40af',
  marginBottom: '12px',
  marginTop: '0',
};

const evidenceContent = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#475569',
  marginBottom: '0',
};

const benefitsSection = {
  marginBottom: '24px',
};

const sectionHeading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1f2937',
  marginBottom: '16px',
  marginTop: '0',
};

const bulletPoint = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#374151',
  marginBottom: '8px',
  paddingLeft: '8px',
};

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#0891b2',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  margin: '16px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const signature_style = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '0',
  whiteSpace: 'pre-line' as const,
};

const footer = {
  backgroundColor: '#f8fafc',
  padding: '20px 30px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  marginBottom: '12px',
};

const disclaimerText = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#9ca3af',
  marginBottom: '0',
  fontStyle: 'italic',
};
