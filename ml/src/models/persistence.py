"""Persistence baseline: assumes generation matches the same hour on the prior comparable day."""

import pandas as pd


class PersistenceModel:
    def __init__(self, period: int = 24):
        self.period = period

    def predict(self, history: pd.Series, horizon: int) -> pd.Series:
        last_cycle = history.iloc[-self.period:]
        reps = -(-horizon // self.period)
        forecast = pd.concat([last_cycle] * reps, ignore_index=True).iloc[:horizon]
        return forecast.reset_index(drop=True)
