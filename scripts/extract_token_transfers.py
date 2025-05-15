import os
from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware  # for Web3.py v7+
import pandas as pd

load_dotenv()
RPC = os.getenv("ALCHEMY_API_URL")
w3 = Web3(Web3.HTTPProvider(RPC))
w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

 # Keccak256 hash of "Transfer(address,address,uint256)" (must include 0x)
TRANSFER_TOPIC = "0x" + w3.keccak(text="Transfer(address,address,uint256)").hex()


def fetch_token_transfers(start_block: int, end_block: int):
    logs = w3.eth.get_logs({
         "fromBlock": start_block,
         "toBlock":   end_block,
         "topics":    [TRANSFER_TOPIC],
     })
    records = []
    for log in logs:
        # skip any malformed log that doesn’t have [sig, from, to]
        if len(log.topics) < 3:
            continue
        from_addr = "0x" + log.topics[1].hex()[-40:]
        to_addr   = "0x" + log.topics[2].hex()[-40:]

         # parse value (defaulting empty data to "0")
        raw       = log.data.hex() or "0"
        value     = int(raw, 16) / 1e18
        records.append({
             "token_contract": log.address,
             "from":           from_addr,
             "to":             to_addr,
             "value":          value,
             "block_number":   log.blockNumber,
             "tx_hash":        log.transactionHash.hex(),
         })
    return pd.DataFrame(records)


if __name__ == "__main__":


    df_blocks = pd.read_parquet("data/recent_tx.parquet")
    start = int(df_blocks.block_number.min())
    end   = int(df_blocks.block_number.max())


    df_tokens = fetch_token_transfers(start, end)
    out_path = "data/token_transfers.parquet"
    df_tokens.to_parquet(out_path, index=False)
    print(f"✅ Saved {len(df_tokens)} token transfers → {out_path}")
