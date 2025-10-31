'use client';

import React from 'react';
import { z } from 'zod';
import {
  useRegisterState,
  useRegisterFrontendTool,
  useSubscribeStateToAgentContext,
} from 'cedar-os';

import { PublicDevicePage } from '@/components/medical-device/PublicDevicePage';
import { FloatingCedarChat } from '@/cedar/components/chatComponents/FloatingCedarChat';
import { mockClinicalChatResponses, MedicalDevice } from '@/lib/mockData';

interface DevicePageClientProps {
  device: MedicalDevice;
}

export function DevicePageClient({ device }: DevicePageClientProps) {
  const [chatHistory, setChatHistory] = React.useState<
    Array<{
      id: string;
      message: string;
      response: string;
      timestamp: string;
    }>
  >([]);

  const [visitorData, setVisitorData] = React.useState({
    viewStartTime: new Date().toISOString(),
    sectionsViewed: [] as string[],
    timeSpent: 0,
    chatInteractions: 0,
  });

  const [documentContext, setDocumentContext] = React.useState<string>('');

  // Fetch documents from database when component mounts
  React.useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/documents?listingId=${device.id}`);
        const data = await response.json();

        if (data.success && data.documents) {
          // Combine all extracted text from documents
          interface DocumentData {
            extracted_text?: string;
          }
          const combinedText = data.documents
            .map((doc: DocumentData) => doc.extracted_text || '')
            .filter((text: string) => text.length > 0)
            .join('\n\n');

          setDocumentContext(combinedText);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, [device.id]);

  // Register device state for Cedar
  useRegisterState({
    key: 'publicDevice',
    description: 'Medical device being viewed on public page',
    value: device,
    setValue: () => {}, // Read-only
    stateSetters: {},
  });

  // Register visitor analytics state
  useRegisterState({
    key: 'visitorAnalytics',
    description: 'Analytics data for device page visitor',
    value: visitorData,
    setValue: setVisitorData,
    stateSetters: {
      trackSectionView: {
        name: 'trackSectionView',
        description: 'Track when a visitor views a specific section',
        argsSchema: z.object({
          section: z.string().describe('Section name that was viewed'),
        }),
        execute: (
          currentData: typeof visitorData,
          setValue: (newValue: typeof visitorData) => void,
          args: { section: string },
        ) => {
          if (!currentData.sectionsViewed.includes(args.section)) {
            setValue({
              ...currentData,
              sectionsViewed: [...currentData.sectionsViewed, args.section],
            });
          }
        },
      },
      incrementChatInteractions: {
        name: 'incrementChatInteractions',
        description: 'Increment chat interaction counter',
        argsSchema: z.object({}),
        execute: (
          currentData: typeof visitorData,
          setValue: (newValue: typeof visitorData) => void,
        ) => {
          setValue({
            ...currentData,
            chatInteractions: currentData.chatInteractions + 1,
          });
        },
      },
    },
  });

  // Register document context state for Cedar chatbot
  useRegisterState({
    key: 'documentContext',
    description: 'Extracted text from all PDF documents for this device listing',
    value: documentContext,
    setValue: () => {}, // Read-only
    stateSetters: {},
  });

  // Register chat history state
  useRegisterState({
    key: 'clinicalChat',
    description: 'Chat history for clinical data queries',
    value: chatHistory,
    setValue: setChatHistory,
    stateSetters: {
      addChatMessage: {
        name: 'addChatMessage',
        description: 'Add a new chat message and AI response',
        argsSchema: z.object({
          message: z.string().describe('User message about the device'),
        }),
        execute: (
          currentHistory: typeof chatHistory,
          setValue: (newValue: typeof chatHistory) => void,
          args: { message: string },
        ) => {
          const response = generateClinicalResponse(args.message, device);
          const newEntry = {
            id: Date.now().toString(),
            message: args.message,
            response,
            timestamp: new Date().toISOString(),
          };
          setValue([...currentHistory, newEntry]);

          // Update visitor analytics
          setVisitorData((prev) => ({
            ...prev,
            chatInteractions: prev.chatInteractions + 1,
          }));
        },
      },
    },
  });

  // Subscribe states to Cedar context
  useSubscribeStateToAgentContext(
    'publicDevice',
    (device: MedicalDevice) => ({
      deviceName: device.name,
      company: device.company,
      categories: device.tags,
      clinicalFilesCount: device.clinicalFiles.length,
      hasImages: device.imageUrls.length > 0,
    }),
    {
      showInChat: true,
      color: '#059669',
    },
  );

  useSubscribeStateToAgentContext(
    'visitorAnalytics',
    (analytics: typeof visitorData) => ({
      sectionsViewed: analytics.sectionsViewed,
      chatInteractions: analytics.chatInteractions,
      engagementLevel: analytics.sectionsViewed.length > 2 ? 'high' : 'low',
    }),
    {
      showInChat: true,
      color: '#0EA5E9',
    },
  );

  // Subscribe document context to Cedar agent - this injects PDF text into LLM prompts
  const DOCUMENT_CONTEXT_PREVIEW_LENGTH = 2000; // Characters to show in preview
  
  useSubscribeStateToAgentContext(
    'documentContext',
    (context: string) => ({
      hasDocumentContext: context.length > 0,
      documentTextLength: context.length,
      documentText: context.substring(0, DOCUMENT_CONTEXT_PREVIEW_LENGTH), // First N chars for context
      fullDocumentText: context, // Full text available to agent
    }),
    {
      showInChat: true,
      color: '#10B981',
    },
  );

  // Frontend tools for device interaction
  useRegisterFrontendTool({
    name: 'queryClinicalData',
    description:
      'Answer questions about clinical evidence, safety data, efficacy studies, and research findings for this medical device. Uses extracted text from PDF documents.',
    argsSchema: z.object({
      query: z
        .string()
        .describe(
          'Question about clinical evidence, efficacy studies, safety data, FDA approval, or research findings',
        ),
    }),
    execute: async (args: { query: string }) => {
      // Use document context if available, otherwise fall back to mock data
      const response = documentContext
        ? generateClinicalResponseWithContext(args.query, device, documentContext)
        : generateClinicalResponse(args.query, device);

      const newEntry = {
        id: Date.now().toString(),
        message: args.query,
        response,
        timestamp: new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, newEntry]);
      setVisitorData((prev) => ({
        ...prev,
        chatInteractions: prev.chatInteractions + 1,
      }));

      console.log(response);
    },
  });

  useRegisterFrontendTool({
    name: 'downloadClinicalFile',
    description:
      'Download clinical research files, studies, and regulatory documentation for this device',
    argsSchema: z.object({
      fileId: z
        .string()
        .describe(
          'ID of the clinical research file to download (available files: cf1, cf2, cf3, cf4)',
        ),
    }),
    execute: async (args: { fileId: string }) => {
      const file = device.clinicalFiles.find((f) => f.id === args.fileId);
      if (file) {
        // In a real app, this would trigger a download
        console.log('Downloading file:', file.filename);
      } else {
        console.log('File not found');
      }
    },
  });

  // Track time spent on page
  React.useEffect(() => {
    const interval = setInterval(() => {
      setVisitorData((prev) => ({
        ...prev,
        timeSpent: prev.timeSpent + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <PublicDevicePage
        device={device}
        onSectionView={(section: string) => {
          setVisitorData((prev) => ({
            ...prev,
            sectionsViewed: [...new Set([...prev.sectionsViewed, section])],
          }));
        }}
      />

      <FloatingCedarChat
        side="right"
        title="Clinical Evidence Assistant"
        collapsedLabel="Ask about clinical data"
      />
    </div>
  );
}

// Helper function to generate clinical responses
function generateClinicalResponse(query: string, device: MedicalDevice): string {
  const queryLower = query.toLowerCase();

  // Check for specific keywords in the query
  if (
    queryLower.includes('efficacy') ||
    queryLower.includes('effective') ||
    queryLower.includes('success')
  ) {
    return mockClinicalChatResponses.efficacy;
  }

  if (
    queryLower.includes('safety') ||
    queryLower.includes('safe') ||
    queryLower.includes('side effect') ||
    queryLower.includes('complication')
  ) {
    return mockClinicalChatResponses.safety;
  }

  if (
    queryLower.includes('comparison') ||
    queryLower.includes('compare') ||
    queryLower.includes('versus') ||
    queryLower.includes('vs')
  ) {
    return mockClinicalChatResponses.comparison;
  }

  if (
    queryLower.includes('battery') ||
    queryLower.includes('longevity') ||
    queryLower.includes('life')
  ) {
    return mockClinicalChatResponses.battery;
  }

  if (
    queryLower.includes('mri') ||
    queryLower.includes('magnetic') ||
    queryLower.includes('imaging')
  ) {
    return mockClinicalChatResponses.mri;
  }

  // Check if query relates to specific clinical files
  const relevantFiles = device.clinicalFiles.filter(
    (file) =>
      file.filename.toLowerCase().includes(queryLower) ||
      file.description.toLowerCase().includes(queryLower) ||
      (file.extractedContent && file.extractedContent.toLowerCase().includes(queryLower)),
  );

  if (relevantFiles.length > 0) {
    const file = relevantFiles[0];
    return `Based on ${file.filename}: ${file.extractedContent || file.description}`;
  }

  // Default response
  return `I can help you understand the clinical evidence for the ${device.name}. I have access to ${device.clinicalFiles.length} research files including clinical trials, safety studies, and FDA documentation.\n\nI can provide information about clinical efficacy and success rates, safety data and adverse events, comparative studies vs. other devices, battery life and technical specifications, MRI compatibility and imaging safety, and FDA approval status and regulatory information.\n\nWhat specific clinical evidence would you like to know about?`;
}

// Helper function to generate clinical responses using document context
function generateClinicalResponseWithContext(
  query: string,
  device: MedicalDevice,
  documentContext: string,
): string {
  const queryLower = query.toLowerCase();

  // If we have document context, search within it
  if (documentContext && documentContext.length > 0) {
    // Simple keyword-based search in document context
    const sentences = documentContext.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    // Common stopwords to exclude from keyword search
    const STOPWORDS = [
      'this',
      'that',
      'what',
      'about',
      'with',
      'from',
      'have',
      'they',
      'will',
      'would',
      'there',
      'their',
      'when',
      'where',
      'which',
    ];

    // Find sentences containing query keywords
    const keywords = queryLower
      .split(/\s+/)
      .filter((word) => word.length > 3 && !STOPWORDS.includes(word));

    const relevantSentences = sentences.filter((sentence) => {
      const sentenceLower = sentence.toLowerCase();
      return keywords.some((keyword) => sentenceLower.includes(keyword));
    });

    if (relevantSentences.length > 0) {
      // Return the most relevant sentences
      const MAX_SENTENCES = 3;
      const response = relevantSentences.slice(0, MAX_SENTENCES).join('. ') + '.';
      return `Based on the clinical documentation for ${device.name}:\n\n${response}`;
    }
  }

  // Fall back to the original response generator if no context match
  return generateClinicalResponse(query, device);
}
