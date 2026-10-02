import { describe, it, expect } from 'vitest';
import { OneEuroFilter, Point3DOneEuroFilter } from './filter.js';
import { LandmarkNormalizer } from './normalizer.js';
import { RawHandDetection, Landmark21 } from '@beatwave/protocol';

describe('OneEuroFilter', () => {
  it('smooths high frequency noise at low speed', () => {
    const filter = new OneEuroFilter(1.0, 0.005, 1.0);
    const noisyValues = [0.5, 0.52, 0.49, 0.51, 0.48, 0.52];
    let filtered = 0.5;

    for (let i = 0; i < noisyValues.length; i++) {
      filtered = filter.filter(noisyValues[i], i * 33); // ~30 fps
    }

    // Filtered output should be closer to 0.5 than the extreme noise values
    expect(filtered).toBeGreaterThan(0.485);
    expect(filtered).toBeLessThan(0.515);
  });

  it('rapidly follows fast step changes without excessive lag', () => {
    const filter = new OneEuroFilter(1.0, 0.05, 1.0);
    // Initial static
    filter.filter(0.0, 0);
    filter.filter(0.0, 33);
    // Sudden jump (strike impulse)
    const val = filter.filter(1.0, 66);
    expect(val).toBeGreaterThan(0.18); // Dynamic beta boosts response relative to static cutoffs
  });

  it('filters 3D point coordinates', () => {
    const filter = new Point3DOneEuroFilter();
    const p1 = filter.filter({ x: 0.1, y: 0.2, z: -0.05 }, 0);
    expect(p1.x).toBeCloseTo(0.1);
    expect(p1.y).toBeCloseTo(0.2);
    expect(p1.z).toBeCloseTo(-0.05);
  });
});

describe('LandmarkNormalizer', () => {
  it('normalizes hand landmarks relative to wrist and palm scale', () => {
    const normalizer = new LandmarkNormalizer(false, false);

    // Create 21 synthetic landmarks
    const mockLandmarks: Landmark21[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0.0 }));
    // Wrist at (0.5, 0.8, 0.0)
    mockLandmarks[0] = { x: 0.5, y: 0.8, z: 0.0 };
    // Middle MCP (9) at (0.5, 0.6, 0.0) -> palm scale = 0.2
    mockLandmarks[9] = { x: 0.5, y: 0.6, z: 0.0 };
    // Index tip (8) at (0.5, 0.4, -0.02)
    mockLandmarks[8] = { x: 0.5, y: 0.4, z: -0.02 };
    // Thumb tip (4) at (0.45, 0.5, 0.0)
    mockLandmarks[4] = { x: 0.45, y: 0.5, z: 0.0 };

    const detection: RawHandDetection = {
      id: 0,
      handedness: 'Right',
      confidence: 0.9,
      landmarks: mockLandmarks,
      timestampMs: 100
    };

    const normalized = normalizer.normalize(detection);

    expect(normalized.palmScale).toBeCloseTo(0.2);
    // Relative wrist should be at (0, 0, 0)
    expect(normalized.landmarks[0].x).toBeCloseTo(0);
    expect(normalized.landmarks[0].y).toBeCloseTo(0);
    expect(normalized.landmarks[0].z).toBeCloseTo(0);

    // Index tip relative Z should be normalized by palmScale (-0.02 / 0.2 = -0.1)
    expect(normalized.landmarks[8].z).toBeCloseTo(-0.1);
  });
});
