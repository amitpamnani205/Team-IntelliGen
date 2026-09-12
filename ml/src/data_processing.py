"""Load, validate, and clean raw generation/weather time series."""

import pandas as pd


def load_raw(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["timestamp"])
    return df.sort_values("timestamp").reset_index(drop=True)


def validate(df: pd.DataFrame, installed_capacity: float) -> pd.DataFrame:
    df = df.drop_duplicates(subset="timestamp")
    df = df[df["generation"] >= 0]
    df = df[df["generation"] <= installed_capacity]
    return df.reset_index(drop=True)


def resample(df: pd.DataFrame, freq: str = "1h") -> pd.DataFrame:
    return (
        df.set_index("timestamp")
        .resample(freq)
        .mean()
        .interpolate(limit=3)
        .reset_index()
    )
