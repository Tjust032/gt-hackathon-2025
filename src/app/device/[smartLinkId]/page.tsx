import React from 'react';
import { notFound } from 'next/navigation';
import { getDeviceBySmartLink } from '@/lib/mockData';
import { DevicePageClient } from './DevicePageClient';

interface DevicePageProps {
  params: Promise<{
    smartLinkId: string;
  }>;
}

export default async function DevicePage({ params }: DevicePageProps) {
  const { smartLinkId } = await params;
  const device = getDeviceBySmartLink(smartLinkId);

  if (!device) {
    console.error('Device not found for smartLinkId:', smartLinkId);
    notFound();
  }

  return <DevicePageClient device={device} />;
}
