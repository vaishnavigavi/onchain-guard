import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from pathlib import Path

def main():
    # 1. Load the wallet features
    df = pd.read_parquet("data/wallet_features.parquet")
    
    # 2. Prepare the feature matrix
    X = df.drop(columns=["wallet"]).values

    # 3. Fit an IsolationForest (flag ~1% as anomalies)
    model = IsolationForest(
        n_estimators=100,
        contamination=0.01,
        random_state=42
    )
    labels = model.fit_predict(X)
    # map: normal (1) → 0, anomaly (-1) → 1
    df["is_anomaly"] = (labels == -1).astype(int)
    df["anomaly_score"] = model.decision_function(X) * -1  # higher = more anomalous

    # 4. Save the results
    df.to_parquet("data/wallet_anomalies.parquet", index=False)
    # Persist the model to disk
    Path("model").mkdir(exist_ok=True)
    joblib.dump(model, "model/isolation_forest.pkl")
    print(f"✅ Trained model and saved results → data/wallet_anomalies.parquet")
    print("\nTop 10 suspicious wallets:")
    print(
        df.sort_values("anomaly_score", ascending=False)
          .head(10)[["wallet", "anomaly_score", "net_token_flow", "send_recv_ratio"]]
          .to_string(index=False)
    )

if __name__ == "__main__":
    main()
