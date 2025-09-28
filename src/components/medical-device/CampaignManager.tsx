'use client';

import React, { useState } from 'react';
import { Button } from '@/cedar/components/ui/button';
import {
  Mail,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  TrendingUp,
  Filter,
  Search,
  Edit3,
  MoreHorizontal,
  Users,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface Campaign {
  id: string;
  deviceId: string;
  deviceName: string;
  hcpTags: string[];
  campaignType: string;
  subject: string;
  content: string;
  variables: Record<string, string>;
  status: 'draft' | 'generated' | 'sent' | 'delivered' | 'opened' | 'responded';
  createdAt: string;
  sentAt?: string;
  recipientCount?: number;
  openRate?: number;
  responseRate?: number;
  responses?: EmailResponse[];
}

interface EmailResponse {
  id: string;
  recipientName: string;
  recipientEmail: string;
  hospital: string;
  responseType: 'interested' | 'meeting_request' | 'question' | 'not_interested';
  message: string;
  timestamp: string;
}

interface CampaignManagerProps {
  campaigns: Campaign[];
  onEditCampaign?: (campaign: Campaign) => void;
  onViewAnalytics?: (campaign: Campaign) => void;
}

export function CampaignManager({ campaigns, onViewAnalytics }: CampaignManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showResponses, setShowResponses] = useState(false);

  // Mock responses for demonstration
  const mockResponses: EmailResponse[] = [
    {
      id: 'resp1',
      recipientName: 'Dr. Sarah Mitchell',
      recipientEmail: 's.mitchell@memorial.com',
      hospital: 'Memorial Healthcare',
      responseType: 'meeting_request',
      message:
        'Very interested in learning more about this device. Could we schedule a demonstration for our cardiology team next week?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'resp2',
      recipientName: 'Dr. James Rodriguez',
      recipientEmail: 'j.rodriguez@cityhospital.org',
      hospital: 'City Hospital',
      responseType: 'question',
      message:
        'The clinical data looks promising. Can you provide more information about the MRI compatibility protocols?',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'resp3',
      recipientName: 'Dr. Emily Chen',
      recipientEmail: 'e.chen@universityhospital.edu',
      hospital: 'University Hospital',
      responseType: 'interested',
      message:
        'Thank you for sharing this information. We would like to evaluate this for our EP lab.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      generated: 'bg-blue-100 text-blue-800',
      sent: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
      opened: 'bg-purple-100 text-purple-800',
      responded: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: Campaign['status']) => {
    const icons = {
      draft: <Edit3 className="w-3 h-3" />,
      generated: <MessageSquare className="w-3 h-3" />,
      sent: <Mail className="w-3 h-3" />,
      delivered: <CheckCircle className="w-3 h-3" />,
      opened: <Eye className="w-3 h-3" />,
      responded: <TrendingUp className="w-3 h-3" />,
    };
    return icons[status] || <Clock className="w-3 h-3" />;
  };

  const getResponseTypeColor = (type: EmailResponse['responseType']) => {
    const colors = {
      interested: 'bg-green-100 text-green-800',
      meeting_request: 'bg-blue-100 text-blue-800',
      question: 'bg-yellow-100 text-yellow-800',
      not_interested: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.hcpTags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getCampaignStats = () => {
    const totalSent = campaigns.filter((c) =>
      ['sent', 'delivered', 'opened', 'responded'].includes(c.status),
    ).length;
    const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0);
    const avgOpenRate =
      campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / campaigns.length
        : 0;
    const totalResponses = campaigns.reduce((sum, c) => sum + (c.responses?.length || 0), 0);

    return { totalSent, totalRecipients, avgOpenRate, totalResponses };
  };

  const stats = getCampaignStats();

  const handleViewCampaign = (campaign: Campaign) => {
    // Add mock responses for demonstration
    const campaignWithResponses = {
      ...campaign,
      responses: campaign.status === 'responded' ? mockResponses : [],
      openRate: Math.floor(Math.random() * 40) + 20, // Mock open rate 20-60%
      responseRate: campaign.status === 'responded' ? Math.floor(Math.random() * 15) + 5 : 0, // Mock response rate 5-20%
    };
    setSelectedCampaign(campaignWithResponses);
    setShowResponses(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalSent}</div>
              <div className="text-sm text-gray-600">Campaigns Sent</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRecipients}</div>
              <div className="text-sm text-gray-600">Total Recipients</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.avgOpenRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Avg Open Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalResponses}</div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="responded">Responded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Campaigns</h3>
          <p className="text-sm text-gray-600">Track and manage your email campaigns</p>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h4>
            <p className="text-gray-600">Create your first campaign to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-md font-medium text-gray-900 truncate">
                        {campaign.subject}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
                      >
                        {getStatusIcon(campaign.status)}
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.recipientCount || 0} recipients
                      </span>
                      <span>Device: {campaign.deviceName}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {campaign.hcpTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {campaign.hcpTags.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{campaign.hcpTags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => handleViewCampaign(campaign)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>

                    {onViewAnalytics && (
                      <Button onClick={() => onViewAnalytics(campaign)} variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                    )}

                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Details Modal */}
      {showResponses && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Campaign Details</h3>
                <p className="text-sm text-gray-600">{selectedCampaign.subject}</p>
              </div>
              <button
                onClick={() => setShowResponses(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Campaign Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedCampaign.recipientCount}
                  </div>
                  <div className="text-sm text-gray-600">Recipients</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedCampaign.openRate}%
                  </div>
                  <div className="text-sm text-gray-600">Open Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">
                    {selectedCampaign.responseRate}%
                  </div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                </div>
              </div>

              {/* Responses */}
              {selectedCampaign.responses && selectedCampaign.responses.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Recent Responses</h4>
                  <div className="space-y-4">
                    {selectedCampaign.responses.map((response) => (
                      <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-gray-900">
                              {response.recipientName}
                            </div>
                            <div className="text-sm text-gray-600">{response.hospital}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResponseTypeColor(response.responseType)}`}
                            >
                              {response.responseType.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(response.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {response.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedCampaign.responses || selectedCampaign.responses.length === 0) && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h4>
                  <p className="text-gray-600">Responses will appear here as they come in</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
