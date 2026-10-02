# Beatwave

**Your hands are the controller.**

Real-time hand tracking + low-latency Web Audio + gesture intent prediction.  
Trigger samples and MIDI from the air — no controller required.

---

## 30-Second Quickstart

```bash
# 1. Clone repository
git clone https://github.com/sarthakverma0802/beatwave.git
cd beatwave

# 2. Install dependencies & build
pnpm install
pnpm build

# 3. Launch studio
pnpm dev
```

Open `http://localhost:5173` in your browser. Grant camera access, hold your hand in front of the camera, and tap forward to strike pads. Or click **Demo** for an immediate interactive performance without camera access!

---

## What It Does

Beatwave transforms any standard webcam into a floating 4x4 musical launchpad suspended between the musician and the screen.

- **Air Sampler**: Trigger 16-pad drum banks using deliberate mid-air strikes. Includes a zero-asset procedural 808/909 drum kit.
- **Air-Tap State Machine**: Kinematic contact plane detection distinguishing forward strikes from hover, jitter, and lateral swipes.
- **Low-Latency Audio**: Native Web Audio engine with sample-accurate lookahead quantization, polyphony stealing, and choke groups.
- **Web MIDI Controller**: Transmit Note-On/Off with velocity and continuous CC controls (pinch distance $\to$ filter cutoff, wrist roll $\to$ mod wheel).
- **Auto Kit (Local Audio Lab)**: Local Python service for BPM detection, transient slicing, and automatic 4x4 kit generation.
- **Capability-Enforced Spotify Transport**: Strictly capability-controlled playback transport with zero raw PCM access.

---

## Why It Exists

Physical launchpads cost $100-$400 and tether musicians to physical hardware. Most computer vision "demos" trigger sounds merely because a 2D bounding box is entered, resulting in chaotic misfires, double-bounces, and unusable latency. 

Beatwave was engineered as a serious real-time AI/HCI/audio systems repository:
1. **Deterministic Kinematics**: Uses 1€ adaptive filtering and forward velocity hysteresis.
2. **Sub-Millisecond Software Scheduling**: Bypasses browser event loop delays using native `AudioContext.currentTime`.
3. **Local-First Privacy**: Camera pixels and audio never leave the user's computer.

---

## Architecture Boundary & Implementation Scope

To maintain engineering honesty, subsystems are strictly categorized:

| Subsystem | Status | Scope |
| :--- | :--- | :--- |
| **Native Web Audio Engine** | **Production** | Full native implementation, 16 procedural 808 voices, lookahead quantizer, mixer, SMF MIDI exporter. |
| **Air-Tap State Machine (FSM)** | **Production** | 16 independent pad FSMs, 1€ adaptive filter, hysteresis release, swipe rejection. |
| **Interactive Studio UI** | **Production** | 2.5D floating launchpad, spring compression physics, oscilloscope visualizer, HUD. |
| **Web MIDI Adapter** | **Production** | Web MIDI API output with MockMidiAdapter fallback for tests/Safari. |
| **StrikeNet Intent Predictor** | **Experimental** | 1D-TCN + GRU model exported to ONNX. Advisory only; does not directly trigger audio. |
| **Local Audio-Lab Service** | **Optional** | Standalone localhost FastAPI service for onset analysis and auto-kit generation. |
| **Spotify Transport** | **Optional** | PKCE OAuth transport client strictly restricted from audio buffers or slicing. |

---

## Measured Benchmarks

Measured on Apple Silicon arm64 across 10,000 iterations:

```
Subsystem Component               Mean (ms)   p50 (ms)    p95 (ms)    Target (ms)
---------------------------------------------------------------------------------
1€ Adaptive Filter Step           0.0004      0.0002      0.0008      < 0.05
Landmark Normalization            0.0012      0.0008      0.0022      < 0.05
Kinematic Feature Extraction      0.0006      0.0005      0.0005      < 0.05
Full 16-Pad FSM Evaluation        0.0028      0.0009      0.0062      < 0.10
Audio Lookahead Quantizer         0.0002      0.0002      0.0002      < 0.01
---------------------------------------------------------------------------------
End-to-End Software Decision      0.0052      0.0024      0.0091      < 0.25
```

*See [docs/BENCHMARKS.md](docs/BENCHMARKS.md) for full benchmark methodology and StrikeNet baseline comparisons.*

---

## Testing & Verification

Beatwave features a deterministic verification suite:
- **Unit & Integration Tests**: 32/32 tests passing across protocol, audio engine, vision, and MIDI.
- **Fast-Check Property Tests**: Mathematical invariant testing proving strikes can never double-trigger without intervening release.
- **Trajectory Replay Suite**: Replays 6 real-world scenarios (`deliberate_strike`, `slow_hover`, `lateral_swipe`, `hand_jitter`, `pinch_tap`, `tracking_loss_reacquire`).
- **Python Audio Lab Suite**: Pytest suite testing synthetic sine wave beat tracking and FastAPI endpoints.

Run tests:
```bash
pnpm test
pnpm benchmark
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
