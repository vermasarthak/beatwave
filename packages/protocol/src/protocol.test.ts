import { describe, it, expect } from 'vitest';
import {
  assertSourceCapability,
  IncompatibleSourceCapabilityError,
  SOURCE_CAPABILITIES
} from './capabilities.js';
import { isPointInRect, euclideanDistance3D } from './geometry.js';
import { BeatwaveSessionSchema } from './session.js';
import { DEFAULT_CALIBRATION_PROFILE } from './calibration.js';

describe('AudioSourceCapabilities', () => {
  it('allows local and procedural sources to execute slicing and decoded audio', () => {
    expect(() => assertSourceCapability('local', 'decodedAudio', 'SampleTrigger')).not.toThrow();
    expect(() => assertSourceCapability('procedural', 'slicing', 'SliceKit')).not.toThrow();
  });

  it('strictly rejects Spotify source for decoded audio or slicing', () => {
    expect(() => assertSourceCapability('spotify', 'decodedAudio', 'SampleTrigger')).toThrow(
      IncompatibleSourceCapabilityError
    );
    expect(() => assertSourceCapability('spotify', 'slicing', 'AutoKit')).toThrow(
      IncompatibleSourceCapabilityError
    );
    expect(() => assertSourceCapability('spotify', 'recording', 'RecordAudio')).toThrow(
      IncompatibleSourceCapabilityError
    );
  });

  it('permits transport operations for Spotify', () => {
    expect(() => assertSourceCapability('spotify', 'transport', 'TransportPlayPause')).not.toThrow();
  });
});

describe('Geometry Utils', () => {
  it('correctly tests point in bounding rect', () => {
    const rect = { minX: 0.2, maxX: 0.4, minY: 0.3, maxY: 0.5 };
    expect(isPointInRect({ x: 0.3, y: 0.4 }, rect)).toBe(true);
    expect(isPointInRect({ x: 0.1, y: 0.4 }, rect)).toBe(false);
    expect(isPointInRect({ x: 0.3, y: 0.6 }, rect)).toBe(false);
  });

  it('calculates 3D Euclidean distance', () => {
    const a = { x: 0, y: 0, z: 0 };
    const b = { x: 1, y: 2, z: 2 };
    expect(euclideanDistance3D(a, b)).toBeCloseTo(3.0);
  });
});

describe('Session Schema Validation', () => {
  it('validates a correct Beatwave project structure', () => {
    const validSession = {
      version: '1.0.0' as const,
      projectId: 'proj-123',
      title: 'Demo Session',
      bpm: 120,
      quantize: '1/16' as const,
      masterGain: 1.0,
      sourceType: 'procedural' as const,
      banks: [
        {
          id: 'A' as const,
          name: 'Main Kit',
          pads: Array.from({ length: 16 }, (_, i) => ({
            id: `pad-${i}`,
            padIndex: i,
            label: `Pad ${i + 1}`,
            color: '#38bdf8',
            bounds: { minX: 0, maxX: 0.25, minY: 0, maxY: 0.25 },
            action: {
              type: 'SampleTrigger' as const,
              sampleId: `sample-${i}`,
              gain: 1.0,
              pan: 0.0
            }
          }))
        }
      ],
      calibration: DEFAULT_CALIBRATION_PROFILE,
      exportedAt: new Date().toISOString()
    };

    const parsed = BeatwaveSessionSchema.safeParse(validSession);
    expect(parsed.success).toBe(true);
  });

  it('fails validation when bank has invalid pad count', () => {
    const invalidSession = {
      version: '1.0.0',
      projectId: 'proj-bad',
      title: 'Bad Session',
      bpm: 120,
      quantize: 'off',
      masterGain: 1.0,
      sourceType: 'local',
      banks: [
        {
          id: 'A',
          name: 'Incomplete',
          pads: [] // Invalid length
        }
      ],
      calibration: DEFAULT_CALIBRATION_PROFILE,
      exportedAt: new Date().toISOString()
    };
    const parsed = BeatwaveSessionSchema.safeParse(invalidSession);
    expect(parsed.success).toBe(false);
  });
});
