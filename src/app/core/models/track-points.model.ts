/**
 * TannenTrails Track Points Model
 * Generated from GPX data
 */

export interface TrackPoint {
  /** [latitude, longitude, altitude] */
  coordinates: [number, number, number];
}

export interface TrackData {
  metadata: {
    name: string;
    description: string;
    totalPoints: number;
    format: string;
    generatedAt: string;
  };
  trackPoints: Array<[number, number, number]>;
}

// Type for individual coordinate arrays
export type CoordinateArray = [number, number, number];

// Helper functions
export function getLatitude(point: CoordinateArray): number {
  return point[0];
}

export function getLongitude(point: CoordinateArray): number {
  return point[1];
}

export function getAltitude(point: CoordinateArray): number {
  return point[2];
}

export function createTrackPoint(lat: number, lng: number, alt: number): CoordinateArray {
  return [lat, lng, alt];
}
