# api/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd

app = FastAPI()

# Load your backfilled history (run this once at startup)
# Make sure you’ve run your ETL/model pipeline and have this file!
history_df = pd.read_parquet("wallet_anomalies.parquet")

class HistoryPoint(BaseModel):
    timestamp: str        # ISO8601
    anomaly_score: float

@app.get("/anomaly-history/{wallet_address}", response_model=List[HistoryPoint])
async def get_anomaly_history(wallet_address: str):
    df = history_df[history_df.wallet == wallet_address]
    # Return an empty list if we’ve never seen this wallet
    if df.empty:
        return []
    # Sort by timestamp and serialize
    out = []
    for _, row in df.sort_values("timestamp").iterrows():
        out.append(HistoryPoint(
            timestamp=row.timestamp.isoformat(),
            anomaly_score=row.anomaly_score
        ))
    return out
