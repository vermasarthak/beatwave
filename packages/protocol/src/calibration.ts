import { Handedness } from './geometry.js';

export interface CalibrationProfile {
  readonly dominantHand: Handedness;
  /** Normalized Z hover plane reference (typically -0.01 to -0.03 in palm-normalized units) */
  readonly hoverDepthZ: number;
  /** Forward Z threshold to trigger STRIKE (typically -0.04 to -0.06) */
  readonly strikeDepthThresholdZ: number;
  /** Minimum downward Z velocity (units/sec) to arm strike */
  readonly minStrikeVelocityZ: number;
  /** Maximum allowable XY lateral drift velocity to distinguish strike from swipe */
  readonly maxLateralVelocityXY: number;
  /** Distance threshold between index tip and thumb tip to trigger pinch tap */
  readonly pinchThreshold: number;
  /** Cooldown time after release before the same pad can re-arm (ms) */
  readonly cooldownMs: number;
  /** Hysteresis depth offset for release (must retract past strikeDepth + hysteresis) */
  readonly hysteresisDepthZ: number;
  /** Sensitivity multiplier: 0.5 (firm/resistant) to 1.5 (light/hair-trigger) */
  readonly sensitivity: number;
}

export const DEFAULT_CALIBRATION_PROFILE: CalibrationProfile = {
  dominantHand: 'Right',
  hoverDepthZ: -0.015,
  strikeDepthThresholdZ: -0.045,
  minStrikeVelocityZ: 0.28,
  maxLateralVelocityXY: 1.2,
  pinchThreshold: 0.055,
  cooldownMs: 80,
  hysteresisDepthZ: 0.018,
  sensitivity: 1.0
};
