import { describe, it, expect } from 'vitest';
import { PadFSM } from './state-machine.js';
import { KinematicFeatures } from './kinematics.js';
import { GestureRuntime } from './gesture-runtime.js';
import { DEFAULT_CALIBRATION_PROFILE, PadConfig } from '@beatwave/protocol';

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

function makeFeatures(
  x: number,
  y: number,
  z: number,
  strikeSpeedZ: number,
  lateralSpeedXY: number,
  timestampMs: number,
  pinchDist: number = 0.15
): KinematicFeatures {
  return {
    handId: 1,
    timestampMs,
    dtSec: 0.033,
    position: { x, y, z },
    velocity: { x: lateralSpeedXY, y: 0, z: -strikeSpeedZ },
    lateralSpeedXY,
    lateralSpeedX: lateralSpeedXY,
    downwardSpeedY: 0,
    strikeSpeedZ,
    accelerationZ: 0,
    pinchDistance: pinchDist,
    pinchRate: 0,
    wristRollRad: 0
  };
}

describe('PadFSM State Machine', () => {
  it('triggers on deliberate forward air tap and enters HELD', () => {
    const pad = makePadConfig(0);
    const fsm = new PadFSM(pad, DEFAULT_CALIBRATION_PROFILE);

    // 1. Outside
    let out = fsm.update(makeFeatures(0.1, 0.1, 0.0, 0, 0, 0), 0.9);
    expect(out.currentState).toBe('OUTSIDE');

    // 2. Hover into pad
    out = fsm.update(makeFeatures(0.3, 0.3, 0.0, 0, 0, 33), 0.9);
    expect(out.currentState).toBe('HOVER');

    // 3. Move forward past hover depth (-0.015) with forward velocity -> ARMED
    out = fsm.update(makeFeatures(0.3, 0.3, -0.02, 0.35, 0.1, 66), 0.9);
    expect(out.currentState).toBe('ARMED');

    // 4. Penetrate past strike depth threshold (-0.045) -> STRIKE!
    out = fsm.update(makeFeatures(0.3, 0.3, -0.05, 0.4, 0.1, 99), 0.9);
    expect(out.triggered).toBe(true);
    expect(out.method).toBe('AIR_TAP');

    // 5. Next frame remains HELD without retriggering
    out = fsm.update(makeFeatures(0.3, 0.3, -0.05, 0.0, 0.0, 132), 0.9);
    expect(out.currentState).toBe('HELD');
    expect(out.triggered).toBe(false);

    // 6. Retract past hysteresis release plane -> RELEASE
    out = fsm.update(makeFeatures(0.3, 0.3, -0.01, -0.2, 0.0, 165), 0.9);
    expect(out.released).toBe(true);
    expect(out.currentState).toBe('RELEASE');
  });

  it('rejects lateral swipe across pad without triggering', () => {
    const pad = makePadConfig(0);
    const fsm = new PadFSM(pad, DEFAULT_CALIBRATION_PROFILE);

    // Enter pad with high lateral speed (e.g. 2.0 > maxLateralVelocityXY = 1.2)
    fsm.update(makeFeatures(0.25, 0.3, -0.02, 0.3, 2.5, 33), 0.9);
    // Should NOT arm due to lateral velocity gate
    const out = fsm.update(makeFeatures(0.35, 0.3, -0.05, 0.3, 2.5, 66), 0.9);
    expect(out.triggered).toBe(false);
  });

  it('rejects trigger when tracking confidence is low (< 0.4)', () => {
    const pad = makePadConfig(0);
    const fsm = new PadFSM(pad, DEFAULT_CALIBRATION_PROFILE);

    // Deep penetration position but confidence 0.2
    const out = fsm.update(makeFeatures(0.3, 0.3, -0.06, 0.5, 0.1, 33), 0.2);
    expect(out.triggered).toBe(false);
    expect(out.currentState).toBe('OUTSIDE');
  });

  it('triggers on pinch tap when hovering pad', () => {
    const pad = makePadConfig(0);
    const fsm = new PadFSM(pad, DEFAULT_CALIBRATION_PROFILE);

    // Hover
    fsm.update(makeFeatures(0.3, 0.3, 0.0, 0, 0, 33, 0.15), 0.9);

    // Rapid pinch closing below threshold
    const feat = {
      ...makeFeatures(0.3, 0.3, 0.0, 0, 0, 66, 0.03),
      pinchRate: 0.5
    };
    const out = fsm.update(feat, 0.9);
    expect(out.triggered).toBe(true);
    expect(out.method).toBe('PINCH_TAP');
  });

  it('triggers on downward air-drum tap (Y-axis strike)', () => {
    const pad = makePadConfig(0);
    const fsm = new PadFSM(pad, DEFAULT_CALIBRATION_PROFILE);

    // Hover
    fsm.update(makeFeatures(0.3, 0.3, 0.0, 0, 0, 33), 0.9);

    // Downward flick with low lateral speed
    const feat: KinematicFeatures = {
      ...makeFeatures(0.3, 0.35, 0.0, 0, 0.1, 66),
      downwardSpeedY: 0.38,
      lateralSpeedX: 0.05
    };
    const out = fsm.update(feat, 0.9);
    expect(out.triggered).toBe(true);
    expect(out.currentState).toBe('STRIKE');
  });

  it('dynamically updates pad bounds and respects new hitboxes', () => {
    const pad = makePadConfig(0);
    const bank = { id: 'A' as const, name: 'Test Bank', pads: [pad] };
    let strikeDetected = false;
    const runtime = new GestureRuntime(bank, {
      onStrike: () => {
        strikeDetected = true;
      }
    });

    // Old bounds: 0.2 to 0.4. Test point at 0.7 (outside)
    const handOutside = {
      id: 1,
      confidence: 0.9,
      handedness: 'Right' as const,
      indexFingertip: { x: 0.7, y: 0.7, z: -0.05 },
      pinchDistance: 0.15,
      palmCenter: { x: 0.7, y: 0.7, z: 0 },
      palmScale: 0.2,
      landmarks: [],
      timestampMs: 33
    };
    runtime.processHands([handOutside]);
    expect(strikeDetected).toBe(false);

    // Update bounds to include (0.7, 0.7)
    runtime.updatePadBounds(0, { minX: 0.6, maxX: 0.8, minY: 0.6, maxY: 0.8 });

    // Now send downward strike inside new bounds
    const handInside = {
      ...handOutside,
      timestampMs: 66,
      indexFingertip: { x: 0.7, y: 0.75, z: -0.05 }
    };
    const res = runtime.processHands([handInside]);
    expect(res.padStates[0].state).not.toBe('OUTSIDE');
  });
});
