'use client';

import React, { useState } from 'react';
import {
  Mail,
  Send,
  Users,
  FileText,
  Settings,
  Sparkles,
  Copy,
  Download,
  Edit3,
} from 'lucide-react';
import { Button } from '@/cedar/components/ui/button';
import { MedicalDevice } from '@/lib/mockData';

interface CampaignEmailCreatorProps {
  devices: MedicalDevice[];
  onEmailGenerated?: (email: GeneratedEmail) => void;
}

interface GeneratedEmail {
  id: string;
  subject: string;
  content: string;
  deviceId: string;
  campaignType: string;
  targetHCPs: string;
  tone: string;
  createdAt: string;
}

interface EmailFormData {
  deviceId: string;
  campaignType: 'awareness' | 'product-launch' | 'educational' | 'follow-up';
  targetHCPs: string;
  tone: 'professional' | 'educational' | 'urgent' | 'friendly';
  emailLength: 'brief' | 'standard' | 'detailed';
  additionalContext: string;
}

export function CampaignEmailCreator({ devices, onEmailGenerated }: CampaignEmailCreatorProps) {
  const [formData, setFormData] = useState<EmailFormData>({
    deviceId: '',
    campaignType: 'awareness',
    targetHCPs: '',
    tone: 'professional',
    emailLength: 'standard',
    additionalContext: '',
  });

  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const campaignTypes = [
    {
      value: 'awareness',
      label: 'Awareness Campaign',
      description: 'Introduce the device and build awareness',
    },
    {
      value: 'product-launch',
      label: 'Product Launch',
      description: 'Announce a new device or feature',
    },
    {
      value: 'educational',
      label: 'Educational Outreach',
      description: 'Provide clinical evidence and education',
    },
    { value: 'follow-up', label: 'Follow-up Campaign', description: 'Re-engage previous contacts' },
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal and clinical' },
    { value: 'educational', label: 'Educational', description: 'Informative and detailed' },
    { value: 'urgent', label: 'Urgent', description: 'Time-sensitive messaging' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  ];

  const lengthOptions = [
    { value: 'brief', label: 'Brief', description: 'Concise overview' },
    { value: 'standard', label: 'Standard', description: 'Balanced detail' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive information' },
  ];

  const handleInputChange = (field: keyof EmailFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateEmail = async () => {
    if (!formData.deviceId || !formData.targetHCPs) {
      alert('Please select a device and specify target HCPs');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/tools/generateCampaignEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate email');
      }

      const data = await response.json();
      setGeneratedEmail(data.email);
      onEmailGenerated?.(data.email);
    } catch (error) {
      console.error('Error generating email:', error);
      alert(
        `Failed to generate email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadEmail = () => {
    if (!generatedEmail) return;

    const content = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign_email_${generatedEmail.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Campaign Email Creator</h2>
          <p className="text-sm text-gray-600">
            Generate personalized campaign emails with clinical evidence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Select Device
            </label>
            <select
              value={formData.deviceId}
              onChange={(e) => handleInputChange('deviceId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Choose a device...</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Settings className="w-4 h-4 inline mr-2" />
              Campaign Type
            </label>
            <div className="space-y-2">
              {campaignTypes.map((type) => (
                <label
                  key={type.value}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="campaignType"
                    value={type.value}
                    checked={formData.campaignType === type.value}
                    onChange={(e) => handleInputChange('campaignType', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Target HCPs
            </label>
            <input
              type="text"
              value={formData.targetHCPs}
              onChange={(e) => handleInputChange('targetHCPs', e.target.value)}
              placeholder="e.g., Interventional Cardiologists, Cardiac Surgeons"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Specify the medical specialty or HCP criteria
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <select
                value={formData.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {toneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
              <select
                value={formData.emailLength}
                onChange={(e) => handleInputChange('emailLength', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {lengthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              value={formData.additionalContext}
              onChange={(e) => handleInputChange('additionalContext', e.target.value)}
              placeholder="Any specific points to include in the email..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <Button
            onClick={handleGenerateEmail}
            disabled={isGenerating || !formData.deviceId || !formData.targetHCPs}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating Email...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Campaign Email
              </>
            )}
          </Button>
        </div>

        {/* Generated Email Preview */}
        <div className="space-y-4">
          {generatedEmail ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Generated Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setEditMode(!editMode)} variant="outline" size="sm">
                    <Edit3 className="w-4 h-4 mr-1" />
                    {editMode ? 'Preview' : 'Edit'}
                  </Button>
                  <Button
                    onClick={() =>
                      copyToClipboard(`${generatedEmail.subject}\n\n${generatedEmail.content}`)
                    }
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button onClick={downloadEmail} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={generatedEmail.subject}
                      onChange={(e) =>
                        setGeneratedEmail((prev) =>
                          prev ? { ...prev, subject: e.target.value } : null,
                        )
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  ) : (
                    <div className="font-medium text-gray-900 bg-gray-50 p-2 rounded">
                      {generatedEmail.subject}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Content
                  </label>
                  {editMode ? (
                    <textarea
                      value={generatedEmail.content}
                      onChange={(e) =>
                        setGeneratedEmail((prev) =>
                          prev ? { ...prev, content: e.target.value } : null,
                        )
                      }
                      rows={20}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                    />
                  ) : (
                    <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm font-mono border">
                      {generatedEmail.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Generated Yet</h3>
              <p className="text-gray-600">
                Fill out the form and click &quot;Generate Campaign Email&quot; to create your
                AI-powered marketing email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
