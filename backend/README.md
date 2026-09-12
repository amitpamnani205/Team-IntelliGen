# IntelliGen Backend

The backend for **IntelliGen**, a hackathon project built for HackOut '26. It combines the ML forecasting pipeline and the API that serves the dashboard in one service.

## Architecture

1. **Data Preprocessing**: Reads raw solar + weather data and cleans it (timestamp parsing, interpolation, negative value clipping).
2. **Feature Engineering**: Generates time features (sin/cos embeddings, day/hour) and historical generation lags.
3. **ML Forecasting (XGBoost)**: Predicts the next 24 hours of solar generation with quantified uncertainty using residuals.
4. **Risk Engine**: Compares the generation forecast (and uncertainty bounds) against simulated grid conditions (demand, battery capacity, export limits) to classify operational risk.
5. **Recommendation Engine**: Generates deterministic, explainable recommendations (e.g., "Charge battery", "Curtail surplus") based on the risk profile.
6. **FastAPI Backend**: Serves the 24-hour forecast, risk analysis, and recommendations for frontend integration, including scenario simulation capabilities.

All commands below are run from the **repository root** (not from inside `backend/`).

## Setup

1. **Create a virtualenv and install dependencies**:
   ```bash
   python3 -m venv backend/venv
   source backend/venv/bin/activate
   pip install -r backend/requirements.txt
   ```
2. **Download the dataset** (a sample 50kW PV dataset from PVGIS):
   ```bash
   python backend/download_data.py
   ```
3. **Preprocess data**:
   ```bash
   python -m backend.ml.preprocessing
   ```
4. **Train the XGBoost model**:
   ```bash
   python -m backend.ml.train
   ```
   This saves the trained model to `backend/artifacts/models/`.

## Running the API

```bash
uvicorn backend.app.main:app --reload
```
Access the interactive docs at `http://localhost:8000/docs`.

## Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Liveness check |
| `/forecast` | GET | 24h generation forecast with uncertainty bounds |
| `/risk` | GET | Risk classification per forecast hour |
| `/recommendations` | GET | Ranked, explainable actions |
| `/dashboard-data` | GET | Combined forecast + risk + top recommendations + latest actual reading |
| `/scenario` | POST | Re-run risk under a hypothetical solar/battery/export change |

## Testing

```bash
pytest backend/tests/
```
