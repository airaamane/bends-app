/**
 * Sensor service for accelerometer and gyroscope data.
 * Used for smoothness scoring and classification confirmation.
 */

import { Accelerometer, Gyroscope } from 'expo-sensors';

export interface SensorData {
  accelX: number;
  accelY: number;
  accelZ: number;
  yawRate: number;
  timestamp: number;
}

// Gravity constant for normalization
const GRAVITY = 9.81;

// Current sensor values (updated by subscriptions)
let currentAccel = { x: 0, y: 0, z: 0 };
let currentGyro = { x: 0, y: 0, z: 0 };

let accelSubscription: ReturnType<typeof Accelerometer.addListener> | null = null;
let gyroSubscription: ReturnType<typeof Gyroscope.addListener> | null = null;

/**
 * Check if accelerometer is available
 */
export async function isAccelerometerAvailable(): Promise<boolean> {
  try {
    return await Accelerometer.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Check if gyroscope is available
 */
export async function isGyroscopeAvailable(): Promise<boolean> {
  try {
    return await Gyroscope.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Start sensor subscriptions.
 * Updates internal state which can be read via getCurrentSensorData.
 *
 * @returns Cleanup function to stop sensors
 */
export function startSensorWatch(): () => void {
  // Set update interval to ~100ms for responsive readings
  Accelerometer.setUpdateInterval(100);
  Gyroscope.setUpdateInterval(100);

  // Subscribe to accelerometer
  accelSubscription = Accelerometer.addListener((data) => {
    // Expo returns values in g-force, we keep them normalized
    currentAccel = {
      x: data.x,
      y: data.y,
      z: data.z,
    };
  });

  // Subscribe to gyroscope
  gyroSubscription = Gyroscope.addListener((data) => {
    // Expo returns values in rad/s
    currentGyro = {
      x: data.x,
      y: data.y,
      z: data.z, // z is yaw rate
    };
  });

  return () => {
    if (accelSubscription) {
      accelSubscription.remove();
      accelSubscription = null;
    }
    if (gyroSubscription) {
      gyroSubscription.remove();
      gyroSubscription = null;
    }
    // Reset values
    currentAccel = { x: 0, y: 0, z: 0 };
    currentGyro = { x: 0, y: 0, z: 0 };
  };
}

/**
 * Get current sensor data snapshot.
 * Returns latest values from sensor subscriptions.
 */
export function getCurrentSensorData(): SensorData {
  return {
    // Phone orientation when mounted:
    // X = lateral (side-to-side, positive = right)
    // Y = longitudinal (forward/back, positive = forward)
    // Z = vertical (up/down)
    accelX: currentAccel.x,
    accelY: currentAccel.y,
    accelZ: currentAccel.z,
    // Z gyro = yaw rate (rotation around vertical axis)
    yawRate: currentGyro.z,
    timestamp: Date.now(),
  };
}

/**
 * Calculate magnitude of acceleration (useful for detecting total G-force)
 */
export function calculateAccelMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Calculate variance of a number array
 */
export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(values: number[]): number {
  return Math.sqrt(calculateVariance(values));
}
