# ai_engine.py
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import json
import os

MODEL_PATH = os.environ.get("AE_MODEL_PATH", "autoencoder_model.pt")
SCALER_PATH = os.environ.get("SCALER_PATH", "scaler.npz")

class Autoencoder(nn.Module):
    def __init__(self, input_dim):
        super(Autoencoder, self).__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU()
        )
        self.decoder = nn.Sequential(
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.decoder(self.encoder(x))

# ------------------
# Preprocessing
# ------------------
def fit_scaler(df: pd.DataFrame):
    scaler = MinMaxScaler()
    scaler.fit(df.values)
    # persist scaler arrays
    np.savez(SCALER_PATH, min=scaler.data_min_, max=scaler.data_max_, scale=scaler.scale_, var=scaler.var_)
    return scaler

def load_scaler():
    if not os.path.exists(SCALER_PATH):
        return None
    arr = np.load(SCALER_PATH + '.npz') if not SCALER_PATH.endswith('.npz') else np.load(SCALER_PATH)
    # if saved via np.savez as above
    if 'min' in arr:
        scaler = MinMaxScaler()
        scaler.data_min_ = arr['min']
        scaler.data_max_ = arr['max']
        scaler.scale_ = arr['scale']
        scaler.var_ = arr['var']
        scaler.n_features_in_ = arr['min'].shape[0]
        return scaler
    # fallback
    return None

def preprocess(df: pd.DataFrame, fit=False):
    """
    df: pandas DataFrame with numeric columns
    fit: whether to fit scaler and persist
    returns normalized df and scaler
    """
    if fit:
        scaler = fit_scaler(df)
    else:
        scaler = load_scaler()
        if scaler is None:
            scaler = fit_scaler(df)  # fallback
    arr = scaler.transform(df.values)
    return pd.DataFrame(arr, columns=df.columns), scaler

# ------------------
# Training / persistence
# ------------------
def train_autoencoder(df: pd.DataFrame, epochs=50, lr=1e-3, batch_size=None, device="cpu"):
    df_norm, _ = preprocess(df, fit=True)
    tensor = torch.tensor(df_norm.values, dtype=torch.float32).to(device)
    input_dim = df_norm.shape[1]
    model = Autoencoder(input_dim).to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    # training (simple full-batch or mini-batch)
    for epoch in range(epochs):
        model.train()
        if batch_size is None:
            batch = tensor
            output = model(batch)
            loss = criterion(output, batch)
            optimizer.zero_grad(); loss.backward(); optimizer.step()
        else:
            perm = torch.randperm(tensor.size(0))
            for i in range(0, tensor.size(0), batch_size):
                idx = perm[i:i+batch_size]
                batch = tensor[idx]
                output = model(batch)
                loss = criterion(output, batch)
                optimizer.zero_grad(); loss.backward(); optimizer.step()

        if (epoch+1) % 10 == 0 or epoch==0:
            print(f"[AE] Epoch {epoch+1}/{epochs} loss={loss.item():.6f}")

    # save model
    torch.save({
        "model_state": model.state_dict(),
        "input_dim": input_dim
    }, MODEL_PATH)
    print(f"[AE] Model saved to {MODEL_PATH}")
    return model

def load_model(device="cpu"):
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Train first.")
    ckpt = torch.load(MODEL_PATH, map_location=device)
    model = Autoencoder(ckpt["input_dim"])
    model.load_state_dict(ckpt["model_state"])
    model.to(device)
    model.eval()
    return model

# ------------------
# Inference
# ------------------
def detect_anomalies_from_df(model, df: pd.DataFrame, threshold=None, device="cpu"):
    """
    df: raw df (numeric), will be normalized using saved scaler
    returns: df_with_scores, threshold_used
    """
    df_norm, _ = preprocess(df, fit=False)
    tensor = torch.tensor(df_norm.values, dtype=torch.float32).to(device)
    with torch.no_grad():
        reconstructed = model(tensor).cpu()
    errors = torch.mean((tensor.cpu() - reconstructed) ** 2, dim=1).numpy()
    if threshold is None:
        threshold = errors.mean() + 2 * errors.std()
    out = df.copy()
    out["anomaly_score"] = errors
    out["is_anomaly"] = out["anomaly_score"] > threshold
    return out, float(threshold)

# ------------------
# Simple Attack Predictor (stub / RL placeholder)
# ------------------
import random
import pandas as pd
import numpy as np

class AttackPredictor:
    """
    Lightweight Q-table simulation to recommend actions. Intended as POC.
    """

    def __init__(self):
        self.states = ["Normal", "AnomalyDetected", "Mitigated"]
        self.actions = ["Monitor", "IsolateDevice", "DeployPatch", "AlertAdmin"]
        self.q_table = pd.DataFrame(0.0, index=self.states, columns=self.actions)
        self.alpha = 0.2
        self.gamma = 0.9
        self.epsilon = 0.1

    def choose_action(self, state):
        if random.random() < self.epsilon:
            return random.choice(self.actions)
        return self.q_table.loc[state].idxmax()

    def learn(self, state, action, reward, next_state):
        predict = self.q_table.loc[state, action]
        target = reward + self.gamma * self.q_table.loc[next_state].max()
        self.q_table.loc[state, action] += self.alpha * (target - predict)

    def train_sim(self, episodes=200):
        for _ in range(episodes):
            state = random.choice(self.states)
            action = self.choose_action(state)
            reward = 1 if state=="AnomalyDetected" and action=="IsolateDevice" else 0
            next_state = random.choice(self.states)
            self.learn(state, action, reward, next_state)

    def recommend(self, anomalies_df: pd.DataFrame):
        self.train_sim()
        risky = anomalies_df[anomalies_df["is_anomaly"]==True].index.tolist()
        best_action = self.q_table.loc["AnomalyDetected"].idxmax()
        return {
            "high_risk_devices": risky,
            "recommended_action": best_action,
            "q_table": self.q_table.to_dict()
        }
