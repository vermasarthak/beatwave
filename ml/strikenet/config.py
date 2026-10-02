from dataclasses import dataclass

@dataclass
class StrikeNetConfig:
    # Temporal sequence length (number of historical frames, ~200-300ms at 30-60fps)
    sequence_length: int = 12
    # Input feature dimension per frame:
    # 21 landmarks * 3 (x, y, z) = 63
    # + 21 landmarks velocity * 3 = 63
    # + 3 fingertip velocity & acceleration + 1 pinch dist + 1 confidence = 5
    # Total = 131 features
    input_dim: int = 131
    # Hidden dimension in temporal conv / GRU
    hidden_dim: int = 64
    # Number of recurrent / conv layers
    num_layers: int = 2
    dropout: float = 0.1
    # Outputs: [probability_strike (1), eta_ms (1), predicted_dx (1), predicted_dy (1)]
    output_dim: int = 4
    learning_rate: float = 1e-3
    batch_size: int = 32
    num_epochs: int = 20
    onnx_output_path: str = "ml/strikenet/strikenet.onnx"
