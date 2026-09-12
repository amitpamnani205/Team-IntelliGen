# IntelliGen Backend

Python API service responsible for data preprocessing, forecasting (persistence baseline, XGBoost, optional LSTM), risk calculation, recommendation generation, and scenario simulation.

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
