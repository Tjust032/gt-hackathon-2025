'use client';

import React from 'react';
import { z } from 'zod';
import {
  useRegisterState,
  useRegisterFrontendTool,
  useSubscribeStateToAgentContext,
} from 'cedar-os';

import { DashboardLayout } from '@/components/medical-device/DashboardLayout';
import { DashboardOverview } from '@/components/medical-device/DashboardOverview';
import { SidePanelCedarChat } from '@/cedar/components/chatComponents/SidePanelCedarChat';
import { DebuggerPanel } from '@/cedar/components/debugger';
import { mockDrugs, mockSalesRep, PrescriptionDrug } from '@/lib/mockData';

// Mock data for dashboard
interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  drugId: string;
  startDate: string;
  endDate: string;
  targetHCPs: number;
  engagement: number;
  clicks: number;
  meetings: number;
}

interface HCPContact {
  id: string;
  name: string;
  title: string;
  specialty: string;
  hospital: string;
  lastActivity: string;
  activityType: 'viewed' | 'downloaded' | 'scheduled' | 'contacted';
  drugInterest?: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: 'camp1',
    name: 'Repatha Q4 Launch',
    status: 'active',
    drugId: 'drug1',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    targetHCPs: 150,
    engagement: 68.5,
    clicks: 247,
    meetings: 12,
  },
  {
    id: 'camp2',
    name: 'Opdivo Awareness',
    status: 'active',
    drugId: 'drug2',
    startDate: '2024-11-01',
    endDate: '2025-01-31',
    targetHCPs: 85,
    engagement: 45.2,
    clicks: 132,
    meetings: 8,
  },
  {
    id: 'camp3',
    name: 'Xarelto Spring Campaign',
    status: 'scheduled',
    drugId: 'drug3',
    startDate: '2025-03-01',
    endDate: '2025-05-31',
    targetHCPs: 200,
    engagement: 0,
    clicks: 0,
    meetings: 0,
  },
];

const mockHCPContacts: HCPContact[] = [
  {
    id: 'hcp1',
    name: 'Dr. Sarah Chen',
    title: 'Cardiologist',
    specialty: 'Interventional Cardiology',
    hospital: 'Mayo Clinic',
    lastActivity: '2 min ago',
    activityType: 'viewed',
    drugInterest: 'Repatha',
  },
  {
    id: 'hcp2',
    name: 'Dr. James Wilson',
    title: 'Cardiac Surgeon',
    specialty: 'Cardiac Surgery',
    hospital: 'Johns Hopkins',
    lastActivity: '15 min ago',
    activityType: 'downloaded',
  },
  {
    id: 'hcp3',
    name: 'Dr. Lisa Park',
    title: 'Neurologist',
    specialty: 'Movement Disorders',
    hospital: 'Cleveland Clinic',
    lastActivity: '1 hour ago',
    activityType: 'scheduled',
  },
];

export default function DashboardPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(mockCampaigns);
  const [hcpContacts, setHcpContacts] = React.useState<HCPContact[]>(mockHCPContacts);
  const [timeFilter, setTimeFilter] = React.useState<'7d' | '30d' | '90d'>('30d');

  // Calculate dashboard metrics
  const dashboardMetrics = React.useMemo(() => {
    const activeCampaigns = campaigns.filter((c) => c.status === 'active');
    const totalHCPs = campaigns.reduce((sum, c) => sum + c.targetHCPs, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const avgEngagement = campaigns.reduce((sum, c) => sum + c.engagement, 0) / campaigns.length;
    const totalMeetings = campaigns.reduce((sum, c) => sum + c.meetings, 0);

    return {
      activeHCPContacts: 247,
      campaignEngagement: avgEngagement,
      drugPortfolio: mockDrugs.length,
      monthlyOutreach: totalMeetings * 12, // Extrapolated
      responseRate: 12,
      activeCampaignsCount: activeCampaigns.length,
      scheduledCampaignsCount: campaigns.filter((c) => c.status === 'scheduled').length,
      completedCampaignsCount: campaigns.filter((c) => c.status === 'completed').length,
      draftCampaignsCount: campaigns.filter((c) => c.status === 'draft').length,
    };
  }, [campaigns]);

  // Register dashboard state for Cedar
  useRegisterState({
    key: 'dashboardMetrics',
    description: 'Dashboard metrics and KPIs',
    value: dashboardMetrics,
    setValue: () => {}, // Read-only
    stateSetters: {},
  });

  useRegisterState({
    key: 'campaigns',
    description: 'Active and scheduled campaigns',
    value: campaigns,
    setValue: setCampaigns,
    stateSetters: {
      createCampaign: {
        name: 'createCampaign',
        description: 'Create a new marketing campaign',
        argsSchema: z.object({
          name: z.string().describe('Campaign name'),
          drugId: z.string().describe('Target drug ID'),
          targetHCPs: z.number().describe('Number of HCPs to target'),
          startDate: z.string().describe('Campaign start date'),
          endDate: z.string().describe('Campaign end date'),
        }),
        execute: (
          currentCampaigns: Campaign[],
          setValue: (newValue: Campaign[]) => void,
          args: {
            name: string;
            drugId: string;
            targetHCPs: number;
            startDate: string;
            endDate: string;
          },
        ) => {
          const newCampaign: Campaign = {
            id: `camp_${Date.now()}`,
            name: args.name,
            status: 'draft',
            drugId: args.drugId,
            startDate: args.startDate,
            endDate: args.endDate,
            targetHCPs: args.targetHCPs,
            engagement: 0,
            clicks: 0,
            meetings: 0,
          };
          setValue([...currentCampaigns, newCampaign]);
        },
      },
      launchCampaign: {
        name: 'launchCampaign',
        description: 'Launch a draft or scheduled campaign',
        argsSchema: z.object({
          campaignId: z.string().describe('Campaign ID to launch'),
        }),
        execute: (
          currentCampaigns: Campaign[],
          setValue: (newValue: Campaign[]) => void,
          args: { campaignId: string },
        ) => {
          const updated = currentCampaigns.map((campaign) =>
            campaign.id === args.campaignId ? { ...campaign, status: 'active' as const } : campaign,
          );
          setValue(updated);
        },
      },
    },
  });

  // Subscribe states to Cedar context
  useSubscribeStateToAgentContext(
    'dashboardMetrics',
    (metrics: typeof dashboardMetrics) => ({
      activeHCPs: metrics.activeHCPContacts,
      engagement: metrics.campaignEngagement,
      drugs: metrics.drugPortfolio,
      activeCampaigns: metrics.activeCampaignsCount,
      performance: metrics.responseRate > 10 ? 'good' : 'needs_improvement',
    }),
    {
      showInChat: true,
      color: '#059669',
    },
  );

  useSubscribeStateToAgentContext(
    'campaigns',
    (campaigns: Campaign[]) => ({
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
      topPerformingCampaign: campaigns.sort((a, b) => b.engagement - a.engagement)[0]?.name,
      campaignTypes: [...new Set(campaigns.map((c) => c.status))],
    }),
    {
      showInChat: true,
      color: '#0EA5E9',
    },
  );

  // Frontend tools for dashboard management
  useRegisterFrontendTool({
    name: 'filterDashboard',
    description: 'Filter dashboard data by time period',
    argsSchema: z.object({
      period: z.enum(['7d', '30d', '90d']).describe('Time period filter'),
    }),
    execute: async (args: { period: '7d' | '30d' | '90d' }) => {
      setTimeFilter(args.period);
      console.log(`Dashboard filtered to last ${args.period}`);
    },
  });

  useRegisterFrontendTool({
    name: 'generateCampaignInsights',
    description: 'Generate AI insights for campaign performance',
    argsSchema: z.object({
      campaignId: z.string().optional().describe('Specific campaign ID for insights'),
    }),
    execute: async (args: { campaignId?: string }) => {
      const targetCampaign = args.campaignId
        ? campaigns.find((c) => c.id === args.campaignId)
        : campaigns.sort((a, b) => b.engagement - a.engagement)[0];

      if (targetCampaign) {
        console.log(
          `Campaign ${targetCampaign.name} insights: ${targetCampaign.engagement}% engagement rate, ${targetCampaign.clicks} total clicks, ${targetCampaign.meetings} meetings scheduled.`,
        );
      } else {
        console.log('No campaigns available for insights generation.');
      }
    },
  });

  useRegisterFrontendTool({
    name: 'exportDashboardData',
    description: 'Export dashboard data and analytics',
    argsSchema: z.object({
      format: z.enum(['csv', 'pdf', 'excel']).describe('Export format'),
      includeCharts: z.boolean().optional().describe('Include charts in export'),
    }),
    execute: async (args: { format: 'csv' | 'pdf' | 'excel'; includeCharts?: boolean }) => {
      console.log(
        `Exporting dashboard data as ${args.format}${args.includeCharts ? ' with charts' : ''}`,
      );
    },
  });

  const renderContent = () => (
    <DashboardLayout>
      <DashboardOverview
        metrics={dashboardMetrics}
        campaigns={campaigns}
        hcpContacts={hcpContacts}
        drugs={mockDrugs}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
      />
    </DashboardLayout>
  );

  return (
    <SidePanelCedarChat
      side="right"
      title="Campaign Assistant"
      collapsedLabel="Chat with AI"
      showCollapsedButton={true}
    >
      <DebuggerPanel />
      {renderContent()}
    </SidePanelCedarChat>
  );
}
