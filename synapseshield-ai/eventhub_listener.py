# eventhub_listener.py
from azure.eventhub import EventHubConsumerClient
import os
import json
import pandas as pd
from ai_engine import load_model, detect_anomalies_from_df, AttackPredictor
from adt_client.py import update_twin_property  # small import path note below

# Environment variables
EVENT_HUB_CONN_STR = os.environ.get("EVENT_HUB_CONN_STR")
EVENT_HUB_NAME = os.environ.get("EVENT_HUB_NAME")
CONSUMER_GROUP = os.environ.get("EVENT_HUB_CONSUMER_GROUP", "$Default")
MODEL_DEVICE = os.environ.get("MODEL_DEVICE", "cpu")

if not EVENT_HUB_CONN_STR or not EVENT_HUB_NAME:
    raise EnvironmentError("Set EVENT_HUB_CONN_STR and EVENT_HUB_NAME")

model = load_model(device=MODEL_DEVICE)
predictor = AttackPredictor()

def on_event(partition_context, event):
    body = event.body_as_str(encoding="UTF-8")
    try:
        data = json.loads(body)
    except Exception:
        print("[EventHub] Could not parse JSON", body)
        return

    # map incoming event fields to the expected dataframe columns
    row = {
        "cpuUsage": data.get("cpuUsage", 0.0),
        "networkPackets": data.get("networkPackets", 0.0),
        "failedLogins": data.get("failedLogins", 0),
        "trafficVolume": data.get("trafficVolume", 0.0)
    }
    df = pd.DataFrame([row])

    scored_df, threshold = detect_anomalies_from_df(model, df, threshold=None, device=MODEL_DEVICE)
    print("[EventHub] Scored:", scored_df.to_dict(orient="records"))

    # If anomaly detected, recommend action and write to ADT twin property
    if scored_df["is_anomaly"].iloc[0]:
        res = predictor.recommend(scored_df)
        # Example: update twin with lastAnomalyScore and recommendedAction
        twin_id = data.get("deviceId") or data.get("device_id")  # ensure events carry device id
        if twin_id:
            try:
                update_twin_property(twin_id, "/lastAnomalyScore", float(scored_df["anomaly_score"].iloc[0]))
                update_twin_property(twin_id, "/recommendedAction", res["recommended_action"])
            except Exception as e:
                print("[ADT] Failed to update twin:", e)
        print("[AI] Recommendation:", res)

    partition_context.update_checkpoint(event)

def start_listener():
    client = EventHubConsumerClient.from_connection_string(
        conn_str=EVENT_HUB_CONN_STR,
        consumer_group=CONSUMER_GROUP,
        eventhub_name=EVENT_HUB_NAME
    )
    with client:
        client.receive(on_event=on_event, starting_position="-1")
