/**
 * Haversine Formula Utility
 * Calculates the great-circle straight-line distance between two geographic coordinates on a sphere.
 */

import { Coordinates } from '../types/waste';

const EARTH_RADIUS_KM = 6371.0088; // Mean Earth radius in kilometers (IUGG standard)
const KM_TO_MILES = 0.621371;

/**
 * Validates that latitude and longitude are valid numeric values within geographic ranges.
 */
export function isValidCoordinate(coords: Coordinates | null | undefined): boolean {
  if (!coords) return false;
  const { latitude, longitude } = coords;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return false;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  return true;
}

/**
 * Converts degrees to radians.
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates straight-line distance between two coordinates in kilometers.
 * Throws an Error if either coordinate is invalid.
 */
export function calculateHaversineDistanceKm(
  pointA: Coordinates,
  pointB: Coordinates
): number {
  if (!isValidCoordinate(pointA)) {
    throw new Error(`Invalid coordinate for pointA: ${JSON.stringify(pointA)}`);
  }
  if (!isValidCoordinate(pointB)) {
    throw new Error(`Invalid coordinate for pointB: ${JSON.stringify(pointB)}`);
  }

  const lat1Rad = toRadians(pointA.latitude);
  const lon1Rad = toRadians(pointA.longitude);
  const lat2Rad = toRadians(pointB.latitude);
  const lon2Rad = toRadians(pointB.longitude);

  const deltaLat = lat2Rad - lat1Rad;
  const deltaLon = lon2Rad - lon1Rad;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  // Guard against slight floating point inaccuracies exceeding 1
  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));

  const distanceKm = EARTH_RADIUS_KM * c;

  // Round to 2 decimal places
  return Math.round(distanceKm * 100) / 100;
}

/**
 * Calculates straight-line distance and returns both km and miles.
 */
export function calculateDistance(
  pointA: Coordinates,
  pointB: Coordinates
): { distanceKm: number; distanceMiles: number } {
  const km = calculateHaversineDistanceKm(pointA, pointB);
  const miles = Math.round(km * KM_TO_MILES * 100) / 100;
  return { distanceKm: km, distanceMiles: miles };
}
