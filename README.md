On-Chain Guard

Hey there! I’m Vaishnavi, and this is On-Chain Guard—a full-stack project that combines Web3 and machine learning to flag suspicious Ethereum wallets and visualize their activity over time.

---

🚀 What it Is

I built this because I wanted a simple way to spot “weird” wallets on Ethereum (or Polygon, etc.) without diving into raw logs. Under the hood:

• FastAPI serves up wallet anomaly scores and transfer history.
• Isolation Forest (from scikit-learn) is our anomaly detector—trained on historical wallet features.
• Next.js frontend (with SWR + Recharts) gives you:
– A dashboard of the top-N suspicious wallets
– Click-through to a wallet’s detail page
– A time-series chart of its anomaly score evolution
• ETL scripts pull on-chain data, compute features, train the model, and backfill history

---

🛠️ How to Run Locally

1. Clone & Configure
   git clone [https://github.com/vaishnavigavi/onchain-guard.git](https://github.com/vaishnavigavi/onchain-guard.git)
   cd onchain-guard
   Copy .env.example to .env and fill in your keys:
   ALCHEMY\_API\_URL=your-polygon-or-eth-rpc
   NEXTAUTH\_URL=[http://localhost:3000](http://localhost:3000)
   NEXT\_PUBLIC\_API\_BASE\_URL=[http://localhost:8000](http://localhost:8000)

2. ETL & Model
   This pipeline:
   – Fetches recent on-chain transfers
   – Computes per-wallet features (volume, flow ratios, etc.)
   – Trains an IsolationForest
   – Dumps wallet\_features.parquet, wallet\_anomalies.parquet, and model/isolation\_forest.pkl
   To run it:
   docker-compose up etl

3. API Backend
   docker-compose up api
   Health check:  GET [http://localhost:8000/health](http://localhost:8000/health)
   List top anomalies:  GET [http://localhost:8000/anomalies?top\_n=50](http://localhost:8000/anomalies?top_n=50)
   Single wallet:       GET [http://localhost:8000/anomaly/{wallet}](http://localhost:8000/anomaly/{wallet})
   History:             GET [http://localhost:8000/anomaly-history/{wallet}](http://localhost:8000/anomaly-history/{wallet})

4. Frontend
   docker-compose up frontend
   Browse to [http://localhost:3000](http://localhost:3000) to see:
   – Dashboard of top suspicious wallets
   – Wallet pages with detail, anomaly-over-time chart, and recent transfers

---

🔍 What’s Inside

• scripts/   ETL and model-training code
• data/      Parquet files for wallet features and anomaly scores
• model/     Trained IsolationForest .pkl
• app.py     FastAPI app serving anomalies and history
• frontend/  Next.js app with App Router, SWR, and Recharts
• docker-compose.yml   Orchestrates ETL, API, and frontend

---

⚙️ Extending & Deploying

1. Add new features by updating the ETL scripts
2. Retrain by rerunning docker-compose up etl
3. Deploy by pointing your Docker setup at your cloud provider and setting env vars
4. Auth is stubbed for wallet-signature login—feel free to hook up NextAuth or OAuth

---

🤝 Feedback & Contributions

This is a one-person project and I’m always eager to hear what you think. Open an issue or message me on GitHub if you run into anything.

Enjoy poking around on-chain data without drowning in raw JSON!

— Vaishnavi
