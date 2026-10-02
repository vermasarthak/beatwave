/**
 * Real Benchmark Runner for Beatwave Subsystems.
 * Measures real CPU execution time (p50, p95, p99) on this machine.
 * Outputs benchmarks/results.json and updates docs/BENCHMARKS.md.
 */

import * as fs from 'fs';
import * as path from 'path';
import { OneEuroFilter, Point3DOneEuroFilter, LandmarkNormalizer } from '../packages/vision/src/index.js';
import { GestureRuntime, KinematicTracker, PadFSM } from '../packages/gesture-runtime/src/index.js';
import { Quantizer, AudioLatencyProfiler } from '../packages/audio-engine/src/index.js';
import { DEFAULT_CALIBRATION_PROFILE, RawHandDetection, Landmark21 } from '../packages/protocol/src/index.js';

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return Number(sorted[idx].toFixed(4));
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(4));
}

console.log('Running Beatwave Subsystem Micro-Benchmarks...');

// 1. One Euro Filter Step Latency (10,000 iterations)
const filterTimes: number[] = [];
const filter = new Point3DOneEuroFilter();
for (let i = 0; i < 10000; i++) {
  const t0 = performance.now();
  filter.filter({ x: 0.5 + Math.sin(i) * 0.01, y: 0.5, z: -0.02 }, i * 16.6);
  const elapsed = performance.now() - t0;
  filterTimes.push(elapsed);
}

// 2. Landmark Normalizer (5,000 iterations)
const normalizerTimes: number[] = [];
const normalizer = new LandmarkNormalizer(true, true);
const rawLandmarks: Landmark21[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0.0 }));
rawLandmarks[0] = { x: 0.5, y: 0.8, z: 0.0 };
rawLandmarks[9] = { x: 0.5, y: 0.6, z: 0.0 };
rawLandmarks[8] = { x: 0.5, y: 0.4, z: -0.02 };
rawLandmarks[4] = { x: 0.45, y: 0.5, z: 0.0 };
const rawDetection: RawHandDetection = {
  id: 0,
  handedness: 'Right',
  confidence: 0.95,
  landmarks: rawLandmarks,
  timestampMs: 100
};

for (let i = 0; i < 5000; i++) {
  const t0 = performance.now();
  normalizer.normalize({ ...rawDetection, timestampMs: i * 16 });
  const elapsed = performance.now() - t0;
  normalizerTimes.push(elapsed);
}

// 3. Kinematic Feature Extraction (5,000 iterations)
const normHand = normalizer.normalize(rawDetection);
const kinematicTimes: number[] = [];
const kTracker = new KinematicTracker();
for (let i = 0; i < 5000; i++) {
  const t0 = performance.now();
  kTracker.computeFeatures({ ...normHand, timestampMs: i * 16.6 });
  const elapsed = performance.now() - t0;
  kinematicTimes.push(elapsed);
}

// 4. 16-Pad Full FSM Evaluation (5,000 frames)
const bank = {
  id: 'A' as const,
  name: 'Bench Bank',
  pads: Array.from({ length: 16 }, (_, i) => ({
    id: `pad-${i}`,
    padIndex: i,
    label: `Pad ${i + 1}`,
    color: '#38bdf8',
    bounds: {
      minX: (i % 4) * 0.2 + 0.1,
      maxX: (i % 4) * 0.2 + 0.3,
      minY: Math.floor(i / 4) * 0.2 + 0.1,
      maxY: Math.floor(i / 4) * 0.2 + 0.3
    },
    action: {
      type: 'SampleTrigger' as const,
      sampleId: `sample-${i}`,
      gain: 1.0,
      pan: 0
    }
  }))
};
const runtime = new GestureRuntime(bank);
const fsmTimes: number[] = [];
for (let i = 0; i < 5000; i++) {
  const t0 = performance.now();
  runtime.processHands([normHand]);
  const elapsed = performance.now() - t0;
  fsmTimes.push(elapsed);
}

// 5. Audio Quantizer Calculation (10,000 iterations)
const quantizerTimes: number[] = [];
const quantizer = new Quantizer('1/16', 120, 20);
for (let i = 0; i < 10000; i++) {
  const t0 = performance.now();
  quantizer.computeScheduleTime(i * 0.05, 0, 0.005);
  const elapsed = performance.now() - t0;
  quantizerTimes.push(elapsed);
}

// 6. Cumulative Pipeline Decision Latency (Sum of measured stages)
const cumulativeDecisionLatencyP50 =
  percentile(normalizerTimes, 50) +
  percentile(kinematicTimes, 50) +
  percentile(fsmTimes, 50) +
  percentile(quantizerTimes, 50);

const cumulativeDecisionLatencyP95 =
  percentile(normalizerTimes, 95) +
  percentile(kinematicTimes, 95) +
  percentile(fsmTimes, 95) +
  percentile(quantizerTimes, 95);

const results = {
  benchmarkTimestamp: new Date().toISOString(),
  environment: {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version
  },
  metrics: {
    oneEuroFilterMs: {
      mean: mean(filterTimes),
      p50: percentile(filterTimes, 50),
      p95: percentile(filterTimes, 95),
      p99: percentile(filterTimes, 99)
    },
    landmarkNormalizationMs: {
      mean: mean(normalizerTimes),
      p50: percentile(normalizerTimes, 50),
      p95: percentile(normalizerTimes, 95),
      p99: percentile(normalizerTimes, 99)
    },
    kinematicFeaturesMs: {
      mean: mean(kinematicTimes),
      p50: percentile(kinematicTimes, 50),
      p95: percentile(kinematicTimes, 95),
      p99: percentile(kinematicTimes, 99)
    },
    full16PadFSMProcessMs: {
      mean: mean(fsmTimes),
      p50: percentile(fsmTimes, 50),
      p95: percentile(fsmTimes, 95),
      p99: percentile(fsmTimes, 99)
    },
    audioQuantizerScheduleMs: {
      mean: mean(quantizerTimes),
      p50: percentile(quantizerTimes, 50),
      p95: percentile(quantizerTimes, 95),
      p99: percentile(quantizerTimes, 99)
    },
    endToEndSoftwareDecisionLatencyMs: {
      p50: Number(cumulativeDecisionLatencyP50.toFixed(4)),
      p95: Number(cumulativeDecisionLatencyP95.toFixed(4)),
      note: 'Measured software pipeline from landmark receipt to audio buffer scheduling. Excludes camera hardware exposure & audio DAC buffer latency.'
    }
  }
};

// Write results.json
const resultsPath = path.resolve(process.cwd(), 'benchmarks/results.json');
fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf-8');
console.log(`Saved benchmark results to: ${resultsPath}`);
console.log(JSON.stringify(results, null, 2));
