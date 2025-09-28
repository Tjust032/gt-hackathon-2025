'use client';

import React from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Calendar,
  FileText,
  Eye,
  Users,
  Star,
} from 'lucide-react';

import { Button } from '@/cedar/components/ui/button';

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

interface HCPDatabaseProps {
  hcpContacts: HCPContact[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  specialtyFilter: string;
  onSpecialtyFilterChange: (specialty: string) => void;
  engagementFilter: 'all' | 'high' | 'medium' | 'low';
  onEngagementFilterChange: (filter: 'all' | 'high' | 'medium' | 'low') => void;
}

export function HCPDatabase({
  hcpContacts,
  searchQuery,
  onSearchChange,
  specialtyFilter,
  onSpecialtyFilterChange,
  engagementFilter,
  onEngagementFilterChange,
}: HCPDatabaseProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'viewed':
        return <Eye className="w-4 h-4 text-gray-600" />;
      case 'downloaded':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-gray-600" />;
      case 'contacted':
        return <Mail className="w-4 h-4 text-gray-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  // Calculate metrics
  const metrics = React.useMemo(() => {
    const total = hcpContacts.length;
    const highEngagement = hcpContacts.filter((h) => h.engagementScore >= 80).length;
    const recentActivity = hcpContacts.filter(
      (h) => h.lastActivity.includes('min ago') || h.lastActivity.includes('hour ago'),
    ).length;
    const specialties = [...new Set(hcpContacts.map((h) => h.specialty))].length;

    return { total, highEngagement, recentActivity, specialties };
  }, [hcpContacts]);

  const uniqueSpecialties = [...new Set(hcpContacts.map((h) => h.specialty))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HCP Database</h1>
          <p className="text-gray-600 mt-1">
            Manage your healthcare professional contacts and track engagement
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add HCP
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                TOTAL HCPS
              </p>
              <p className="text-3xl font-bold text-white mt-2">{metrics.total}</p>
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
                HIGH ENGAGEMENT
              </p>
              <p className="text-3xl font-bold text-white mt-2">{metrics.highEngagement}</p>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                RECENT ACTIVITY
              </p>
              <p className="text-3xl font-bold text-white mt-2">{metrics.recentActivity}</p>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                SPECIALTIES
              </p>
              <p className="text-3xl font-bold text-white mt-2">{metrics.specialties}</p>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search HCPs, specialties, hospitals..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Specialty Filter */}
            <select
              value={specialtyFilter}
              onChange={(e) => onSpecialtyFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Specialties</option>
              {uniqueSpecialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>

            {/* Engagement Filter */}
            <select
              value={engagementFilter}
              onChange={(e) =>
                onEngagementFilterChange(e.target.value as 'all' | 'high' | 'medium' | 'low')
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Engagement</option>
              <option value="high">High Engagement (80+)</option>
              <option value="medium">Medium Engagement (60-79)</option>
              <option value="low">Low Engagement (0-59)</option>
            </select>

            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* HCP List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Healthcare Professionals ({hcpContacts.length})
          </h2>
        </div>

        {hcpContacts.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No HCPs found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || specialtyFilter || engagementFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first HCP contact'}
            </p>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add HCP
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {hcpContacts.map((hcp) => (
              <div key={hcp.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <img
                      src={`/avatar${(hcpContacts.indexOf(hcp) % 9) + 1}.jpg`}
                      alt={hcp.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    {/* HCP Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{hcp.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getEngagementColor(
                            hcp.engagementScore,
                          )}`}
                        >
                          {getEngagementLabel(hcp.engagementScore)} ({hcp.engagementScore})
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {hcp.title} • {hcp.specialty}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {hcp.hospital}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {hcp.location}
                        </div>
                      </div>

                      {/* Device Interests */}
                      {hcp.deviceInterests.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Device Interests:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {hcp.deviceInterests.map((device, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md"
                              >
                                {device}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {hcp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {hcp.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {hcp.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md mb-3">
                          {hcp.notes}
                        </p>
                      )}

                      {/* Last Activity */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {getActivityIcon(hcp.activityType)}
                        <span>
                          {hcp.activityType === 'viewed' && 'Viewed device page'}
                          {hcp.activityType === 'downloaded' && 'Downloaded clinical file'}
                          {hcp.activityType === 'scheduled' && 'Scheduled meeting'}
                          {hcp.activityType === 'contacted' && 'Sent message'}
                        </span>
                        <span>• {hcp.lastActivity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={`mailto:${hcp.email}`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <a
                      href={`tel:${hcp.phone}`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
