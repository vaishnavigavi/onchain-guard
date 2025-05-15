import os
from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
import pandas as pd


load_dotenv()
RPC = os.getenv("ALCHEMY_API_URL")
print("🔍 Loaded RPC URL:", RPC)

# create Web3 instance
w3 = Web3(Web3.HTTPProvider(RPC))

# PoA chains (Polygon, BSC, etc.) send extraData >32 bytes—this middleware trims it
w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)


if __name__ == "__main__":
    if not w3.is_connected():
        raise RuntimeError("Failed to connect to Polygon Mumbai RPC")
    print("✅ Connected to chain ID:", w3.eth.chain_id)  # expecting 80001

    def fetch_recent_tx(n_blocks: int = 100):
        latest = w3.eth.get_block("latest").number
        records = []
        for block_num in range(latest - n_blocks + 1, latest + 1):
            block = w3.eth.get_block(block_num, full_transactions=True)
            ts = block.timestamp
            for tx in block.transactions:
                records.append({
                    "tx_hash": tx.hash.hex(),
                    "block_number": block_num,
                    "timestamp": ts,
                    "from": tx["from"],
                    "to": tx["to"],
                    "value_eth": w3.from_wei(tx["value"], "ether"),
                    "gas": tx["gas"],
                    "gas_price_gwei": w3.from_wei(tx["gasPrice"], "gwei"),
                    "input": tx["input"],
                })

        return pd.DataFrame(records)

    df = fetch_recent_tx()
    out_path = "data/recent_tx.parquet"
    df.to_parquet(out_path, index=False)
    print(f"✅ Saved {len(df)} transactions → {out_path}")
