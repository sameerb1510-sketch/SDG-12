/**
 * EcoWaste Navigator - Shared Canonical Waste Categories and Types
 * Used across Frontend, Backend, AI Prompts, Dataset, and Matching Algorithm.
 */

export enum WasteCategory {
  PHONES_TABLETS = 'Phones and tablets',
  COMPUTERS_LAPTOPS = 'Computers and laptops',
  BATTERIES = 'Batteries',
  CABLES_CHARGERS = 'Cables and chargers',
  AUDIO_VIDEO = 'Audio and video electronics',
  HOUSEHOLD_APPLIANCES = 'Household electronic appliances',
  LIGHTING_DEVICES = 'Lighting and electronic devices',
  CIRCUIT_BOARDS = 'Circuit boards and components',
  PRINTERS_PERIPHERALS = 'Printers and peripherals',
  OTHER_UNCERTAIN = 'Other or uncertain e-waste'
}

export const ALL_WASTE_CATEGORIES: WasteCategory[] = [
  WasteCategory.PHONES_TABLETS,
  WasteCategory.COMPUTERS_LAPTOPS,
  WasteCategory.BATTERIES,
  WasteCategory.CABLES_CHARGERS,
  WasteCategory.AUDIO_VIDEO,
  WasteCategory.HOUSEHOLD_APPLIANCES,
  WasteCategory.LIGHTING_DEVICES,
  WasteCategory.CIRCUIT_BOARDS,
  WasteCategory.PRINTERS_PERIPHERALS,
  WasteCategory.OTHER_UNCERTAIN
];

export type DisposalPathway = 'REPAIR' | 'REUSE_DONATE' | 'RECYCLE';

export interface DecisionPathwayDetails {
  pathway: DisposalPathway;
  title: string;
  badgeLabel: string;
  rationale: string;
  actionSteps: string[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FictionalFacility {
  id: string;
  name: string;
  coordinates: Coordinates;
  acceptedCategories: WasteCategory[];
  openingHours: string;
  description: string;
  address: string;
  isDemo: true;
  contactNote: string;
}

export interface FacilityMatchResult {
  facility: FictionalFacility;
  distanceKm: number;
  distanceMiles: number;
  rank: number;
}

export type CertaintyLevel = 'High' | 'Medium' | 'Low' | 'Uncertain';

export interface AIIdentificationResult {
  itemName: string;
  category: WasteCategory;
  explanation: string;
  certainty: CertaintyLevel;
  safetyGuidance: string[];
  followUpQuestion?: string;
  isHazardous: boolean;
  isFallbackDemo?: boolean;
  decisionPathway?: DecisionPathwayDetails;
}

export interface IdentifyRequestPayload {
  description?: string;
  imageBase64?: string;
  imageMimeType?: string;
  userCategoryHint?: WasteCategory;
  deviceCondition?: 'working' | 'minor_issue' | 'dead_broken' | 'hazardous';
}

export interface IdentifyResponsePayload {
  success: boolean;
  result?: AIIdentificationResult;
  error?: string;
  isFallbackDemo?: boolean;
}
