import pandas as pd
import numpy as np

def create_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create time-based features from timestamp."""
    df = df.copy()
    if 'timestamp' in df.columns:
        dt = df['timestamp']
    else:
        dt = df.index
        
    df['hour'] = dt.dt.hour
    df['day_of_week'] = dt.dt.dayofweek
    df['day_of_month'] = dt.dt.day
    df['month'] = dt.dt.month
    df['day_of_year'] = dt.dt.dayofyear
    df['is_weekend'] = (dt.dt.dayofweek >= 5).astype(int)
    
    # Cyclical encoding for time features
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24.0)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24.0)
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12.0)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12.0)
    
    return df

def create_solar_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create historical generation lag and rolling features."""
    df = df.copy()
    
    # Lags
    lags = [1, 2, 3, 6, 12, 24]
    for lag in lags:
        df[f'lag_{lag}'] = df['generation_mw'].shift(lag)
        
    # Rolling stats
    df['rolling_mean_3'] = df['generation_mw'].shift(1).rolling(window=3).mean()
    df['rolling_mean_24'] = df['generation_mw'].shift(1).rolling(window=24).mean()
    df['rolling_std_24'] = df['generation_mw'].shift(1).rolling(window=24).std()
    
    return df

def create_interaction_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create weather/solar interaction features if available."""
    df = df.copy()
    if 'irradiance' in df.columns and 'temperature' in df.columns:
        # Simple interaction: high irradiance but cool temp is great for PV efficiency
        df['irradiance_temp_ratio'] = df['irradiance'] / (df['temperature'] + 10) # +10 to avoid division by zero/negatives usually
    return df

def generate_features(df: pd.DataFrame, is_training: bool = True) -> pd.DataFrame:
    """Full feature engineering pipeline."""
    df = create_time_features(df)
    df = create_solar_features(df)
    df = create_interaction_features(df)
    
    if is_training:
        # Drop rows with NaN from lags
        df = df.dropna()
        
    return df
