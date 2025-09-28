'use client';

import React from 'react';
import {
  ExternalLink,
  Download,
  Mail,
  Phone,
  FileText,
  Calendar,
  Building2,
  Globe,
  User,
} from 'lucide-react';
import Image from 'next/image';

import { MedicalDevice, MedicalCategory, mockSalesRep } from '@/lib/mockData';

interface PublicDevicePageProps {
  device: MedicalDevice;
  onSectionView: (section: string) => void;
}

export function PublicDevicePage({ device, onSectionView }: PublicDevicePageProps) {
  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const categoryColors: Record<MedicalCategory, string> = {
    'Heart/Cardiovascular': 'bg-red-100 text-red-800 border-red-200',
    'Brain/Neurological': 'bg-purple-100 text-purple-800 border-purple-200',
    'Cancer/Oncology': 'bg-orange-100 text-orange-800 border-orange-200',
    Orthopedic: 'bg-blue-100 text-blue-800 border-blue-200',
    Respiratory: 'bg-green-100 text-green-800 border-green-200',
    Gastrointestinal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Custom: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  // Track section views with Intersection Observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.getAttribute('data-section');
            if (sectionName) {
              onSectionView(sectionName);
            }
          }
        });
      },
      { threshold: 0.5 },
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [onSectionView]);

  const setSectionRef = (section: string) => (ref: HTMLDivElement | null) => {
    sectionRefs.current[section] = ref;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Safety check
  if (!device) {
    return <div className="p-8 text-center">Device not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div
        ref={setSectionRef('hero')}
        data-section="hero"
        className="bg-white border-b border-gray-200"
      >
        <div className="p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Device Images - Airbnb Style */}
            <div className="relative">
              {device.imageUrls && device.imageUrls.length > 0 ? (
                <div className="grid grid-cols-4 grid-rows-2 gap-3 h-96">
                  {/* Main large image - takes up 2x2 grid */}
                  <div className="col-span-2 row-span-2 bg-gray-100 rounded-xl overflow-hidden group cursor-pointer">
                    <Image
                      src={device.imageUrls[0]}
                      alt={device.name}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Top right image */}
                  {device.imageUrls[1] && (
                    <div className="col-span-2 bg-gray-100 rounded-xl overflow-hidden group cursor-pointer">
                      <Image
                        src={device.imageUrls[1]}
                        alt={`${device.name} view 2`}
                        width={300}
                        height={180}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Bottom right - split into 2 images */}
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    {device.imageUrls[2] && (
                      <div className="bg-gray-100 rounded-xl overflow-hidden group cursor-pointer relative">
                        <Image
                          src={device.imageUrls[2]}
                          alt={`${device.name} view 3`}
                          width={150}
                          height={180}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}

                    {device.imageUrls[3] && (
                      <div className="bg-gray-100 rounded-xl overflow-hidden group cursor-pointer">
                        <Image
                          src={device.imageUrls[3]}
                          alt={`${device.name} view 4`}
                          width={150}
                          height={180}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Building2 className="w-16 h-16 mx-auto mb-2" />
                    <p>No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Device Information */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{device.name}</h1>
                <div className="flex items-center gap-2 text-lg text-gray-600 mb-4">
                  <Building2 className="w-5 h-5" />
                  {device.company}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {device.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[tag]}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">{device.description}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={device.companyProductUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ExternalLink className="w-5 h-5" />
                  View on Company Site
                </a>
                <button
                  className="inline-flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-semibold text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => onSectionView('contact-interest')}
                >
                  <Mail className="w-5 h-5" />
                  Contact Sales Rep
                </button>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last updated: {formatDate(device.updatedAt)}
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {device.clinicalFiles.length} clinical research files available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Evidence Section */}
      {device.clinicalFiles.length > 0 && (
        <div
          ref={setSectionRef('clinical-evidence')}
          data-section="clinical-evidence"
          className="bg-white border-b border-gray-200"
        >
          <div className="p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Clinical Evidence</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {device.clinicalFiles.map((file) => (
                <div key={file.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0">
                      {file.fileType === 'url' ? (
                        <Globe className="w-6 h-6 text-gray-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {file.filename}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{file.description}</p>
                      <p className="text-xs text-gray-500 mb-4">
                        Uploaded: {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  {file.extractedContent && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 line-clamp-4">{file.extractedContent}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {file.fileType === 'url' ? (
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Online
                      </a>
                    ) : (
                      <button className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 font-medium">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sales Representative Contact */}
      <div ref={setSectionRef('contact')} data-section="contact" className="bg-white">
        <div className="p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Sales Representative</h2>

          <div className="max-w-2xl">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 border border-blue-200">
              <div className="flex items-start gap-6">
                <Image
                  src="/avatar1.jpg"
                  alt={mockSalesRep.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                />

                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{mockSalesRep.name}</h3>
                  <p className="text-gray-700 mb-4">{mockSalesRep.company}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a
                        href={`mailto:${mockSalesRep.email}`}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {mockSalesRep.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <a
                        href={`tel:${mockSalesRep.phone}`}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {mockSalesRep.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{mockSalesRep.territory}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-gray-700 mb-4">
                      Get in touch to learn more about the {device.name} and discuss how it can
                      benefit your patients.
                    </p>
                    <button className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      <Mail className="w-5 h-5" />
                      Contact Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
