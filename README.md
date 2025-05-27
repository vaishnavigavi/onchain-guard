# On-Chain Guard

**On-Chain Guard** is an end-to-end Web3 × ML anomaly detection platform designed to ingest, process, and analyze on-chain transaction data to surface suspicious wallet behavior. This proof-of-concept demonstrates a production-grade pipeline from data collection through model inference and interactive visualization.

---

## 🚀 Project Highlights

* **Real-Time On-Chain ETL**: Fetches full transaction data and token transfer logs from Polygon using Web3.py and Alchemy RPC.
* **Feature Engineering**: Computes per-wallet metrics (token flows, send/receive ratios) at scale, stored in Parquet for fast analytics.
* **Anomaly Detection**: Trains an IsolationForest model on wallet features, identifies top suspicious addresses, and serializes model with joblib.
* **Robust API**: FastAPI service exposing endpoints for global anomalies (`/anomalies`), wallet-specific scores (`/anomaly/{wallet}`) and health-checks, with CORS configured for front-end consumption.
* **Interactive Dashboard**: Next.js + SWR + Tailwind CSS front-end that dynamically displays anomaly rankings, wallet detail cards, and supports drill-down exploration.
* **Dockerized & CI/CD Ready**: Can be containerized via Docker and orchestrated with Docker Compose; ideal for GitHub Actions automation, and cloud deployment (e.g., Cloud Run, Vercel).

---

## 📐 Architecture

```text
+----------------------+     +----------------------+     +------------------+
| On-Chain ETL (Py)    | --> | Feature Store (Parquet)| --> | Anomaly Model     |
| - Web3.py, Alchemy   |     | - wallet_features.parquet| | - IsolationForest|
+----------------------+     +----------------------+     +------------------+
         |                                  |                      |
         v                                  v                      v
+----------------------+     +----------------------+     +------------------+
| Token Transfers Data |     | Anomaly Scores      | --> | FastAPI Service  |
| - data/token_transfers.parquet |  | - data/wallet_anomalies.parquet | | - /anomalies,    |
+----------------------+     +----------------------+     |   /anomaly/{addr}|
                                                      +------------------+
                                                                |
                                                                v
                                                     +------------------------+
                                                     | Next.js Dashboard      |
                                                     | - SWR, Tailwind, Drill-|
                                                     |   down pages           |
                                                     +------------------------+
```

---

## 📦 Tech Stack

* **Data & ML**: Python 3.9, Web3.py, pandas, scikit-learn, joblib
* **API**: FastAPI, Uvicorn, Pydantic, CORS middleware
* **Frontend**: Next.js (React), SWR, Tailwind CSS
* **Data Storage**: Parquet files (local), easily extended to S3/MinIO
* **Containerization**: Docker, Docker Compose
* **CI/CD**: GitHub Actions (scripts to rebuild ETL, retrain model, redeploy)

---

## ⚙️ Local Setup

### Prerequisites

* Python 3.9+ and pip
* Node.js 18+ and npm
* Docker & Docker Compose (optional but recommended)
* Alchemy (or equivalent) RPC key for Polygon

### 1. Clone & Dependencies

```bash
git clone https://github.com/vaishnavigavi/onchain-guard.git
cd onchain-guard
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` in the root:

```env
ALCHEMY_API_URL=https://polygon-mumbai.g.alchemy.com/v2/<<YOUR_KEY>>
```

### 3. Run ETL & Model Training

```bash
# Backfill recent blocks → token_transfers.parquet
python scripts/fetch_blocks.py
python scripts/extract_token_transfers.py
python scripts/engineer_features.py
python scripts/train_anomaly_model.py
```

### 4. Launch Services

```bash
# Terminal 1: API
uvicorn app:app --reload --port 8000

# Terminal 2 (root): Next.js Frontend
cd frontend
npm run dev -- -p 3001
```

Open [http://localhost:3001/anomalies](http://localhost:3001/anomalies) to browse.

---

## 🐳 Dockerized Deployment

```bash
# Build all services
docker-compose build
# Bring up ETL, API, Frontend
docker-compose up
```

---

## 🌐 Cloud Deployment

1. Push containers to your registry (Docker Hub, GCR, ECR).
2. Use GitHub Actions to redeploy to Cloud Run (API) and Vercel (Next.js).
3. Set up managed storage (e.g., GCS/S3) for Parquet and model artifacts.

---

## 🛠 Future Improvements

* Swap IsolationForest for a Graph Neural Network (PyTorch Geometric)
* Real-time streaming with Kafka / WebSockets
* Feature store (Redis / Postgres) for sub-second lookups
* Wallet authentication & user-specific alerts via WalletConnect
* Add historical trend graphs and downloadable reports

---


*This README frames **On-Chain Guard** as an end-to-end, production-ready Web3 × ML service—perfect for showcasing on your resume or portfolio.*
