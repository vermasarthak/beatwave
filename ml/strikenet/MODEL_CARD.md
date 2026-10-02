# Model Card: StrikeNet v0.1

## Model Details
- **Architecture**: 1D Temporal Convolutional Network (TCN) + 2-layer Gated Recurrent Unit (GRU).
- **Parameters**: ~41,200 parameters.
- **Model Size**: ~165 KB (ONNX FP32), ~85 KB (ONNX INT8 quantized).
- **Input Specification**: Float32 tensor of shape `[batch_size, 12, 131]` representing 12 historical frames of normalized landmarks, first-order velocities, accelerations, and tracking confidence.
- **Output Specification**: Float32 tensor of shape `[batch_size, 4]`:
  - `[0]`: $P(\text{strike}) \in [0.0, 1.0]$ (Sigmoid activation)
  - `[1]`: Estimated milliseconds-to-contact ($\text{ETA} \ge 0$) (ReLU activation)
  - `[2]`: Predicted lateral deviation $\Delta x$
  - `[3]`: Predicted lateral deviation $\Delta y$

## Intended Use & Strict Boundary
- **Intended Use**: Shaving perceived latency by scheduling audio buffer preparation slightly prior to physical virtual plane penetration.
- **Out of Scope / Prohibited**: Direct triggering of audio nodes or MIDI messages without deterministic kinematic confirmation.
- **Fail-Safe Mechanism**: If confidence drops below 0.85, the runtime gracefully falls back 100% to the heuristic kinematic contact plane detector.

## Training Data & Limitations
- **Dataset**: Biomechanically synthesized kinematic trajectory sequences augmented with Gaussian jitter, random scaling, horizontal mirroring, variable frame rates, and simulated dropped frames.
- **Honest Limitation**: Synthetic benchmarks do not capture real-world occlusions, motion blur from low-cost webcams, or atypical finger morphology. Therefore, StrikeNet remains labeled **EXPERIMENTAL** and disabled by default until verified on larger real-world user studies.
