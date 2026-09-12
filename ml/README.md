# IntelliGen ML

Forecasting model training pipeline. This is where models are built and evaluated; `backend/` loads the resulting artifacts to serve predictions at inference time.

## Structure

```
ml/
├── data/
│   ├── raw/         # untouched source data (gitignored)
│   └── processed/   # cleaned/feature-engineered data (gitignored)
├── notebooks/        # exploration and model-comparison notebooks
├── src/
│   ├── data_processing.py   # load, validate, resample
│   ├── features.py          # time/lag/rolling features
│   ├── models/
│   │   ├── persistence.py   # baseline model
│   │   └── xgboost_model.py # primary model, quantile regression for uncertainty bands
│   ├── train.py              # training entry point
│   └── evaluate.py           # MAE / RMSE / MAPE / interval coverage
└── artifacts/         # saved model files (gitignored)
```

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Train

```bash
python -m src.train --data data/raw/solar_generation.csv --capacity 1000
```

Saves a fitted `XGBoostForecaster` (quantile models for the 10th/50th/90th percentiles, used as the forecast + uncertainty range) to `artifacts/`.

## Model Strategy

1. **Persistence baseline** — establishes the benchmark every other model must beat.
2. **XGBoost (primary)** — quantile regression gives both the point forecast and the uncertainty interval the risk engine needs.
3. **LSTM / ensemble (optional)** — only added if validation shows it beats XGBoost; complexity must be earned.
