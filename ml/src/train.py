"""Entry point: load data, build features, train and save the forecaster."""

import argparse

from src.data_processing import load_raw, validate, resample
from src.features import add_time_features, add_lag_features, add_rolling_features
from src.models.xgboost_model import XGBoostForecaster

FEATURE_COLS = [
    "hour", "day_of_week", "month",
    "generation_lag_1", "generation_lag_2", "generation_lag_3", "generation_lag_24",
    "generation_roll_mean_3", "generation_roll_mean_6", "generation_roll_mean_24",
]
TARGET_COL = "generation"


def build_dataset(path: str, installed_capacity: float):
    df = load_raw(path)
    df = validate(df, installed_capacity)
    df = resample(df)
    df = add_time_features(df)
    df = add_lag_features(df, TARGET_COL)
    df = add_rolling_features(df, TARGET_COL)
    return df.dropna().reset_index(drop=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="path to raw generation CSV")
    parser.add_argument("--capacity", type=float, required=True, help="installed capacity (MW)")
    parser.add_argument("--out", default="ml/artifacts/xgboost_forecaster.joblib")
    args = parser.parse_args()

    df = build_dataset(args.data, args.capacity)
    model = XGBoostForecaster().fit(df[FEATURE_COLS], df[TARGET_COL])
    model.save(args.out)
    print(f"Saved model to {args.out}")


if __name__ == "__main__":
    main()
