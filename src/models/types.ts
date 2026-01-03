/**
 * Core data models for MX5 Pocket
 */

// --- Sample Types ---

/**
 * A single sensor/GPS sample collected during a drive session.
 * Collected at ~250-500ms intervals.
 */
export interface Sample {
  /** Timestamp in milliseconds since epoch */
  t: number;
  /** Latitude in degrees */
  lat: number;
  /** Longitude in degrees */
  lon: number;
  /** Speed in meters per second */
  speedMps: number;
  /** Heading/bearing in degrees (0-360), null if unavailable */
  headingDeg: number | null;
  /** Accelerometer X (lateral, g-force) */
  accelX: number | null;
  /** Accelerometer Y (longitudinal, g-force) */
  accelY: number | null;
  /** Accelerometer Z (vertical, g-force) */
  accelZ: number | null;
  /** Gyroscope yaw rate in rad/s */
  yawRate: number | null;
}

// --- Road Classification ---

export type RoadClassification = 'Straight' | 'Flow' | 'Tight' | 'Transition';

/**
 * Statistics about time spent in each classification
 */
export interface ClassificationStats {
  straightPct: number;
  flowPct: number;
  tightPct: number;
  transitionPct: number;
}

// --- Gear & Rev Guidance ---

export type GearBand = '1st-2nd' | '2nd' | '2nd-3rd' | '3rd' | '3rd-4th' | '4th' | '4th-5th' | '5th';
export type RevZone = 'below' | 'optimal' | 'above';

// --- Car Profile ---

export type MX5Generation = 'NA' | 'NB' | 'NC' | 'ND';
export type EngineSize = '1.5' | '1.6' | '1.8' | '2.0';
export type Transmission = 'manual' | 'automatic';

export interface CarProfile {
  id: string;
  generation: MX5Generation;
  engine: EngineSize;
  transmission: Transmission;
  createdAt: number;
}

// --- Drive Session ---

/**
 * A completed drive session with computed metrics
 */
export interface DriveSession {
  id: string;
  /** Timestamp when session started */
  startedAt: number;
  /** Timestamp when session ended */
  endedAt: number;
  /** Total number of samples collected */
  samplesCount: number;
  /** Total distance in meters */
  distanceMeters: number;
  /** Duration in seconds */
  durationSeconds: number;
  /** Percentage breakdown of road classifications */
  classificationStats: ClassificationStats;
  /** Smoothness score 0-100 */
  smoothnessScore: number;
  /** Single key insight for the driver */
  keyInsight: string;
  /** Encoded polyline for map display (optional, for future use) */
  polyline?: string;
}

/**
 * Active session state during recording
 */
export interface ActiveSession {
  id: string;
  startedAt: number;
  samples: Sample[];
  /** Running classification counts */
  classificationCounts: {
    straight: number;
    flow: number;
    tight: number;
    transition: number;
  };
}

// --- Curated Routes ---

export type RouteDifficulty = 'easy' | 'moderate' | 'challenging';
export type BestTimeOfDay = 'morning' | 'midday' | 'evening' | 'any';
export type SurfaceCondition = 'excellent' | 'good' | 'variable';

export interface CuratedRoute {
  id: string;
  name: string;
  region: string;
  country: string;
  description: string;
  /** Why this route is special */
  whySpecial: string;
  difficulty: RouteDifficulty;
  bestTimeOfDay: BestTimeOfDay;
  surfaceCondition: SurfaceCondition;
  /** Approximate length in km */
  lengthKm: number;
  /** Approximate duration in minutes */
  durationMinutes: number;
  /** Surface notes (e.g., "Watch for gravel on hairpins") */
  surfaceNotes: string;
  /** Start point coordinates for future map integration */
  startLat?: number;
  startLon?: number;
}

// --- Live HUD State ---

export interface HudState {
  speedKmh: number;
  classification: RoadClassification;
  gearBand: GearBand;
  revZone: RevZone;
  isRecording: boolean;
}
