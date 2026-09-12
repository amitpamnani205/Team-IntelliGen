"""Forecast-quality and uncertainty-calibration metrics."""

import numpy as np


def mae(y_true, y_pred):
    return np.mean(np.abs(y_true - y_pred))


def rmse(y_true, y_pred):
    return np.sqrt(np.mean((y_true - y_pred) ** 2))


def mape(y_true, y_pred, eps=1e-6):
    return np.mean(np.abs((y_true - y_pred) / (y_true + eps))) * 100


def interval_coverage(y_true, lower, upper):
    return np.mean((y_true >= lower) & (y_true <= upper))


def interval_width(lower, upper):
    return np.mean(upper - lower)
