'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/medical-device/DashboardLayout';
import { SmartCampaignBuilder } from '@/components/medical-device/SmartCampaignBuilder';
import { CampaignManager } from '@/components/medical-device/CampaignManager';
import { FloatingCedarChat } from '@/cedar/components/chatComponents/FloatingCedarChat';
import { mockDrugs, PrescriptionDrug } from '@/lib/mockData';
import { Plus, Target, Sparkles, BarChart3 } from 'lucide-react';
import { Button } from '@/cedar/components/ui/button';

interface Campaign {
  id: string;
  drugId: string;
  drugName: string;
  hcpTags: string[];
  campaignType: string;
  subject: string;
  content: string;
  variables: Record<string, string>;
  status: 'draft' | 'generated' | 'sent' | 'delivered' | 'opened' | 'responded';
  createdAt: string;
  sentAt?: string;
  recipientCount?: number;
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'analytics'>('create');

  // Dynamic drug list that includes newly added medications
  const [drugs, setDrugs] = useState<PrescriptionDrug[]>(() => {
    // Load from localStorage on mount, fallback to mockDrugs
    if (typeof window !== 'undefined') {
      const storedDrugs = localStorage.getItem('drugs');
      if (storedDrugs) {
        try {
          return JSON.parse(storedDrugs);
        } catch {
          return mockDrugs;
        }
      }
    }
    return mockDrugs;
  });

  // Update drugs when localStorage changes (e.g., when new medications are added)
  React.useEffect(() => {
    const handleStorageChange = () => {
      const storedDrugs = localStorage.getItem('drugs');
      if (storedDrugs) {
        try {
          setDrugs(JSON.parse(storedDrugs));
        } catch {
          setDrugs(mockDrugs);
        }
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Also check for changes periodically (in case of same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    // Mock campaigns for demonstration
    {
      id: 'camp_1',
      drugId: 'drug1',
      drugName: 'Repatha',
      hcpTags: ['Interventional Cardiologist', 'Chief of Cardiology'],
      campaignType: 'awareness',
      subject: 'Introducing Repatha - Revolutionary LDL-C Reduction for Memorial Healthcare',
      content: 'Dear Dr. Johnson,\n\nI hope this message finds you well...',
      variables: { hospital_name: 'Memorial Healthcare', doctor_name: 'Johnson' },
      status: 'responded',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      recipientCount: 45,
    },
    {
      id: 'camp_2',
      drugId: 'drug2',
      drugName: 'Opdivo',
      hcpTags: ['Oncologist', 'Medical Oncology'],
      campaignType: 'education',
      subject: 'Clinical Evidence Update: Opdivo Outcomes at University Hospital',
      content: 'Dear Dr. Mitchell,\n\nAs a respected Oncologist...',
      variables: { hospital_name: 'University Hospital', doctor_name: 'Mitchell' },
      status: 'opened',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      recipientCount: 28,
    },
    {
      id: 'camp_3',
      drugId: 'drug3',
      drugName: 'Xarelto',
      hcpTags: ['Emergency Medicine', 'Cardiologist'],
      campaignType: 'follow-up',
      subject: 'Follow-up: Xarelto Implementation at City Medical Center',
      content: 'Dear Dr. Rodriguez,\n\nFollowing up on our recent discussion...',
      variables: { hospital_name: 'City Medical Center', doctor_name: 'Rodriguez' },
      status: 'delivered',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      recipientCount: 12,
    },
  ]);

  const handleCampaignLaunched = (campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
  };

  const renderContent = () => (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
            <p className="text-gray-600 mt-1">
              Create and manage your prescription drug marketing campaigns
            </p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Smart Campaign Builder
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Campaign Manager
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' && (
          <SmartCampaignBuilder drugs={drugs} onCampaignLaunched={handleCampaignLaunched} />
        )}

        {activeTab === 'manage' && (
          <CampaignManager
            campaigns={campaigns.filter((c) =>
              ['sent', 'delivered', 'opened', 'responded'].includes(c.status),
            )}
            onViewAnalytics={(campaign) => {
              // Handle analytics view
              console.log('View analytics:', campaign);
              setActiveTab('analytics');
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Analytics</h3>
              <p className="text-gray-600 mb-8">Track the performance of your campaigns</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{campaigns.length}</div>
                  <div className="text-sm text-blue-600">Total Campaigns</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      campaigns.filter((c) =>
                        ['sent', 'delivered', 'opened', 'responded'].includes(c.status),
                      ).length
                    }
                  </div>
                  <div className="text-sm text-green-600">Campaigns Sent</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {campaigns.length > 0
                      ? Math.round(
                          (campaigns.filter(
                            (c) => c.status === 'opened' || c.status === 'responded',
                          ).length /
                            campaigns.length) *
                            100,
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-purple-600">Open Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );

  return (
    <>
      <FloatingCedarChat />
      {renderContent()}
    </>
  );
}
