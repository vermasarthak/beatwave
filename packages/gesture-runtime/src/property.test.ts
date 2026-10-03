import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { PadFSM } from './state-machine.js';
import { DEFAULT_CALIBRATION_PROFILE, PadConfig } from '@beatwave/protocol';
import { KinematicFeatures } from './kinematics.js';

function makePadConfig(index: number = 0): PadConfig {
  return {
    id: `pad-${index}`,
    padIndex: index,
    label: `Pad ${index + 1}`,
    color: '#38bdf8',
    bounds: { minX: 0.2, maxX: 0.4, minY: 0.2, maxY: 0.4 },
    action: {
      type: 'SampleTrigger',
      sampleId: 'proc_kick',
      gain: 1.0,
      pan: 0
    }
  };
}

describe('Gesture Runtime Fast-Check Property Tests', () => {
  it('Property 1: A single physical strike can never emit multiple triggers without an intervening release', () => {
    fc.assert(
      fc.property(
        // Generate random sequence of depth penetration Z coordinates and strike speeds
        fc.array(
          fc.record({
            z: fc.double({ min: -0.15, max: 0.05 }),
            strikeSpeedZ: fc.double({ min: 0.0, max: 2.0 }),
            pinchDist: fc.double({ min: 0.1, max: 0.3 })
          }),
          { minLength: 10, maxLength: 50 }
        ),
        (frames) => {
          const fsm = new PadFSM(makePadConfig(0), DEFAULT_CALIBRATION_PROFILE);
          let triggerCountWithoutRelease = 0;
          let maxConcurrentTriggers = 0;
          let wasReleasedSinceLastTrigger = true;

          let timestamp = 0;
          for (const fr of frames) {
            timestamp += 33;
            const feat: KinematicFeatures = {
              handId: 1,
              timestampMs: timestamp,
              dtSec: 0.033,
              position: { x: 0.3, y: 0.3, z: fr.z },
              velocity: { x: 0, y: 0, z: -fr.strikeSpeedZ },
              lateralSpeedXY: 0.05,
              lateralSpeedX: 0.05,
              downwardSpeedY: 0,
              strikeSpeedZ: fr.strikeSpeedZ,
              accelerationZ: 0,
              pinchDistance: fr.pinchDist,
              pinchRate: 0,
              wristRollRad: 0
            };

            const out = fsm.update(feat, 0.95);

            if (out.triggered) {
              if (!wasReleasedSinceLastTrigger) {
                triggerCountWithoutRelease++;
              }
              wasReleasedSinceLastTrigger = false;
              maxConcurrentTriggers++;
            }

            if (out.released) {
              wasReleasedSinceLastTrigger = true;
            }
          }

          // Invariant: triggerCountWithoutRelease must always be 0
          return triggerCountWithoutRelease === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Low-confidence tracking states (< 0.4) never trigger a strike', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.0, max: 0.39 }),
        fc.double({ min: -0.2, max: -0.05 }), // Deep penetration
        fc.double({ min: 0.3, max: 2.0 }),   // High strike speed
        (confidence, z, vz) => {
          const fsm = new PadFSM(makePadConfig(0), DEFAULT_CALIBRATION_PROFILE);
          const feat: KinematicFeatures = {
            handId: 1,
            timestampMs: 100,
            dtSec: 0.033,
            position: { x: 0.3, y: 0.3, z },
            velocity: { x: 0, y: 0, z: -vz },
            lateralSpeedXY: 0.05,
            lateralSpeedX: 0.05,
            downwardSpeedY: 0,
            strikeSpeedZ: vz,
            accelerationZ: 0,
            pinchDistance: 0.15,
            pinchRate: 0,
            wristRollRad: 0
          };

          const out = fsm.update(feat, confidence);
          return out.triggered === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
