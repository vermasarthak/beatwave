import {
  RawHandDetection,
  NormalizedHand,
  Point3D,
  euclideanDistance3D
} from '@beatwave/protocol';
import { Point3DOneEuroFilter } from './filter.js';

export class LandmarkNormalizer {
  private readonly filters: Map<number, Point3DOneEuroFilter> = new Map();

  constructor(
    private readonly mirrorX: boolean = true,
    private readonly enableSmoothing: boolean = true
  ) {}

  public normalize(detection: RawHandDetection): NormalizedHand {
    const rawLandmarks = detection.landmarks;
    if (rawLandmarks.length < 21) {
      throw new Error(`Expected 21 landmarks, received ${rawLandmarks.length}`);
    }

    const wrist = rawLandmarks[0];
    const middleMCP = rawLandmarks[9];
    const indexTipRaw = rawLandmarks[8];
    const thumbTipRaw = rawLandmarks[4];

    // Palm scale: distance from wrist (0) to middle finger knuckle (9)
    const palmScale = Math.max(0.001, euclideanDistance3D(wrist, middleMCP));

    // Normalize all 21 landmarks relative to wrist and scaled by palm
    const normalizedLandmarks: Point3D[] = rawLandmarks.map((lm) => {
      let x = (lm.x - wrist.x) / palmScale;
      if (this.mirrorX) {
        x = -x;
      }
      return {
        x,
        y: (lm.y - wrist.y) / palmScale,
        z: (lm.z - wrist.z) / palmScale
      };
    });

    // Camera space fingertip coordinates for hit testing [0..1, 0..1, z_relative]
    let cameraFingertip: Point3D = {
      x: this.mirrorX ? 1.0 - indexTipRaw.x : indexTipRaw.x,
      y: indexTipRaw.y,
      z: indexTipRaw.z / palmScale
    };

    if (this.enableSmoothing) {
      let filter = this.filters.get(detection.id);
      if (!filter) {
        filter = new Point3DOneEuroFilter();
        this.filters.set(detection.id, filter);
      }
      cameraFingertip = filter.filter(cameraFingertip, detection.timestampMs);
    }

    // Pinch distance between index tip (8) and thumb tip (4)
    const pinchDistance = euclideanDistance3D(indexTipRaw, thumbTipRaw) / palmScale;

    // Palm center approximate (MCP 9)
    const palmCenter: Point3D = {
      x: this.mirrorX ? 1.0 - middleMCP.x : middleMCP.x,
      y: middleMCP.y,
      z: middleMCP.z / palmScale
    };

    return {
      id: detection.id,
      handedness: detection.handedness,
      confidence: detection.confidence,
      landmarks: normalizedLandmarks,
      indexFingertip: cameraFingertip,
      pinchDistance,
      palmCenter,
      palmScale,
      timestampMs: detection.timestampMs
    };
  }

  public resetHand(handId: number): void {
    this.filters.delete(handId);
  }

  public resetAll(): void {
    this.filters.clear();
  }
}
