/**
 * Location service for GPS tracking during drive sessions.
 * Handles permissions and provides location updates.
 */

import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  speedMps: number;
  headingDeg: number | null;
  accuracy: number | null;
  timestamp: number;
}

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * Check current location permission status
 */
export async function checkLocationPermission(): Promise<PermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status as PermissionStatus;
}

/**
 * Request foreground location permission
 */
export async function requestLocationPermission(): Promise<PermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status as PermissionStatus;
}

/**
 * Check if location services are enabled on the device
 */
export async function isLocationServicesEnabled(): Promise<boolean> {
  return await Location.hasServicesEnabledAsync();
}

let locationSubscription: Location.LocationSubscription | null = null;

/**
 * Start watching location with high accuracy.
 * Calls onLocation callback with each new location.
 *
 * @param onLocation - Callback for each location update
 * @param onError - Callback for errors
 * @returns Cleanup function to stop watching
 */
export async function startLocationWatch(
  onLocation: (data: LocationData) => void,
  onError: (error: Error) => void
): Promise<() => void> {
  // Stop any existing subscription
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }

  try {
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        // Request updates every ~250ms (system may throttle)
        timeInterval: 250,
        distanceInterval: 1, // Update at least every 1 meter
      },
      (location) => {
        onLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          // Speed is null when stationary, default to 0
          speedMps: location.coords.speed ?? 0,
          headingDeg: location.coords.heading,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        });
      }
    );
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Failed to start location watch'));
  }

  return () => {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }
  };
}

/**
 * Get current location once
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      speedMps: location.coords.speed ?? 0,
      headingDeg: location.coords.heading,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch {
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate heading difference, normalized to -180 to 180
 */
export function normalizeHeadingDelta(heading1: number, heading2: number): number {
  let delta = heading2 - heading1;
  // Normalize to -180 to 180
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}
