/**
 * Landmark geometry and spatial coordinate definitions.
 * MediaPipe hand landmark tracking yields 21 points in camera space.
 */

export interface Point3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Landmark21 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly visibility?: number;
}

export type Handedness = 'Left' | 'Right';

export interface RawHandDetection {
  readonly id: number;
  readonly handedness: Handedness;
  readonly confidence: number;
  readonly landmarks: readonly Landmark21[];
  readonly timestampMs: number;
}

export interface NormalizedHand {
  readonly id: number;
  readonly handedness: Handedness;
  readonly confidence: number;
  /** Normalized landmarks: origin at wrist (0), scaled by palm size */
  readonly landmarks: readonly Point3D[];
  /** Fingertip point in normalized 2.5D camera space [0..1, 0..1, z_relative] */
  readonly indexFingertip: Point3D;
  /** Distance between index tip (8) and thumb tip (4) */
  readonly pinchDistance: number;
  /** Palm center approximate coordinates */
  readonly palmCenter: Point3D;
  /** Estimated palm scale (wrist to middle MCP distance) */
  readonly palmScale: number;
  readonly timestampMs: number;
}

/** 2D Bounding box for pads in normalized camera coordinates [0..1] */
export interface Rect2D {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

export function isPointInRect(point: { x: number; y: number }, rect: Rect2D): boolean {
  return point.x >= rect.minX && point.x <= rect.maxX && point.y >= rect.minY && point.y <= rect.maxY;
}

export function euclideanDistance3D(a: Point3D, b: Point3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.hypot(dx, dy, dz);
}
