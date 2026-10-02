"""
Export StrikeNet PyTorch model to ONNX for browser runtime (onnxruntime-web).
"""

import os
import torch
from config import StrikeNetConfig
from model import StrikeNet

def export_onnx():
    config = StrikeNetConfig()
    model = StrikeNet(config)
    model.eval()

    weights_path = "ml/strikenet/strikenet.pt"
    if os.path.exists(weights_path):
        model.load_state_dict(torch.load(weights_path, map_location="cpu"))
        print(f"[Export ONNX] Loaded weights from {weights_path}")
    else:
        print("[Export ONNX] No pretrained weights found; exporting initialized model.")

    # Dummy input: (batch_size=1, seq_len=12, input_dim=131)
    dummy_input = torch.randn(1, config.sequence_length, config.input_dim, dtype=torch.float32)

    os.makedirs(os.path.dirname(config.onnx_output_path), exist_ok=True)

    torch.onnx.export(
        model,
        dummy_input,
        config.onnx_output_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["trajectory_input"],
        output_names=["strike_prediction"],
        dynamic_axes={
            "trajectory_input": {0: "batch_size"},
            "strike_prediction": {0: "batch_size"}
        }
    )

    print(f"[Export ONNX] Successfully exported to {config.onnx_output_path}")

if __name__ == "__main__":
    export_onnx()
