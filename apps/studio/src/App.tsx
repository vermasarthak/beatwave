import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  PadBank,
  PadLifecycleState,
  SourceType,
  QuantizeGrid,
  CalibrationProfile,
  DEFAULT_CALIBRATION_PROFILE,
  Point3D,
  TelemetryMetrics
} from '@beatwave/protocol';
import { AudioEngine } from '@beatwave/audio-engine';
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
import { HandCursor } from './components/HandCursor.js';
import { WaveformBar } from './components/WaveformBar.js';
import { DebugOverlay } from './components/DebugOverlay.js';
import { CalibrationModal } from './components/CalibrationModal.js';
import { AutoKitModal } from './components/AutoKitModal.js';
import { SyntheticDemoPlayer } from './demo/SyntheticDemoPlayer.js';

function createDefaultBank(id: 'A' | 'B' | 'C' | 'D' = 'A'): PadBank {
  const padLabels = [
    'Kick 808', 'Snare', 'Closed Hat', 'Open Hat',
    'Clap', 'Rimshot', 'Low Tom', 'High Tom',
    'Crash', 'Ride', 'Shaker', 'Cowbell',
    'Sub Bass', 'FM Chord C', 'FM Chord Eb', 'FM Chord G'
  ];

  const sampleIds = [
    'proc_kick', 'proc_snare', 'proc_cl_hat', 'proc_op_hat',
    'proc_clap', 'proc_rim', 'proc_tom_lo', 'proc_tom_hi',
    'proc_crash', 'proc_ride', 'proc_shaker', 'proc_cowbell',
    'proc_sub_bass', 'proc_chord_c', 'proc_chord_eb', 'proc_chord_g'
  ];

  return {
    id,
    name: `Bank ${id}`,
    pads: Array.from({ length: 16 }, (_, i) => ({
      id: `pad_${id}_${i}`,
      padIndex: i,
      label: padLabels[i] || `Pad ${i + 1}`,
      color: '#38bdf8',
      bounds: {
        minX: (i % 4) * 0.22 + 0.06,
        maxX: (i % 4) * 0.22 + 0.24,
        minY: Math.floor(i / 4) * 0.22 + 0.06,
        maxY: Math.floor(i / 4) * 0.22 + 0.24
      },
      action: {
        type: 'SampleTrigger',
        sampleId: sampleIds[i] || 'proc_kick',
        gain: 1.0,
        pan: 0,
        chokeGroup: i === 2 || i === 3 ? 1 : undefined
      }
    }))
  };
}

export const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Core subsystems
  const [engine, setEngine] = useState<AudioEngine | null>(null);
  const [runtime, setRuntime] = useState<GestureRuntime | null>(null);
  const [storage] = useState(() => new LocalStorageManager());
  const [midiAdapter] = useState(() => (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator ? new WebMidiAdapter() : new MockMidiAdapter()));

  // UI state
  const [activeBank, setActiveBank] = useState<PadBank>(() => createDefaultBank('A'));
  const [sourceType, setSourceType] = useState<SourceType>('procedural');
  const [bpm, setBpm] = useState<number>(120);
  const [quantize, setQuantize] = useState<QuantizeGrid>('off');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [trackingState, setTrackingState] = useState<'idle' | 'tracking' | 'error'>('idle');
  const [demoActive, setDemoActive] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);
  const [showAutoKit, setShowAutoKit] = useState<boolean>(false);
  const [transportState, setTransportState] = useState<'playing' | 'stopped' | 'paused'>('stopped');

  // Pad visual states
  const [padStates, setPadStates] = useState<Map<number, { state: PadLifecycleState; compression: number; hoverProximity: number }>>(new Map());

  // Cursor tracking
  const [cursorPos, setCursorPos] = useState<Point3D | null>(null);
  const [cursorPinch, setCursorPinch] = useState<number>(0.15);
  const [cursorStriking, setCursorStriking] = useState<boolean>(false);
  const [handConfidence, setHandConfidence] = useState<number>(0);

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

  // 1. Initialize Audio Engine & MIDI on boot
  useEffect(() => {
    const audioEng = new AudioEngine();
    setEngine(audioEng);

    // Preload procedural 808 kit
    audioEng.registry.preloadProceduralKit().then(() => {
      console.log('[Beatwave] Procedural 808 Kit preloaded successfully.');
    });

    // Initialize MIDI
    midiAdapter.initialize().then((ok) => {
      if (ok) console.log('[Beatwave] MIDI Adapter initialized.');
    });

    // Gesture Runtime initialization
    const gr = new GestureRuntime(activeBank, {
      onStrike: (strike) => {
        audioEng.triggerPadAction(strike);
        midiAdapter.sendNoteOn(36 + strike.padIndex, strike.velocity);
        setCursorStriking(true);
        setTimeout(() => setCursorStriking(false), 80);
      },
      onPadRelease: (padIndex) => {
        audioEng.releasePad(padIndex);
        midiAdapter.sendNoteOff(36 + padIndex);
      },
      onPadStateChange: (change) => {
        setPadStates((prev) => {
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
      setCursorPos(pos);
      setCursorPinch(pinch);
      setCursorStriking(striking);
      setHandConfidence(0.98);
    });

    return () => {
      audioEng.dispose();
      demoPlayerRef.current?.stop();
    };
  }, []);

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
      setCursorPos(null);
    } else {
      if (demoActive) {
        demoPlayerRef.current?.stop();
        setDemoActive(false);
      }
      try {
        engine?.resume();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: { ideal: 60 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const tracker = new MediaPipeHandTracker();
        trackerRef.current = tracker;
        await tracker.initialize();

        const scheduler = new CameraFrameScheduler(async (video, timestampMs) => {
          const detections = await tracker.detectForVideo(video, timestampMs);
          if (detections.length > 0 && runtime) {
            const normalizedHands = detections.map((d) => normalizerRef.current.normalize(d));
            const primaryHand = normalizedHands[0];
            setCursorPos(primaryHand.indexFingertip);
            setCursorPinch(primaryHand.pinchDistance);
            setHandConfidence(primaryHand.confidence);

            runtime.processHands(normalizedHands);
            setTrackingState('tracking');
          } else {
            setTrackingState('idle');
          }
        });

        schedulerRef.current = scheduler;
        if (videoRef.current) {
          scheduler.start(videoRef.current);
        }
        setCameraActive(true);
      } catch (err) {
        console.error('[Beatwave] Webcam permission or initialization error:', err);
        setTrackingState('error');
      }
    }
  };

  // 4. Demo Mode Toggle
  const toggleDemo = () => {
    if (demoActive) {
      demoPlayerRef.current?.stop();
      setDemoActive(false);
      setCursorPos(null);
    } else {
      if (cameraActive) {
        toggleCamera();
      }
      engine?.resume();
      demoPlayerRef.current?.start();
      setDemoActive(true);
    }
  };

  // 5. Transport Controls
  const toggleTransport = () => {
    if (!engine) return;
    engine.resume();
    if (engine.transport.state === 'playing') {
      engine.transport.stop();
      setTransportState('stopped');
    } else {
      engine.transport.play();
      setTransportState('playing');
    }
  };

  // 6. Manual Pointer Strike
  const handlePointerTrigger = (padIndex: number) => {
    engine?.resume();
    runtime?.triggerPadManual(padIndex, 0.95, 'POINTER_FALLBACK');
  };

  const handlePointerRelease = (padIndex: number) => {
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
          handConfidence: handConfidence,
          strikeConfidence: cursorStriking ? 0.95 : 0.1,
          renderFps: 60,
          audioScheduleJitterMs: audioStats.p50Ms,
          activeVoices: engine.voices.activeCount,
          audioContextState: engine.ctx.state,
          strikeNetAdvisoryMs: 18
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [engine, demoActive, handConfidence, cursorStriking]);

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

      {/* Atmospheric ambient lighting & grid backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.06),transparent_70%)] pointer-events-none" />

      {/* Hand Cursor Marker */}
      <HandCursor
        fingertip={cursorPos}
        pinchDistance={cursorPinch}
        confidence={handConfidence}
        isStriking={cursorStriking}
      />

      {/* Top Header Bar */}
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
      />

      {/* Center 2.5D Launchpad Stage */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <FloatingPadGrid
          bank={activeBank}
          padStates={padStates}
          onPointerTrigger={handlePointerTrigger}
          onPointerRelease={handlePointerRelease}
        />
      </main>

      {/* Bottom Audio Waveform & Bank Selector */}
      <WaveformBar
        mixer={engine?.mixer || null}
        activeBankId={activeBank.id}
        onSelectBank={(b) => {
          const newBank = createDefaultBank(b);
          setActiveBank(newBank);
          runtime?.setPadBank(newBank);
        }}
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
