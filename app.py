# app.py
import os
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()  # if you later need env vars

app = FastAPI(
    title="On-Chain Guard Anomaly API",
    description="Serve wallet‐level anomaly scores from IsolationForest",
)

# Load persisted assets once at startup
MODEL = joblib.load("model/isolation_forest.pkl")
FEATURES = pd.read_parquet("data/wallet_features.parquet")
ANOMALIES = pd.read_parquet("data/wallet_anomalies.parquet")

class AnomalyResponse(BaseModel):
    wallet: str
    anomaly_score: float
    net_token_flow: float
    send_recv_ratio: float

@app.get("/health")
def health():
    return {"status": "ok", "chain_id": FEATURES.shape[0]}

@app.get("/anomalies", response_model=list[AnomalyResponse])
def list_anomalies(top_n: int = 100):
    df = ANOMALIES.sort_values("anomaly_score", ascending=False).head(top_n)
    return [
        AnomalyResponse(
            wallet=row.wallet,
            anomaly_score=float(row.anomaly_score),
            net_token_flow=float(row.net_token_flow),
            send_recv_ratio=float(row.send_recv_ratio),
        )
        for row in df.itertuples()
    ]

@app.get("/anomaly/{wallet}", response_model=AnomalyResponse)
def get_anomaly(wallet: str):
    row = ANOMALIES[ANOMALIES.wallet.str.lower() == wallet.lower()]
    if row.empty:
        raise HTTPException(status_code=404, detail="Wallet not found")
    row = row.iloc[0]
    return AnomalyResponse(
        wallet=row.wallet,
        anomaly_score=float(row.anomaly_score),
        net_token_flow=float(row.net_token_flow),
        send_recv_ratio=float(row.send_recv_ratio),
    )
