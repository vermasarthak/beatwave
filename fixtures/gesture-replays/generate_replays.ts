import * as fs from 'fs';
import * as path from 'path';
import { NormalizedHand, Point3D } from '@beatwave/protocol';
import { ReplayDataset, TrajectoryFrame } from '@beatwave/gesture-runtime';

function makeLandmarks(x: number, y: number, z: number): Point3D[] {
  // 21 landmarks
  return Array.from({ length: 21 }, (_, i) => {
    if (i === 8) return { x, y, z }; // Index tip
    if (i === 4) return { x: x - 0.05, y: y + 0.02, z }; // Thumb tip
    if (i === 0) return { x: 0, y: 0, z: 0 }; // Wrist
    if (i === 9) return { x: 0, y: -0.2, z: 0 }; // Middle MCP
    return { x: 0, y: 0, z: 0 };
  });
}

function makeHand(
  timestampMs: number,
  x: number,
  y: number,
  z: number,
  pinchDist: number = 0.15,
  confidence: number = 0.95
): NormalizedHand {
  return {
    id: 1,
    handedness: 'Right',
    confidence,
    landmarks: makeLandmarks(x, y, z),
    indexFingertip: { x, y, z },
    pinchDistance: pinchDist,
    palmCenter: { x, y: y + 0.1, z },
    palmScale: 0.2,
    timestampMs
  };
}

// 1. Deliberate Strike on Pad 0 (bounds: x: 0.1..0.3, y: 0.1..0.3)
export function createDeliberateStrikeDataset(): ReplayDataset {
  const frames: TrajectoryFrame[] = [];
  // Enter hover at t=0
  frames.push({ timestampMs: 0, hand: makeHand(0, 0.2, 0.2, 0.0) });
  frames.push({ timestampMs: 33, hand: makeHand(33, 0.2, 0.2, -0.01) });
  // Accelerating forward into contact plane (-0.045)
  frames.push({ timestampMs: 66, hand: makeHand(66, 0.2, 0.2, -0.025) });
  frames.push({ timestampMs: 99, hand: makeHand(99, 0.2, 0.2, -0.055) }); // Strike!
  // Held
  frames.push({ timestampMs: 132, hand: makeHand(132, 0.2, 0.2, -0.052) });
  // Retract
  frames.push({ timestampMs: 165, hand: makeHand(165, 0.2, 0.2, -0.01) });
  frames.push({ timestampMs: 198, hand: makeHand(198, 0.2, 0.2, 0.0) });

  return {
    name: 'deliberate_strike',
    description: 'Deliberate forward air-tap into Pad 0 virtual contact plane',
    expectedTriggers: [{ padIndex: 0, approximateTimestampMs: 99, method: 'AIR_TAP' }],
    frames
  };
}

// 2. Slow Hover (No Strike)
export function createSlowHoverDataset(): ReplayDataset {
  const frames: TrajectoryFrame[] = [];
  for (let t = 0; t <= 300; t += 33) {
    frames.push({ timestampMs: t, hand: makeHand(t, 0.2, 0.2, 0.005) });
  }
  return {
    name: 'slow_hover',
    description: 'Fingertip hovers inside pad above contact plane; must not trigger',
    expectedTriggers: [],
    frames
  };
}

// 3. Lateral Swipe (Fast horizontal motion across pads)
export function createLateralSwipeDataset(): ReplayDataset {
  const frames: TrajectoryFrame[] = [];
  // Moves from x=0.05 to x=0.85 in 100ms (v_x = 8.0 palm units/sec)
  const xCoords = [0.05, 0.25, 0.45, 0.65, 0.85];
  xCoords.forEach((x, i) => {
    frames.push({ timestampMs: i * 33, hand: makeHand(i * 33, x, 0.2, -0.05) });
  });
  return {
    name: 'lateral_swipe',
    description: 'Rapid lateral swipe across launchpad; must be rejected by lateral speed gate',
    expectedTriggers: [],
    frames
  };
}

// 4. Hand Jitter
export function createHandJitterDataset(): ReplayDataset {
  const frames: TrajectoryFrame[] = [];
  for (let i = 0; i < 15; i++) {
    const t = i * 33;
    const jitterZ = -0.01 + (Math.sin(i) * 0.004);
    frames.push({ timestampMs: t, hand: makeHand(t, 0.2, 0.2, jitterZ) });
  }
  return {
    name: 'hand_jitter',
    description: 'Micro-movements and tremor around hover plane; must not trigger',
    expectedTriggers: [],
    frames
  };
}

// 5. Pinch Tap
export function createPinchTapDataset(): ReplayDataset {
  const frames: TrajectoryFrame[] = [];
  frames.push({ timestampMs: 0, hand: makeHand(0, 0.2, 0.2, 0.0, 0.15) });
  frames.push({ timestampMs: 33, hand: makeHand(33, 0.2, 0.2, 0.0, 0.12) });
  // Fast pinch closing
  frames.push({ timestampMs: 66, hand: makeHand(66, 0.2, 0.2, 0.0, 0.03) }); // Pinch!
  frames.push({ timestampMs: 99, hand: makeHand(99, 0.2, 0.2, 0.0, 0.03) });
  frames.push({ timestampMs: 132, hand: makeHand(132, 0.2, 0.2, 0.0, 0.14) }); // Release
  return {
    name: 'pinch_tap',
    description: 'Pinch closing while hovering pad; triggers pinch tap fallback',
    expectedTriggers: [{ padIndex: 0, approximateTimestampMs: 66, method: 'PINCH_TAP' }],
    frames
  };
}

// 6. Tracking Loss & Reacquisition
export function createTrackingLossDataset(): ReplayDataset {
  const frames: TrajectoryFrame[] = [];
  frames.push({ timestampMs: 0, hand: makeHand(0, 0.2, 0.2, 0.0, 0.15, 0.9) });
  // Tracking loss (confidence 0)
  frames.push({ timestampMs: 33, hand: makeHand(33, 0.2, 0.2, 0.0, 0.15, 0.1) });
  // Reacquisition deep in contact plane (-0.06); must NOT trigger on first frame of reacquisition
  frames.push({ timestampMs: 66, hand: makeHand(66, 0.2, 0.2, -0.06, 0.15, 0.9) });
  return {
    name: 'tracking_loss_reacquire',
    description: 'Tracking reacquired deep inside contact plane; must not false trigger',
    expectedTriggers: [],
    frames
  };
}

// Write out JSON fixtures
const targetDir = path.resolve(__dirname, '../../fixtures/gesture-replays');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const datasets = [
  createDeliberateStrikeDataset(),
  createSlowHoverDataset(),
  createLateralSwipeDataset(),
  createHandJitterDataset(),
  createPinchTapDataset(),
  createTrackingLossDataset()
];

for (const ds of datasets) {
  const filePath = path.join(targetDir, `${ds.name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(ds, null, 2), 'utf-8');
  console.log(`Generated fixture: ${filePath}`);
}
