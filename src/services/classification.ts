/**
 * Road classification service.
 * Classifies road segments as Straight, Flow, Tight, or Transition
 * based on GPS heading changes and sensor data.
 */

import type { Sample, RoadClassification, GearBand, RevZone } from '../models/types';
import { normalizeHeadingDelta, calculateDistance } from './location';

// Classification thresholds (tuned for MX-5 driving feel)
const CURVATURE_STRAIGHT_MAX = 0.5; // deg/m threshold for straight
const CURVATURE_FLOW_MAX = 2.0; // deg/m threshold for flow curves
const CURVATURE_TIGHT_MIN = 2.0; // deg/m threshold for tight curves
const YAW_RATE_FLOW_MIN = 0.05; // rad/s for confirming flow
const YAW_RATE_TIGHT_MIN = 0.15; // rad/s for confirming tight

// Smoothing window size (number of samples)
const SMOOTHING_WINDOW = 5;

// Recent classifications for smoothing
let recentClassifications: RoadClassification[] = [];

/**
 * Calculate curvature score from heading change over distance.
 * @returns Curvature in degrees per meter
 */
function calculateCurvatureScore(
  headingDelta: number,
  distanceMeters: number
): number {
  if (distanceMeters < 1) return 0;
  return Math.abs(headingDelta) / distanceMeters;
}

/**
 * Classify current road segment based on recent samples.
 * Uses heading changes and optionally yaw rate for confirmation.
 */
export function classifyRoad(
  currentSample: Sample,
  previousSample: Sample | null
): RoadClassification {
  // Not enough data - default to Straight
  if (!previousSample) {
    return 'Straight';
  }

  // Calculate distance between samples
  const distance = calculateDistance(
    previousSample.lat,
    previousSample.lon,
    currentSample.lat,
    currentSample.lon
  );

  // Calculate heading change if available
  let curvatureScore = 0;
  if (currentSample.headingDeg !== null && previousSample.headingDeg !== null) {
    const headingDelta = normalizeHeadingDelta(
      previousSample.headingDeg,
      currentSample.headingDeg
    );
    curvatureScore = calculateCurvatureScore(headingDelta, distance);
  }

  // Get yaw rate for confirmation (optional)
  const yawRate = Math.abs(currentSample.yawRate ?? 0);

  // Classify based on thresholds
  let rawClassification: RoadClassification;

  if (curvatureScore < CURVATURE_STRAIGHT_MAX && yawRate < YAW_RATE_FLOW_MIN) {
    rawClassification = 'Straight';
  } else if (curvatureScore >= CURVATURE_TIGHT_MIN || yawRate >= YAW_RATE_TIGHT_MIN) {
    rawClassification = 'Tight';
  } else if (curvatureScore >= CURVATURE_STRAIGHT_MAX || yawRate >= YAW_RATE_FLOW_MIN) {
    rawClassification = 'Flow';
  } else {
    rawClassification = 'Straight';
  }

  // Apply smoothing to avoid flicker
  return applySmoothing(rawClassification);
}

/**
 * Apply smoothing using moving mode (most common recent value).
 * Also detects transitions between states.
 */
function applySmoothing(classification: RoadClassification): RoadClassification {
  recentClassifications.push(classification);

  // Keep only last N samples
  if (recentClassifications.length > SMOOTHING_WINDOW) {
    recentClassifications = recentClassifications.slice(-SMOOTHING_WINDOW);
  }

  // Not enough samples yet
  if (recentClassifications.length < 3) {
    return classification;
  }

  // Count occurrences
  const counts: Record<RoadClassification, number> = {
    Straight: 0,
    Flow: 0,
    Tight: 0,
    Transition: 0,
  };

  for (const c of recentClassifications) {
    counts[c]++;
  }

  // Detect transition: if we have a mix of very different states
  const hasStraight = counts.Straight > 0;
  const hasTight = counts.Tight > 0;
  const hasFlow = counts.Flow > 0;

  // If we're switching between Straight and Tight directly, it's a transition
  if (hasStraight && hasTight && !hasFlow) {
    return 'Transition';
  }

  // Return the most common classification
  let maxCount = 0;
  let result: RoadClassification = 'Straight';

  for (const [key, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      result = key as RoadClassification;
    }
  }

  return result;
}

/**
 * Reset classification state (call when starting new session)
 */
export function resetClassification(): void {
  recentClassifications = [];
}

/**
 * Suggest gear band based on current speed and classification.
 * This is abstract guidance, not exact RPM-based.
 */
export function suggestGearBand(
  speedKmh: number,
  classification: RoadClassification
): GearBand {
  // Base gear selection on speed
  // Adjusted for spirited driving (keeping revs in "fun zone")

  if (speedKmh < 20) {
    return '1st-2nd';
  } else if (speedKmh < 35) {
    return '2nd';
  } else if (speedKmh < 50) {
    // In tight corners, suggest staying in 2nd longer
    if (classification === 'Tight') {
      return '2nd';
    }
    return '2nd-3rd';
  } else if (speedKmh < 65) {
    return '3rd';
  } else if (speedKmh < 85) {
    // In flow sections, 3rd is often more engaging
    if (classification === 'Flow') {
      return '3rd';
    }
    return '3rd-4th';
  } else if (speedKmh < 100) {
    return '4th';
  } else if (speedKmh < 120) {
    return '4th-5th';
  } else {
    return '5th';
  }
}

/**
 * Determine rev zone based on speed, gear band, and driving context.
 * Abstract guidance: below/optimal/above the "fun zone"
 */
export function determineRevZone(
  speedKmh: number,
  classification: RoadClassification
): RevZone {
  // This is simplified heuristic guidance
  // In real implementation, this would be tuned per generation/engine

  // When approaching a tight section, being in higher revs is good
  if (classification === 'Tight' && speedKmh > 40 && speedKmh < 70) {
    return 'optimal';
  }

  // In flow sections, we want to be in the meat of the powerband
  if (classification === 'Flow') {
    if (speedKmh < 30) return 'below';
    if (speedKmh > 90) return 'above';
    return 'optimal';
  }

  // On straights, optimal cruising is fine
  if (classification === 'Straight') {
    return 'optimal';
  }

  return 'optimal';
}
