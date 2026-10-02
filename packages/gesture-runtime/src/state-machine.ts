import {
  PadConfig,
  PadLifecycleState,
  CalibrationProfile,
  isPointInRect,
  InteractionMethod
} from '@beatwave/protocol';
import { KinematicFeatures } from './kinematics.js';

export interface PadFSMOutput {
  readonly previousState: PadLifecycleState;
  readonly currentState: PadLifecycleState;
  readonly triggered: boolean;
  readonly released: boolean;
  readonly velocity: number; // 0..1
  readonly method: InteractionMethod;
  readonly compression: number; // 0..1 for visual depth spring
  readonly hoverProximity: number; // 0..1
}

export class PadFSM {
  private state: PadLifecycleState = 'OUTSIDE';
  private cooldownUntilTimestampMs: number = 0;
  private activeHandId: number | null = null;
  private timeEnteredHoverMs: number = 0;
  private activeMethod: InteractionMethod = 'AIR_TAP';

  constructor(
    public readonly config: PadConfig,
    private calibration: CalibrationProfile
  ) {}

  public updateCalibration(calibration: CalibrationProfile): void {
    this.calibration = calibration;
  }

  public update(features: KinematicFeatures | null, confidence: number): PadFSMOutput {
    const prevState = this.state;
    const now = features ? features.timestampMs : 0;

    // Fail-safe: if hand tracking lost or confidence too low (< 0.4), return to OUTSIDE or RELEASE
    if (!features || confidence < 0.4) {
      if (this.state === 'HELD' || this.state === 'STRIKE') {
        this.state = 'RELEASE';
        this.cooldownUntilTimestampMs = now + this.calibration.cooldownMs;
        return {
          previousState: prevState,
          currentState: this.state,
          triggered: false,
          released: true,
          velocity: 0,
          method: 'AIR_TAP',
          compression: 0,
          hoverProximity: 0
        };
      }
      this.state = 'OUTSIDE';
      this.activeHandId = null;
      return {
        previousState: prevState,
        currentState: this.state,
        triggered: false,
        released: false,
        velocity: 0,
        method: 'AIR_TAP',
        compression: 0,
        hoverProximity: 0
      };
    }

    const pos = features.position;
    const insideRect = isPointInRect({ x: pos.x, y: pos.y }, this.config.bounds);

    // Compute hover proximity (0 to 1) based on distance to pad center and depth
    let hoverProximity = 0;
    if (insideRect) {
      const centerX = (this.config.bounds.minX + this.config.bounds.maxX) / 2;
      const centerY = (this.config.bounds.minY + this.config.bounds.maxY) / 2;
      const padRadiusX = (this.config.bounds.maxX - this.config.bounds.minX) / 2;
      const distCenter = Math.hypot(pos.x - centerX, pos.y - centerY) / padRadiusX;
      hoverProximity = Math.max(0, 1 - Math.min(1, distCenter));
    }

    let triggered = false;
    let released = false;
    let triggerVelocity = 0;
    let method: InteractionMethod = 'AIR_TAP';
    let compression = 0;

    // Apply sensitivity scaling to strike depth threshold
    const effectiveStrikeDepthZ = this.calibration.strikeDepthThresholdZ * (1 / this.calibration.sensitivity);
    const releaseThresholdZ = effectiveStrikeDepthZ + this.calibration.hysteresisDepthZ;

    // FSM Transition Logic
    switch (this.state) {
      case 'COOLDOWN': {
        if (now >= this.cooldownUntilTimestampMs) {
          this.state = insideRect ? 'HOVER' : 'OUTSIDE';
        }
        break;
      }

      case 'OUTSIDE': {
        if (insideRect) {
          this.state = 'HOVER';
          this.activeHandId = features.handId;
          this.timeEnteredHoverMs = now;
        }
        break;
      }

      case 'HOVER': {
        if (!insideRect) {
          this.state = 'OUTSIDE';
          this.activeHandId = null;
          break;
        }

        // Check PINCH TAP fallback
        if (features.pinchDistance < this.calibration.pinchThreshold && features.pinchRate > 0.1) {
          this.state = 'STRIKE';
          this.activeMethod = 'PINCH_TAP';
          triggered = true;
          method = 'PINCH_TAP';
          triggerVelocity = Math.min(1.0, Math.max(0.2, features.pinchRate * 0.8));
          compression = 1.0;
          break;
        }

        // Arming condition:
        // 1. Reached hover depth
        // 2. Forward strike speed > minStrikeVelocityZ
        // 3. Lateral speed < maxLateralVelocityXY (rejects lateral swipes)
        if (
          pos.z <= this.calibration.hoverDepthZ &&
          features.strikeSpeedZ >= this.calibration.minStrikeVelocityZ &&
          features.lateralSpeedXY <= this.calibration.maxLateralVelocityXY
        ) {
          this.state = 'ARMED';
        }
        break;
      }

      case 'ARMED': {
        if (!insideRect) {
          this.state = 'OUTSIDE';
          this.activeHandId = null;
          break;
        }

        // Strike condition: penetrated through virtual contact plane!
        if (pos.z <= effectiveStrikeDepthZ) {
          this.state = 'STRIKE';
          this.activeMethod = 'AIR_TAP';
          triggered = true;
          method = 'AIR_TAP';
          // Compute velocity proportional to strike impulse
          triggerVelocity = Math.min(1.0, Math.max(0.25, features.strikeSpeedZ * 0.9));
          compression = 1.0;
          break;
        }

        // If finger decelerated or backed away without hitting contact plane, return to HOVER
        if (features.strikeSpeedZ < -0.05 || pos.z > this.calibration.hoverDepthZ + 0.02) {
          this.state = 'HOVER';
        }
        break;
      }

      case 'STRIKE': {
        // Strike state is instantaneous, transitions immediately to HELD
        this.state = 'HELD';
        compression = 0.85;
        break;
      }

      case 'HELD': {
        compression = 0.7;

        // Release conditions:
        // 1. Fingertip pulled back past hysteresis release plane
        // 2. Fingertip exited pad bounds
        // 3. In pinch mode, pinch released
        const retracted = pos.z > releaseThresholdZ;
        const pinchReleased = features.pinchDistance > this.calibration.pinchThreshold * 1.3;

        if (!insideRect || retracted || (this.activeMethod === 'PINCH_TAP' && pinchReleased)) {
          this.state = 'RELEASE';
          released = true;
          this.cooldownUntilTimestampMs = now + this.calibration.cooldownMs;
        }
        break;
      }

      case 'RELEASE': {
        this.state = 'COOLDOWN';
        compression = 0.2;
        break;
      }
    }

    return {
      previousState: prevState,
      currentState: this.state,
      triggered,
      released,
      velocity: triggerVelocity,
      method,
      compression,
      hoverProximity
    };
  }

  public forceTrigger(method: InteractionMethod = 'POINTER_FALLBACK', velocity: number = 0.9): PadFSMOutput {
    const prevState = this.state;
    this.state = 'STRIKE';
    return {
      previousState: prevState,
      currentState: this.state,
      triggered: true,
      released: false,
      velocity,
      method,
      compression: 1.0,
      hoverProximity: 1.0
    };
  }

  public forceRelease(): PadFSMOutput {
    const prevState = this.state;
    this.state = 'RELEASE';
    return {
      previousState: prevState,
      currentState: this.state,
      triggered: false,
      released: true,
      velocity: 0,
      method: 'POINTER_FALLBACK',
      compression: 0,
      hoverProximity: 0
    };
  }

  public reset(): void {
    this.state = 'OUTSIDE';
    this.activeHandId = null;
    this.cooldownUntilTimestampMs = 0;
  }
}
