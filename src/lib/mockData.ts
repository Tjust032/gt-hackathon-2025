// Mock data for Prescription Drug Sales Rep Profile Page

export interface PrescriptionDrug {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  description: string;
  manufacturerProductUrl: string;
  imageUrls: string[];
  tags: TherapeuticCategory[];
  clinicalFiles: ClinicalFile[];
  smartLinkId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  ndcCode: string;
  dosageForm: string;
  strength: string;
  routeOfAdministration: string;
  activeIngredient: string;
  therapeuticClass: string;
  prescriptionRequired: boolean;
  controlledSubstanceSchedule?: string;
}

export interface ClinicalFile {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: 'pdf' | 'url' | 'text';
  description: string;
  drugId: string;
  uploadedAt: string;
  extractedContent?: string;
}

export interface DocumentRecord {
  document_id: string; // UUID
  listing_id: number; // Auto-incrementing listing ID (1, 2, 3, ...)
  original_filename: string;
  storage_url: string; // Where the PDF lives
  upload_timestamp: string;
  extracted_text?: string;
  embedding?: number[]; // BioBERT embedding vector
}

export type TherapeuticCategory =
  | 'Cardiovascular'
  | 'Oncology'
  | 'Hematology'
  | 'Rare Disease'
  | 'Immunotherapy'
  | 'Biologics'
  | 'Small Molecule'
  | 'Custom';

export const therapeuticCategories: TherapeuticCategory[] = [
  'Cardiovascular',
  'Oncology',
  'Hematology',
  'Rare Disease',
  'Immunotherapy',
  'Biologics',
  'Small Molecule',
  'Custom',
];

// Mock clinical files for Repatha
export const mockClinicalFiles: ClinicalFile[] = [
  {
    id: 'cf1',
    filename: 'Repatha_FOURIER_Trial_2017.pdf',
    fileUrl: '/mock-files/repatha-fourier-trial.pdf',
    fileType: 'pdf',
    description:
      'FOURIER trial demonstrating 59% LDL-C reduction and 15% cardiovascular event reduction',
    drugId: 'drug1',
    uploadedAt: '2024-01-15T10:30:00Z',
    extractedContent:
      'The FOURIER (Further Cardiovascular Outcomes Research with PCSK9 Inhibition in Subjects with Elevated Risk) trial enrolled 27,564 patients with atherosclerotic cardiovascular disease. Repatha (evolocumab) reduced LDL cholesterol by 59% (from 92 to 30 mg/dL) and demonstrated a 15% relative risk reduction in major cardiovascular events (composite of cardiovascular death, MI, stroke, hospitalization for unstable angina, or coronary revascularization) compared to placebo over a median of 2.2 years.',
  },
  {
    id: 'cf2',
    filename: 'Repatha_Prescribing_Information.pdf',
    fileUrl: 'https://www.pi.amgen.com/~/media/amgen/repositorysites/pi-amgen-com/repatha/repatha_pi_hcp_english.pdf',
    fileType: 'url',
    description: 'FDA-approved prescribing information and medication guide',
    drugId: 'drug1',
    uploadedAt: '2024-02-20T14:22:00Z',
    extractedContent:
      'Repatha (evolocumab) injection 140 mg/mL is indicated as an adjunct to diet and maximally tolerated statin therapy for treatment of adults with heterozygous familial hypercholesterolemia (HeFH) or clinical atherosclerotic cardiovascular disease (ASCVD), who require additional lowering of LDL-C. Dosing: 140 mg every 2 weeks or 420 mg once monthly by subcutaneous injection. Most common adverse reactions (>5%): nasopharyngitis, upper respiratory tract infection, influenza, back pain, and injection site reactions.',
  },
  {
    id: 'cf3',
    filename: 'OSLER_Long_Term_Safety_Study.pdf',
    fileUrl: '/mock-files/osler-safety-study.pdf',
    fileType: 'pdf',
    description: 'Open-Label Study of Long-Term Evaluation against LDL-C (OSLER) safety data',
    drugId: 'drug1',
    uploadedAt: '2024-03-10T09:15:00Z',
    extractedContent:
      'OSLER-1 and OSLER-2 trials followed 4,465 patients for up to 5 years, demonstrating sustained LDL-C reductions of approximately 61% with evolocumab. Safety profile was consistent with the parent studies, with no increase in adverse events over time. Injection site reactions occurred in 4.2% of patients. No cases of clinically significant liver enzyme elevations or new-onset diabetes were observed. Cognitive function testing showed no adverse effects with sustained low LDL-C levels.',
  },
  {
    id: 'cf4',
    filename: 'FDA_Approval_BLA_125522.pdf',
    fileUrl: '/mock-files/fda-bla-approval.pdf',
    fileType: 'pdf',
    description: 'FDA Biologics License Application approval documentation',
    drugId: 'drug1',
    uploadedAt: '2024-01-05T16:45:00Z',
    extractedContent:
      'FDA BLA 125522 approval granted August 27, 2015 for Repatha (evolocumab) injection. Approved as adjunct to diet and maximally tolerated statin therapy for adults with HeFH or clinical ASCVD requiring additional LDL-C lowering. Mechanism: fully human monoclonal IgG2 antibody that binds to PCSK9, preventing PCSK9-mediated LDL receptor degradation and thereby reducing LDL-C. Indicated for subcutaneous administration at 140 mg every 2 weeks or 420 mg once monthly.',
  },
];

// Mock drug data
export const mockDrugs: PrescriptionDrug[] = [
  {
    id: 'drug1',
    name: 'Repatha',
    genericName: 'evolocumab',
    manufacturer: 'Amgen',
    description:
      'A fully human monoclonal antibody that inhibits PCSK9 (proprotein convertase subtilisin/kexin type 9) to lower LDL cholesterol. Indicated for adults with atherosclerotic cardiovascular disease or familial hypercholesterolemia who require additional lowering of LDL-C.',
    manufacturerProductUrl: 'https://www.repatha.com/',
    imageUrls: ['/pacemaker1.webp', '/pacemaker2.webp', '/pacemaker3.webp', '/pacemaker4.jpg'],
    tags: ['Cardiovascular', 'Biologics'],
    clinicalFiles: mockClinicalFiles,
    smartLinkId: 'repatha-evolocumab-abc123',
    userId: 'rep1',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-03-15T10:30:00Z',
    ndcCode: '55513-0193-01',
    dosageForm: 'Solution for Injection',
    strength: '140mg/mL',
    routeOfAdministration: 'Subcutaneous',
    activeIngredient: 'evolocumab',
    therapeuticClass: 'PCSK9 Inhibitor',
    prescriptionRequired: true,
  },
  {
    id: 'drug2',
    name: 'Opdivo',
    genericName: 'nivolumab',
    manufacturer: 'Bristol Myers Squibb',
    description:
      'A programmed death receptor-1 (PD-1) blocking antibody indicated for the treatment of multiple types of cancer including melanoma, non-small cell lung cancer, renal cell carcinoma, and others. Works by enhancing T-cell immune responses against tumor cells.',
    manufacturerProductUrl: 'https://www.opdivo.com/',
    imageUrls: ['/pacemaker1.webp', '/pacemaker2.webp', '/pacemaker3.webp', '/pacemaker4.jpg'],
    tags: ['Oncology', 'Immunotherapy', 'Biologics'],
    clinicalFiles: [],
    smartLinkId: 'opdivo-nivolumab-def456',
    userId: 'rep1',
    createdAt: '2024-02-01T12:00:00Z',
    updatedAt: '2024-03-20T10:30:00Z',
    ndcCode: '0003-3772-11',
    dosageForm: 'Injection',
    strength: '10mg/mL',
    routeOfAdministration: 'Intravenous',
    activeIngredient: 'nivolumab',
    therapeuticClass: 'PD-1 Inhibitor',
    prescriptionRequired: true,
  },
  {
    id: 'drug3',
    name: 'Xarelto',
    genericName: 'rivaroxaban',
    manufacturer: 'Janssen Pharmaceuticals (Johnson & Johnson)',
    description:
      'A Factor Xa inhibitor anticoagulant indicated for reducing the risk of stroke and systemic embolism in patients with nonvalvular atrial fibrillation, treatment and prevention of deep vein thrombosis (DVT) and pulmonary embolism (PE).',
    manufacturerProductUrl: 'https://www.xarelto.com/',
    imageUrls: ['/pacemaker1.webp', '/pacemaker2.webp', '/pacemaker3.webp', '/pacemaker4.jpg'],
    tags: ['Cardiovascular', 'Hematology', 'Small Molecule'],
    clinicalFiles: [],
    smartLinkId: 'xarelto-rivaroxaban-ghi789',
    userId: 'rep1',
    createdAt: '2024-02-15T12:00:00Z',
    updatedAt: '2024-03-22T10:30:00Z',
    ndcCode: '50458-0579-01',
    dosageForm: 'Tablet',
    strength: '20mg',
    routeOfAdministration: 'Oral',
    activeIngredient: 'rivaroxaban',
    therapeuticClass: 'Factor Xa Inhibitor',
    prescriptionRequired: true,
  },
  {
    id: 'drug4',
    name: 'Pemazyre',
    genericName: 'pemigatinib',
    manufacturer: 'Incyte',
    description:
      'A kinase inhibitor indicated for the treatment of adults with previously treated, unresectable locally advanced or metastatic cholangiocarcinoma with a fibroblast growth factor receptor 2 (FGFR2) fusion or other rearrangement.',
    manufacturerProductUrl: 'https://www.pemazyre.com/',
    imageUrls: ['/pacemaker1.webp', '/pacemaker2.webp', '/pacemaker3.webp', '/pacemaker4.jpg'],
    tags: ['Oncology', 'Rare Disease', 'Small Molecule'],
    clinicalFiles: [],
    smartLinkId: 'pemazyre-pemigatinib-jkl012',
    userId: 'rep1',
    createdAt: '2024-03-01T12:00:00Z',
    updatedAt: '2024-03-25T10:30:00Z',
    ndcCode: '50881-0106-01',
    dosageForm: 'Tablet',
    strength: '13.5mg',
    routeOfAdministration: 'Oral',
    activeIngredient: 'pemigatinib',
    therapeuticClass: 'FGFR Kinase Inhibitor',
    prescriptionRequired: true,
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
  drugs: PrescriptionDrug[];
}

export const mockSalesRep: SalesRep = {
  id: 'rep1',
  name: 'Dr. Sarah Mitchell',
  email: 'sarah.mitchell@pharmasales.com',
  phone: '(555) 123-4567',
  territory: 'Southeast Region',
  company: 'Pharma Sales Solutions',
  drugs: mockDrugs,
};

// Utility functions for working with mock data
export const getDrugById = (id: string): PrescriptionDrug | undefined => {
  return mockDrugs.find((drug) => drug.id === id);
};

export const getDrugBySmartLink = (smartLinkId: string): PrescriptionDrug | undefined => {
  return mockDrugs.find((drug) => drug.smartLinkId === smartLinkId);
};

export const filterDrugsByCategory = (category: TherapeuticCategory): PrescriptionDrug[] => {
  return mockDrugs.filter((drug) => drug.tags.includes(category));
};

export const searchDrugs = (query: string): PrescriptionDrug[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockDrugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(lowercaseQuery) ||
      drug.genericName.toLowerCase().includes(lowercaseQuery) ||
      drug.manufacturer.toLowerCase().includes(lowercaseQuery) ||
      drug.description.toLowerCase().includes(lowercaseQuery) ||
      drug.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  );
};

// Mock AI chat responses for clinical data
export const mockClinicalChatResponses: Record<string, string> = {
  efficacy:
    'Based on the FOURIER trial data, Repatha (evolocumab) reduced LDL cholesterol by 59% (from 92 to 30 mg/dL) and demonstrated a 15% relative risk reduction in major cardiovascular events compared to placebo. The OSLER trials showed sustained LDL-C reductions of approximately 61% over up to 5 years.',
  safety:
    'Safety data from the OSLER-1 and OSLER-2 trials followed 4,465 patients for up to 5 years. The safety profile was consistent with no increase in adverse events over time. Injection site reactions occurred in 4.2% of patients. Most common adverse reactions (>5%) include nasopharyngitis, upper respiratory tract infection, influenza, and back pain.',
  comparison:
    'As a PCSK9 inhibitor, Repatha offers a unique mechanism of action compared to statins. While statins reduce LDL-C by 30-50%, Repatha provides an additional 60% reduction when used as adjunct therapy. Unlike statins, Repatha has not been associated with muscle-related side effects or liver enzyme elevations.',
  dosing:
    'Repatha is administered at 140 mg every 2 weeks or 420 mg once monthly by subcutaneous injection. The medication can be self-administered using a pre-filled autoinjector or syringe. No dose adjustments are needed for renal or hepatic impairment.',
  mechanism:
    'Repatha is a fully human monoclonal IgG2 antibody that binds to PCSK9, preventing PCSK9-mediated LDL receptor degradation. This allows more LDL receptors to remain on liver cell surfaces, thereby increasing LDL-C clearance from the bloodstream.',
  default:
    'I can help you understand the clinical evidence for this prescription drug. Ask me about efficacy, safety data, dosing, mechanism of action, or comparisons with other therapies.',
};
