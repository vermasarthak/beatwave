import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Quantizer } from './quantizer.js';
import { PerformanceRecorder } from './recorder.js';
import { AudioLatencyProfiler } from './profiler.js';
import { IncompatibleSourceCapabilityError } from '@beatwave/protocol';

describe('Quantizer', () => {
  it('schedules immediately when quantize is off', () => {
    const quantizer = new Quantizer('off', 120);
    const scheduled = quantizer.computeScheduleTime(10.0, 0, 0.005);
    expect(scheduled).toBeCloseTo(10.005);
  });

  it('correctly quantizes to 1/4 notes at 120 bpm', () => {
    // 120 bpm = 2 beats per sec = 0.5s per beat
    const quantizer = new Quantizer('1/4', 120);
    // At t = 0.2s, next 1/4 note is at 0.5s
    const scheduled = quantizer.computeScheduleTime(0.2, 0, 0.005);
    expect(scheduled).toBeCloseTo(0.5);
  });

  it('correctly quantizes to 1/16 notes at 120 bpm', () => {
    // 1/16 note = 0.5 / 4 = 0.125s
    const quantizer = new Quantizer('1/16', 120);
    // At t = 0.13s, next 1/16 note is at 0.25s
    const scheduled = quantizer.computeScheduleTime(0.13, 0, 0.005);
    expect(scheduled).toBeCloseTo(0.25);
  });

  it('never schedules in the past', () => {
    const quantizer = new Quantizer('1/8', 120);
    const scheduled = quantizer.computeScheduleTime(1.24, 0, 0.01);
    expect(scheduled).toBeGreaterThanOrEqual(1.25);
  });
});

describe('PerformanceRecorder & MIDI Export', () => {
  it('records performance strikes and exports valid Standard MIDI File bytes', () => {
    const recorder = new PerformanceRecorder();
    recorder.start(0);

    recorder.recordEvent(
      {
        padIndex: 0,
        handId: 1,
        timestampMs: 100,
        audioContextTimeSec: 0.1,
        velocity: 0.9,
        method: 'AIR_TAP',
        confidence: 0.95,
        action: {
          type: 'SampleTrigger',
          sampleId: 'proc_kick',
          gain: 1.0,
          pan: 0
        }
      },
      'A',
      'proc_kick'
    );

    const midiBytes = recorder.exportMidiFile(120);
    expect(midiBytes).toBeInstanceOf(Uint8Array);
    expect(midiBytes.length).toBeGreaterThan(14); // Header is 14 bytes

    // Check 'MThd' header
    expect(String.fromCharCode(midiBytes[0], midiBytes[1], midiBytes[2], midiBytes[3])).toBe('MThd');
  });
});

describe('AudioLatencyProfiler', () => {
  it('calculates mean, p50, and p95 jitter', () => {
    const profiler = new AudioLatencyProfiler();
    profiler.recordSchedule(1000, 1.005, 1.0); // 5ms
    profiler.recordSchedule(1050, 1.006, 1.0); // 6ms
    profiler.recordSchedule(1100, 1.004, 1.0); // 4ms
    profiler.recordSchedule(1150, 1.010, 1.0); // 10ms

    const stats = profiler.getStats();
    expect(stats.count).toBe(4);
    expect(stats.p50Ms).toBeGreaterThan(0);
    expect(stats.p95Ms).toBeGreaterThanOrEqual(stats.p50Ms);
  });
});

describe('Kanye West Signature Kits', () => {
  it('defines 5 kits each with exactly 16 pads and unique IDs', async () => {
    const { ALL_KITS } = await import('./procedural-kit.js');
    expect(ALL_KITS.length).toBe(5);
    for (const kit of ALL_KITS) {
      expect(kit.samples.length).toBe(16);
      expect(kit.name.length).toBeGreaterThan(0);
      expect(kit.bpm).toBeGreaterThan(40);
      const ids = new Set(kit.samples.map((s) => s.id));
      expect(ids.size).toBe(16);
    }
  });

  it('includes signature vocal samples and backing track URLs for Flashing Lights, POWER, and Runaway', async () => {
    const { FLASHING_LIGHTS_KIT, POWER_KIT, RUNAWAY_KIT, HEARTBREAK_KIT } = await import('./procedural-kit.js');
    
    // Check Flashing Lights vocals & backing
    expect(FLASHING_LIGHTS_KIT.backingTrackUrl).toBe('/audio/backing/flashing_lights_instrumental.wav');
    const flIds = FLASHING_LIGHTS_KIT.samples.map((s) => s.id);
    expect(flIds).toContain('fl_vocal_0');
    expect(flIds).toContain('fl_vocal_4');
    expect(flIds).toContain('fl_vocal_15');

    // Check POWER vocals & backing
    expect(POWER_KIT.backingTrackUrl).toBe('/audio/backing/power_instrumental.wav');
    const powIds = POWER_KIT.samples.map((s) => s.id);
    expect(powIds).toContain('pow_vocal_0');
    expect(powIds).toContain('pow_vocal_5');
    expect(powIds).toContain('pow_vocal_6');

    // Check Runaway vocals & backing
    expect(RUNAWAY_KIT.backingTrackUrl).toBe('/audio/backing/runaway_instrumental.wav');
    const runIds = RUNAWAY_KIT.samples.map((s) => s.id);
    expect(runIds).toContain('run_vocal_0');
    expect(runIds).toContain('run_vocal_6');
    expect(runIds).toContain('run_vocal_13');

    // Check 808s Heartbreak
    const hbIds = HEARTBREAK_KIT.samples.map((s) => s.id);
    expect(hbIds).toContain('hb_taiko_low');
  });
});

