'use client';

import React, { useState } from 'react';
import { MedicalDevice } from '@/lib/mockData';
import { Button } from '@/cedar/components/ui/button';
import { EmailTemplate } from './EmailTemplate';
import { render } from '@react-email/render';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  X,
  Plus,
  Sparkles,
  Send,
  Target,
  Users,
  FileText,
  Tag,
  Building2,
  Eye,
  Code,
  Edit3,
  Save,
} from 'lucide-react';

interface SmartCampaignBuilderProps {
  devices: MedicalDevice[];
  onCampaignLaunched?: (campaign: Campaign) => void;
}

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
}

export function SmartCampaignBuilder({ devices, onCampaignLaunched }: SmartCampaignBuilderProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [hcpTags, setHcpTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [campaignType, setCampaignType] = useState<string>('');
  const [showQuickLaunchModal, setShowQuickLaunchModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [streamedSubject, setStreamedSubject] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({
    hospital_name: 'Memorial Healthcare',
    doctor_name: 'Johnson',
    hospital_size: 'large academic',
    specialty_focus: 'cardiovascular care',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'formatted' | 'html'>('formatted');
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [editableSubject, setEditableSubject] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [structuredData, setStructuredData] = useState<
    | {
        preview: string;
        greeting: string;
        opening: string;
        clinicalEvidence: Array<{ title: string; content: string }>;
        deviceBenefits: string[];
        callToAction: string;
        deviceLink: string;
        signature: string;
      }
    | undefined
  >(undefined);
  const [salesRep, setSalesRep] = useState<
    | {
        name: string;
        email: string;
        phone: string;
        territory: string;
        company: string;
      }
    | undefined
  >(undefined);

  const campaignTypes = [
    {
      value: 'awareness',
      label: 'Awareness Campaign',
      description: 'Build device awareness and interest',
    },
    {
      value: 'education',
      label: 'Educational Outreach',
      description: 'Share clinical evidence and data',
    },
    { value: 'launch', label: 'Product Launch', description: 'Announce new device or features' },
    {
      value: 'follow-up',
      label: 'Follow-up Campaign',
      description: 'Re-engage interested prospects',
    },
    {
      value: 'competitive',
      label: 'Competitive Positioning',
      description: 'Highlight advantages over competitors',
    },
  ];

  const commonHcpTags = [
    'Interventional Cardiologist',
    'Cardiac Surgeon',
    'Electrophysiologist',
    'Emergency Medicine',
    'Cardiologist',
    'Chief of Cardiology',
    'Department Head',
    'High Volume Center',
    'Academic Medical Center',
    'Community Hospital',
    'Large Hospital System',
    'Key Opinion Leader',
  ];

  const addTag = (tag: string) => {
    if (tag && !hcpTags.includes(tag)) {
      setHcpTags([...hcpTags, tag]);
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setHcpTags(hcpTags.filter((tag) => tag !== tagToRemove));
  };

  const simulateStreaming = async (content: string, isSubject = false) => {
    const words = content.split(' ');
    const setter = isSubject ? setStreamedSubject : setStreamedContent;

    setter('');

    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const partial = words.slice(0, i + 1).join(' ');
      setter(partial);
    }
  };

  const handleQuickLaunch = async () => {
    if (!selectedDevice || hcpTags.length === 0 || !campaignType) {
      alert('Please select a device, add HCP tags, and choose a campaign type');
      return;
    }

    setShowQuickLaunchModal(true);
    setIsGenerating(true);
    setIsStreaming(true);
    setStreamedContent('');
    setStreamedSubject('');

    try {
      // Call the OpenAI API to generate the email
      const response = await fetch('/api/generate-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: selectedDevice,
          hcpTags,
          campaignType,
          variables,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate email');
      }

      const data = await response.json();
      const {
        subject,
        content,
        structuredData: emailStructuredData,
        salesRep: emailSalesRep,
      } = data.email;

      // Store structured data for enhanced email rendering
      setStructuredData(emailStructuredData);
      setSalesRep(emailSalesRep);

      // Stream the subject first
      await simulateStreaming(subject, true);

      // Then stream the content
      await simulateStreaming(content, false);

      // Set editable versions once streaming is complete
      setEditableSubject(subject);
      setEditableContent(content);
      setIsStreaming(false);
    } catch (error) {
      console.error('Error generating template:', error);
      alert(
        `Failed to generate email template: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      setShowQuickLaunchModal(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariables((prev) => ({ ...prev, [variable]: value }));
  };

  const processTemplate = (template: string): string => {
    let processed = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      processed = processed.replace(regex, value);
    });
    return processed;
  };

  const renderEmailPreview = async () => {
    const currentSubject = isEditing ? editableSubject : streamedSubject;
    const currentContent = isEditing ? editableContent : streamedContent;

    if (!currentContent || !currentSubject) {
      setRenderedHtml('');
      return;
    }

    const device = devices.find((d) => d.id === selectedDevice);
    if (!device) {
      setRenderedHtml('');
      return;
    }

    try {
      const html = await render(
        <EmailTemplate
          subject={processTemplate(currentSubject)}
          content={processTemplate(currentContent)}
          deviceName={device.name}
          companyName={device.company}
          variables={variables}
          structuredData={structuredData}
          salesRep={salesRep}
        />,
      );
      setRenderedHtml(html);
    } catch (error) {
      console.error('Error rendering email:', error);
      setRenderedHtml('<p>Error rendering email preview</p>');
    }
  };

  const handleSendCampaign = async () => {
    const finalSubject = isEditing ? editableSubject : streamedSubject;
    const finalContent = isEditing ? editableContent : streamedContent;

    if (!finalContent || !finalSubject) return;

    const campaign: Campaign = {
      id: `camp_${Date.now()}`,
      deviceId: selectedDevice,
      deviceName: devices.find((d) => d.id === selectedDevice)?.name || '',
      hcpTags,
      campaignType,
      subject: processTemplate(finalSubject),
      content: processTemplate(finalContent),
      variables,
      status: 'sent',
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      recipientCount: Math.floor(Math.random() * 50) + 10,
    };

    onCampaignLaunched?.(campaign);
    setShowQuickLaunchModal(false);

    // Reset form
    setSelectedDevice('');
    setHcpTags([]);
    setCampaignType('');
    setStreamedContent('');
    setStreamedSubject('');
    setEditableContent('');
    setEditableSubject('');
    setIsEditing(false);
    setShowPreview(false);
    setRenderedHtml('');
    setStructuredData(undefined);
    setSalesRep(undefined);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowQuickLaunchModal(false);
      setShowPreview(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Smart Campaign Builder</h2>
          <p className="text-sm text-gray-600">
            Build targeted campaigns with AI-generated content and HCP targeting
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Device Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Select a device...
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">Choose device...</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </div>

        {/* HCP Targeting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 inline mr-2" />
            HCP Targeting (e.g., Cardiologist)
          </label>

          {/* Common Tags */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Quick add common tags:</p>
            <div className="flex flex-wrap gap-2">
              {commonHcpTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  disabled={hcpTags.includes(tag)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    hcpTags.includes(tag)
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
              placeholder="Enter specialty or criteria"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <Button onClick={() => addTag(newTag)} variant="outline" size="sm" disabled={!newTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Selected Tags */}
          {hcpTags.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Selected tags:</p>
              <div className="flex flex-wrap gap-2">
                {hcpTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-800 text-sm rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-cyan-600 hover:text-cyan-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Campaign Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Users className="w-4 h-4 inline mr-2" />
            Select campaign type...
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
                  checked={campaignType === type.value}
                  onChange={(e) => setCampaignType(e.target.value)}
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

        {/* Quick Launch Button */}
        <Button
          onClick={handleQuickLaunch}
          disabled={!selectedDevice || hcpTags.length === 0 || !campaignType}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Quick Launch
        </Button>
      </div>

      {/* Quick Launch Modal */}
      {showQuickLaunchModal && (
        <div
          className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center p-4 z-50"
          onClick={handleModalClick}
        >
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200 mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Generated Campaign Email
                  </h3>
                  <p className="text-sm text-gray-600">Review and customize your email template</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickLaunchModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {isGenerating ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4">
                    <DotLottieReact
                      src="/Ai loading model.lottie"
                      loop
                      autoplay
                      className="w-full h-full"
                    />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Generating Your Campaign Email
                  </h4>
                  <p className="text-gray-600">
                    Our AI is analyzing your device data and creating a personalized email for{' '}
                    {hcpTags.join(', ')}...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Variables Section */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Customize Variables
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.keys(variables).map((variable) => (
                        <div key={variable}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {variable.replace('_', ' ').toUpperCase()}
                          </label>
                          <input
                            type="text"
                            value={variables[variable] || ''}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder={`Enter ${variable.replace('_', ' ')}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email Content */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-gray-900">Email Preview</h4>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (!isEditing) {
                              // Starting to edit - copy current content to editable state and hide preview
                              setEditableSubject(streamedSubject);
                              setEditableContent(streamedContent);
                              setShowPreview(false);
                            } else {
                              // Stopping edit - save the edited content back to streamed state
                              setStreamedSubject(editableSubject);
                              setStreamedContent(editableContent);
                            }
                            setIsEditing(!isEditing);
                          }}
                          variant={isEditing ? 'default' : 'outline'}
                          size="sm"
                          disabled={isStreaming}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          {isEditing ? 'Save & Stop Editing' : 'Edit'}
                        </Button>
                        <Button
                          onClick={() => {
                            const newShowPreview = !showPreview;
                            setShowPreview(newShowPreview);
                            if (newShowPreview) {
                              renderEmailPreview();
                            }
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {showPreview ? 'Hide' : 'Show'} Preview
                        </Button>
                        {showPreview && (
                          <Button
                            onClick={() =>
                              setPreviewMode(previewMode === 'formatted' ? 'html' : 'formatted')
                            }
                            variant="outline"
                            size="sm"
                          >
                            <Code className="w-4 h-4 mr-1" />
                            {previewMode === 'formatted' ? 'HTML' : 'Formatted'}
                          </Button>
                        )}
                        {isEditing && (
                          <Button
                            onClick={() => {
                              renderEmailPreview();
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Update Preview
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-3 border-b border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject Line
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableSubject}
                            onChange={(e) => setEditableSubject(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Email subject..."
                          />
                        ) : (
                          <div className="font-medium text-gray-900 bg-white p-2 rounded border">
                            {processTemplate(streamedSubject)}
                            {isStreaming && streamedSubject && (
                              <span className="animate-pulse">|</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Content
                        </label>

                        {showPreview ? (
                          <div className="bg-white border rounded">
                            {previewMode === 'formatted' ? (
                              <iframe
                                srcDoc={renderedHtml}
                                className="w-full h-96 border-0"
                                title="Email Preview"
                              />
                            ) : (
                              <pre className="p-4 text-xs overflow-auto max-h-96 bg-gray-50">
                                {renderedHtml}
                              </pre>
                            )}
                          </div>
                        ) : isEditing ? (
                          <textarea
                            value={editableContent}
                            onChange={(e) => setEditableContent(e.target.value)}
                            rows={20}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Email content..."
                          />
                        ) : (
                          <div className="bg-white border rounded p-4 whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto">
                            {processTemplate(streamedContent)}
                            {isStreaming && streamedContent && (
                              <span className="animate-pulse">|</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={handleSendCampaign}
                      disabled={!streamedContent || !streamedSubject}
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Campaign
                    </Button>
                    <Button onClick={() => setShowQuickLaunchModal(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
