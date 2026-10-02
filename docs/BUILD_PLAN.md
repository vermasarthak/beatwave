# Beatwave Build Plan & Progress Tracker

## Status: IN PROGRESS
**Target**: Production-grade, open-source, local-first AI air launchpad.

---

### Subsystem Milestones

| Milestone | Component | Scope | Status |
| :--- | :--- | :--- | :--- |
| **M1** | Protocol & Architecture | Domain types, source capabilities, action schemas, fast-check specs | Pending |
| **M2** | Native Audio Engine | Web Audio low-latency engine, procedural 808 kit, quantizer, choke groups | Pending |
| **M3** | Vision & Filtering | MediaPipe hand tracker, frame scheduler (latest-only), OneEuroFilter | Pending |
| **M4** | Air-Tap Gesture Runtime | Kinematic velocity extractor, deterministic FSM, pinch fallback, calibration | Pending |
| **M5** | 2.5D Studio UI | Three.js translucent floating glass launchpad, developer HUD, camera mirror | Pending |
| **M6** | Advisory StrikeNet ML | PyTorch TCN/GRU, synthetic trajectory generator, ONNX export & runtime | Pending |
| **M7** | MIDI & Spotify | Web MIDI adapter (with Mock), Spotify PKCE transport with capability enforcement | Pending |
| **M8** | Deterministic Replays & Tests | Replay fixtures, fast-check properties, vitest unit/integration suite | Pending |
| **M9** | Local Audio-Lab | FastAPI local onset/beat/transient kit generation & optional Demucs | Pending |
| **M10** | Benchmarks & Verification | Real micro-benchmarks (filter, FSM, audio jitter, StrikeNet), CI workflow | Pending |

---

### Risks & Mitigations
- **Frame queue latency**: Camera ingestion could lag rendering if inference is slow. *Mitigation*: Dropping stale frames with latest-frame-only scheduler.
- **Air-tap false triggers**: Moving across pads could trigger notes accidentally. *Mitigation*: Multi-condition FSM requiring inward Z-velocity, low lateral XY-velocity, depth threshold penetration, hysteresis release, and cooldown.
- **Audio timing jitter**: Browser event loop delays. *Mitigation*: Native Web Audio clock (`AudioContext.currentTime`) with lookahead scheduling.
- **Spotify compliance**: Inadvertent audio recording or processing. *Mitigation*: Strict domain-level capability bitmask rejecting prohibited operations with typed errors.
