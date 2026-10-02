"""
Training script for StrikeNet.
Trains on synthetic trajectories with data augmentation.
"""

import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from config import StrikeNetConfig
from model import StrikeNet
from data import SyntheticTrajectoryDataset

def train():
    config = StrikeNetConfig()
    device = torch.device('cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu')
    print(f"[StrikeNet] Training on device: {device}")

    train_dataset = SyntheticTrajectoryDataset(num_samples=1500, config=config, is_train=True)
    val_dataset = SyntheticTrajectoryDataset(num_samples=300, config=config, is_train=False)

    train_loader = DataLoader(train_dataset, batch_size=config.batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=config.batch_size, shuffle=False)

    model = StrikeNet(config).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=config.learning_rate, weight_decay=1e-4)

    bce_loss = nn.BCELoss()
    mse_loss = nn.MSELoss()

    best_val_loss = float('inf')
    os.makedirs(os.path.dirname(config.onnx_output_path), exist_ok=True)

    for epoch in range(1, config.num_epochs + 1):
        model.train()
        total_train_loss = 0.0

        for x_batch, y_batch in train_loader:
            x_batch = x_batch.to(device)
            y_batch = y_batch.to(device)

            optimizer.zero_grad()
            preds = model(x_batch)

            loss_p = bce_loss(preds[:, 0], y_batch[:, 0])
            loss_eta = mse_loss(preds[:, 1] / 100.0, y_batch[:, 1] / 100.0)
            loss = loss_p + 0.1 * loss_eta

            loss.backward()
            optimizer.step()
            total_train_loss += loss.item()

        # Validation
        model.eval()
        total_val_loss = 0.0
        correct_strike = 0
        total_val_samples = 0

        with torch.no_grad():
            for x_batch, y_batch in val_loader:
                x_batch = x_batch.to(device)
                y_batch = y_batch.to(device)
                preds = model(x_batch)

                loss_p = bce_loss(preds[:, 0], y_batch[:, 0])
                loss_eta = mse_loss(preds[:, 1] / 100.0, y_batch[:, 1] / 100.0)
                total_val_loss += (loss_p + 0.1 * loss_eta).item()

                pred_strike = (preds[:, 0] > 0.5).float()
                correct_strike += (pred_strike == y_batch[:, 0]).sum().item()
                total_val_samples += y_batch.size(0)

        acc = (correct_strike / total_val_samples) * 100
        avg_train = total_train_loss / len(train_loader)
        avg_val = total_val_loss / len(val_loader)
        print(f"Epoch {epoch:02d}/{config.num_epochs:02d} | Train Loss: {avg_train:.4f} | Val Loss: {avg_val:.4f} | Val Acc: {acc:.1f}%")

        if avg_val < best_val_loss:
            best_val_loss = avg_val
            torch.save(model.state_dict(), "ml/strikenet/strikenet.pt")

    print("[StrikeNet] Training complete. Saved to ml/strikenet/strikenet.pt")

if __name__ == "__main__":
    train()
