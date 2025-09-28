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
import { mockDevices, MedicalDevice, MedicalCategory, searchDevices } from '@/lib/mockData';

export default function DevicesPage() {
  const [devices, setDevices] = React.useState<MedicalDevice[]>(mockDevices);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategories, setSelectedCategories] = React.useState<MedicalCategory[]>([]);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Filtered devices based on search and category filters
  const filteredDevices = React.useMemo(() => {
    let result = devices;

    if (searchQuery) {
      result = searchDevices(searchQuery);
    }

    if (selectedCategories.length > 0) {
      result = result.filter((device) =>
        device.tags.some((tag) => selectedCategories.includes(tag)),
      );
    }

    return result;
  }, [devices, searchQuery, selectedCategories]);

  // Register Cedar state for device management
  useRegisterState({
    key: 'devices',
    description: 'List of medical devices in the portfolio',
    value: devices,
    setValue: setDevices,
    stateSetters: {
      addDevice: {
        name: 'addDevice',
        description: 'Add a new medical device to the portfolio',
        argsSchema: z.object({
          name: z.string().describe('Device name'),
          company: z.string().describe('Manufacturing company'),
          description: z.string().describe('Device description'),
          companyProductUrl: z.string().url().describe('Company product page URL'),
          tags: z.array(z.string()).describe('Medical category tags'),
        }),
        execute: (
          currentDevices: MedicalDevice[],
          setValue: (newValue: MedicalDevice[]) => void,
          args: {
            name: string;
            company: string;
            description: string;
            companyProductUrl: string;
            tags: string[];
          },
        ) => {
          const newDevice: MedicalDevice = {
            id: `device_${Date.now()}`,
            name: args.name,
            company: args.company,
            description: args.description,
            companyProductUrl: args.companyProductUrl,
            imageUrls: [],
            tags: args.tags as MedicalCategory[],
            clinicalFiles: [],
            smartLinkId: `${args.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`,
            userId: 'rep1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setValue([...currentDevices, newDevice]);
        },
      },
      generateSmartLink: {
        name: 'generateSmartLink',
        description: 'Generate a smart link for sharing a device',
        argsSchema: z.object({
          deviceId: z.string().describe('Device ID to generate link for'),
        }),
        execute: (
          currentDevices: MedicalDevice[],
          setValue: (newValue: MedicalDevice[]) => void,
          args: { deviceId: string },
        ) => {
          const device = currentDevices.find((d) => d.id === args.deviceId);
          if (device) {
            const link = `${window.location.origin}/device/${device.smartLinkId}`;
            navigator.clipboard.writeText(link);
            console.log(`Smart link copied to clipboard: ${link}`);
          } else {
            console.log('Device not found');
          }
        },
      },
    },
  });

  // Subscribe states to Cedar context
  useSubscribeStateToAgentContext(
    'devices',
    (devices: MedicalDevice[]) => ({
      deviceCount: devices.length,
      deviceNames: devices.map((d: MedicalDevice) => d.name),
      deviceCategories: [...new Set(devices.flatMap((d: MedicalDevice) => d.tags))],
      hasSmartLinks: devices.every((d) => d.smartLinkId),
    }),
    {
      showInChat: true,
      color: '#059669',
    },
  );

  // Frontend tools for device management
  useRegisterFrontendTool({
    name: 'filterDevices',
    description: 'Filter devices by category or search query',
    argsSchema: z.object({
      query: z.string().optional().describe('Search query'),
      categories: z.array(z.string()).optional().describe('Medical categories to filter by'),
    }),
    execute: async (args: { query?: string; categories?: string[] }) => {
      if (args.query) {
        setSearchQuery(args.query);
      }
      if (args.categories) {
        setSelectedCategories(args.categories as MedicalCategory[]);
      }
      console.log('Device filters applied');
    },
  });

  useRegisterFrontendTool({
    name: 'createCampaignForDevice',
    description: 'Create a marketing campaign for a specific device',
    argsSchema: z.object({
      deviceId: z.string().describe('Device ID to create campaign for'),
      campaignType: z.string().optional().describe('Type of campaign'),
    }),
    execute: async (args: { deviceId: string; campaignType?: string }) => {
      const device = devices.find((d) => d.id === args.deviceId);
      if (device) {
        console.log(`Creating ${args.campaignType || 'standard'} campaign for ${device.name}`);
        // This would redirect to campaign creation
      }
    },
  });

  const renderContent = () => (
    <DashboardLayout>
      <DeviceManagement
        devices={filteredDevices}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </DashboardLayout>
  );

  return (
    <SidePanelCedarChat
      side="right"
      title="Device Assistant"
      collapsedLabel="Chat with AI"
      showCollapsedButton={true}
    >
      <DebuggerPanel />
      {renderContent()}
    </SidePanelCedarChat>
  );
}
