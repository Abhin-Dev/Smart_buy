# SmartBuy — Retail Analytics & Customer Behaviour Drift Detection

A full-stack AI web application for retail analytics that analyses transaction datasets, detects changing purchase patterns over time, segments customers, and recommends trending products.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + TailwindCSS + Recharts |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| ML | Pandas, NumPy, Scikit-learn, mlxtend |

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (database named `smartbuy`)

### Backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```
API runs on `http://localhost:8000` — Swagger docs at `/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`.

### Sample Dataset
A sample CSV is included at `backend/sample_data/retail_data.csv`.  
Upload it via the app's Dataset Upload page to get started.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload_dataset` | Upload CSV dataset |
| GET | `/api/clusters` | Customer segmentation data |
| GET | `/api/trends?window=24h` | Behaviour trends (1h/24h/7d) |
| GET | `/api/recommendations?customer_id=` | Product recommendations |
| GET | `/api/drift_report` | Full drift analysis |

## Features
- **Dataset Upload** — CSV upload with validation and preview
- **Data Preprocessing** — Automatic cleaning, RFM computation
- **Customer Segmentation** — K-Means clustering on RFM features
- **Behaviour Drift Detection** — Sliding window trend analysis
- **Recommendation Engine** — Apriori association rules with personalisation
