import streamlit as st
import pandas as pd

@st.cache_data
def load_data():
    return pd.read_parquet("data/wallet_anomalies.parquet")

# Page layout
st.set_page_config(page_title="On-Chain Guard Dashboard", layout="wide")
st.title("On-Chain Guard: Anomaly Dashboard")

# Load data
df = load_data().sort_values("anomaly_score", ascending=False)

# Sidebar controls
st.sidebar.header("Controls")
top_n = st.sidebar.slider("Top N wallets", min_value=10, max_value=500, value=50, step=10)
wallet = st.sidebar.text_input("Inspect wallet (address)")

# Display top N anomalies
st.subheader(f"Top {top_n} Suspicious Wallets")
st.dataframe(
    df.head(top_n)[["wallet", "anomaly_score", "net_token_flow", "send_recv_ratio"]],
    use_container_width=True
)

# Wallet detail view
if wallet:
    st.subheader(f"Details for {wallet}")
    detail = df[df.wallet.str.lower() == wallet.lower()]
    if not detail.empty:
        st.json(detail.iloc[0].to_dict())
    else:
        st.warning("Wallet not found in current anomaly set.")
