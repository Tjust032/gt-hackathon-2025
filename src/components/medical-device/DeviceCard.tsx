'use client';

import React from 'react';
import { Edit, Share2, Trash2, ExternalLink, FileText, Calendar, Building2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { PrescriptionDrug, TherapeuticCategory } from '@/lib/mockData';
import { Button } from '@/cedar/components/ui/button';

interface DeviceCardProps {
  device: PrescriptionDrug;
  viewMode: 'grid' | 'list';
  categoryColors: Record<TherapeuticCategory, string>;
}

export function DeviceCard({ device, viewMode, categoryColors }: DeviceCardProps) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/device/${device.smartLinkId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: device.name,
          text: `Check out ${device.name} by ${device.manufacturer}`,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        alert('Drug link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Drug link copied to clipboard!');
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${device.name}?`)) {
      // This would trigger the Cedar agent's deleteDrug action
      console.log('Deleting drug:', device.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Device Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
              {device.imageUrls[0] ? (
                <Image
                  src={device.imageUrls[0]}
                  alt={device.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Building2 className="w-8 h-8" />
                </div>
              )}
            </div>
          </div>

          {/* Drug Info */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-col gap-4">
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      <Link
                        href={`/device/${device.smartLinkId}`}
                        className="hover:text-gray-600 transition-colors"
                      >
                        {device.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {device.manufacturer}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{device.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {device.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[tag]}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {device.clinicalFiles.length} clinical files
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Added {formatDate(device.createdAt)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Link href={`/profile/devices/${device.id}/edit`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 whitespace-nowrap">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Drug Image */}
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {device.imageUrls[0] ? (
          <Image
            src={device.imageUrls[0]}
            alt={device.name}
            width={400}
            height={240}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Building2 className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-grow min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              <Link
                href={`/device/${device.smartLinkId}`}
                className="hover:text-gray-600 transition-colors"
              >
                {device.name}
              </Link>
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1 truncate">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              {device.manufacturer}
            </p>
          </div>
          <a
            href={device.manufacturerProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{device.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {device.tags.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[tag]}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {device.clinicalFiles.length} clinical files
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(device.createdAt)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-1 flex-1"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Link href={`/profile/devices/${device.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
