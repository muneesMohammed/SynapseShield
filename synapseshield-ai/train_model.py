import pandas as pd
import torch
from ai_engine import preprocess, train_autoencoder

# Example baseline "normal" telemetry data
df = pd.DataFrame({
    "cpuUsage": [0.1, 0.2, 0.3, 0.4],
    "networkPackets": [100, 150, 120, 130],
    "failedLogins": [0, 0, 1, 0],
    "trafficVolume": [2000, 2400, 2200, 2100]
})

df_norm, _ = preprocess(df)
model = train_autoencoder(df_norm)

# Save trained model
torch.save(model.state_dict(), "autoencoder_model.pt")

print("✅ Model trained & saved successfully")
