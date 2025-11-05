'use client';

import React from 'react';
import { z } from 'zod';
import {
  useRegisterState,
  useRegisterFrontendTool,
  useSubscribeStateToAgentContext,
} from 'cedar-os';

import { DashboardLayout } from '@/components/medical-device/DashboardLayout';
import { DeviceManagement } from '@/components/medical-device/DeviceManagement';
import { SidePanelCedarChat } from '@/cedar/components/chatComponents/SidePanelCedarChat';
import { DebuggerPanel } from '@/cedar/components/debugger';
import { mockDrugs, PrescriptionDrug, TherapeuticCategory, searchDrugs } from '@/lib/mockData';

export default function DrugsPage() {
  const [drugs, setDrugs] = React.useState<PrescriptionDrug[]>(() => {
    // Load from localStorage on mount, fallback to mockDrugs
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('drugs');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // If there's stored data and it's not empty, use it
          if (parsed && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error('Failed to parse stored drugs:', e);
        }
      }
      // Initialize localStorage with mockDrugs if empty
      localStorage.setItem('drugs', JSON.stringify(mockDrugs));
    }
    return mockDrugs;
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategories, setSelectedCategories] = React.useState<TherapeuticCategory[]>([]);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Listen for storage changes (e.g., when new drug is added)
  React.useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('drugs');
      if (stored) {
        try {
          setDrugs(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored drugs:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filtered drugs based on search and category filters
  const filteredDrugs = React.useMemo(() => {
    let result = drugs;

    if (searchQuery) {
      result = searchDrugs(searchQuery);
    }

    if (selectedCategories.length > 0) {
      result = result.filter((drug) =>
        drug.tags.some((tag) => selectedCategories.includes(tag)),
      );
    }

    return result;
  }, [drugs, searchQuery, selectedCategories]);

  // Sync drugs to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('drugs', JSON.stringify(drugs));
    }
  }, [drugs]);

  // Handle drug deletion
  const handleDeleteDrug = (drugId: string) => {
    const updatedDrugs = drugs.filter((drug) => drug.id !== drugId);
    setDrugs(updatedDrugs);
    localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
  };

  // Reset drugs to original mock data
  const handleResetDrugs = () => {
    if (confirm('Are you sure you want to reset to the original mock drugs? This will remove all custom drugs you added.')) {
      setDrugs(mockDrugs);
      localStorage.setItem('drugs', JSON.stringify(mockDrugs));
    }
  };

  // Register Cedar state for drug management
  useRegisterState({
    key: 'drugs',
    description: 'List of prescription drugs in the portfolio',
    value: drugs,
    setValue: setDrugs,
    stateSetters: {
      addDrug: {
        name: 'addDrug',
        description: 'Add a new prescription drug to the portfolio',
        argsSchema: z.object({
          name: z.string().describe('Drug name'),
          manufacturer: z.string().describe('Manufacturing company'),
          description: z.string().describe('Drug description'),
          manufacturerProductUrl: z.string().url().describe('Manufacturer product page URL'),
          tags: z.array(z.string()).describe('Therapeutic category tags'),
        }),
        execute: (
          currentDrugs: PrescriptionDrug[],
          setValue: (newValue: PrescriptionDrug[]) => void,
          args: {
            name: string;
            manufacturer: string;
            description: string;
            manufacturerProductUrl: string;
            tags: string[];
          },
        ) => {
          const newDrug: PrescriptionDrug = {
            id: `drug_${Date.now()}`,
            name: args.name,
            genericName: args.name.toLowerCase(),
            manufacturer: args.manufacturer,
            description: args.description,
            manufacturerProductUrl: args.manufacturerProductUrl,
            imageUrls: [],
            tags: args.tags as TherapeuticCategory[],
            clinicalFiles: [],
            smartLinkId: `${args.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`,
            userId: 'rep1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ndcCode: '00000-0000-00',
            dosageForm: 'Tablet',
            strength: 'TBD',
            routeOfAdministration: 'Oral',
            activeIngredient: args.name,
            therapeuticClass: 'TBD',
            prescriptionRequired: true,
          };
          const updatedDrugs = [...currentDrugs, newDrug];
          setValue(updatedDrugs);
          localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
        },
      },
      generateSmartLink: {
        name: 'generateSmartLink',
        description: 'Generate a smart link for sharing a drug',
        argsSchema: z.object({
          drugId: z.string().describe('Drug ID to generate link for'),
        }),
        execute: (
          currentDrugs: PrescriptionDrug[],
          setValue: (newValue: PrescriptionDrug[]) => void,
          args: { drugId: string },
        ) => {
          const drug = currentDrugs.find((d) => d.id === args.drugId);
          if (drug) {
            const link = `${window.location.origin}/medication/${drug.smartLinkId}`;
            navigator.clipboard.writeText(link);
            console.log(`Smart link copied to clipboard: ${link}`);
          } else {
            console.log('Drug not found');
          }
        },
      },
      deleteDrug: {
        name: 'deleteDrug',
        description: 'Delete a drug from the portfolio',
        argsSchema: z.object({
          drugId: z.string().describe('Drug ID to delete'),
        }),
        execute: (
          currentDrugs: PrescriptionDrug[],
          setValue: (newValue: PrescriptionDrug[]) => void,
          args: { drugId: string },
        ) => {
          const updatedDrugs = currentDrugs.filter((d) => d.id !== args.drugId);
          setValue(updatedDrugs);
          localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
          console.log(`Drug deleted: ${args.drugId}`);
        },
      },
    },
  });

  // Subscribe states to Cedar context
  useSubscribeStateToAgentContext(
    'drugs',
    (drugs: PrescriptionDrug[]) => ({
      drugCount: drugs.length,
      drugNames: drugs.map((d: PrescriptionDrug) => d.name),
      drugCategories: [...new Set(drugs.flatMap((d: PrescriptionDrug) => d.tags))],
      hasSmartLinks: drugs.every((d) => d.smartLinkId),
    }),
    {
      showInChat: true,
      color: '#059669',
    },
  );

  // Frontend tools for drug management
  useRegisterFrontendTool({
    name: 'filterDrugs',
    description: 'Filter drugs by category or search query',
    argsSchema: z.object({
      query: z.string().optional().describe('Search query'),
      categories: z.array(z.string()).optional().describe('Therapeutic categories to filter by'),
    }),
    execute: async (args: { query?: string; categories?: string[] }) => {
      if (args.query) {
        setSearchQuery(args.query);
      }
      if (args.categories) {
        setSelectedCategories(args.categories as TherapeuticCategory[]);
      }
      console.log('Drug filters applied');
    },
  });

  useRegisterFrontendTool({
    name: 'createCampaignForDrug',
    description: 'Create a marketing campaign for a specific drug',
    argsSchema: z.object({
      drugId: z.string().describe('Drug ID to create campaign for'),
      campaignType: z.string().optional().describe('Type of campaign'),
    }),
    execute: async (args: { drugId: string; campaignType?: string }) => {
      const drug = drugs.find((d) => d.id === args.drugId);
      if (drug) {
        console.log(`Creating ${args.campaignType || 'standard'} campaign for ${drug.name}`);
        // This would redirect to campaign creation
      }
    },
  });

  const renderContent = () => (
    <DashboardLayout>
      <DeviceManagement
        drugs={filteredDrugs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onDeleteDrug={handleDeleteDrug}
        onResetDrugs={handleResetDrugs}
      />
    </DashboardLayout>
  );

  return (
    <SidePanelCedarChat
      side="right"
      title="Drug Assistant"
      collapsedLabel="Chat with AI"
      showCollapsedButton={true}
    >
      <DebuggerPanel />
      {renderContent()}
    </SidePanelCedarChat>
  );
}
