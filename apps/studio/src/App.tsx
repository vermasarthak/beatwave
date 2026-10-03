import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  PadBank,
  PadLifecycleState,
  SourceType,
  QuantizeGrid,
  CalibrationProfile,
  DEFAULT_CALIBRATION_PROFILE,
  Point3D,
  Rect2D,
  TelemetryMetrics
} from '@beatwave/protocol';
import {
  AudioEngine,
  ALL_KITS,
  FLASHING_LIGHTS_KIT,
  CLASSIC_808_KIT,
  HEARTBREAK_KIT,
  ProceduralSampleMeta,
  KanyeKitDefinition
} from '@beatwave/audio-engine';
import { GestureRuntime } from '@beatwave/gesture-runtime';
import {
  MediaPipeHandTracker,
  LandmarkNormalizer,
  CameraFrameScheduler
} from '@beatwave/vision';
import { WebMidiAdapter, MockMidiAdapter, MidiGestureMapper } from '@beatwave/midi';
import { LocalStorageManager } from '@beatwave/storage';
import { Header } from './components/Header.js';
import { FloatingPadGrid } from './components/FloatingPadGrid.js';
import { HandCursor, HandCursorHandle } from './components/HandCursor.js';
import { HandSkeletonOverlay, HandSkeletonHandle } from './components/HandSkeletonOverlay.js';
import { WaveformBar } from './components/WaveformBar.js';
import { DebugOverlay } from './components/DebugOverlay.js';
import { CalibrationModal } from './components/CalibrationModal.js';
import { AutoKitModal } from './components/AutoKitModal.js';
import { SyntheticDemoPlayer } from './demo/SyntheticDemoPlayer.js';

const CHROMATIC_COLORS = [
  '#7c3aed', '#6366f1', '#3b82f6', '#0284c7',
  '#06b6d4', '#10b981', '#84cc16', '#eab308',
  '#f59e0b', '#f97316', '#ef4444', '#dc2626',
  '#b91c1c', '#db2777', '#c026d3', '#9333ea'
];

function createBankFromKit(
  kitId: string,
  bankId: 'A' | 'B' | 'C' | 'D' = 'A',
  customBounds?: Map<number, Rect2D>,
  sixteenLevelsSample?: ProceduralSampleMeta | null
): PadBank {
  const currentKit = ALL_KITS.find((k) => k.id === kitId) || FLASHING_LIGHTS_KIT;

  if (sixteenLevelsSample) {
    return {
      id: bankId,
      name: `${sixteenLevelsSample.name} (16 Levels)`,
      pads: Array.from({ length: 16 }, (_, i) => {
        const padCol = i % 4;
        const padRow = Math.floor(i / 4);
        const defaultBounds: Rect2D = {
          minX: 0.28 + padCol * 0.11,
          maxX: 0.28 + padCol * 0.11 + 0.09,
          minY: 0.32 + padRow * 0.11,
          maxY: 0.32 + padRow * 0.11 + 0.09
        };
        const bounds = customBounds?.get(i) || defaultBounds;
        const semitones = i - 8;
        const semitoneLabel = semitones === 0 ? 'ROOT [0]' : `${semitones > 0 ? '+' : ''}${semitones}st`;

        return {
          id: `pad_16lvl_${i}`,
          padIndex: i,
          label: semitoneLabel,
          color: CHROMATIC_COLORS[i] || '#38bdf8',
          bounds,
          action: {
            type: 'SampleTrigger',
            sampleId: sixteenLevelsSample.id,
            gain: sixteenLevelsSample.defaultGain,
            pan: 0,
            pitchSemitones: semitones,
            chokeGroup: 1
          },
          chokeGroup: 1
        };
      })
    };
  }

  // Multi-Bank Architecture
  let sourceSamples: readonly ProceduralSampleMeta[];
  let bankName: string;

  if (bankId === 'A') {
    sourceSamples = currentKit.samples;
    bankName = `${currentKit.name} (Vocal Hooks)`;
  } else if (bankId === 'B') {
    sourceSamples = [...currentKit.samples.slice(8), ...currentKit.samples.slice(0, 8)];
    bankName = `${currentKit.name} (Verse & Chops)`;
  } else if (bankId === 'C') {
    sourceSamples = CLASSIC_808_KIT.samples;
    bankName = `808 Drums & Percussion`;
  } else {
    sourceSamples = HEARTBREAK_KIT.samples;
    bankName = `Melodic Synths & Taiko`;
  }

  return {
    id: bankId,
    name: bankName,
    pads: Array.from({ length: 16 }, (_, i) => {
      const sample = sourceSamples[i] || sourceSamples[0];
      const padCol = i % 4;
      const padRow = Math.floor(i / 4);
      const defaultBounds: Rect2D = {
        minX: 0.28 + padCol * 0.11,
        maxX: 0.28 + padCol * 0.11 + 0.09,
        minY: 0.32 + padRow * 0.11,
        maxY: 0.32 + padRow * 0.11 + 0.09
      };
      const bounds = customBounds?.get(i) || defaultBounds;
      const chokeGroup = sample.chokeGroup ?? (sample.category === 'vocal' ? 1 : undefined);

      return {
        id: `pad_${bankId}_${i}`,
        padIndex: i,
        label: sample.note || sample.name,
        color: sample.color || currentKit.themeColor,
        bounds,
        action: {
          type: 'SampleTrigger',
          sampleId: sample.id,
          gain: sample.defaultGain,
          pan: 0,
          chokeGroup
        },
        chokeGroup
      };
    })
  };
}

export const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Core subsystems
  const [engine, setEngine] = useState<AudioEngine | null>(null);
  const [runtime, setRuntime] = useState<GestureRuntime | null>(null);
  const [storage] = useState(() => new LocalStorageManager());
  const [midiAdapter] = useState(() => (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator ? new WebMidiAdapter() : new MockMidiAdapter()));

  // Active Kanye Kit state
  const [activeKitId, setActiveKitId] = useState<string>('flashing_lights');
  const currentKit = ALL_KITS.find((k) => k.id === activeKitId) || FLASHING_LIGHTS_KIT;

  // UI state
  const [activeBank, setActiveBank] = useState<PadBank>(() => createBankFromKit('flashing_lights', 'A'));
  const [sourceType, setSourceType] = useState<SourceType>('procedural');
  const [bpm, setBpm] = useState<number>(FLASHING_LIGHTS_KIT.bpm);
  const [quantize, setQuantize] = useState<QuantizeGrid>('off');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [trackingState, setTrackingState] = useState<'idle' | 'tracking' | 'error'>('idle');
  const [demoActive, setDemoActive] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);
  const [showAutoKit, setShowAutoKit] = useState<boolean>(false);
  const [transportState, setTransportState] = useState<'playing' | 'stopped' | 'paused'>('stopped');
  const [songBackingActive, setSongBackingActive] = useState<boolean>(false);

  // MPC Hardware Controls state
  const [activeBankId, setActiveBankId] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [fullLevel, setFullLevel] = useState<boolean>(false);
  const [sixteenLevels, setSixteenLevels] = useState<boolean>(false);
  const [noteRepeat, setNoteRepeat] = useState<boolean>(false);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);

  const fullLevelRef = useRef<boolean>(false);
  const noteRepeatRef = useRef<boolean>(false);
  const sixteenLevelsRef = useRef<boolean>(false);
  const lastStruckSampleRef = useRef<ProceduralSampleMeta | null>(null);
  const skeletonHandleRef = useRef<HandSkeletonHandle | null>(null);
  const currentBankRef = useRef<PadBank>(activeBank);
  const heldPadsRef = useRef<Set<number>>(new Set());
  const repeatIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    fullLevelRef.current = fullLevel;
  }, [fullLevel]);

  useEffect(() => {
    sixteenLevelsRef.current = sixteenLevels;
  }, [sixteenLevels]);

  useEffect(() => {
    noteRepeatRef.current = noteRepeat;
    if (!noteRepeat && repeatIntervalRef.current !== null) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }, [noteRepeat]);

  // Pad visual states
  const [padStates, setPadStates] = useState<Map<number, { state: PadLifecycleState; compression: number; hoverProximity: number }>>(new Map());
  const measuredBoundsRef = useRef<Map<number, Rect2D>>(new Map());

  // High-performance imperative cursor tracking (bypasses 60fps React re-renders)
  const cursorHandleRef = useRef<HandCursorHandle | null>(null);
  const lastHandPosRef = useRef<Point3D | null>(null);
  const lastPinchRef = useRef<number>(0.15);
  const lastConfidenceRef = useRef<number>(0);

  // Telemetry metrics
  const [metrics, setMetrics] = useState<TelemetryMetrics>({
    cameraFps: 0,
    inferenceFps: 0,
    inferenceLatencyMs: 0,
    droppedFrames: 0,
    handConfidence: 0,
    strikeConfidence: 0,
    renderFps: 60,
    audioScheduleJitterMs: 0,
    activeVoices: 0,
    audioContextState: 'suspended'
  });

  const demoPlayerRef = useRef<SyntheticDemoPlayer | null>(null);
  const schedulerRef = useRef<CameraFrameScheduler | null>(null);
  const trackerRef = useRef<MediaPipeHandTracker | null>(null);
  const normalizerRef = useRef<LandmarkNormalizer>(new LandmarkNormalizer(true, true));

  // Note Repeat roll loop
  const startNoteRepeat = useCallback(() => {
    if (repeatIntervalRef.current !== null) return;
    const intervalMs = Math.max(50, Math.round((60000 / bpm) / 4)); // 1/16th note roll
    repeatIntervalRef.current = window.setInterval(() => {
      if (heldPadsRef.current.size === 0 || !noteRepeatRef.current) {
        if (repeatIntervalRef.current !== null) {
          clearInterval(repeatIntervalRef.current);
          repeatIntervalRef.current = null;
        }
        return;
      }
      for (const padIdx of heldPadsRef.current) {
        const vel = fullLevelRef.current ? 1.0 : 0.92;
        runtime?.triggerPadManual(padIdx, vel, 'POINTER_FALLBACK');
      }
    }, intervalMs);
  }, [bpm, runtime]);

  const stopNoteRepeat = useCallback(() => {
    if (repeatIntervalRef.current !== null) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }, []);

  const handleSelectBank = useCallback((bankId: 'A' | 'B' | 'C' | 'D') => {
    setActiveBankId(bankId);
    setSixteenLevels(false);
    sixteenLevelsRef.current = false;
    const newBank = createBankFromKit(activeKitId, bankId, measuredBoundsRef.current, null);
    setActiveBank(newBank);
    currentBankRef.current = newBank;
    if (runtime) {
      runtime.setPadBank(newBank);
      if (measuredBoundsRef.current.size > 0) {
        runtime.updateAllPadBounds(measuredBoundsRef.current);
      }
    }
  }, [activeKitId, runtime]);

  const handleToggleSixteenLevels = useCallback(() => {
    setSixteenLevels((prev) => {
      const next = !prev;
      sixteenLevelsRef.current = next;
      const targetSample = next
        ? lastStruckSampleRef.current || currentKit.samples[0]
        : null;
      const newBank = createBankFromKit(
        activeKitId,
        activeBankId,
        measuredBoundsRef.current,
        targetSample
      );
      setActiveBank(newBank);
      currentBankRef.current = newBank;
      if (runtime) {
        runtime.setPadBank(newBank);
        if (measuredBoundsRef.current.size > 0) {
          runtime.updateAllPadBounds(measuredBoundsRef.current);
        }
      }
      return next;
    });
  }, [activeKitId, activeBankId, currentKit, runtime]);

  const handleToggleFullLevel = useCallback(() => {
    setFullLevel((prev) => !prev);
  }, []);

  const handleToggleNoteRepeat = useCallback(() => {
    setNoteRepeat((prev) => {
      const next = !prev;
      if (!next) {
        stopNoteRepeat();
      }
      return next;
    });
  }, [stopNoteRepeat]);

  // 1. Initialize Audio Engine & MIDI on boot
  useEffect(() => {
    const audioEng = new AudioEngine();
    setEngine(audioEng);

    // Preload ALL signature kits concurrently in background for zero latency
    audioEng.registry.preloadAllKits().then(() => {
      console.log('[Beatwave] All signature kits preloaded in memory successfully.');
    });

    // Initialize MIDI
    midiAdapter.initialize().then((ok) => {
      if (ok) console.log('[Beatwave] MIDI Adapter initialized.');
    });

    // Gesture Runtime initialization
    const gr = new GestureRuntime(activeBank, {
      onStrike: (strike) => {
        const isFull = fullLevelRef.current;
        const finalStrike = isFull ? { ...strike, velocity: 1.0 } : strike;
        audioEng.triggerPadAction(finalStrike);
        midiAdapter.sendNoteOn(36 + strike.padIndex, finalStrike.velocity);
        cursorHandleRef.current?.update(lastHandPosRef.current, lastPinchRef.current, 1.0, true);
        setTimeout(() => {
          cursorHandleRef.current?.update(lastHandPosRef.current, lastPinchRef.current, lastConfidenceRef.current, false);
        }, 75);

        // Keep track of last struck sample for 16-Levels mode
        const padDef = currentBankRef.current.pads.find((p) => p.padIndex === strike.padIndex);
        const action = padDef?.action;
        if (action && action.type === 'SampleTrigger') {
          const sampleId = action.sampleId;
          const sample =
            currentKit.samples.find((s) => s.id === sampleId) ||
            CLASSIC_808_KIT.samples.find((s) => s.id === sampleId) ||
            HEARTBREAK_KIT.samples.find((s) => s.id === sampleId);
          if (sample) {
            lastStruckSampleRef.current = sample;
          }
        }

        // Note repeat tracking
        if (noteRepeatRef.current) {
          heldPadsRef.current.add(strike.padIndex);
          startNoteRepeat();
        }
      },
      onPadRelease: (padIndex) => {
        audioEng.releasePad(padIndex);
        midiAdapter.sendNoteOff(36 + padIndex);
        heldPadsRef.current.delete(padIndex);
        if (heldPadsRef.current.size === 0) {
          stopNoteRepeat();
        }
      },
      onPadStateChange: (change) => {
        setPadStates((prev) => {
          const current = prev.get(change.padIndex);
          if (
            current &&
            current.state === change.newState &&
            Math.abs(current.compression - change.compression) < 0.05
          ) {
            return prev;
          }
          const next = new Map(prev);
          next.set(change.padIndex, {
            state: change.newState,
            compression: change.compression,
            hoverProximity: change.newState === 'HOVER' ? 1.0 : 0
          });
          return next;
        });
      }
    });

    setRuntime(gr);

    // Demo player setup
    demoPlayerRef.current = new SyntheticDemoPlayer(gr, (pos, pinch, striking) => {
      lastHandPosRef.current = pos;
      lastPinchRef.current = pinch;
      lastConfidenceRef.current = 0.98;
      cursorHandleRef.current?.update(pos, pinch, 0.98, striking);
    });
    demoPlayerRef.current.setKit('flashing_lights');

    return () => {
      audioEng.dispose();
      demoPlayerRef.current?.stop();
    };
  }, []);

  // Synchronize on-screen measured pad hitboxes with GestureRuntime
  const handlePadBoundsMeasured = useCallback((boundsMap: Map<number, Rect2D>) => {
    measuredBoundsRef.current = boundsMap;
    runtime?.updateAllPadBounds(boundsMap);
  }, [runtime]);

  // Handle Kanye Kit change
  const handleKitChange = async (kitId: string) => {
    setActiveKitId(kitId);
    const kit = ALL_KITS.find((k) => k.id === kitId) || FLASHING_LIGHTS_KIT;
    const newBank = createBankFromKit(kitId, activeBank.id, measuredBoundsRef.current);
    setActiveBank(newBank);

    if (runtime) {
      runtime.setPadBank(newBank);
      if (measuredBoundsRef.current.size > 0) {
        runtime.updateAllPadBounds(measuredBoundsRef.current);
      }
    }
    if (engine) {
      await engine.registry.preloadKit(kitId);
      engine.setBpm(kit.bpm);
      if (songBackingActive && kit.backingTrackUrl) {
        await engine.backing.loadTrack(kit.backingTrackUrl);
        engine.backing.play();
      } else if (!kit.backingTrackUrl) {
        engine.backing.stop();
        setSongBackingActive(false);
      }
    }
    setBpm(kit.bpm);
    demoPlayerRef.current?.setKit(kitId);
  };

  // 2. Keyboard fallback triggers
  useEffect(() => {
    const keyMap: Record<string, number> = {
      '1': 0, '2': 1, '3': 2, '4': 3,
      'q': 4, 'w': 5, 'e': 6, 'r': 7,
      'a': 8, 's': 9, 'd': 10, 'f': 11,
      'z': 12, 'x': 13, 'c': 14, 'v': 15
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.repeat) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleTransport();
        return;
      }

      const padIdx = keyMap[e.key.toLowerCase()];
      if (padIdx !== undefined && runtime && engine) {
        engine.resume();
        runtime.triggerPadManual(padIdx, 0.95, 'KEYBOARD_FALLBACK');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const padIdx = keyMap[e.key.toLowerCase()];
      if (padIdx !== undefined && runtime) {
        runtime.releasePadManual(padIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [runtime, engine, transportState]);

  // 3. Camera Start/Stop
  const toggleCamera = async () => {
    if (cameraActive) {
      schedulerRef.current?.stop();
      trackerRef.current?.close();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      setTrackingState('idle');
      cursorHandleRef.current?.update(null, 0.15, 0, false);
      skeletonHandleRef.current?.clear();
    } else {
      if (demoActive) {
        demoPlayerRef.current?.stop();
        setDemoActive(false);
      }
      try {
        engine?.resume();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30, max: 30 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const tracker = new MediaPipeHandTracker('/wasm', '/models/hand_landmarker.task');
        trackerRef.current = tracker;
        await tracker.initialize();

        const scheduler = new CameraFrameScheduler(async (video, timestampMs) => {
          const detections = await tracker.detectForVideo(video, timestampMs);
          if (detections.length > 0 && runtime) {
            const rawDetection = detections[0];
            const normalizedHands = detections.map((d) => normalizerRef.current.normalize(d));
            const primaryHand = normalizedHands[0];
            lastHandPosRef.current = primaryHand.indexFingertip;
            lastPinchRef.current = primaryHand.pinchDistance;
            lastConfidenceRef.current = primaryHand.confidence;

            cursorHandleRef.current?.update(
              primaryHand.indexFingertip,
              primaryHand.pinchDistance,
              primaryHand.confidence,
              false
            );

            // Skeleton overlay coordinates mirrored to match CSS -scale-x-100 webcam
            if (rawDetection.landmarks && rawDetection.landmarks.length >= 21) {
              const mirroredLandmarks = rawDetection.landmarks.map((lm) => ({
                x: 1.0 - lm.x,
                y: lm.y,
                z: lm.z
              }));
              skeletonHandleRef.current?.update(mirroredLandmarks, primaryHand.confidence);
            }

            runtime.processHands(normalizedHands);
            setTrackingState((prev) => (prev !== 'tracking' ? 'tracking' : prev));
          } else {
            cursorHandleRef.current?.update(null, 0.15, 0, false);
            skeletonHandleRef.current?.clear();
            setTrackingState((prev) => (prev !== 'idle' ? 'idle' : prev));
          }
        });

        schedulerRef.current = scheduler;
        if (videoRef.current) {
          scheduler.start(videoRef.current);
        }

        setCameraActive(true);
      } catch (err) {
        console.error('[Beatwave] Camera initialization failed:', err);
        setTrackingState('error');
      }
    }
  };

  // 4. Demo Mode Toggle
  const toggleDemo = async () => {
    if (demoActive) {
      demoPlayerRef.current?.stop();
      setDemoActive(false);
      cursorHandleRef.current?.update(null, 0.15, 0, false);
      skeletonHandleRef.current?.clear();
      if (songBackingActive && engine) {
        engine.backing.stop();
        setSongBackingActive(false);
      }
    } else {
      if (cameraActive) toggleCamera();
      await engine?.resume();
      demoPlayerRef.current?.setKit(activeKitId);
      demoPlayerRef.current?.start();
      setDemoActive(true);
      // Automatically start song backing track during demo
      if (currentKit.backingTrackUrl && engine) {
        await engine.backing.loadTrack(currentKit.backingTrackUrl);
        engine.backing.play();
        setSongBackingActive(true);
      }
    }
  };

  // 5. Song Backing Track Toggle
  const toggleSongBacking = async () => {
    if (!engine) return;
    await engine.resume();
    if (songBackingActive) {
      engine.backing.stop();
      setSongBackingActive(false);
    } else {
      if (currentKit.backingTrackUrl) {
        await engine.backing.loadTrack(currentKit.backingTrackUrl);
        engine.backing.play();
        setSongBackingActive(true);
      }
    }
  };

  // 6. Transport Play/Stop
  const toggleTransport = () => {
    if (!engine) return;
    engine.resume();
    if (transportState === 'playing') {
      engine.transport.stop();
      setTransportState('stopped');
    } else {
      engine.transport.play();
      setTransportState('playing');
    }
  };

  // 7. Manual Pointer Strike
  const handlePointerTrigger = (padIndex: number) => {
    engine?.resume();
    const vel = fullLevelRef.current ? 1.0 : 0.95;
    runtime?.triggerPadManual(padIndex, vel, 'POINTER_FALLBACK');

    const padDef = currentBankRef.current.pads.find((p) => p.padIndex === padIndex);
    const action = padDef?.action;
    if (action && action.type === 'SampleTrigger') {
      const sampleId = action.sampleId;
      const sample =
        currentKit.samples.find((s) => s.id === sampleId) ||
        CLASSIC_808_KIT.samples.find((s) => s.id === sampleId) ||
        HEARTBREAK_KIT.samples.find((s) => s.id === sampleId);
      if (sample) {
        lastStruckSampleRef.current = sample;
      }
    }

    if (noteRepeatRef.current) {
      heldPadsRef.current.add(padIndex);
      startNoteRepeat();
    }
  };

  const handlePointerRelease = (padIndex: number) => {
    heldPadsRef.current.delete(padIndex);
    if (heldPadsRef.current.size === 0) {
      stopNoteRepeat();
    }
    runtime?.releasePadManual(padIndex);
  };

  // Telemetry loop for HUD
  useEffect(() => {
    const interval = setInterval(() => {
      if (engine) {
        const stats = schedulerRef.current?.getStats() || {
          cameraFps: demoActive ? 60 : 0,
          inferenceFps: demoActive ? 60 : 0,
          inferenceLatencyMs: demoActive ? 0.4 : 0,
          droppedFrames: 0,
          totalFrames: 0
        };
        const audioStats = engine.profiler.getStats();

        setMetrics({
          cameraFps: stats.cameraFps,
          inferenceFps: stats.inferenceFps,
          inferenceLatencyMs: stats.inferenceLatencyMs,
          droppedFrames: stats.droppedFrames,
          handConfidence: lastConfidenceRef.current,
          strikeConfidence: 0.95,
          renderFps: 60,
          audioScheduleJitterMs: audioStats.p50Ms,
          activeVoices: engine.voices.activeCount,
          audioContextState: engine.ctx.state,
          strikeNetAdvisoryMs: 18
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [engine, demoActive]);

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden bg-[#07090e]">
      {/* Background Webcam Mirror */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-500 pointer-events-none ${
          cameraActive ? 'opacity-35 blur-[2px]' : 'opacity-0'
        }`}
      />

      {/* Atmospheric ambient lighting matching active Kanye track */}
      <div
        style={{
          background: `radial-gradient(circle at 50% 45%, ${currentKit.themeColor}1a 0%, transparent 65%)`
        }}
        className="absolute inset-0 pointer-events-none transition-all duration-700"
      />

      {/* Hand Cursor Marker (imperatively updated for 60fps smoothness) */}
      <HandCursor ref={cursorHandleRef} />

      {/* Hand Skeleton Overlay (21 MediaPipe joints + bones in neon cyan/gold) */}
      <HandSkeletonOverlay ref={skeletonHandleRef} visible={showSkeleton && cameraActive} />

      {/* Top Header Bar with Kanye Kit Selector */}
      <Header
        sourceType={sourceType}
        onSourceChange={(s) => {
          setSourceType(s);
          engine?.setSourceType(s);
        }}
        bpm={bpm}
        onBpmChange={(b) => {
          setBpm(b);
          engine?.setBpm(b);
        }}
        quantize={quantize}
        onQuantizeChange={(q) => {
          setQuantize(q);
          engine?.setQuantize(q);
        }}
        activeKitId={activeKitId}
        onKitChange={handleKitChange}
        cameraActive={cameraActive}
        onToggleCamera={toggleCamera}
        onOpenCalibration={() => setShowCalibration(true)}
        onOpenAutoKit={() => setShowAutoKit(true)}
        demoActive={demoActive}
        onToggleDemo={toggleDemo}
        showDebug={showDebug}
        onToggleDebug={() => setShowDebug((prev) => !prev)}
        transportState={transportState}
        onToggleTransport={toggleTransport}
        trackingState={trackingState}
        songBackingActive={songBackingActive}
        onToggleSongBacking={toggleSongBacking}
        showSkeleton={showSkeleton}
        onToggleSkeleton={() => setShowSkeleton((prev) => !prev)}
      />

      {/* Center 2.5D Launchpad Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 z-10">
        {/* Track Banner */}
        <div className="mb-2 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-xs">
          <span
            style={{ backgroundColor: currentKit.themeColor }}
            className="w-2 h-2 rounded-full animate-ping"
          />
          <span className="font-extrabold text-white tracking-wide">{currentKit.name}</span>
          <span className="text-slate-400 font-medium">• {currentKit.album} ({currentKit.year})</span>
          <span className="text-slate-500 hidden sm:inline">• {currentKit.description}</span>
        </div>

        <FloatingPadGrid
          bank={activeBank}
          padStates={padStates}
          onPointerTrigger={handlePointerTrigger}
          onPointerRelease={handlePointerRelease}
          onPadBoundsMeasured={handlePadBoundsMeasured}
          bpm={bpm}
          kitName={currentKit.name}
          album={currentKit.album}
          songBackingActive={songBackingActive}
          onToggleSongBacking={toggleSongBacking}
          transportState={transportState}
          onToggleTransport={toggleTransport}
          activeBankId={activeBankId}
          onSelectBank={handleSelectBank}
          fullLevel={fullLevel}
          onToggleFullLevel={handleToggleFullLevel}
          sixteenLevels={sixteenLevels}
          onToggleSixteenLevels={handleToggleSixteenLevels}
          noteRepeat={noteRepeat}
          onToggleNoteRepeat={handleToggleNoteRepeat}
        />
      </main>

      {/* Bottom Audio Waveform & Bank Selector */}
      <WaveformBar
        mixer={engine?.mixer || null}
        activeBankId={activeBankId}
        onSelectBank={handleSelectBank}
      />

      {/* Developer Telemetry & HUD */}
      {showDebug && <DebugOverlay metrics={metrics} onClose={() => setShowDebug(false)} />}

      {/* Calibration Wizard Modal */}
      {showCalibration && (
        <CalibrationModal
          profile={DEFAULT_CALIBRATION_PROFILE}
          onSaveProfile={(prof) => {
            runtime?.setCalibration(prof);
            storage.saveCalibration(prof);
          }}
          onClose={() => setShowCalibration(false)}
        />
      )}

      {/* Auto Kit Modal */}
      {showAutoKit && (
        <AutoKitModal
          onClose={() => setShowAutoKit(false)}
          onApplyKit={(slices, newBpm) => {
            setBpm(newBpm);
            engine?.setBpm(newBpm);
            console.log('[AutoKit] Applied kit slices:', slices);
          }}
        />
      )}
    </div>
  );
};
