import {
  createMastraToolForFrontendTool,
  createRequestAdditionalContextTool,
} from '@cedar-os/backend';
import { streamJSONEvent } from '../../utils/streamUtils';
import { z } from 'zod';

// Define the schemas for clinical data tools

// Schema for clinical data query tool
export const ClinicalDataQuerySchema = z.object({
  query: z
    .string()
    .min(1, 'Query cannot be empty')
    .describe(
      'Question about clinical evidence, efficacy studies, safety data, FDA approval, or research findings',
    ),
});

// Schema for clinical file download tool
export const ClinicalFileDownloadSchema = z.object({
  fileId: z
    .string()
    .min(1, 'File ID cannot be empty')
    .describe('ID of the clinical research file to download (available files: cf1, cf2, cf3, cf4)'),
});

// Schema for campaign email generation tool
export const CampaignEmailGenerationSchema = z.object({
  deviceId: z
    .string()
    .min(1, 'Device ID cannot be empty')
    .describe('ID of the medical device for the campaign'),
  campaignType: z
    .enum(['awareness', 'product-launch', 'educational', 'follow-up'])
    .describe('Type of campaign to create'),
  targetHCPs: z
    .string()
    .min(1, 'Target HCPs cannot be empty')
    .describe('Target HCP specialty or criteria (e.g., Cardiologist, Interventional Cardiologist)'),
  tone: z
    .enum(['professional', 'educational', 'urgent', 'friendly'])
    .default('professional')
    .describe('Tone of the email'),
  emailLength: z
    .enum(['brief', 'standard', 'detailed'])
    .default('standard')
    .describe('Desired length of the email'),
  additionalContext: z
    .string()
    .optional()
    .describe('Additional context or specific points to include in the email'),
});

// Schema for medication addition tool
export const AddMedicationSchema = z.object({
  medicationName: z
    .string()
    .min(1, 'Medication name cannot be empty')
    .describe('Name of the medication to add (e.g., Tylenol, Aspirin, Lisinopril)'),
  genericName: z
    .string()
    .optional()
    .describe('Generic name of the medication if different from brand name'),
  dosage: z.string().optional().describe('Dosage information (e.g., 500mg, 10mg/ml)'),
  manufacturer: z.string().optional().describe('Manufacturer name if specified'),
  therapeuticClass: z
    .string()
    .optional()
    .describe('Therapeutic class or category (e.g., Analgesic, Antibiotic, Cardiovascular)'),
  includeImage: z
    .boolean()
    .default(true)
    .describe('Whether to fetch and include medication images'),
  includeClinicalData: z
    .boolean()
    .default(true)
    .describe('Whether to fetch clinical trial and study information'),
  additionalNotes: z
    .string()
    .optional()
    .describe('Any additional notes or specific requirements for the medication'),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

// Create backend tools for clinical data functionality
export const queryClinicalDataTool = createMastraToolForFrontendTool(
  'queryClinicalData',
  ClinicalDataQuerySchema,
  {
    description:
      'Answer questions about clinical evidence, safety data, efficacy studies, and research findings for medical devices. Provides access to clinical trials, safety studies, FDA documentation, and comparative research.',
    toolId: 'queryClinicalData',
    streamEventFn: streamJSONEvent,
    errorSchema: ErrorResponseSchema,
  },
);

export const downloadClinicalFileTool = createMastraToolForFrontendTool(
  'downloadClinicalFile',
  ClinicalFileDownloadSchema,
  {
    description:
      'Download clinical research files, studies, and regulatory documentation for medical devices. Provides access to clinical trial reports, safety studies, and FDA approval documents.',
    toolId: 'downloadClinicalFile',
    streamEventFn: streamJSONEvent,
    errorSchema: ErrorResponseSchema,
  },
);

export const generateCampaignEmailTool = createMastraToolForFrontendTool(
  'generateCampaignEmail',
  CampaignEmailGenerationSchema,
  {
    description:
      'Generate AI-powered campaign emails for medical devices based on device specifications, target HCP audience, and campaign type. Creates personalized, professional emails with clinical evidence integration.',
    toolId: 'generateCampaignEmail',
    streamEventFn: streamJSONEvent,
    errorSchema: ErrorResponseSchema,
  },
);

export const addMedicationTool = createMastraToolForFrontendTool(
  'addMedication',
  AddMedicationSchema,
  {
    description:
      'Add a new medication to the database with comprehensive information including images, clinical data, and therapeutic details. Automatically fetches medication images, clinical trial information, FDA data, and relevant studies from reliable sources.',
    toolId: 'addMedication',
    streamEventFn: streamJSONEvent,
    errorSchema: ErrorResponseSchema,
  },
);

export const requestAdditionalContextTool = createRequestAdditionalContextTool();

/**
 * Registry of all available tools organized by category
 * This structure makes it easy to see tool organization and generate categorized descriptions
 */
export const TOOL_REGISTRY = {
  clinicalData: {
    queryClinicalDataTool,
    downloadClinicalFileTool,
  },
  campaigns: {
    generateCampaignEmailTool,
  },
  medications: {
    addMedicationTool,
  },
  context: {
    requestAdditionalContextTool,
  },
};

// Export all tools as an array for easy registration
export const ALL_TOOLS = [
  queryClinicalDataTool,
  downloadClinicalFileTool,
  generateCampaignEmailTool,
  addMedicationTool,
  requestAdditionalContextTool,
];
