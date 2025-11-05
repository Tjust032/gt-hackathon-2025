'use client';

import React from 'react';
import { z } from 'zod';
import {
  useRegisterState,
  useRegisterFrontendTool,
  useSubscribeStateToAgentContext,
} from 'cedar-os';

import { DashboardLayout } from '@/components/medical-device/DashboardLayout';
import { DrugRegistrationForm } from '@/components/medical-device/DrugRegistrationForm';
import { SidePanelCedarChat } from '@/cedar/components/chatComponents/SidePanelCedarChat';
import { DebuggerPanel } from '@/cedar/components/debugger';
import { TherapeuticCategory } from '@/lib/mockData';

interface DrugFormData {
  name: string;
  genericName: string;
  manufacturer: string;
  description: string;
  manufacturerProductUrl: string;
  tags: TherapeuticCategory[];
  images: File[];
  clinicalFiles: (File | { url: string; description: string })[];
  researchSummary: string;
  ndcCode: string;
  dosageForm: string;
  strength: string;
  routeOfAdministration: string;
  activeIngredient: string;
  therapeuticClass: string;
  prescriptionRequired: boolean;
  controlledSubstanceSchedule?: string;
}

export default function AddDrugPage() {
  const [formData, setFormData] = React.useState<DrugFormData>({
    name: '',
    genericName: '',
    manufacturer: '',
    description: '',
    manufacturerProductUrl: '',
    tags: [],
    images: [],
    clinicalFiles: [],
    researchSummary: '',
    ndcCode: '',
    dosageForm: '',
    strength: '',
    routeOfAdministration: '',
    activeIngredient: '',
    therapeuticClass: '',
    prescriptionRequired: true,
    controlledSubstanceSchedule: undefined,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationErrors] = React.useState<Record<string, string>>({});

  // Register form state for Cedar
  useRegisterState({
    key: 'drugFormData',
    description: 'Prescription drug registration form data',
    value: formData,
    setValue: setFormData,
    stateSetters: {
      updateField: {
        name: 'updateField',
        description: 'Update a specific field in the drug form',
        argsSchema: z.object({
          field: z.string().describe('Field name to update'),
          value: z.any().describe('New value for the field'),
        }),
        execute: (
          currentData: DrugFormData,
          setValue: (newValue: DrugFormData) => void,
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
    'drugFormData',
    (data: DrugFormData) => ({
      formCompletion:
        Object.values(data).filter((value) =>
          Array.isArray(value) ? value.length > 0 : Boolean(value),
        ).length / 13, // 13 required fields
      drugName: data.name,
      genericName: data.genericName,
      manufacturer: data.manufacturer,
      ndcCode: data.ndcCode,
      selectedTags: data.tags,
      hasImages: data.images.length > 0,
      hasClinicalFiles: data.clinicalFiles.length > 0,
    }),
    {
      showInChat: true,
      color: '#0891b2',
    },
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.genericName || !formData.manufacturer ||
          !formData.description || !formData.manufacturerProductUrl ||
          formData.tags.length === 0 || !formData.ndcCode || !formData.dosageForm ||
          !formData.strength || !formData.routeOfAdministration ||
          !formData.activeIngredient || !formData.therapeuticClass) {
        alert('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Get existing drugs from localStorage
      const existingDrugs = JSON.parse(localStorage.getItem('drugs') || '[]');

      // Create new drug object
      const newDrug = {
        id: `drug_${Date.now()}`,
        name: formData.name,
        genericName: formData.genericName,
        manufacturer: formData.manufacturer,
        description: formData.description,
        manufacturerProductUrl: formData.manufacturerProductUrl,
        imageUrls: [],
        tags: formData.tags,
        clinicalFiles: [],
        smartLinkId: `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`,
        userId: 'rep1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ndcCode: formData.ndcCode,
        dosageForm: formData.dosageForm,
        strength: formData.strength,
        routeOfAdministration: formData.routeOfAdministration,
        activeIngredient: formData.activeIngredient,
        therapeuticClass: formData.therapeuticClass,
        prescriptionRequired: formData.prescriptionRequired,
        controlledSubstanceSchedule: formData.controlledSubstanceSchedule,
      };

      // Save to localStorage
      localStorage.setItem('drugs', JSON.stringify([...existingDrugs, newDrug]));

      // Trigger a storage event to update other tabs/windows
      window.dispatchEvent(new Event('storage'));

      // Redirect to medications page
      window.location.href = '/dashboard/medications';
    } catch (error) {
      setIsSubmitting(false);
      console.error('Failed to register drug:', error);
      alert('Failed to register drug. Please try again.');
    }
  };

  // Frontend tools for form management
  useRegisterFrontendTool({
    name: 'submitDrug',
    description: 'Submit the prescription drug registration form',
    argsSchema: z.object({}),
    execute: handleSubmit,
  });

  const renderContent = () => (
    <DashboardLayout>
      <DrugRegistrationForm
        formData={formData}
        onFormDataChange={setFormData}
        validationErrors={validationErrors}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </DashboardLayout>
  );

  return (
    <SidePanelCedarChat
      side="right"
      title="Drug Registration Assistant"
      collapsedLabel="Chat with AI"
      showCollapsedButton={true}
    >
      <DebuggerPanel />
      {renderContent()}
    </SidePanelCedarChat>
  );
}
