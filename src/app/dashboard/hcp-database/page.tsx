'use client';

import React from 'react';
import { z } from 'zod';
import {
  useRegisterState,
  useRegisterFrontendTool,
  useSubscribeStateToAgentContext,
} from 'cedar-os';

import { DashboardLayout } from '@/components/medical-device/DashboardLayout';
import { HCPDatabase } from '@/components/medical-device/HCPDatabase';
import { SidePanelCedarChat } from '@/cedar/components/chatComponents/SidePanelCedarChat';
import { DebuggerPanel } from '@/cedar/components/debugger';

interface HCPContact {
  id: string;
  name: string;
  title: string;
  specialty: string;
  hospital: string;
  email: string;
  phone: string;
  location: string;
  lastActivity: string;
  activityType: 'viewed' | 'downloaded' | 'scheduled' | 'contacted';
  engagementScore: number;
  deviceInterests: string[];
  notes: string;
  tags: string[];
}

const mockHCPContacts: HCPContact[] = [
  {
    id: 'hcp1',
    name: 'Dr. Sarah Chen',
    title: 'Cardiologist',
    specialty: 'Interventional Cardiology',
    hospital: 'Mayo Clinic',
    email: 'sarah.chen@mayoclinic.org',
    phone: '(555) 123-4567',
    location: 'Rochester, MN',
    lastActivity: '2 min ago',
    activityType: 'viewed',
    engagementScore: 85,
    deviceInterests: ['CardioTech Pro Pacemaker', 'Stents'],
    notes: 'Very interested in latest pacemaker technology. Scheduled demo for next week.',
    tags: ['High Priority', 'Decision Maker'],
  },
  {
    id: 'hcp2',
    name: 'Dr. James Wilson',
    title: 'Cardiac Surgeon',
    specialty: 'Cardiac Surgery',
    hospital: 'Johns Hopkins',
    email: 'james.wilson@jhmi.edu',
    phone: '(555) 234-5678',
    location: 'Baltimore, MD',
    lastActivity: '15 min ago',
    activityType: 'downloaded',
    engagementScore: 92,
    deviceInterests: ['CardioTech Pro Pacemaker'],
    notes: 'Downloaded clinical trial data. Highly engaged prospect.',
    tags: ['Hot Lead', 'Influencer'],
  },
  {
    id: 'hcp3',
    name: 'Dr. Lisa Park',
    title: 'Neurologist',
    specialty: 'Movement Disorders',
    hospital: 'Cleveland Clinic',
    email: 'lisa.park@ccf.org',
    phone: '(555) 345-6789',
    location: 'Cleveland, OH',
    lastActivity: '1 hour ago',
    activityType: 'scheduled',
    engagementScore: 78,
    deviceInterests: ['NeuroStim Deep Brain Stimulator'],
    notes: 'Scheduled demo meeting for NeuroStim device.',
    tags: ['Scheduled Demo'],
  },
  {
    id: 'hcp4',
    name: 'Dr. Michael Rodriguez',
    title: 'Orthopedic Surgeon',
    specialty: 'Joint Replacement',
    hospital: 'Hospital for Special Surgery',
    email: 'michael.rodriguez@hss.edu',
    phone: '(555) 456-7890',
    location: 'New York, NY',
    lastActivity: '3 hours ago',
    activityType: 'contacted',
    engagementScore: 65,
    deviceInterests: ['OrthoFlex Hip Replacement'],
    notes: 'Sent inquiry about OrthoFlex pricing and availability.',
    tags: ['Price Sensitive'],
  },
  {
    id: 'hcp5',
    name: 'Dr. Emily Thompson',
    title: 'Cardiologist',
    specialty: 'Electrophysiology',
    hospital: 'Cedars-Sinai',
    email: 'emily.thompson@cshs.org',
    phone: '(555) 567-8901',
    location: 'Los Angeles, CA',
    lastActivity: '1 day ago',
    activityType: 'viewed',
    engagementScore: 72,
    deviceInterests: ['CardioTech Pro Pacemaker'],
    notes: 'Recently viewed device page. Follow up needed.',
    tags: ['Follow Up'],
  },
];

export default function HCPDatabasePage() {
  const [hcpContacts, setHcpContacts] = React.useState<HCPContact[]>(mockHCPContacts);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [specialtyFilter, setSpecialtyFilter] = React.useState<string>('');
  const [engagementFilter, setEngagementFilter] = React.useState<'all' | 'high' | 'medium' | 'low'>(
    'all',
  );

  // Filtered HCPs based on search and filters
  const filteredHCPs = React.useMemo(() => {
    let result = hcpContacts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (hcp) =>
          hcp.name.toLowerCase().includes(query) ||
          hcp.specialty.toLowerCase().includes(query) ||
          hcp.hospital.toLowerCase().includes(query) ||
          hcp.location.toLowerCase().includes(query),
      );
    }

    if (specialtyFilter) {
      result = result.filter((hcp) =>
        hcp.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()),
      );
    }

    if (engagementFilter !== 'all') {
      result = result.filter((hcp) => {
        if (engagementFilter === 'high') return hcp.engagementScore >= 80;
        if (engagementFilter === 'medium')
          return hcp.engagementScore >= 60 && hcp.engagementScore < 80;
        if (engagementFilter === 'low') return hcp.engagementScore < 60;
        return true;
      });
    }

    return result;
  }, [hcpContacts, searchQuery, specialtyFilter, engagementFilter]);

  // Register Cedar state for HCP management
  useRegisterState({
    key: 'hcpDatabase',
    description: 'Healthcare Professional database and contacts',
    value: hcpContacts,
    setValue: setHcpContacts,
    stateSetters: {
      addHCP: {
        name: 'addHCP',
        description: 'Add a new HCP contact to the database',
        argsSchema: z.object({
          name: z.string().describe('HCP name'),
          title: z.string().describe('Professional title'),
          specialty: z.string().describe('Medical specialty'),
          hospital: z.string().describe('Hospital or practice'),
          email: z.string().email().describe('Email address'),
          phone: z.string().describe('Phone number'),
          location: z.string().describe('Location'),
        }),
        execute: (
          currentHCPs: HCPContact[],
          setValue: (newValue: HCPContact[]) => void,
          args: {
            name: string;
            title: string;
            specialty: string;
            hospital: string;
            email: string;
            phone: string;
            location: string;
          },
        ) => {
          const newHCP: HCPContact = {
            id: `hcp_${Date.now()}`,
            name: args.name,
            title: args.title,
            specialty: args.specialty,
            hospital: args.hospital,
            email: args.email,
            phone: args.phone,
            location: args.location,
            lastActivity: 'Just added',
            activityType: 'contacted',
            engagementScore: 0,
            deviceInterests: [],
            notes: '',
            tags: ['New Contact'],
          };
          setValue([...currentHCPs, newHCP]);
        },
      },
      updateEngagement: {
        name: 'updateEngagement',
        description: 'Update HCP engagement score and activity',
        argsSchema: z.object({
          hcpId: z.string().describe('HCP ID'),
          activity: z
            .enum(['viewed', 'downloaded', 'scheduled', 'contacted'])
            .describe('Activity type'),
          notes: z.string().optional().describe('Additional notes'),
        }),
        execute: (
          currentHCPs: HCPContact[],
          setValue: (newValue: HCPContact[]) => void,
          args: {
            hcpId: string;
            activity: 'viewed' | 'downloaded' | 'scheduled' | 'contacted';
            notes?: string;
          },
        ) => {
          const updated = currentHCPs.map((hcp) =>
            hcp.id === args.hcpId
              ? {
                  ...hcp,
                  lastActivity: 'Just now',
                  activityType: args.activity,
                  engagementScore: Math.min(100, hcp.engagementScore + 5),
                  notes: args.notes || hcp.notes,
                }
              : hcp,
          );
          setValue(updated);
        },
      },
    },
  });

  // Subscribe states to Cedar context
  useSubscribeStateToAgentContext(
    'hcpDatabase',
    (hcps: HCPContact[]) => ({
      totalHCPs: hcps.length,
      highEngagementHCPs: hcps.filter((h) => h.engagementScore >= 80).length,
      specialties: [...new Set(hcps.map((h) => h.specialty))],
      recentActivity: hcps.filter(
        (h) => h.lastActivity.includes('min ago') || h.lastActivity.includes('hour ago'),
      ).length,
    }),
    {
      showInChat: true,
      color: '#059669',
    },
  );

  // Frontend tools for HCP management
  useRegisterFrontendTool({
    name: 'filterHCPs',
    description: 'Filter HCP database by specialty or engagement level',
    argsSchema: z.object({
      specialty: z.string().optional().describe('Medical specialty filter'),
      engagement: z
        .enum(['all', 'high', 'medium', 'low'])
        .optional()
        .describe('Engagement level filter'),
      searchQuery: z.string().optional().describe('Search query'),
    }),
    execute: async (args: {
      specialty?: string;
      engagement?: 'all' | 'high' | 'medium' | 'low';
      searchQuery?: string;
    }) => {
      if (args.specialty) setSpecialtyFilter(args.specialty);
      if (args.engagement) setEngagementFilter(args.engagement);
      if (args.searchQuery) setSearchQuery(args.searchQuery);
      console.log('HCP filters applied');
    },
  });

  useRegisterFrontendTool({
    name: 'exportHCPData',
    description: 'Export HCP contact data',
    argsSchema: z.object({
      format: z.enum(['csv', 'excel', 'vcard']).describe('Export format'),
      includeNotes: z.boolean().optional().describe('Include notes in export'),
    }),
    execute: async (args: { format: 'csv' | 'excel' | 'vcard'; includeNotes?: boolean }) => {
      console.log(
        `Exporting ${filteredHCPs.length} HCP contacts as ${args.format}${args.includeNotes ? ' with notes' : ''}`,
      );
    },
  });

  const renderContent = () => (
    <DashboardLayout>
      <HCPDatabase
        hcpContacts={filteredHCPs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        specialtyFilter={specialtyFilter}
        onSpecialtyFilterChange={setSpecialtyFilter}
        engagementFilter={engagementFilter}
        onEngagementFilterChange={setEngagementFilter}
      />
    </DashboardLayout>
  );

  return (
    <SidePanelCedarChat
      side="right"
      title="HCP Assistant"
      collapsedLabel="Chat with AI"
      showCollapsedButton={true}
    >
      <DebuggerPanel />
      {renderContent()}
    </SidePanelCedarChat>
  );
}
