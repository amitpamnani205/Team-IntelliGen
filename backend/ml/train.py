import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
import logging
from pathlib import Path
from backend.ml.features import generate_features

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

def baseline_persistence(y_true, y_pred_baseline):
    """Evaluate persistence baseline (e.g., generation at t = generation at t-24)."""
    mask = ~np.isnan(y_pred_baseline) & ~np.isnan(y_true)
    y_true_clean = y_true[mask]
    y_pred_clean = y_pred_baseline[mask]
    
    mae = mean_absolute_error(y_true_clean, y_pred_clean)
    rmse = np.sqrt(mean_squared_error(y_true_clean, y_pred_clean))
    r2 = r2_score(y_true_clean, y_pred_clean)
    return mae, rmse, r2

def train_model():
    # Load processed data
    data_path = 'backend/data/processed/clean_data.csv'
    df = pd.read_csv(data_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    logging.info(f"Dataset shape before features: {df.shape}")
    
    # Generate features
    df = generate_features(df, is_training=True)
    logging.info(f"Dataset shape after features: {df.shape}")
    
    # Define features and target
    target = 'generation_mw'
    # Use only historical features and current weather (assuming we have weather forecast in production)
    features = [c for c in df.columns if c not in [target, 'timestamp', 'generation_w']]
    logging.info(f"Features used: {features}")
    
    # Chronological Split (70% train, 15% val, 15% test)
    n = len(df)
    train_end = int(n * 0.7)
    val_end = int(n * 0.85)
    
    train_df = df.iloc[:train_end]
    val_df = df.iloc[train_end:val_end]
    test_df = df.iloc[val_end:]
    
    X_train, y_train = train_df[features], train_df[target]
    X_val, y_val = val_df[features], val_df[target]
    X_test, y_test = test_df[features], test_df[target]
    
    logging.info(f"Train size: {len(X_train)}, Val size: {len(X_val)}, Test size: {len(X_test)}")
    
    # Baseline (24h persistence)
    baseline_pred = test_df['lag_24']
    b_mae, b_rmse, b_r2 = baseline_persistence(y_test, baseline_pred)
    logging.info(f"Baseline MAE: {b_mae:.4f}, RMSE: {b_rmse:.4f}, R²: {b_r2:.4f}")
    
    # Train XGBoost
    model = xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        early_stopping_rounds=10
    )
    
    model.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_val, y_val)],
        verbose=False
    )
    
    # Evaluate
    y_pred = model.predict(X_test)
    xgb_mae = mean_absolute_error(y_test, y_pred)
    xgb_rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    xgb_r2 = r2_score(y_test, y_pred)
    
    logging.info(f"XGBoost MAE: {xgb_mae:.4f}, RMSE: {xgb_rmse:.4f}, R²: {xgb_r2:.4f}")
    logging.info(f"Improvement over baseline (MAE): {((b_mae - xgb_mae)/b_mae)*100:.2f}%")
    
    # Calculate residuals for uncertainty estimation
    residuals = y_test - y_pred
    uncertainty_width = np.percentile(np.abs(residuals), 90) # 90% confidence width estimate
    
    # Save artifacts
    Path('backend/artifacts/models').mkdir(parents=True, exist_ok=True)
    Path('backend/artifacts/metrics').mkdir(parents=True, exist_ok=True)
    
    joblib.dump(model, 'backend/artifacts/models/xgboost_model.joblib')
    with open('backend/artifacts/models/features.json', 'w') as f:
        json.dump(features, f)
        
    metrics = {
        "baseline_mae": b_mae,
        "xgboost_mae": xgb_mae,
        "xgboost_rmse": xgb_rmse,
        "xgboost_r2": xgb_r2,
        "uncertainty_width": float(uncertainty_width)
    }
    with open('backend/artifacts/metrics/evaluation.json', 'w') as f:
        json.dump(metrics, f, indent=4)
        
    logging.info("Model and metrics saved.")

if __name__ == "__main__":
    train_model()
