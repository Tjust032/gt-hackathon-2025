'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { getDrugBySmartLink } from '@/lib/mockData';
import { DevicePageClient } from './DevicePageClient';

export default function DevicePage() {
  const params = useParams();
  const smartLinkId = params.smartLinkId as string;
  const [drug, setDrug] = React.useState(() => getDrugBySmartLink(smartLinkId));
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Re-fetch on mount to ensure we have the latest from localStorage
    const foundDrug = getDrugBySmartLink(smartLinkId);
    setDrug(foundDrug);
    setLoading(false);
  }, [smartLinkId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!drug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Drug Not Found</h1>
          <p className="text-gray-600">The drug you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <DevicePageClient device={drug} />;
}
