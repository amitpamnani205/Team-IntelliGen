"""Time, lag, and rolling features for the forecasting models."""

import pandas as pd


def add_time_features(df: pd.DataFrame, ts_col: str = "timestamp") -> pd.DataFrame:
    df = df.copy()
    df["hour"] = df[ts_col].dt.hour
    df["day_of_week"] = df[ts_col].dt.dayofweek
    df["month"] = df[ts_col].dt.month
    return df


def add_lag_features(df: pd.DataFrame, col: str, lags=(1, 2, 3, 24)) -> pd.DataFrame:
    df = df.copy()
    for lag in lags:
        df[f"{col}_lag_{lag}"] = df[col].shift(lag)
    return df


def add_rolling_features(df: pd.DataFrame, col: str, windows=(3, 6, 24)) -> pd.DataFrame:
    df = df.copy()
    for window in windows:
        df[f"{col}_roll_mean_{window}"] = df[col].rolling(window).mean()
    return df
