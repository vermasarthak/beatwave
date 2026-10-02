# Beatwave Architecture

"Your hands are the controller."

Beatwave is an open-source, local-first AI air launchpad that allows musicians to play virtual MPC/Launchpad-style drum and sample banks using webcam hand tracking and low-latency Web Audio.

---

## 1. High-Level Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                              BROWSER CLIENT                            │
│                                                                        │
│   Webcam Stream                                                        │
│        │ requestVideoFrameCallback (latest-frame-only drop queue)      │
│        ▼                                                               │
│   MediaPipe HandLandmarker (21 3D points, up to 2 hands)               │
│        │                                                               │
│        ▼                                                               │
│   Landmark Normalization (Wrist-relative origin, palm scale invariant) │
│        │                                                               │
│        ▼                                                               │
│   Adaptive 1€ Low-Pass Filter (Casiez et al., CHI 2012)                │
│        │                                                               │
│        ├────────────────────────────────────┐                          │
│        │                                    ▼                          │
│        │                       StrikeNet (Advisory ONNX)               │
│        │                       P(strike) > 0.85, ETA ms                │
│        │                                    │                          │
│        ▼                                    ▼ (advisory pre-schedule)  │
│   Deterministic Air-Tap FSM (PadFSM) ◄──────┘                          │
│   OUTSIDE ➔ HOVER ➔ ARMED ➔ STRIKE ➔ HELD ➔ RELEASE ➔ COOLDOWN         │
│        │                                                               │
│        ▼ PadEvent (padIndex, velocity, confidence, timestamp)          │
│   Source Capability Layer (Strict domain enforcement)                  │
│        │                                                               │
│        ├──────────────────────┬──────────────────────┐                 │
│        ▼                      ▼                      ▼                 │
│   Native Audio Engine     Web MIDI API          Spotify Transport      │
│   - AudioContext clock    - Note On / Off       - PKCE OAuth           │
│   - Procedural 808 kit    - Velocity            - Transport only       │
│   - Voice stealing        - Continuous CC       - NO PCM / Slicing     │
│   - Lookahead quantize    └──────────────────┘  └──────────────────────┘
│        │                                                               │
│        ▼ 60 FPS RAF                                                    │
│   2.5D Launchpad Scene (GlassPad spring compression, fingertip halo)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Package Boundaries & Responsibilities

| Package | Purpose | Dependencies |
| :--- | :--- | :--- |
| `packages/protocol` | Domain types, source capabilities, action schemas, Zod validation | `zod` |
| `packages/vision` | MediaPipe HandLandmarker wrapper, latest-frame scheduler, 1€ filter | `@mediapipe/tasks-vision`, `protocol` |
| `packages/gesture-runtime` | Kinematic feature extraction, 16-pad deliberate strike FSM, replay runner | `protocol`, `vision` |
| `packages/audio-engine` | Low-latency Web Audio engine, procedural 808 synthesizer, quantizer, MIDI recorder | `protocol` |
| `packages/midi` | Web MIDI API and Mock MIDI adapter with CC mapping | `protocol` |
| `packages/spotify` | Spotify PKCE authentication client and transport commands | `protocol` |
| `packages/storage` | IndexedDB local persistence for projects and calibration | `protocol`, `idb` |
| `apps/studio` | Desktop-first React web application with 2.5D floating launchpad | All packages |
| `services/audio-lab` | Standalone local FastAPI service for BPM detection, onsets, and auto-kit | Python, FastAPI, NumPy, SciPy |
| `ml/strikenet` | Advisory intent prediction model (1D-TCN + GRU) exported to ONNX | PyTorch, ONNX |

---

## 3. Strict Boundary Rules

1. **Zero External Camera Uploads**: Webcam frames are strictly processed client-side via WebAssembly/WebGPU. No pixels are transmitted over any network socket.
2. **Deterministic Trigger Priority**: The machine learning model (`StrikeNet`) is advisory only. Audio and MIDI triggers can only be committed by the deterministic kinematic state machine (`PadFSM`).
3. **Spotify Capability Isolation**: Spotify content is an opaque transport source. Slicing, PCM decoding, recording, or sending Spotify tracks through audio analysis endpoints is rejected at the domain level via `assertSourceCapability`.
