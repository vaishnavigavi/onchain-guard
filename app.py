# main.py
import os
from typing import List
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# 1) Load .env (for any paths / RPC URLs, etc)
load_dotenv()

app = FastAPI(
    title="On-Chain Guard Anomaly API",
    description="Serve wallet-level anomaly scores, history & transfers",
    version="0.1.0",
)

# 2) CORS (development only)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3) Load your model & data files
MODEL = joblib.load(os.getenv("MODEL_PATH", "model/isolation_forest.pkl"))

# current features/anomalies
FEATURES = pd.read_parquet(os.getenv("FEATURES_PATH", "data/wallet_features.parquet"))
ANOMALIES = pd.read_parquet(os.getenv("ANOMALIES_PATH", "data/wallet_anomalies.parquet"))

# historical anomaly scores
HISTORY_DF = pd.read_parquet(os.getenv("HISTORY_PATH", "data/wallet_anomaly_history.parquet"))

# token transfers
TRANSFERS_DF = pd.read_parquet(os.getenv("TRANSFERS_PATH", "data/token_transfers.parquet"))

# 4) Pydantic schemas
class AnomalyResponse(BaseModel):
    wallet: str
    anomaly_score: float
    net_token_flow: float
    send_recv_ratio: float

class HistoryPoint(BaseModel):
    timestamp: str          # ISO8601
    anomaly_score: float

class Transfer(BaseModel):
    tx_hash: str
    block_number: int
    token_symbol: str
    from_addr: str
    to_addr: str
    value: float

# 5) Routes

@app.get("/health")
def health():
    return {"status": "ok", "num_wallets": FEATURES.shape[0]}

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
    df = ANOMALIES[ANOMALIES.wallet.str.lower() == wallet.lower()]
    if df.empty:
        raise HTTPException(404, "Wallet not found")
    r = df.iloc[0]
    return AnomalyResponse(
        wallet=r.wallet,
        anomaly_score=float(r.anomaly_score),
        net_token_flow=float(r.net_token_flow),
        send_recv_ratio=float(r.send_recv_ratio),
    )

@app.get("/anomaly-history/{wallet}", response_model=List[HistoryPoint])
def get_anomaly_history(wallet: str):
    df = HISTORY_DF[HISTORY_DF.wallet.str.lower() == wallet.lower()]
    if df.empty:
        return []
    out: List[HistoryPoint] = []
    for r in df.sort_values("timestamp").itertuples(index=False):
        # ensure timestamp is a string
        ts = r.timestamp.isoformat() if hasattr(r.timestamp, "isoformat") else str(r.timestamp)
        out.append(HistoryPoint(timestamp=ts, anomaly_score=float(r.anomaly_score)))
    return out

@app.get("/transfers/{wallet}", response_model=List[Transfer])
def get_transfers(wallet: str, limit: int = 20):
    try:
        # Get transfers where the wallet is either sender or receiver
        df = TRANSFERS_DF[
            (TRANSFERS_DF['from'].str.lower() == wallet.lower()) |
            (TRANSFERS_DF['to'].str.lower() == wallet.lower())
        ].sort_values("block_number", ascending=False).head(limit)
        
        if df.empty:
            return []
        
        return [
            Transfer(
                tx_hash=row['tx_hash'],
                block_number=int(row['block_number']),
                token_symbol=row['token_symbol'],
                from_addr=row['from'],
                to_addr=row['to'],
                value=float(row['value'])
            )
            for _, row in df.iterrows()
        ]
    except Exception as e:
        print(f"Error in get_transfers: {str(e)}")
        raise HTTPException(500, f"Error processing transfers: {str(e)}")