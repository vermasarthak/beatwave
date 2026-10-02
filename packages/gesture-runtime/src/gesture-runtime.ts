import {
  NormalizedHand,
  PadBank,
  StrikeEvent,
  PadStateChangeEvent,
  ContinuousGestureEvent,
  CalibrationProfile,
  DEFAULT_CALIBRATION_PROFILE
} from '@beatwave/protocol';
import { KinematicTracker, KinematicFeatures } from './kinematics.js';
import { PadFSM, PadFSMOutput } from './state-machine.js';
import { StrikeNetAdvisoryAdapter } from './strike-net-adapter.js';

export interface GestureRuntimeCallbacks {
  onStrike?: (event: StrikeEvent) => void;
  onPadStateChange?: (event: PadStateChangeEvent) => void;
  onPadRelease?: (padIndex: number, handId: number, timestampMs: number) => void;
  onContinuousGesture?: (event: ContinuousGestureEvent) => void;
}

export class GestureRuntime {
  private readonly kinematicTrackers: Map<number, KinematicTracker> = new Map();
  private readonly padFSMs: Map<number, PadFSM> = new Map();
  public readonly advisoryAdapter: StrikeNetAdvisoryAdapter = new StrikeNetAdvisoryAdapter();

  private currentBank: PadBank;
  private calibration: CalibrationProfile = { ...DEFAULT_CALIBRATION_PROFILE };

  constructor(
    initialBank: PadBank,
    private readonly callbacks: GestureRuntimeCallbacks = {},
    initialCalibration?: CalibrationProfile
  ) {
    this.currentBank = initialBank;
    if (initialCalibration) {
      this.calibration = { ...initialCalibration };
    }
    this.initPadFSMs();
  }

  private initPadFSMs(): void {
    this.padFSMs.clear();
    for (const pad of this.currentBank.pads) {
      this.padFSMs.set(pad.padIndex, new PadFSM(pad, this.calibration));
    }
  }

  public setPadBank(bank: PadBank): void {
    this.currentBank = bank;
    this.initPadFSMs();
  }

  public setCalibration(calibration: CalibrationProfile): void {
    this.calibration = calibration;
    for (const fsm of this.padFSMs.values()) {
      fsm.updateCalibration(calibration);
    }
  }

  /**
   * Process a new normalized hand landmark frame.
   */
  public processHands(hands: NormalizedHand[]): {
    strikes: StrikeEvent[];
    padStates: { padIndex: number; state: string; compression: number; hoverProximity: number }[];
  } {
    const emittedStrikes: StrikeEvent[] = [];
    const padStatesSummary: {
      padIndex: number;
      state: string;
      compression: number;
      hoverProximity: number;
    }[] = [];

    // Compute kinematics for each tracked hand
    const handFeatures: Map<number, KinematicFeatures> = new Map();
    for (const hand of hands) {
      let tracker = this.kinematicTrackers.get(hand.id);
      if (!tracker) {
        tracker = new KinematicTracker();
        this.kinematicTrackers.set(hand.id, tracker);
      }
      const feat = tracker.computeFeatures(hand);
      handFeatures.set(hand.id, feat);

      // Emit continuous gesture for DAW / synth control (wrist roll, pinch, vertical height)
      this.callbacks.onContinuousGesture?.({
        handId: hand.id,
        timestampMs: hand.timestampMs,
        pinchDistance: feat.pinchDistance,
        wristRollRad: feat.wristRollRad,
        verticalPositionNorm: hand.indexFingertip.y
      });
    }

    // Clean up trackers for hands that disappeared
    for (const handId of this.kinematicTrackers.keys()) {
      if (!hands.some((h) => h.id === handId)) {
        this.kinematicTrackers.delete(handId);
      }
    }

    // Evaluate each pad against candidate hands
    for (const [padIndex, fsm] of this.padFSMs.entries()) {
      // Find the closest or most relevant hand for this pad
      let bestFeatures: KinematicFeatures | null = null;
      let bestConfidence = 0;

      for (const hand of hands) {
        const feat = handFeatures.get(hand.id);
        if (feat) {
          // If we already have a candidate, pick the one closer in depth
          if (!bestFeatures || feat.position.z < bestFeatures.position.z) {
            bestFeatures = feat;
            bestConfidence = hand.confidence;
          }
        }
      }

      const out: PadFSMOutput = fsm.update(bestFeatures, bestConfidence);

      if (out.previousState !== out.currentState) {
        this.callbacks.onPadStateChange?.({
          padIndex,
          handId: bestFeatures ? bestFeatures.handId : -1,
          previousState: out.previousState,
          newState: out.currentState,
          timestampMs: bestFeatures ? bestFeatures.timestampMs : performance.now(),
          compression: out.compression
        });
      }

      if (out.triggered) {
        const strikeEvent: StrikeEvent = {
          padIndex,
          handId: bestFeatures ? bestFeatures.handId : 0,
          timestampMs: bestFeatures ? bestFeatures.timestampMs : performance.now(),
          velocity: out.velocity,
          method: out.method,
          confidence: bestConfidence,
          action: fsm.config.action
        };
        emittedStrikes.push(strikeEvent);
        this.callbacks.onStrike?.(strikeEvent);
      }

      if (out.released) {
        this.callbacks.onPadRelease?.(
          padIndex,
          bestFeatures ? bestFeatures.handId : 0,
          bestFeatures ? bestFeatures.timestampMs : performance.now()
        );
      }

      padStatesSummary.push({
        padIndex,
        state: out.currentState,
        compression: out.compression,
        hoverProximity: out.hoverProximity
      });
    }

    return { strikes: emittedStrikes, padStates: padStatesSummary };
  }

  public triggerPadManual(
    padIndex: number,
    velocity: number = 0.9,
    method: 'POINTER_FALLBACK' | 'KEYBOARD_FALLBACK' = 'POINTER_FALLBACK'
  ): StrikeEvent | null {
    const fsm = this.padFSMs.get(padIndex);
    if (!fsm) return null;

    const out = fsm.forceTrigger(method, velocity);
    const strikeEvent: StrikeEvent = {
      padIndex,
      handId: 0,
      timestampMs: performance.now(),
      velocity: out.velocity,
      method: out.method,
      confidence: 1.0,
      action: fsm.config.action
    };

    this.callbacks.onPadStateChange?.({
      padIndex,
      handId: 0,
      previousState: out.previousState,
      newState: out.currentState,
      timestampMs: strikeEvent.timestampMs,
      compression: 1.0
    });

    this.callbacks.onStrike?.(strikeEvent);
    return strikeEvent;
  }

  public releasePadManual(padIndex: number): void {
    const fsm = this.padFSMs.get(padIndex);
    if (!fsm) return;

    const out = fsm.forceRelease();
    this.callbacks.onPadStateChange?.({
      padIndex,
      handId: 0,
      previousState: out.previousState,
      newState: out.currentState,
      timestampMs: performance.now(),
      compression: 0
    });
    this.callbacks.onPadRelease?.(padIndex, 0, performance.now());
  }

  public reset(): void {
    for (const fsm of this.padFSMs.values()) {
      fsm.reset();
    }
    this.kinematicTrackers.clear();
  }
}
