'use client';

import React from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  ExternalLink,
  Share2,
  BarChart3,
  File,
} from 'lucide-react';
import Link from 'next/link';

import { MedicalDevice, MedicalCategory, medicalCategories } from '@/lib/mockData';
import { DeviceCard } from './DeviceCard';
import { Button } from '@/cedar/components/ui/button';
import { Dropdown } from './Dropdown';

interface DeviceManagementProps {
  devices: MedicalDevice[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: MedicalCategory[];
  onCategoryChange: (categories: MedicalCategory[]) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function DeviceManagement({
  devices,
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  viewMode,
  onViewModeChange,
}: DeviceManagementProps) {
  const handleCategoryToggle = (category: MedicalCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const categoryColors: Record<MedicalCategory, string> = {
    'Heart/Cardiovascular': 'bg-red-100 text-red-800 border-red-200',
    'Brain/Neurological': 'bg-purple-100 text-purple-800 border-purple-200',
    'Cancer/Oncology': 'bg-orange-100 text-orange-800 border-orange-200',
    Orthopedic: 'bg-blue-100 text-blue-800 border-blue-200',
    Respiratory: 'bg-green-100 text-green-800 border-green-200',
    Gastrointestinal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Custom: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const handleGenerateSmartLink = async (device: MedicalDevice) => {
    const link = `${window.location.origin}/device/${device.smartLinkId}`;
    try {
      await navigator.clipboard.writeText(link);
      alert('Smart link copied to clipboard!');
    } catch (error) {
      prompt('Copy this link:', link);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Devices</h1>
          <p className="text-gray-600 mt-1">
            Manage your medical device portfolio and create smart links for HCP engagement
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/devices/add">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium">
              <Plus className="w-5 h-5" />
              Add New Device
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                TOTAL DEVICES
              </p>
              <p className="text-3xl font-bold text-white mt-2">{devices.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Grid className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                CATEGORIES
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {new Set(devices.flatMap((d) => d.tags)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                SMART LINKS
              </p>
              <p className="text-3xl font-bold text-white mt-2">{devices.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                CLINICAL FILES
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {devices.reduce((sum, device) => sum + device.clinicalFiles.length, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <File className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search devices, companies, or descriptions..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Category Filter */}
            <Dropdown
              trigger={
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Categories
                  {selectedCategories.length > 0 && (
                    <span className="bg-blue-600 text-white rounded-full px-2 py-1 text-xs">
                      {selectedCategories.length}
                    </span>
                  )}
                </Button>
              }
            >
              <div className="p-4 space-y-2 min-w-[250px]">
                <h3 className="font-medium text-gray-900 mb-3">Filter by Category</h3>
                {medicalCategories.map((category) => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                    />
                    <span className={`px-2 py-1 rounded-md text-sm ${categoryColors[category]}`}>
                      {category}
                    </span>
                  </label>
                ))}
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => onCategoryChange([])}
                    className="w-full mt-3 text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </Dropdown>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`px-3 py-2 flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`px-3 py-2 flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {selectedCategories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {selectedCategories.map((category) => (
              <span
                key={category}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm ${categoryColors[category]}`}
              >
                {category}
                <button
                  onClick={() => handleCategoryToggle(category)}
                  className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Devices Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Medical Devices ({devices.length})
              </h2>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-1">
                  Showing results for &quot;{searchQuery}&quot;
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Bulk Share
              </Button>
            </div>
          </div>
        </div>

        {devices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategories.length > 0
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first medical device'}
            </p>
            {!searchQuery && selectedCategories.length === 0 && (
              <Link href="/dashboard/devices/add">
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Device
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {devices.map((device) => (
                <div key={device.id} className="relative">
                  <DeviceCard device={device} viewMode={viewMode} categoryColors={categoryColors} />
                  {/* Smart Link Actions */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => handleGenerateSmartLink(device)}
                      className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg shadow-sm border border-gray-200 transition-all"
                      title="Copy Smart Link"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                    <Link
                      href={`/device/${device.smartLinkId}`}
                      target="_blank"
                      className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg shadow-sm border border-gray-200 transition-all"
                      title="Preview Device Page"
                    >
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
