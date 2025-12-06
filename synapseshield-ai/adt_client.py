# adt_client.py
from azure.digitaltwins.core import DigitalTwinsClient
from azure.identity import DefaultAzureCredential
import os
import json

ADT_URL = os.environ.get("ADT_URL")  # e.g. https://<your-instance>.api.<region>.digitaltwins.azure.net

if ADT_URL is None:
    raise EnvironmentError("Set ADT_URL env var")

credential = DefaultAzureCredential()
adt_client = DigitalTwinsClient(ADT_URL, credential)

def query_twins(query: str):
    """
    Returns list of twin dicts
    """
    result = adt_client.query_twins(query)
    return list(result)

def update_twin_property(twin_id: str, path: str, value):
    """
    patch path must be like "/propertyName"
    """
    patch = [{"op":"replace","path":path,"value":value}]
    try:
        adt_client.update_digital_twin(twin_id, patch)
    except Exception as e:
        # try add if replace fails
        patch = [{"op":"add","path":path,"value":value}]
        adt_client.update_digital_twin(twin_id, patch)
