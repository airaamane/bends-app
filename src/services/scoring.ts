/**
 * Scoring and insight generation service.
 * Computes smoothness score and generates key insights.
 */

import type { Sample, ClassificationStats } from '../models/types';
import { calculateVariance, calculateStdDev } from './sensors';

// Weights for smoothness scoring components
const WEIGHT_ACCEL_VARIANCE = 0.4;
const WEIGHT_YAW_VARIANCE = 0.3;
const WEIGHT_SPEED_VARIANCE = 0.3;

// Thresholds for detecting issues
const HIGH_ACCEL_VARIANCE = 0.15; // g^2
const HIGH_YAW_VARIANCE = 0.05; // rad/s^2
const FREQUENT_LIFTS_THRESHOLD = 10; // number of detected lifts

export interface ScoringResult {
  smoothnessScore: number;
  keyInsight: string;
  details: {
    accelVariance: number;
    yawVariance: number;
    speedVariance: number;
    liftEvents: number;
    abruptInputs: number;
  };
}

/**
 * Compute smoothness score and generate insight from session samples.
 *
 * Score breakdown:
 * - 0-30: Very jerky, lots of issues
 * - 30-50: Room for improvement
 * - 50-70: Decent smoothness
 * - 70-85: Good flow
 * - 85-100: Excellent, smooth driving
 */
export function computeSmoothnessScore(samples: Sample[]): ScoringResult {
  if (samples.length < 10) {
    return {
      smoothnessScore: 50,
      keyInsight: 'Not enough data for detailed analysis. Try a longer drive.',
      details: {
        accelVariance: 0,
        yawVariance: 0,
        speedVariance: 0,
        liftEvents: 0,
        abruptInputs: 0,
      },
    };
  }

  // Extract data series
  const accelY = samples.map((s) => s.accelY ?? 0); // Longitudinal acceleration
  const yawRates = samples.map((s) => s.yawRate ?? 0);
  const speeds = samples.map((s) => s.speedMps);

  // Calculate variance for each metric
  const accelVariance = calculateVariance(accelY);
  const yawVariance = calculateVariance(yawRates);
  const speedVariance = calculateVariance(speeds);

  // Detect specific issues
  const liftEvents = detectLiftEvents(samples);
  const abruptInputs = detectAbruptInputs(samples);

  // Normalize variances to 0-1 scale (higher variance = worse)
  const normalizedAccel = Math.min(accelVariance / 0.3, 1);
  const normalizedYaw = Math.min(yawVariance / 0.1, 1);
  const normalizedSpeed = Math.min(speedVariance / 100, 1);

  // Calculate composite score (inverted: low variance = high score)
  const rawScore =
    (1 - normalizedAccel) * WEIGHT_ACCEL_VARIANCE +
    (1 - normalizedYaw) * WEIGHT_YAW_VARIANCE +
    (1 - normalizedSpeed) * WEIGHT_SPEED_VARIANCE;

  // Apply penalties for detected issues
  let penalty = 0;
  if (liftEvents > FREQUENT_LIFTS_THRESHOLD) {
    penalty += 0.1 * Math.min((liftEvents - FREQUENT_LIFTS_THRESHOLD) / 10, 0.2);
  }
  if (abruptInputs > 5) {
    penalty += 0.05 * Math.min(abruptInputs / 10, 0.15);
  }

  // Scale to 0-100
  const smoothnessScore = Math.round(Math.max(0, Math.min(100, (rawScore - penalty) * 100)));

  // Generate key insight
  const keyInsight = generateKeyInsight(
    accelVariance,
    yawVariance,
    liftEvents,
    abruptInputs,
    smoothnessScore
  );

  return {
    smoothnessScore,
    keyInsight,
    details: {
      accelVariance,
      yawVariance,
      speedVariance,
      liftEvents,
      abruptInputs,
    },
  };
}

/**
 * Detect mid-corner lift events (sudden deceleration in turns).
 * A lift event is when longitudinal accel goes significantly negative
 * while yaw rate indicates we're in a turn.
 */
function detectLiftEvents(samples: Sample[]): number {
  let liftCount = 0;
  const MIN_YAW_FOR_TURN = 0.05; // rad/s
  const LIFT_THRESHOLD = -0.15; // g

  for (let i = 1; i < samples.length; i++) {
    const current = samples[i];
    const yawRate = Math.abs(current.yawRate ?? 0);

    // Check if we're in a turn
    if (yawRate > MIN_YAW_FOR_TURN) {
      const accelY = current.accelY ?? 0;
      // Sudden deceleration while turning
      if (accelY < LIFT_THRESHOLD) {
        liftCount++;
      }
    }
  }

  return liftCount;
}

/**
 * Detect abrupt inputs (high rate of change in acceleration).
 */
function detectAbruptInputs(samples: Sample[]): number {
  let abruptCount = 0;
  const JERK_THRESHOLD = 0.3; // g/sample

  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1];
    const current = samples[i];

    const accelChange = Math.abs((current.accelY ?? 0) - (prev.accelY ?? 0));
    if (accelChange > JERK_THRESHOLD) {
      abruptCount++;
    }
  }

  return abruptCount;
}

/**
 * Generate a single key insight based on the most significant issue.
 * Only ONE insight per drive.
 */
function generateKeyInsight(
  accelVariance: number,
  yawVariance: number,
  liftEvents: number,
  abruptInputs: number,
  score: number
): string {
  // Excellent score - give positive feedback
  if (score >= 85) {
    return 'Smooth driving throughout. Your throttle and steering inputs were well-coordinated.';
  }

  // Identify the biggest issue
  const issues = [
    {
      priority: liftEvents > FREQUENT_LIFTS_THRESHOLD ? liftEvents : 0,
      insight:
        'Frequent mid-corner lifts detected. Try maintaining steadier throttle through turns.',
    },
    {
      priority: abruptInputs > 5 ? abruptInputs * 2 : 0,
      insight: 'Some abrupt throttle inputs noticed. Smoother transitions help maintain flow.',
    },
    {
      priority: accelVariance > HIGH_ACCEL_VARIANCE ? accelVariance * 100 : 0,
      insight: 'Stop-start throttle pattern detected. Try more progressive acceleration.',
    },
    {
      priority: yawVariance > HIGH_YAW_VARIANCE ? yawVariance * 100 : 0,
      insight: 'Steering corrections detected. Earlier turn-in might help find a smoother line.',
    },
  ];

  // Sort by priority (highest first)
  issues.sort((a, b) => b.priority - a.priority);

  // Return the most significant issue, or a default if nothing stands out
  if (issues[0].priority > 0) {
    return issues[0].insight;
  }

  // Default insights based on score range
  if (score >= 70) {
    return 'Good flow overall. Minor refinements could make it even smoother.';
  } else if (score >= 50) {
    return 'Decent drive. Focus on consistent throttle application for better flow.';
  } else {
    return 'Try to anticipate corners earlier and apply smoother inputs.';
  }
}

/**
 * Calculate classification statistics from samples.
 */
export function calculateClassificationStats(
  counts: { straight: number; flow: number; tight: number; transition: number }
): ClassificationStats {
  const total = counts.straight + counts.flow + counts.tight + counts.transition;

  if (total === 0) {
    return { straightPct: 0, flowPct: 0, tightPct: 0, transitionPct: 0 };
  }

  return {
    straightPct: Math.round((counts.straight / total) * 100),
    flowPct: Math.round((counts.flow / total) * 100),
    tightPct: Math.round((counts.tight / total) * 100),
    transitionPct: Math.round((counts.transition / total) * 100),
  };
}
