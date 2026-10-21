import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistanceKm,
  calculateDistance,
  isValidCoordinate
} from '../src/utils/haversine';
import { Coordinates } from '../src/types/waste';

describe('Haversine Formula & Coordinate Validation', () => {
  it('validates correct latitude and longitude ranges', () => {
    expect(isValidCoordinate({ latitude: 19.076, longitude: 72.8777 })).toBe(true);
    expect(isValidCoordinate({ latitude: 0, longitude: 0 })).toBe(true);
    expect(isValidCoordinate({ latitude: -90, longitude: 180 })).toBe(true);
    expect(isValidCoordinate({ latitude: 90, longitude: -180 })).toBe(true);

    // Invalid ranges
    expect(isValidCoordinate({ latitude: 91, longitude: 72 })).toBe(false);
    expect(isValidCoordinate({ latitude: -90.5, longitude: 0 })).toBe(false);
    expect(isValidCoordinate({ latitude: 19, longitude: 181 })).toBe(false);
    expect(isValidCoordinate({ latitude: 19, longitude: -185 })).toBe(false);

    // Corrupted types
    expect(isValidCoordinate(null)).toBe(false);
    expect(isValidCoordinate(undefined)).toBe(false);
    expect(isValidCoordinate({ latitude: NaN, longitude: 72 })).toBe(false);
    expect(isValidCoordinate({ latitude: 19, longitude: Infinity })).toBe(false);
  });

  it('computes 0 distance for identical coordinates', () => {
    const point: Coordinates = { latitude: 19.076, longitude: 72.8777 };
    const dist = calculateHaversineDistanceKm(point, point);
    expect(dist).toBe(0);
  });

  it('accurately calculates known distance between Mumbai (19.0760, 72.8777) and Pune (18.5204, 73.8567)', () => {
    const mumbai: Coordinates = { latitude: 19.076, longitude: 72.8777 };
    const pune: Coordinates = { latitude: 18.5204, longitude: 73.8567 };

    const distKm = calculateHaversineDistanceKm(mumbai, pune);
    // Great circle distance between Mumbai and Pune is ~121 km
    expect(distKm).toBeGreaterThan(118);
    expect(distKm).toBeLessThan(125);
  });

  it('accurately calculates distance along equator (1 degree of longitude is ~111.3 km)', () => {
    const pt1: Coordinates = { latitude: 0, longitude: 0 };
    const pt2: Coordinates = { latitude: 0, longitude: 1 };

    const distKm = calculateHaversineDistanceKm(pt1, pt2);
    expect(distKm).toBeCloseTo(111.19, 0);
  });

  it('returns both kilometers and miles correctly via calculateDistance', () => {
    const ptA: Coordinates = { latitude: 19.0596, longitude: 72.8295 }; // Bandra
    const ptB: Coordinates = { latitude: 19.1136, longitude: 72.8697 }; // Andheri

    const res = calculateDistance(ptA, ptB);
    expect(res.distanceKm).toBeGreaterThan(6);
    expect(res.distanceKm).toBeLessThan(9);
    expect(res.distanceMiles).toBeCloseTo(res.distanceKm * 0.621371, 1);
  });

  it('throws an error if either point has invalid coordinates', () => {
    const valid: Coordinates = { latitude: 19.076, longitude: 72.8777 };
    const invalid: Coordinates = { latitude: 120, longitude: 72.8777 };

    expect(() => calculateHaversineDistanceKm(valid, invalid)).toThrow(/Invalid coordinate/);
    expect(() => calculateHaversineDistanceKm(invalid, valid)).toThrow(/Invalid coordinate/);
  });
});
