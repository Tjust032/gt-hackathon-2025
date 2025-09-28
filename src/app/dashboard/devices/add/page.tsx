'use client';

import React from 'react';
import { z } from 'zod';
import {
  useRegisterState,
  useRegisterFrontendTool,
  useSubscribeStateToAgentContext,
} from 'cedar-os';

import { DashboardLayout } from '@/components/medical-device/DashboardLayout';
import { DeviceRegistrationForm } from '@/components/medical-device/DeviceRegistrationForm';
import { SidePanelCedarChat } from '@/cedar/components/chatComponents/SidePanelCedarChat';
import { DebuggerPanel } from '@/cedar/components/debugger';
import { MedicalCategory } from '@/lib/mockData';

interface DeviceFormData {
  name: string;
  company: string;
  description: string;
  companyProductUrl: string;
  tags: MedicalCategory[];
  images: File[];
  clinicalFiles: (File | { url: string; description: string })[];
  researchSummary: string;
}

export default function AddDevicePage() {
  const [formData, setFormData] = React.useState<DeviceFormData>({
    name: '',
    company: '',
    description: '',
    companyProductUrl: '',
    tags: [],
    images: [],
    clinicalFiles: [],
    researchSummary: '',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Register form state for Cedar
  useRegisterState({
    key: 'deviceFormData',
    description: 'Medical device registration form data',
    value: formData,
    setValue: setFormData,
    stateSetters: {
      updateField: {
        name: 'updateField',
        description: 'Update a specific field in the device form',
        argsSchema: z.object({
          field: z.string().describe('Field name to update'),
          value: z.any().describe('New value for the field'),
        }),
        execute: (
          currentData: DeviceFormData,
          setValue: (newValue: DeviceFormData) => void,
          args: { field: string; value: unknown },
        ) => {
          setValue({
            ...currentData,
            [args.field]: args.value,
          });
        },
      },
    },
  });

  // Subscribe form data to Cedar context
  useSubscribeStateToAgentContext(
    'deviceFormData',
    (data: DeviceFormData) => ({
      formCompletion:
        Object.values(data).filter((value) =>
          Array.isArray(value) ? value.length > 0 : Boolean(value),
        ).length / 7, // 7 required fields
      deviceName: data.name,
      company: data.company,
      selectedTags: data.tags,
      hasImages: data.images.length > 0,
      hasClinicalFiles: data.clinicalFiles.length > 0,
    }),
    {
      showInChat: true,
      color: '#0891b2',
    },
  );

  // Frontend tools for form management
  useRegisterFrontendTool({
    name: 'submitDevice',
    description: 'Submit the device registration form',
    argsSchema: z.object({}),
    execute: async () => {
      setIsSubmitting(true);

      try {
        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log('Submitting device:', formData);

        // Redirect to devices page
        window.location.href = '/dashboard/devices';
      } catch {
        setIsSubmitting(false);
        console.log('Failed to register device. Please try again.');
      }
    },
  });

  const renderContent = () => (
    <DashboardLayout>
      <DeviceRegistrationForm
        formData={formData}
        onFormDataChange={setFormData}
        validationErrors={validationErrors}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  );

  return (
    <SidePanelCedarChat
      side="right"
      title="Device Registration Assistant"
      collapsedLabel="Chat with AI"
      showCollapsedButton={true}
    >
      <DebuggerPanel />
      {renderContent()}
    </SidePanelCedarChat>
  );
}
