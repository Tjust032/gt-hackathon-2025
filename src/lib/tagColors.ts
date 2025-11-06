import { TherapeuticCategory } from './mockData';

/**
 * Standardized color mappings for therapeutic categories
 * Used across all components to ensure consistent styling
 * Each color includes background, text, and border classes for pill styling
 */
export const categoryColors: Record<TherapeuticCategory | string, string> = {
  // Core therapeutic categories with enhanced styling
  Cardiovascular: 'bg-red-50 text-red-700 border border-red-200 shadow-sm',
  Oncology: 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm',
  Hematology: 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm',
  'Rare Disease': 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm',
  Immunotherapy: 'bg-green-50 text-green-700 border border-green-200 shadow-sm',
  Biologics: 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm',
  'Small Molecule': 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm',

  // Additional categories
  Neurology: 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm',
  Dermatology: 'bg-pink-50 text-pink-700 border border-pink-200 shadow-sm',
  Endocrinology: 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm',
  Respiratory: 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm',
  Gastrointestinal: 'bg-lime-50 text-lime-700 border border-lime-200 shadow-sm',

  // Default/fallback
  Custom: 'bg-gray-50 text-gray-700 border border-gray-200 shadow-sm',
};

/**
 * Get color classes for a therapeutic category
 * Falls back to gray if category is not found
 */
export function getCategoryColor(category: string): string {
  return categoryColors[category] || categoryColors.Custom;
}

/**
 * Get all available therapeutic categories with their colors
 */
export function getAllCategoryColors(): Record<string, string> {
  return { ...categoryColors };
}
