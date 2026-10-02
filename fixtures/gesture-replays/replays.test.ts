import { describe, it, expect } from 'vitest';
import {
  createDeliberateStrikeDataset,
  createSlowHoverDataset,
  createLateralSwipeDataset,
  createHandJitterDataset,
  createPinchTapDataset,
  createTrackingLossDataset
} from './generate_replays.js';
import { GestureRuntime, ReplayRunner } from '@beatwave/gesture-runtime';
import { PadBank } from '@beatwave/protocol';

function makeTestBank(): PadBank {
  return {
    id: 'A',
    name: 'Test Bank',
    pads: Array.from({ length: 16 }, (_, i) => ({
      id: `pad-${i}`,
      padIndex: i,
      label: `Pad ${i + 1}`,
      color: '#38bdf8',
      // Pad 0: minX 0.1, maxX 0.3, minY 0.1, maxY 0.3
      // Pad 1: minX 0.3, maxX 0.5, minY 0.1, maxY 0.3, etc.
      bounds: {
        minX: (i % 4) * 0.2 + 0.1,
        maxX: (i % 4) * 0.2 + 0.3,
        minY: Math.floor(i / 4) * 0.2 + 0.1,
        maxY: Math.floor(i / 4) * 0.2 + 0.3
      },
      action: {
        type: 'SampleTrigger',
        sampleId: `sample-${i}`,
        gain: 1.0,
        pan: 0
      }
    }))
  };
}

describe('Deterministic Trajectory Replay Suite', () => {
  const bank = makeTestBank();

  it('correctly triggers on deliberate strike', () => {
    const runtime = new GestureRuntime(bank);
    const dataset = createDeliberateStrikeDataset();
    const result = ReplayRunner.runReplay(runtime, dataset);

    expect(result.matchesExpected).toBe(true);
    expect(result.recordedStrikes).toHaveLength(1);
    expect(result.recordedStrikes[0].padIndex).toBe(0);
    expect(result.recordedStrikes[0].method).toBe('AIR_TAP');
  });

  it('produces zero triggers during slow hover', () => {
    const runtime = new GestureRuntime(bank);
    const dataset = createSlowHoverDataset();
    const result = ReplayRunner.runReplay(runtime, dataset);

    expect(result.matchesExpected).toBe(true);
    expect(result.recordedStrikes).toHaveLength(0);
    expect(result.falseTriggerCount).toBe(0);
  });

  it('rejects lateral swipe without triggering any pad', () => {
    const runtime = new GestureRuntime(bank);
    const dataset = createLateralSwipeDataset();
    const result = ReplayRunner.runReplay(runtime, dataset);

    expect(result.matchesExpected).toBe(true);
    expect(result.recordedStrikes).toHaveLength(0);
  });

  it('rejects hand jitter without triggering', () => {
    const runtime = new GestureRuntime(bank);
    const dataset = createHandJitterDataset();
    const result = ReplayRunner.runReplay(runtime, dataset);

    expect(result.matchesExpected).toBe(true);
    expect(result.recordedStrikes).toHaveLength(0);
  });

  it('triggers on pinch tap fallback', () => {
    const runtime = new GestureRuntime(bank);
    const dataset = createPinchTapDataset();
    const result = ReplayRunner.runReplay(runtime, dataset);

    expect(result.matchesExpected).toBe(true);
    expect(result.recordedStrikes).toHaveLength(1);
    expect(result.recordedStrikes[0].method).toBe('PINCH_TAP');
  });

  it('prevents false trigger on tracking reacquisition deep in contact plane', () => {
    const runtime = new GestureRuntime(bank);
    const dataset = createTrackingLossDataset();
    const result = ReplayRunner.runReplay(runtime, dataset);

    expect(result.matchesExpected).toBe(true);
    expect(result.recordedStrikes).toHaveLength(0);
  });
});
