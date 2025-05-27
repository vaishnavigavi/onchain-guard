#!/usr/bin/env python
import os
import pandas as pd
import joblib
from datetime import datetime

# Paths (adjust if yours differ)
FEATURES_PATH = "data/wallet_features.parquet"
ANOMALIES_PATH = "data/wallet_anomalies.parquet"
HISTORY_PATH   = "data/wallet_anomaly_history.parquet"
MODEL_PATH     = "model/isolation_forest.pkl"

# 1) load
features = pd.read_parquet(FEATURES_PATH)
model    = joblib.load(MODEL_PATH)

# 2) score
# assume features has columns: wallet, net_token_flow, send_recv_ratio, plus your model inputs
X = features.drop(columns=["wallet"])
features["anomaly_score"] = -model.decision_function(X)

# 3) current snapshot
anomalies = features[["wallet","anomaly_score","net_token_flow","send_recv_ratio"]]
anomalies.to_parquet(ANOMALIES_PATH, index=False)
print(f"Wrote {len(anomalies)} rows to {ANOMALIES_PATH}")

# 4) append to history
if os.path.exists(HISTORY_PATH):
    history = pd.read_parquet(HISTORY_PATH)
else:
    history = pd.DataFrame(columns=list(anomalies.columns) + ["timestamp"])

anomalies["timestamp"] = pd.Timestamp.utcnow()
history = pd.concat([history, anomalies], ignore_index=True)
history.to_parquet(HISTORY_PATH, index=False)
print(f"Wrote history with {len(history)} total rows to {HISTORY_PATH}")
