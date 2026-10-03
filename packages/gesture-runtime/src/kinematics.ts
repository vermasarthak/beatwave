import { NormalizedHand, Point3D } from '@beatwave/protocol';

export interface KinematicFeatures {
  readonly handId: number;
  readonly timestampMs: number;
  readonly dtSec: number;
  /** Fingertip position */
  readonly position: Point3D;
  /** Velocity in palm units / sec */
  readonly velocity: Point3D;
  /** Lateral planar velocity: sqrt(vx^2 + vy^2) */
  readonly lateralSpeedXY: number;
  /** Horizontal lateral velocity: abs(vx) */
  readonly lateralSpeedX: number;
  /** Downward air-drum strike speed: vy (positive when flicking downward onto pad) */
  readonly downwardSpeedY: number;
  /** Forward strike speed: -vz (positive when striking forward into the screen) */
  readonly strikeSpeedZ: number;
  /** Acceleration in Z */
  readonly accelerationZ: number;
  /** Pinch distance in palm units */
  readonly pinchDistance: number;
  /** Pinch closing rate (positive when pinching closed) */
  readonly pinchRate: number;
  /** Wrist roll angle in radians */
  readonly wristRollRad: number;
}

export class KinematicTracker {
  private previousHand: NormalizedHand | null = null;
  private previousVelocityZ: number = 0;

  public computeFeatures(hand: NormalizedHand): KinematicFeatures {
    if (!this.previousHand || hand.timestampMs <= this.previousHand.timestampMs) {
      this.previousHand = hand;
      this.previousVelocityZ = 0;
      return {
        handId: hand.id,
        timestampMs: hand.timestampMs,
        dtSec: 0.016,
        position: hand.indexFingertip,
        velocity: { x: 0, y: 0, z: 0 },
        lateralSpeedXY: 0,
        lateralSpeedX: 0,
        downwardSpeedY: 0,
        strikeSpeedZ: 0,
        accelerationZ: 0,
        pinchDistance: hand.pinchDistance,
        pinchRate: 0,
        wristRollRad: this.estimateWristRoll(hand)
      };
    }

    const dtSec = Math.max(0.002, (hand.timestampMs - this.previousHand.timestampMs) / 1000);

    const vx = (hand.indexFingertip.x - this.previousHand.indexFingertip.x) / dtSec;
    const vy = (hand.indexFingertip.y - this.previousHand.indexFingertip.y) / dtSec;
    const vz = (hand.indexFingertip.z - this.previousHand.indexFingertip.z) / dtSec;

    const lateralSpeedXY = Math.hypot(vx, vy);
    const lateralSpeedX = Math.abs(vx);
    const downwardSpeedY = vy;
    // In camera space, forward toward the camera / screen contact plane is negative Z
    const strikeSpeedZ = -vz;

    const accelerationZ = (vz - this.previousVelocityZ) / dtSec;
    this.previousVelocityZ = vz;

    const pinchRate = (this.previousHand.pinchDistance - hand.pinchDistance) / dtSec;
    const wristRollRad = this.estimateWristRoll(hand);

    this.previousHand = hand;

    return {
      handId: hand.id,
      timestampMs: hand.timestampMs,
      dtSec,
      position: hand.indexFingertip,
      velocity: { x: vx, y: vy, z: vz },
      lateralSpeedXY,
      lateralSpeedX,
      downwardSpeedY,
      strikeSpeedZ,
      accelerationZ,
      pinchDistance: hand.pinchDistance,
      pinchRate,
      wristRollRad
    };
  }

  public reset(): void {
    this.previousHand = null;
    this.previousVelocityZ = 0;
  }

  private estimateWristRoll(hand: NormalizedHand): number {
    if (hand.landmarks.length < 18) return 0;
    // Landmark 5 (Index MCP) and Landmark 17 (Pinky MCP)
    const indexMCP = hand.landmarks[5];
    const pinkyMCP = hand.landmarks[17];
    const dx = pinkyMCP.x - indexMCP.x;
    const dy = pinkyMCP.y - indexMCP.y;
    return Math.atan2(dy, dx);
  }
}
