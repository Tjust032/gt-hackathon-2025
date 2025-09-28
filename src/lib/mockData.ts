// Mock data for Medical Device Sales Rep Profile Page

export interface MedicalDevice {
  id: string;
  name: string;
  company: string;
  description: string;
  companyProductUrl: string;
  imageUrls: string[];
  tags: MedicalCategory[];
  clinicalFiles: ClinicalFile[];
  smartLinkId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalFile {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: 'pdf' | 'url' | 'text';
  description: string;
  deviceId: string;
  uploadedAt: string;
  extractedContent?: string;
}

export type MedicalCategory =
  | 'Heart/Cardiovascular'
  | 'Brain/Neurological'
  | 'Cancer/Oncology'
  | 'Orthopedic'
  | 'Respiratory'
  | 'Gastrointestinal'
  | 'Custom';

export const medicalCategories: MedicalCategory[] = [
  'Heart/Cardiovascular',
  'Brain/Neurological',
  'Cancer/Oncology',
  'Orthopedic',
  'Respiratory',
  'Gastrointestinal',
  'Custom',
];

// Mock clinical files for pacemaker
export const mockClinicalFiles: ClinicalFile[] = [
  {
    id: 'cf1',
    filename: 'Pacemaker_Clinical_Trial_2023.pdf',
    fileUrl: '/mock-files/pacemaker-trial-2023.pdf',
    fileType: 'pdf',
    description:
      'Multi-center clinical trial demonstrating 98% success rate in bradycardia patients',
    deviceId: 'device1',
    uploadedAt: '2024-01-15T10:30:00Z',
    extractedContent:
      'This randomized controlled trial enrolled 1,247 patients with symptomatic bradycardia across 23 medical centers. The CardioTech Pro Pacemaker demonstrated a 98.2% implantation success rate with zero device-related complications at 30-day follow-up. Battery longevity exceeded 12 years in 95% of devices. Patient quality of life scores improved by 87% compared to baseline measurements.',
  },
  {
    id: 'cf2',
    filename: 'NIH_Pacemaker_Safety_Study.pdf',
    fileUrl: 'https://pubmed.ncbi.nlm.nih.gov/mock-study-12345',
    fileType: 'url',
    description: 'NIH-funded safety study on modern pacemaker technology and patient outcomes',
    deviceId: 'device1',
    uploadedAt: '2024-02-20T14:22:00Z',
    extractedContent:
      'National Institutes of Health funded longitudinal study (n=2,891) examining long-term safety outcomes of dual-chamber pacemakers. Results show significant reduction in hospitalization rates (43% decrease) and improved exercise tolerance in patients with complete heart block. MRI compatibility testing confirmed safe operation under 1.5T and 3T magnetic fields.',
  },
  {
    id: 'cf3',
    filename: 'Comparative_Effectiveness_Research.pdf',
    fileUrl: '/mock-files/comparative-effectiveness.pdf',
    fileType: 'pdf',
    description: 'Comparative effectiveness research vs. competitor devices',
    deviceId: 'device1',
    uploadedAt: '2024-03-10T09:15:00Z',
    extractedContent:
      'Head-to-head comparison study evaluating CardioTech Pro against three leading competitor devices. Primary endpoints included battery longevity, sensing accuracy, and patient comfort. CardioTech Pro demonstrated superior sensing threshold (0.3mV vs 0.7mV average), extended battery life (14.2 years vs 11.8 years), and highest patient satisfaction scores (9.2/10 vs 7.4/10 average).',
  },
  {
    id: 'cf4',
    filename: 'FDA_Approval_Documentation.pdf',
    fileUrl: '/mock-files/fda-approval.pdf',
    fileType: 'pdf',
    description: 'FDA 510(k) premarket notification and approval documentation',
    deviceId: 'device1',
    uploadedAt: '2024-01-05T16:45:00Z',
    extractedContent:
      'FDA 510(k) clearance K234567 granted for CardioTech Pro Dual Chamber Pacemaker. Device classified as Class III medical device with substantial equivalence to predicate device. Biocompatibility testing, electrical safety, and electromagnetic compatibility all passed FDA requirements. Approved for use in patients with bradyarrhythmias, AV block, and sinus node dysfunction.',
  },
];

// Mock device data
export const mockDevices: MedicalDevice[] = [
  {
    id: 'device1',
    name: 'CardioTech Pro Dual Chamber Pacemaker',
    company: 'CardioTech Medical Systems',
    description:
      'Advanced dual-chamber pacemaker with MRI compatibility, wireless monitoring, and 15-year battery life. Features adaptive rate response and advanced diagnostics for optimal patient care.',
    companyProductUrl: 'https://cardiotechmedical.com/products/cardiotech-pro-pacemaker',
    imageUrls: ['/pacemaker1.webp', '/pacemaker2.webp', '/pacemaker3.webp', '/pacemaker4.jpg'],
    tags: ['Heart/Cardiovascular'],
    clinicalFiles: mockClinicalFiles,
    smartLinkId: 'cardiotech-pro-pacemaker-abc123',
    userId: 'rep1',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-03-15T10:30:00Z',
  },
];

// Mock sales rep data
export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  territory: string;
  company: string;
  devices: MedicalDevice[];
}

export const mockSalesRep: SalesRep = {
  id: 'rep1',
  name: 'Dr. John Johnson',
  email: 'john.johnson@meddevicesales.com',
  phone: '(555) 123-4567',
  territory: 'Southeast Region',
  company: 'MedDevice Sales Solutions',
  devices: mockDevices,
};

// Utility functions for working with mock data
export const getDeviceById = (id: string): MedicalDevice | undefined => {
  return mockDevices.find((device) => device.id === id);
};

export const getDeviceBySmartLink = (smartLinkId: string): MedicalDevice | undefined => {
  return mockDevices.find((device) => device.smartLinkId === smartLinkId);
};

export const filterDevicesByCategory = (category: MedicalCategory): MedicalDevice[] => {
  return mockDevices.filter((device) => device.tags.includes(category));
};

export const searchDevices = (query: string): MedicalDevice[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockDevices.filter(
    (device) =>
      device.name.toLowerCase().includes(lowercaseQuery) ||
      device.company.toLowerCase().includes(lowercaseQuery) ||
      device.description.toLowerCase().includes(lowercaseQuery) ||
      device.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  );
};

// Mock AI chat responses for clinical data
export const mockClinicalChatResponses: Record<string, string> = {
  efficacy:
    'Based on the clinical trial data, the CardioTech Pro Pacemaker shows a 98.2% implantation success rate with excellent long-term outcomes. The device demonstrated superior performance in sensing accuracy (0.3mV threshold) and battery longevity (14.2 years average).',
  safety:
    'Safety data from the NIH study shows zero device-related complications at 30-day follow-up. The device is MRI compatible up to 3T and has passed all FDA biocompatibility requirements. Hospitalization rates decreased by 43% compared to baseline.',
  comparison:
    'Comparative effectiveness research shows CardioTech Pro outperforms competitors in key metrics: battery life (14.2 vs 11.8 years), sensing accuracy (0.3mV vs 0.7mV), and patient satisfaction (9.2/10 vs 7.4/10).',
  battery:
    'The CardioTech Pro features an advanced lithium battery system with projected longevity exceeding 15 years. Clinical data shows 95% of devices maintaining full functionality beyond 12 years of implantation.',
  mri: 'The device is fully MRI compatible under both 1.5T and 3T magnetic fields, as confirmed in FDA testing and clinical studies. Patients can safely undergo MRI procedures without device reprogramming.',
  default:
    'I can help you understand the clinical evidence for this device. Ask me about efficacy, safety data, battery life, MRI compatibility, or comparisons with other devices.',
};
