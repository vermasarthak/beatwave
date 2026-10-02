"""
Data generation and dataset loader for StrikeNet.
Distinguishes synthetic generated trajectories from real calibrated recordings.
"""

import numpy as np
import torch
from torch.utils.data import Dataset
from config import StrikeNetConfig
from augment import augment_trajectory

class SyntheticTrajectoryDataset(Dataset):
    def __init__(self, num_samples: int = 1200, config: StrikeNetConfig = StrikeNetConfig(), is_train: bool = True):
        self.config = config
        self.is_train = is_train
        self.samples = []
        self.targets = []

        # Generate 50% strikes, 50% non-strikes (hover, swipe, jitter)
        half = num_samples // 2
        for _ in range(half):
            seq, target = self._generate_strike_sample()
            if self.is_train:
                seq = augment_trajectory(seq, self.config)
            self.samples.append(seq)
            self.targets.append(target)

        for _ in range(half):
            seq, target = self._generate_non_strike_sample()
            if self.is_train:
                seq = augment_trajectory(seq, self.config)
            self.samples.append(seq)
            self.targets.append(target)

        self.samples = np.array(self.samples, dtype=np.float32)
        self.targets = np.array(self.targets, dtype=np.float32)

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        return (
            torch.tensor(self.samples[idx], dtype=torch.float32),
            torch.tensor(self.targets[idx], dtype=torch.float32)
        )

    def _generate_strike_sample(self):
        """Generates a sequence where a hand strikes forward into virtual contact plane."""
        seq_len = self.config.sequence_length
        dim = self.config.input_dim
        seq = np.zeros((seq_len, dim), dtype=np.float32)

        # Contact plane at -0.045
        # Strike begins around frame 4-7, reaches contact around frame 10-12
        contact_frame = np.random.randint(9, seq_len)
        strike_start = contact_frame - np.random.randint(3, 5)

        z = 0.0
        vz = 0.0
        for t in range(seq_len):
            if t >= strike_start and t <= contact_frame:
                # Accelerating forward in -Z
                vz = -np.random.uniform(0.3, 0.6)
                z += vz * 0.033
            elif t > contact_frame:
                # Decelerating / contacting
                vz = -0.05
                z = min(z, -0.05)
            else:
                vz = np.random.normal(0, 0.02)
                z = np.random.normal(0, 0.005)

            # Landmarks (21 points)
            seq[t, 0:63] = np.random.normal(0, 0.01, size=63)
            # Index tip (landmark 8)
            seq[t, 8 * 3 + 2] = z
            # Velocities
            seq[t, 63:126] = np.random.normal(0, 0.01, size=63)
            seq[t, 63 + 8 * 3 + 2] = vz
            # Kinematic features at the end
            seq[t, 126] = vz # strike speed
            seq[t, 127] = np.random.uniform(0, 0.2) # low lateral speed
            seq[t, 128] = np.random.uniform(0.12, 0.18) # pinch dist
            seq[t, 129] = np.random.uniform(0.85, 0.98) # tracking confidence
            seq[t, 130] = 0.033 # dt

        eta_frames = max(0, contact_frame - (seq_len - 1))
        eta_ms = eta_frames * 33.0
        # Target: [P(strike)=1.0, eta_ms, dx, dy]
        target = np.array([1.0, eta_ms, 0.0, 0.0], dtype=np.float32)
        return seq, target

    def _generate_non_strike_sample(self):
        """Generates hover, lateral swipe, or stationary jitter."""
        seq_len = self.config.sequence_length
        dim = self.config.input_dim
        seq = np.zeros((seq_len, dim), dtype=np.float32)

        sample_type = np.random.choice(['hover', 'swipe', 'jitter'])

        for t in range(seq_len):
            if sample_type == 'hover':
                z = np.random.normal(0.01, 0.005)
                vx = np.random.normal(0, 0.05)
                vy = np.random.normal(0, 0.05)
                vz = np.random.normal(0, 0.02)
            elif sample_type == 'swipe':
                z = np.random.normal(0.0, 0.01)
                vx = np.random.uniform(0.8, 1.8) # High lateral speed
                vy = np.random.normal(0, 0.1)
                vz = np.random.normal(0, 0.03)
            else: # jitter
                z = np.random.normal(0.0, 0.01)
                vx = np.random.normal(0, 0.02)
                vy = np.random.normal(0, 0.02)
                vz = np.random.normal(0, 0.02)

            seq[t, 0:63] = np.random.normal(0, 0.01, size=63)
            seq[t, 8 * 3 + 2] = z
            seq[t, 63:126] = np.random.normal(0, 0.01, size=63)
            seq[t, 63 + 8 * 3 + 2] = vz
            seq[t, 126] = -vz
            seq[t, 127] = np.hypot(vx, vy)
            seq[t, 128] = np.random.uniform(0.12, 0.18)
            seq[t, 129] = np.random.uniform(0.85, 0.98)
            seq[t, 130] = 0.033

        # Target: [P(strike)=0.0, eta_ms=999.0, dx=0, dy=0]
        target = np.array([0.0, 999.0, 0.0, 0.0], dtype=np.float32)
        return seq, target
