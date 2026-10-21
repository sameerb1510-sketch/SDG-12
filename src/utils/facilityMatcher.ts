/**
 * Facility Matching & Ranking Algorithm
 * Filters fictional facilities by canonical waste category and sorts by straight-line Haversine distance.
 */

import { Coordinates, FacilityMatchResult, FictionalFacility, WasteCategory } from '../types/waste';
import { calculateDistance, isValidCoordinate } from './haversine';

export interface MatchFacilitiesOptions {
  userCoordinates: Coordinates;
  category: WasteCategory;
  facilities: FictionalFacility[];
  maxResults?: number;
}

export interface MatchFacilitiesResponse {
  results: FacilityMatchResult[];
  totalCompatible: number;
  totalInDataset: number;
  selectedCategory: WasteCategory;
  userCoordinates: Coordinates;
  error?: string;
}

/**
 * Validates a single facility record.
 */
export function isValidFacility(facility: unknown): facility is FictionalFacility {
  if (!facility || typeof facility !== 'object') return false;
  const f = facility as Partial<FictionalFacility>;
  if (typeof f.id !== 'string' || f.id.trim() === '') return false;
  if (typeof f.name !== 'string' || f.name.trim() === '') return false;
  if (!isValidCoordinate(f.coordinates)) return false;
  if (!Array.isArray(f.acceptedCategories)) return false;
  return true;
}

/**
 * Deduplicates facilities by unique facility ID, preserving the first occurrence.
 */
export function deduplicateFacilities(facilities: FictionalFacility[]): FictionalFacility[] {
  const seen = new Set<string>();
  const unique: FictionalFacility[] = [];
  for (const fac of facilities) {
    if (!seen.has(fac.id)) {
      seen.add(fac.id);
      unique.push(fac);
    }
  }
  return unique;
}

/**
 * Core facility matching function:
 * 1. Validates inputs (coordinates and category).
 * 2. Deduplicates & validates facilities.
 * 3. Filters to strictly compatible facilities accepting the specified category.
 * 4. Computes straight-line Haversine distance to each.
 * 5. Sorts in ascending order (nearest to farthest).
 * 6. Returns top N (default 3) matches.
 */
export function findNearestFacilities({
  userCoordinates,
  category,
  facilities,
  maxResults = 3
}: MatchFacilitiesOptions): MatchFacilitiesResponse {
  // 1. Guard against invalid user coordinates
  if (!isValidCoordinate(userCoordinates)) {
    return {
      results: [],
      totalCompatible: 0,
      totalInDataset: facilities?.length || 0,
      selectedCategory: category,
      userCoordinates: userCoordinates || { latitude: 0, longitude: 0 },
      error: 'Invalid user coordinates provided. Please enter valid latitude and longitude.'
    };
  }

  // Guard against missing category
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return {
      results: [],
      totalCompatible: 0,
      totalInDataset: facilities?.length || 0,
      selectedCategory: category,
      userCoordinates,
      error: 'No waste category selected. Please select a valid e-waste category.'
    };
  }

  // Guard against non-array or empty dataset
  if (!Array.isArray(facilities) || facilities.length === 0) {
    return {
      results: [],
      totalCompatible: 0,
      totalInDataset: 0,
      selectedCategory: category,
      userCoordinates,
      error: 'Facility dataset is empty or unavailable.'
    };
  }

  // Filter out any corrupted records and deduplicate
  const validFacilities = deduplicateFacilities(facilities.filter(isValidFacility));

  // 2. Filter strictly by accepted category
  const compatible = validFacilities.filter((fac) =>
    fac.acceptedCategories.includes(category)
  );

  if (compatible.length === 0) {
    return {
      results: [],
      totalCompatible: 0,
      totalInDataset: validFacilities.length,
      selectedCategory: category,
      userCoordinates
    };
  }

  // 3. Compute distance for each compatible facility
  const withDistance = compatible.map((facility) => {
    const { distanceKm, distanceMiles } = calculateDistance(
      userCoordinates,
      facility.coordinates
    );
    return {
      facility,
      distanceKm,
      distanceMiles
    };
  });

  // 4. Sort nearest to farthest
  withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  // 5. Take top maxResults (default 3) with rank assigned
  const topMatches: FacilityMatchResult[] = withDistance
    .slice(0, Math.max(1, maxResults))
    .map((item, index) => ({
      facility: item.facility,
      distanceKm: item.distanceKm,
      distanceMiles: item.distanceMiles,
      rank: index + 1
    }));

  return {
    results: topMatches,
    totalCompatible: compatible.length,
    totalInDataset: validFacilities.length,
    selectedCategory: category,
    userCoordinates
  };
}
