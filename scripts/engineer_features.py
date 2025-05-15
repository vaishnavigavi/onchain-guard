import pandas as pd
from pathlib import Path

def main():
    # 1. Load data
    df_tx     = pd.read_parquet("data/recent_tx.parquet")           # raw txs
    df_tokens = pd.read_parquet("data/token_transfers.parquet")     # ERC-20 transfers

    # 2. Prepare token flows per wallet
    #    a) Outbound transfers
    out = (
        df_tokens
        .groupby("from")
        .agg(
            tokens_sent_count=("tx_hash", "nunique"),
            tokens_sent_value=("value", "sum"),
            unique_tokens_sent=("token_contract", "nunique"),
        )
        .rename_axis("wallet")
    )

    #    b) Inbound transfers
    inp = (
        df_tokens
        .groupby("to")
        .agg(
            tokens_recv_count=("tx_hash", "nunique"),
            tokens_recv_value=("value", "sum"),
            unique_tokens_recv=("token_contract", "nunique"),
        )
        .rename_axis("wallet")
    )

    # 3. On-chain activity features from raw txs
    tx_feats = (
        df_tx
        .groupby("from")
        .agg(
            txs_sent_count=("tx_hash", "nunique"),
            eth_sent_value=("value_eth", "sum"),
        )
        .rename_axis("wallet")
    )

    # 4. Combine all into a single wallet-features DataFrame
    features = (
        pd.concat([out, inp, tx_feats], axis=1)
        .fillna(0)  # wallets with no inbound or no outbound still get zeros
        .reset_index()
    )

    # 5. Add net-flows and ratios
    features["net_token_flow"] = features.tokens_recv_value - features.tokens_sent_value
    features["send_recv_ratio"] = (
        features.tokens_sent_count / (features.tokens_recv_count.replace(0, 1))
    )

    # 6. Save for modeling
    Path("data").mkdir(exist_ok=True)
    features.to_parquet("data/wallet_features.parquet", index=False)
    print(f"✅ Created features for {len(features)} wallets → data/wallet_features.parquet")

if __name__ == "__main__":
    main()
