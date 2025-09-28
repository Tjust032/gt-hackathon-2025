'use client';

import React from 'react';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

import { MedicalCategory, medicalCategories } from '@/lib/mockData';
import { Button } from '@/cedar/components/ui/button';

interface DeviceFormData {
  name: string;
  company: string;
  description: string;
  companyProductUrl: string;
  tags: MedicalCategory[];
  images: File[];
  clinicalFiles: (File | { url: string; description: string })[];
  researchSummary: string;
}

interface DeviceRegistrationFormProps {
  formData: DeviceFormData;
  onFormDataChange: (data: DeviceFormData) => void;
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
}

export function DeviceRegistrationForm({
  formData,
  onFormDataChange,
  validationErrors,
  isSubmitting,
}: DeviceRegistrationFormProps) {
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState('');
  const [urlDescription, setUrlDescription] = React.useState('');

  const categoryColors: Record<MedicalCategory, string> = {
    'Heart/Cardiovascular': 'bg-red-100 text-red-800 border-red-200',
    'Brain/Neurological': 'bg-purple-100 text-purple-800 border-purple-200',
    'Cancer/Oncology': 'bg-orange-100 text-orange-800 border-orange-200',
    Orthopedic: 'bg-blue-100 text-blue-800 border-blue-200',
    Respiratory: 'bg-green-100 text-green-800 border-green-200',
    Gastrointestinal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Custom: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const updateField = (field: keyof DeviceFormData, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleTagToggle = (tag: MedicalCategory) => {
    if (formData.tags.includes(tag)) {
      updateField(
        'tags',
        formData.tags.filter((t) => t !== tag),
      );
    } else {
      updateField('tags', [...formData.tags, tag]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    updateField('images', [...formData.images, ...files]);
  };

  const removeImage = (index: number) => {
    updateField(
      'images',
      formData.images.filter((_, i) => i !== index),
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    updateField('clinicalFiles', [...formData.clinicalFiles, ...files]);
  };

  const addUrlFile = () => {
    if (urlInput && urlDescription) {
      updateField('clinicalFiles', [
        ...formData.clinicalFiles,
        { url: urlInput, description: urlDescription },
      ]);
      setUrlInput('');
      setUrlDescription('');
      setShowUrlInput(false);
    }
  };

  const removeClinicalFile = (index: number) => {
    updateField(
      'clinicalFiles',
      formData.clinicalFiles.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would trigger the Cedar agent's submitDevice tool
    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/devices" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Medical Device</h1>
            <p className="text-gray-600 mt-1">Register a new device to your sales portfolio</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Device Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., CardioTech Pro Pacemaker"
              />
              {validationErrors.name && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.company ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., CardioTech Medical Systems"
              />
              {validationErrors.company && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.company}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Product URL *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.companyProductUrl}
                onChange={(e) => updateField('companyProductUrl', e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.companyProductUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://company.com/product-page"
              />
              <Button type="button" variant="outline" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Extract
              </Button>
            </div>
            {validationErrors.companyProductUrl && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.companyProductUrl}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Detailed description of the medical device, its features, and benefits..."
            />
            {validationErrors.description && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>
        </div>

        {/* Medical Categories */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Categories *</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {medicalCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleTagToggle(category)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  formData.tags.includes(category)
                    ? `${categoryColors[category]} border-current`
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {validationErrors.tags && (
            <p className="text-red-600 text-sm mt-2">{validationErrors.tags}</p>
          )}

          {formData.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Selected categories:</p>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm ${categoryColors[tag]}`}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>

          <div className="mb-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clinical Research */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Clinical Research</h2>

          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Clinical Files
              </label>
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Upload PDFs, clinical trials, NIH papers
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* URL Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Online Research Papers
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add URL
                </Button>
              </div>

              {showUrlInput && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={urlDescription}
                    onChange={(e) => setUrlDescription(e.target.value)}
                    placeholder="Brief description of the research paper"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={addUrlFile}>
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUrlInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Research Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Summary
              </label>
              <textarea
                value={formData.researchSummary}
                onChange={(e) => updateField('researchSummary', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Manual summary of clinical research, trial results, efficacy data..."
              />
            </div>
          </div>

          {/* Clinical Files List */}
          {formData.clinicalFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Added Clinical Files:</h3>
              <div className="space-y-2">
                {formData.clinicalFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {'url' in file ? (
                        <Globe className="w-5 h-5 text-gray-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {'url' in file ? file.description : file.name}
                      </p>
                      {'url' in file && (
                        <p className="text-xs text-gray-500 truncate">{file.url}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeClinicalFile(index)}
                      className="flex-shrink-0 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/devices">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
          >
            {isSubmitting ? 'Registering...' : 'Register Device'}
          </Button>
        </div>
      </form>
    </div>
  );
}
