# StrikeNet: Advisory Temporal Intent Model

StrikeNet is an experimental 1D Temporal Convolution Network (TCN) + GRU designed to predict deliberate air-tap intentions from 12 consecutive frames (~200ms) of 3D hand landmark kinematics.

## Architectural Role: Advisory Only

> [!IMPORTANT]
> StrikeNet is strictly **advisory**. It never triggers audio or MIDI events directly. The deterministic gesture state machine (`PadFSM`) in `packages/gesture-runtime` retains sole trigger authority. If StrikeNet outputs high confidence ($P(\text{strike}) > 0.85$), the audio scheduler prepares voice buffers in advance to shave perceived visual-to-audio latency.

## Pipeline

```
21 Landmark 3D Points (t-11 .. t)
           │
           ▼
Kinematic Feature Extraction (velocities, accelerations, pinch, palm scale)
           │
           ▼
Input Tensor (batch_size, 12, 131)
           │
           ▼
Conv1D (kernel_size=3, hidden_dim=64) + BatchNorm1D + ReLU
           │
           ▼
2-layer GRU (hidden_dim=64)
           │
           ▼
Dense Heads ➔ [P(strike), ETA ms, predicted_dx, predicted_dy]
```

## Running Training & ONNX Export

```bash
# In Python virtual environment with PyTorch:
python ml/strikenet/train.py
python ml/strikenet/export_onnx.py
python ml/strikenet/evaluate.py
```
