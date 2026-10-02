# Beatwave Limitations & Known Constraints

Engineering honesty is a foundational value of Beatwave. This document details real-world limitations discovered during testing and development.

---

## 1. Computer Vision & Hardware Limits
- **Lighting Conditions**: MediaPipe hand landmark tracking confidence declines under low ambient lighting or strong backlight (e.g., sitting directly in front of a bright window). In low lighting, the Pinch Tap fallback or pointer fallback is recommended.
- **Webcam Exposure / Rolling Shutter**: Standard 30 FPS webcams introduce a ~33ms sampling interval and motion blur during fast physical strikes. While Beatwave’s software decision pipeline completes in $< 0.01\text{ms}$, physical camera hardware limits maximum tracking responsiveness.
- **Fingertip Occlusion**: When performing gestures with multiple overlapping fingers, optical occlusions may cause transient landmark jitter. The adaptive One Euro filter mitigates this, but extreme occlusions can momentarily cause tracking loss.

---

## 2. Audio Latency Limits
- **Acoustic Roundtrip vs Software Scheduling**: Beatwave achieves sub-millisecond ($< 0.001\text{ms}$) software scheduling precision in Web Audio. However, total acoustic roundtrip latency also includes operating system audio buffer sizes and DAC hardware conversion (typically 5-15ms on macOS CoreAudio, 15-30ms on standard Windows WASAPI).
- **Bluetooth Headphones**: Wireless audio devices (AirPods, Bluetooth speakers) introduce 80-200ms of hardware transmission latency. For real-time musical performance, wired headphones or laptop built-in speakers are strongly recommended.

---

## 3. StrikeNet Advisory Status
- **Synthetic vs Real Dataset**: StrikeNet was trained and evaluated on 1,500 biomechanically synthesized kinematic sequences. While it achieves high precision on synthetic data, its inference cost ($0.395\text{ ms}$) is ~65x higher than the deterministic heuristic baseline ($0.006\text{ ms}$). StrikeNet is therefore retained as **EXPERIMENTAL** and advisory only.
