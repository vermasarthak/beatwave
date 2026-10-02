"""
StrikeNet Model Architecture.
Lightweight Temporal Convolution + GRU intent predictor.
Approx 40,000 parameters; sub-4ms inference on modern browser runtimes.
"""

import torch
import torch.nn as nn
from config import StrikeNetConfig

class StrikeNet(nn.Module):
    def __init__(self, config: StrikeNetConfig = StrikeNetConfig()):
        super().__init__()
        self.config = config

        # 1D Temporal Convolution feature extractor
        self.conv1 = nn.Conv1d(
            in_channels=config.input_dim,
            out_channels=config.hidden_dim,
            kernel_size=3,
            padding=1
        )
        self.bn1 = nn.BatchNorm1d(config.hidden_dim)
        self.relu = nn.ReLU()

        # Recurrent sequence processor
        self.gru = nn.GRU(
            input_size=config.hidden_dim,
            hidden_size=config.hidden_dim,
            num_layers=config.num_layers,
            batch_first=True,
            dropout=config.dropout if config.num_layers > 1 else 0.0
        )

        # Output heads
        self.head = nn.Sequential(
            nn.Linear(config.hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, config.output_dim)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch_size, seq_len, input_dim)
        # Transpose for Conv1d: (batch_size, input_dim, seq_len)
        x_conv = x.transpose(1, 2)
        feat = self.relu(self.bn1(self.conv1(x_conv)))

        # Transpose back for GRU: (batch_size, seq_len, hidden_dim)
        feat = feat.transpose(1, 2)
        out, _ = self.gru(feat)

        # Take last time step
        last_step = out[:, -1, :]
        raw_output = self.head(last_step)

        # Output heads:
        # 0: p_strike in [0, 1]
        # 1: eta_ms >= 0
        # 2: predicted_dx
        # 3: predicted_dy
        p_strike = torch.sigmoid(raw_output[:, 0:1])
        eta_ms = torch.relu(raw_output[:, 1:2])
        dx_dy = raw_output[:, 2:4]

        return torch.cat([p_strike, eta_ms, dx_dy], dim=1)
