import React from 'react';
import { notFound } from 'next/navigation';
import { getDrugBySmartLink } from '@/lib/mockData';
import { DevicePageClient } from './DevicePageClient';

interface DevicePageProps {
  params: Promise<{
    smartLinkId: string;
  }>;
}

export default async function DevicePage({ params }: DevicePageProps) {
  const { smartLinkId } = await params;
  const drug = getDrugBySmartLink(smartLinkId);

  if (!drug) {
    console.error('Drug not found for smartLinkId:', smartLinkId);
    notFound();
  }

  return <DevicePageClient device={drug} />;
}
