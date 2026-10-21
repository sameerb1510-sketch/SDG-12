import { describe, it, expect } from 'vitest';
import {
  findNearestFacilities,
  deduplicateFacilities,
  isValidFacility
} from '../src/utils/facilityMatcher';
import { FictionalFacility, WasteCategory, Coordinates } from '../src/types/waste';
import rawFacilities from '../src/data/facilities.json';

const sampleDataset: FictionalFacility[] = rawFacilities as unknown as FictionalFacility[];

describe('Facility Matching & Distance Ranking Algorithm', () => {
  const userMumbaiCenter: Coordinates = { latitude: 19.076, longitude: 72.8777 };

  it('validates genuine fictional facility objects', () => {
    expect(isValidFacility(sampleDataset[0])).toBe(true);
    expect(isValidFacility(null)).toBe(false);
    expect(isValidFacility({})).toBe(false);
    expect(isValidFacility({ id: '', name: 'Test' })).toBe(false);
    expect(isValidFacility({ id: '1', name: 'Test', coordinates: { latitude: 200, longitude: 0 } })).toBe(false);
  });

  it('filters only compatible facilities accepting the target category', () => {
    const targetCategory = WasteCategory.BATTERIES;
    const response = findNearestFacilities({
      userCoordinates: userMumbaiCenter,
      category: targetCategory,
      facilities: sampleDataset,
      maxResults: 3
    });

    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results.length).toBeLessThanOrEqual(3);

    // Every returned facility MUST accept Batteries
    response.results.forEach((match) => {
      expect(match.facility.acceptedCategories).toContain(targetCategory);
    });
  });

  it('never returns incompatible facilities', () => {
    // Artificial dataset: one accepts Batteries, one does NOT
    const testFacilities: FictionalFacility[] = [
      {
        id: 'fac-a',
        name: 'Demo Facility A',
        coordinates: { latitude: 19.05, longitude: 72.85 },
        acceptedCategories: [WasteCategory.BATTERIES],
        openingHours: '9am',
        description: 'Test',
        address: 'Test',
        isDemo: true,
        contactNote: 'Demo'
      },
      {
        id: 'fac-b',
        name: 'Demo Incompatible Facility B (Very Close to user)',
        coordinates: { latitude: 19.0761, longitude: 72.8778 }, // Extremely close!
        acceptedCategories: [WasteCategory.PRINTERS_PERIPHERALS], // Incompatible!
        openingHours: '9am',
        description: 'Test',
        address: 'Test',
        isDemo: true,
        contactNote: 'Demo'
      }
    ];

    const response = findNearestFacilities({
      userCoordinates: userMumbaiCenter,
      category: WasteCategory.BATTERIES,
      facilities: testFacilities
    });

    expect(response.results.length).toBe(1);
    expect(response.results[0].facility.id).toBe('fac-a');
    // fac-b must NOT be returned despite being closer
    expect(response.results.find((r) => r.facility.id === 'fac-b')).toBeUndefined();
  });

  it('ranks facilities in ascending order of distance (nearest is rank 1)', () => {
    const response = findNearestFacilities({
      userCoordinates: userMumbaiCenter,
      category: WasteCategory.PHONES_TABLETS,
      facilities: sampleDataset,
      maxResults: 3
    });

    expect(response.results.length).toBe(3);
    expect(response.results[0].rank).toBe(1);
    expect(response.results[1].rank).toBe(2);
    expect(response.results[2].rank).toBe(3);

    expect(response.results[0].distanceKm).toBeLessThanOrEqual(response.results[1].distanceKm);
    expect(response.results[1].distanceKm).toBeLessThanOrEqual(response.results[2].distanceKm);
  });

  it('handles fewer than three matching facilities safely without crashing', () => {
    const singleMatchList: FictionalFacility[] = [
      {
        id: 'single-1',
        name: 'Sole Match Center',
        coordinates: { latitude: 19.1, longitude: 72.85 },
        acceptedCategories: [WasteCategory.LIGHTING_DEVICES],
        openingHours: '10am - 4pm',
        description: 'Sole center',
        address: 'Demo Address',
        isDemo: true,
        contactNote: 'Demo'
      }
    ];

    const response = findNearestFacilities({
      userCoordinates: userMumbaiCenter,
      category: WasteCategory.LIGHTING_DEVICES,
      facilities: singleMatchList,
      maxResults: 3
    });

    expect(response.results.length).toBe(1);
    expect(response.results[0].rank).toBe(1);
    expect(response.results[0].facility.id).toBe('single-1');
    expect(response.totalCompatible).toBe(1);
  });

  it('handles no matching facilities gracefully', () => {
    const noneMatchList: FictionalFacility[] = [
      {
        id: 'no-match-1',
        name: 'Phones Only',
        coordinates: { latitude: 19.1, longitude: 72.85 },
        acceptedCategories: [WasteCategory.PHONES_TABLETS],
        openingHours: '10am',
        description: 'Test',
        address: 'Test',
        isDemo: true,
        contactNote: 'Demo'
      }
    ];

    const response = findNearestFacilities({
      userCoordinates: userMumbaiCenter,
      category: WasteCategory.BATTERIES,
      facilities: noneMatchList
    });

    expect(response.results).toEqual([]);
    expect(response.totalCompatible).toBe(0);
    expect(response.error).toBeUndefined();
  });

  it('rejects invalid user coordinates with clear error message', () => {
    const response = findNearestFacilities({
      userCoordinates: { latitude: 999, longitude: 72.8777 },
      category: WasteCategory.BATTERIES,
      facilities: sampleDataset
    });

    expect(response.results).toEqual([]);
    expect(response.error).toMatch(/Invalid user coordinates/);
  });

  it('deduplicates duplicate facility IDs, keeping first record', () => {
    const duplicates: FictionalFacility[] = [
      {
        id: 'dup-1',
        name: 'First Instance',
        coordinates: { latitude: 19.0, longitude: 72.8 },
        acceptedCategories: [WasteCategory.BATTERIES],
        openingHours: '10am',
        description: 'First',
        address: 'First Addr',
        isDemo: true,
        contactNote: 'Demo'
      },
      {
        id: 'dup-1',
        name: 'Second Instance Duplicate',
        coordinates: { latitude: 19.2, longitude: 72.9 },
        acceptedCategories: [WasteCategory.BATTERIES],
        openingHours: '10am',
        description: 'Second',
        address: 'Second Addr',
        isDemo: true,
        contactNote: 'Demo'
      }
    ];

    const deduped = deduplicateFacilities(duplicates);
    expect(deduped.length).toBe(1);
    expect(deduped[0].name).toBe('First Instance');
  });
});
