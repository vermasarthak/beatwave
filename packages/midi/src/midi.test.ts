import { describe, it, expect, beforeEach } from 'vitest';
import { MockMidiAdapter } from './adapter.js';
import { MidiGestureMapper } from './mapping.js';

describe('MockMidiAdapter', () => {
  let adapter: MockMidiAdapter;

  beforeEach(() => {
    adapter = new MockMidiAdapter();
  });

  it('sends note on with clamped velocity', () => {
    adapter.sendNoteOn(60, 0.8, 1);
    expect(adapter.sentMessages).toHaveLength(1);
    expect(adapter.sentMessages[0]).toEqual({
      type: 'noteOn',
      data: [60, Math.round(0.8 * 127)],
      channel: 1
    });
  });

  it('sends note off', () => {
    adapter.sendNoteOff(60, 1);
    expect(adapter.sentMessages).toHaveLength(1);
    expect(adapter.sentMessages[0]).toEqual({
      type: 'noteOff',
      data: [60, 0],
      channel: 1
    });
  });
});

describe('MidiGestureMapper', () => {
  it('maps continuous gestures to MIDI CC controllers', () => {
    const adapter = new MockMidiAdapter();
    const mapper = new MidiGestureMapper(adapter);

    mapper.handleContinuousGesture({
      handId: 0,
      timestampMs: 100,
      pinchDistance: 0.05,
      wristRollRad: 0,
      verticalPositionNorm: 0.5
    });

    // Should emit CC for pinch, vertical position, and wrist roll
    expect(adapter.sentMessages.length).toBeGreaterThanOrEqual(3);
    const ccTypes = adapter.sentMessages.map((m) => m.type);
    expect(ccTypes.every((t) => t === 'cc')).toBe(true);
  });
});
