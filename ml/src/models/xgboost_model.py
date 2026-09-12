"""XGBoost forecaster with quantile models for the uncertainty interval."""

import joblib
import xgboost as xgb


class XGBoostForecaster:
    def __init__(self, quantiles=(0.1, 0.5, 0.9), **xgb_params):
        self.quantiles = quantiles
        self.xgb_params = xgb_params
        self.models = {}

    def fit(self, X, y):
        for q in self.quantiles:
            model = xgb.XGBRegressor(
                objective="reg:quantileerror",
                quantile_alpha=q,
                **self.xgb_params,
            )
            model.fit(X, y)
            self.models[q] = model
        return self

    def predict(self, X) -> dict:
        return {q: model.predict(X) for q, model in self.models.items()}

    def save(self, path: str):
        joblib.dump(self, path)

    @staticmethod
    def load(path: str) -> "XGBoostForecaster":
        return joblib.load(path)
