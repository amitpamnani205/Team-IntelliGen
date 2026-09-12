import pandas as pd
import numpy as np
import joblib
import json
from pathlib import Path
from backend.ml.features import generate_features

def load_model_artifacts():
    model = joblib.load('backend/artifacts/models/xgboost_model.joblib')
    with open('backend/artifacts/models/features.json', 'r') as f:
        features = json.load(f)
    with open('backend/artifacts/metrics/evaluation.json', 'r') as f:
        metrics = json.load(f)
    return model, features, metrics['uncertainty_width']

def generate_24h_forecast(recent_data: pd.DataFrame, future_weather: pd.DataFrame = None):
    """
    Generate 24h recursive forecast.
    recent_data: The last 24+ hours of actual data (to calculate lags).
    future_weather: DataFrame with timestamps and weather variables for next 24h.
                    If None, we persist the last known weather as a basic assumption.
    """
    model, features, uncertainty_width = load_model_artifacts()
    
    # We need to predict 24 steps
    predictions = []
    
    # Work on a copy of recent data so we can append to it
    df = recent_data.copy()
    
    last_timestamp = pd.to_datetime(df['timestamp'].iloc[-1])
    
    for i in range(24):
        next_ts = last_timestamp + pd.Timedelta(hours=i+1)
        
        # Create a new row for the future step
        new_row = {'timestamp': next_ts}
        
        if future_weather is not None and len(future_weather) > i:
            # Use provided weather forecast
            for col in ['irradiance', 'sun_height', 'temperature', 'wind_speed']:
                if col in future_weather.columns:
                    new_row[col] = future_weather.iloc[i][col]
        else:
            # Persistence assumption for weather: use the weather from 24h ago
            # so the diurnal cycle is maintained
            past_row = df.iloc[-24]
            for col in ['irradiance', 'sun_height', 'temperature', 'wind_speed']:
                if col in past_row:
                    new_row[col] = past_row[col]
                    
        # Append new row
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        
        # Recalculate features
        df_feats = generate_features(df, is_training=False)
        
        # Get the latest row's features and cast to float
        current_features = df_feats.iloc[-1][features].to_frame().T.astype(float)
        
        # Predict
        pred = model.predict(current_features)[0]
        
        # Clip negative generation or nighttime
        if 'sun_height' in df_feats.columns and df_feats['sun_height'].iloc[-1] <= 0:
            pred = 0.0
        else:
            pred = max(0.0, pred)
            
        # Set the prediction as the generation_mw for this step so next steps can use it as lag
        df.loc[df.index[-1], 'generation_mw'] = pred
        
        # Save prediction
        lower = max(0.0, pred - uncertainty_width) if pred > 0 else 0.0
        upper = pred + uncertainty_width if pred > 0 else 0.0
        
        predictions.append({
            'timestamp': next_ts.isoformat(),
            'predicted_generation': float(pred),
            'lower_bound': float(lower),
            'upper_bound': float(upper),
            'interval_width': float(uncertainty_width)
        })
        
    return predictions
