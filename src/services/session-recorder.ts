/**
 * Session recorder service.
 * Manages the active drive session, collects samples,
 * and produces the final DriveSession with metrics.
 */

import type {
  Sample,
  DriveSession,
  ActiveSession,
  RoadClassification,
  HudState,
  GearBand,
  RevZone,
} from '../models/types';
import { startLocationWatch, calculateDistance, type LocationData } from './location';
import { startSensorWatch, getCurrentSensorData } from './sensors';
import { classifyRoad, resetClassification, suggestGearBand, determineRevZone } from './classification';
import { computeSmoothnessScore, calculateClassificationStats } from './scoring';

// Sample collection interval in ms
const SAMPLE_INTERVAL = 250;

// Session state
let activeSession: ActiveSession | null = null;
let sampleInterval: ReturnType<typeof setInterval> | null = null;
let stopLocationWatch: (() => void) | null = null;
let stopSensorWatch: (() => void) | null = null;
let lastLocationData: LocationData | null = null;
let lastSample: Sample | null = null;
let hudUpdateCallback: ((state: HudState) => void) | null = null;

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Convert speed from m/s to km/h
 */
function mpsToKmh(mps: number): number {
  return mps * 3.6;
}

/**
 * Start a new drive session.
 * Begins collecting location and sensor data.
 *
 * @param onHudUpdate - Callback for HUD state updates
 * @param onError - Callback for errors
 * @returns Session ID
 */
export async function startSession(
  onHudUpdate: (state: HudState) => void,
  onError: (error: Error) => void
): Promise<string> {
  // Clean up any existing session
  if (activeSession) {
    await stopSession();
  }

  // Reset classification state
  resetClassification();

  // Create new session
  const sessionId = generateSessionId();
  activeSession = {
    id: sessionId,
    startedAt: Date.now(),
    samples: [],
    classificationCounts: {
      straight: 0,
      flow: 0,
      tight: 0,
      transition: 0,
    },
  };

  hudUpdateCallback = onHudUpdate;

  // Start sensor watch
  stopSensorWatch = startSensorWatch();

  // Start location watch
  try {
    stopLocationWatch = await startLocationWatch(
      (location) => {
        lastLocationData = location;
      },
      (error) => {
        onError(error);
      }
    );
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Failed to start location'));
    return sessionId;
  }

  // Start sampling at fixed interval
  sampleInterval = setInterval(() => {
    collectSample();
  }, SAMPLE_INTERVAL);

  // Initial HUD state
  onHudUpdate({
    speedKmh: 0,
    classification: 'Straight',
    gearBand: '2nd',
    revZone: 'optimal',
    isRecording: true,
  });

  return sessionId;
}

/**
 * Collect a single sample and update HUD.
 */
function collectSample(): void {
  if (!activeSession || !lastLocationData) {
    return;
  }

  // Get current sensor data
  const sensors = getCurrentSensorData();

  // Create sample
  const sample: Sample = {
    t: Date.now(),
    lat: lastLocationData.latitude,
    lon: lastLocationData.longitude,
    speedMps: lastLocationData.speedMps,
    headingDeg: lastLocationData.headingDeg,
    accelX: sensors.accelX,
    accelY: sensors.accelY,
    accelZ: sensors.accelZ,
    yawRate: sensors.yawRate,
  };

  // Add to session
  activeSession.samples.push(sample);

  // Classify road segment
  const classification = classifyRoad(sample, lastSample);

  // Update classification counts
  switch (classification) {
    case 'Straight':
      activeSession.classificationCounts.straight++;
      break;
    case 'Flow':
      activeSession.classificationCounts.flow++;
      break;
    case 'Tight':
      activeSession.classificationCounts.tight++;
      break;
    case 'Transition':
      activeSession.classificationCounts.transition++;
      break;
  }

  // Calculate current speed in km/h
  const speedKmh = mpsToKmh(sample.speedMps);

  // Get gear and rev zone suggestions
  const gearBand = suggestGearBand(speedKmh, classification);
  const revZone = determineRevZone(speedKmh, classification);

  // Update HUD
  if (hudUpdateCallback) {
    hudUpdateCallback({
      speedKmh: Math.round(speedKmh),
      classification,
      gearBand,
      revZone,
      isRecording: true,
    });
  }

  // Store for next iteration
  lastSample = sample;
}

/**
 * Stop the current session and compute final metrics.
 * @returns Completed DriveSession or null if no active session
 */
export async function stopSession(): Promise<DriveSession | null> {
  if (!activeSession) {
    return null;
  }

  // Stop interval
  if (sampleInterval) {
    clearInterval(sampleInterval);
    sampleInterval = null;
  }

  // Stop location watch
  if (stopLocationWatch) {
    stopLocationWatch();
    stopLocationWatch = null;
  }

  // Stop sensor watch
  if (stopSensorWatch) {
    stopSensorWatch();
    stopSensorWatch = null;
  }

  // Compute final metrics
  const session = activeSession;
  const endedAt = Date.now();

  // Calculate total distance
  let totalDistance = 0;
  for (let i = 1; i < session.samples.length; i++) {
    const prev = session.samples[i - 1];
    const curr = session.samples[i];
    totalDistance += calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
  }

  // Calculate duration
  const durationSeconds = (endedAt - session.startedAt) / 1000;

  // Calculate classification stats
  const classificationStats = calculateClassificationStats(session.classificationCounts);

  // Calculate smoothness score and get insight
  const scoringResult = computeSmoothnessScore(session.samples);

  // Create completed session
  const completedSession: DriveSession = {
    id: session.id,
    startedAt: session.startedAt,
    endedAt,
    samplesCount: session.samples.length,
    distanceMeters: Math.round(totalDistance),
    durationSeconds: Math.round(durationSeconds),
    classificationStats,
    smoothnessScore: scoringResult.smoothnessScore,
    keyInsight: scoringResult.keyInsight,
  };

  // Clear state
  activeSession = null;
  lastLocationData = null;
  lastSample = null;
  hudUpdateCallback = null;

  return completedSession;
}

/**
 * Check if there's an active session
 */
export function isSessionActive(): boolean {
  return activeSession !== null;
}

/**
 * Get current session ID
 */
export function getCurrentSessionId(): string | null {
  return activeSession?.id ?? null;
}

/**
 * Get current sample count
 */
export function getCurrentSampleCount(): number {
  return activeSession?.samples.length ?? 0;
}
