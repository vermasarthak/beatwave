import { CalibrationProfile, DEFAULT_CALIBRATION_PROFILE } from '@beatwave/protocol';
import { KinematicFeatures } from './kinematics.js';

export interface CalibrationSample {
  hoverDepthZ: number;
  strikeDepthZ: number;
  maxVelocityZ: number;
  pinchDist: number;
}

export class CalibrationManager {
  private profile: CalibrationProfile = { ...DEFAULT_CALIBRATION_PROFILE };
  private samples: CalibrationSample[] = [];

  constructor(initialProfile?: CalibrationProfile) {
    if (initialProfile) {
      this.profile = { ...initialProfile };
    }
  }

  public getProfile(): CalibrationProfile {
    return { ...this.profile };
  }

  public setSensitivity(sensitivity: number): void {
    this.profile = {
      ...this.profile,
      sensitivity: Math.max(0.4, Math.min(2.0, sensitivity))
    };
  }

  public setDominantHand(hand: 'Left' | 'Right'): void {
    this.profile = {
      ...this.profile,
      dominantHand: hand
    };
  }

  public recordCalibrationTap(hoverZ: number, strikeZ: number, maxVz: number, pinchDist: number): void {
    this.samples.push({
      hoverDepthZ: hoverZ,
      strikeDepthZ: strikeZ,
      maxVelocityZ: maxVz,
      pinchDist
    });

    if (this.samples.length >= 3) {
      this.computeCalibratedProfile();
    }
  }

  private computeCalibratedProfile(): void {
    const avgHoverZ = this.samples.reduce((a, b) => a + b.hoverDepthZ, 0) / this.samples.length;
    const avgStrikeZ = this.samples.reduce((a, b) => a + b.strikeDepthZ, 0) / this.samples.length;
    const avgVz = this.samples.reduce((a, b) => a + b.maxVelocityZ, 0) / this.samples.length;

    this.profile = {
      ...this.profile,
      hoverDepthZ: Number(avgHoverZ.toFixed(3)),
      strikeDepthThresholdZ: Number(avgStrikeZ.toFixed(3)),
      minStrikeVelocityZ: Number((avgVz * 0.4).toFixed(3))
    };
  }

  public resetToDefault(): void {
    this.profile = { ...DEFAULT_CALIBRATION_PROFILE };
    this.samples = [];
  }
}
