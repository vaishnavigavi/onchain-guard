# api/main.py
import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="On-Chain Guard Anomaly API",
    description="Serve wallet-level anomaly scores and transfers",
)

# We expect your Parquets in /app/data inside the container
DATA_DIR = os.getenv("DATA_DIR", "data")
ANOMALIES_PATH = os.path.join(DATA_DIR, "wallet_anomalies.parquet")
FEATURES_PATH  = os.path.join(DATA_DIR, "wallet_features.parquet")

# load at startup
ANOMALIES: pd.DataFrame = pd.read_parquet(ANOMALIES_PATH)
FEATURES:  pd.DataFrame = pd.read_parquet(FEATURES_PATH)

class AnomalyResponse(BaseModel):
    wallet: str
    anomaly_score: float
    net_token_flow: float
    send_recv_ratio: float

class HistoryPoint(BaseModel):
    timestamp: str       # ISO8601
    anomaly_score: float

@app.get("/health")
def health():
    return {"status": "ok", "count_features": FEATURES.shape[0]}

@app.get("/anomalies", response_model=List[AnomalyResponse])
def list_anomalies(top_n: int = 100):
    df = ANOMALIES.sort_values("anomaly_score", ascending=False).head(top_n)
    return [
        AnomalyResponse(
            wallet=row.wallet,
            anomaly_score=float(row.anomaly_score),
            net_token_flow=float(row.net_token_flow),
            send_recv_ratio=float(row.send_recv_ratio),
        )
        for row in df.itertuples(index=False)
    ]

@app.get("/anomaly/{wallet}", response_model=AnomalyResponse)
def get_anomaly(wallet: str):
    row = ANOMALIES[ANOMALIES.wallet.str.lower() == wallet.lower()]
    if row.empty:
        raise HTTPException(404, "Wallet not found")
    r = row.iloc[0]
    return AnomalyResponse(
        wallet=r.wallet,
        anomaly_score=float(r.anomaly_score),
        net_token_flow=float(r.net_token_flow),
        send_recv_ratio=float(r.send_recv_ratio),
    )

@app.get("/anomaly-history/{wallet}", response_model=List[HistoryPoint])
def get_anomaly_history(wallet: str):
    df = ANOMALIES[ANOMALIES.wallet.str.lower() == wallet.lower()]
    if df.empty:
        return []
    out: List[HistoryPoint] = []
    for _, row in df.sort_values("timestamp").iterrows():
        out.append(HistoryPoint(
            timestamp=row.timestamp.isoformat(),
            anomaly_score=float(row.anomaly_score),
        ))
    return out
