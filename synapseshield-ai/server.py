# server.py
import os
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import pandas as pd
from ai_engine import train_autoencoder, load_model, detect_anomalies_from_df, AttackPredictor, preprocess
from adt_client import query_twins, update_twin_property
from eventhub_listener import start_listener
import threading
import uvicorn

app = FastAPI(title="SynapseShield AI Service")

# --------------------------
# Request/response models
# --------------------------
class TelemetryPoint(BaseModel):
    deviceId: str
    cpuUsage: float
    networkPackets: float
    failedLogins: int
    trafficVolume: float

class TrainRequest(BaseModel):
    # file-based or list of telemetry rows (for demo)
    rows: list

# --------------------------
# Endpoints
# --------------------------
@app.post("/train")
def train(req: TrainRequest):
    """
    Train autoencoder on supplied rows (list of dicts)
    """
    df = pd.DataFrame(req.rows)
    if df.empty:
        raise HTTPException(status_code=400, detail="No rows provided")
    # Only pick numeric columns expected
    cols = ["cpuUsage", "networkPackets", "failedLogins", "trafficVolume"]
    df = df[cols].astype(float)
    model = train_autoencoder(df, epochs=50)
    return {"status": "trained", "model_path": os.environ.get("AE_MODEL_PATH", "autoencoder_model.pt")}

@app.post("/predict")
def predict_point(t: TelemetryPoint):
    """
    Score a single telemetry point and return anomaly result and recommended action
    """
    df = pd.DataFrame([{
        "cpuUsage": t.cpuUsage,
        "networkPackets": t.networkPackets,
        "failedLogins": t.failedLogins,
        "trafficVolume": t.trafficVolume
    }])
    model = load_model()
    scored, thr = detect_anomalies_from_df(model, df)
    predictor = AttackPredictor()
    rec = predictor.recommend(scored)
    return {
        "deviceId": t.deviceId,
        "anomaly_score": float(scored["anomaly_score"].iloc[0]),
        "is_anomaly": bool(scored["is_anomaly"].iloc[0]),
        "threshold_used": thr,
        "recommended_action": rec["recommended_action"]
    }

@app.post("/start-listener")
def start_listener_endpoint(background_tasks: BackgroundTasks):
    """
    Start EventHub listener in background thread (for demo).
    In production, run listener as separate process/service.
    """
    thread = threading.Thread(target=start_listener, daemon=True)
    thread.start()
    return {"status":"listener_started"}

@app.get("/twins")
def get_twins(q: str = "SELECT * FROM DIGITALTWINS"):
    """
    Query ADT (provide simple query). Returns list of twin dicts (caveat: can be large).
    """
    try:
        res = query_twins(q)
        return {"count": len(res), "items": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run via `uvicorn server:app --reload --port 8000`
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
