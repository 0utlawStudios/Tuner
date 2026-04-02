export const A4_FREQUENCY = 440;

export const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

// Tuning thresholds in cents
export const IN_TUNE_THRESHOLD = 5;
export const CLOSE_THRESHOLD = 15;

// Pitch detection config
export const CONFIDENCE_THRESHOLD = 0.85;
export const VOLUME_THRESHOLD = -50; // dB
export const EMA_ALPHA = 0.3;
export const HYSTERESIS_MS = 80;

// Gauge config
export const GAUGE_MIN_CENTS = -50;
export const GAUGE_MAX_CENTS = 50;
export const GAUGE_ARC_DEGREES = 180;
