'use client';

import React from 'react';
import {
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  FileText,
  Mail,
  Clock,
  ArrowRight,
  Plus,
  Download,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/cedar/components/ui/button';
import { MedicalDevice } from '@/lib/mockData';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  deviceId: string;
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
  deviceInterest?: string;
}

interface DashboardMetrics {
  activeHCPContacts: number;
  campaignEngagement: number;
  devicePortfolio: number;
  monthlyOutreach: number;
  responseRate: number;
  activeCampaignsCount: number;
  scheduledCampaignsCount: number;
  completedCampaignsCount: number;
  draftCampaignsCount: number;
}

interface DashboardOverviewProps {
  metrics: DashboardMetrics;
  campaigns: Campaign[];
  hcpContacts: HCPContact[];
  devices: MedicalDevice[];
  timeFilter: '7d' | '30d' | '90d';
  onTimeFilterChange: (filter: '7d' | '30d' | '90d') => void;
}

export function DashboardOverview({
  metrics,
  campaigns,
  hcpContacts,
  devices,
  timeFilter,
  onTimeFilterChange,
}: DashboardOverviewProps) {
  const timeFilterOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'viewed':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'downloaded':
        return <Download className="w-4 h-4 text-gray-600" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-gray-600" />;
      case 'contacted':
        return <Mail className="w-4 h-4 text-gray-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Device Campaign Center</h1>
          <p className="text-gray-600 mt-1">Manage your device campaigns and HCP relationships</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Time Filter */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => onTimeFilterChange(e.target.value as '7d' | '30d' | '90d')}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {timeFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <Link href="/dashboard/campaigns">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                ACTIVE HCP CONTACTS
              </p>
              <p className="text-3xl font-bold text-white mt-2">{metrics.activeHCPContacts}</p>
              <p className="text-sm text-gray-400 mt-1">HCPs</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-gray-400 font-medium text-sm">5% from last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                CAMPAIGN ENGAGEMENT
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {metrics.campaignEngagement.toFixed(1)}%
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                <span className="text-emerald-400 font-medium text-sm">12% from last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                DEVICE PORTFOLIO
              </p>
              <p className="text-3xl font-bold text-white mt-2">{metrics.devicePortfolio}</p>
              <p className="text-sm text-gray-400 mt-1">Devices</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                <span className="text-emerald-400 font-medium text-sm">1 new this month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                THIS MONTH&apos;S OUTREACH
              </p>
              <p className="text-3xl font-bold text-white mt-2">{metrics.monthlyOutreach}</p>
              <p className="text-sm text-gray-400 mt-1">{metrics.responseRate}% Response Rate</p>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Campaign Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Campaign Performance</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">HCP Contacts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-gray-600">Email Engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Page Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Meetings</span>
              </div>
            </div>
          </div>
          {/* Chart placeholder */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Campaign performance chart</p>
              <p className="text-sm text-gray-400">Weekly data visualization</p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mt-4 text-sm text-gray-600 text-center">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Smart Campaign Builder */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Smart Campaign Builder</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a device...
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="">Choose device...</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HCP Targeting (e.g., Cardiologist)
              </label>
              <input
                type="text"
                placeholder="Enter specialty or criteria"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select campaign type...
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="">Choose type...</option>
                <option value="awareness">Awareness Campaign</option>
                <option value="product-launch">Product Launch</option>
                <option value="educational">Educational Outreach</option>
                <option value="follow-up">Follow-up Campaign</option>
              </select>
            </div>
            <Link href="/dashboard/campaigns" className="block">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-4">
                Quick Launch
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent HCP Activity */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent HCP Activity</h2>
            <Link
              href="/dashboard/hcp-database"
              className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
            >
              View All Activity
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {hcpContacts.slice(0, 3).map((contact, index) => (
              <div key={contact.id} className="flex items-start gap-3">
                <img
                  src={`/avatar${(index % 9) + 1}.jpg`}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                    <div className="flex items-center gap-1">
                      {getActivityIcon(contact.activityType)}
                      <span className="text-xs text-gray-500">{contact.lastActivity}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {contact.activityType === 'viewed' && 'viewed'}
                    {contact.activityType === 'downloaded' && 'downloaded clinical trial PDF.'}
                    {contact.activityType === 'scheduled' && 'scheduled a demo meeting.'}
                    {contact.activityType === 'contacted' && 'sent inquiry about'}
                    {contact.deviceInterest && ` ${contact.deviceInterest} device page.`}
                  </p>
                  <p className="text-xs text-gray-500">{contact.hospital}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">Performance Insights</h2>
          </div>
          <div className="px-6 pb-6 space-y-3">
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200/60 hover:border-gray-300/60 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Top Performing Device</p>
                  <p className="text-gray-600 mt-0.5">
                    CardioMax Stent{' '}
                    <span className="font-semibold text-gray-900">(+25% engagement)</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200/60 hover:border-gray-300/60 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Best HCP Segment</p>
                  <p className="text-gray-600 mt-0.5">
                    Interventional Cardiologists show highest engagement rates
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200/60 hover:border-gray-300/60 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Optimal Timing</p>
                  <p className="text-gray-600 mt-0.5">
                    Tuesday-Thursday, 2-4 PM show best response rates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Campaigns</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Active {metrics.activeCampaignsCount}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Scheduled {metrics.scheduledCampaignsCount}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
              Completed {metrics.completedCampaignsCount}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              Draft {metrics.draftCampaignsCount}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Campaign</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Target HCPs
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Engagement
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Duration</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 5).map((campaign) => (
                <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        campaign.status,
                      )}`}
                    >
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{campaign.targetHCPs}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {campaign.engagement.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(campaign.startDate).toLocaleDateString()} -{' '}
                    {new Date(campaign.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}`}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
