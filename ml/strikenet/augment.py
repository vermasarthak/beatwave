"""
Landmark Trajectory Augmentation.
Applies geometric and temporal perturbations to landmark sequences for training StrikeNet.
"""

import numpy as np

def augment_trajectory(sequence: np.ndarray, config) -> np.ndarray:
    """
    Augments a trajectory sequence of shape (seq_len, input_dim).
    """
    seq = sequence.copy()
    seq_len, dim = seq.shape

    # 1. Random Gaussian noise (simulates sensor landmark jitter)
    noise = np.random.normal(0, 0.008, size=seq.shape)
    seq += noise

    # 2. Scale jitter (simulates varying hand distances from camera)
    scale_factor = np.random.uniform(0.85, 1.15)
    seq[:, :63] *= scale_factor
    seq[:, 63:126] *= scale_factor

    # 3. Horizontal mirroring (50% probability)
    if np.random.rand() > 0.5:
        # Invert X coordinate of landmarks (every 3rd feature starting at 0)
        seq[:, 0:63:3] *= -1.0
        seq[:, 63:126:3] *= -1.0

    # 4. Temporal speed warping (speed up or slow down strike by 20%)
    speed_factor = np.random.uniform(0.8, 1.25)
    seq[:, 63:126] *= speed_factor

    # 5. Occasional frame dropping (simulates dropped webcam frames)
    if np.random.rand() > 0.7:
        drop_idx = np.random.randint(1, seq_len - 1)
        seq[drop_idx] = (seq[drop_idx - 1] + seq[drop_idx + 1]) / 2.0

    return seq
