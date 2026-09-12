import pandas as pd
import numpy as np
import logging
import json
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

def load_data(filepath: str) -> pd.DataFrame:
    """Load the raw PVGIS dataset."""
    logging.info(f"Loading data from {filepath}")
    # PVGIS files have 10 rows of metadata at the top, and some footer lines at the bottom.
    df = pd.read_csv(filepath, skiprows=10)
    # The columns are time,P,G(i),H_sun,T2m,WS10m,Int
    # Drop footer lines: look for rows where time is missing or not a string starting with "20"
    df = df.dropna(subset=['time'])
    df = df[df['time'].str.startswith('20')]
    
    # Rename columns for clarity
    df = df.rename(columns={
        'time': 'timestamp',
        'P': 'generation_w',
        'G(i)': 'irradiance',
        'H_sun': 'sun_height',
        'T2m': 'temperature',
        'WS10m': 'wind_speed'
    })
    
    return df

def validate_data(df: pd.DataFrame) -> pd.DataFrame:
    """Validate and clean the dataframe."""
    initial_rows = len(df)
    logging.info(f"Initial rows before cleaning: {initial_rows}")
    
    # Parse timestamp
    df['timestamp'] = pd.to_datetime(df['timestamp'], format='%Y%m%d:%H%M')
    
    # Cast all other columns to numeric
    numeric_cols = [c for c in df.columns if c != 'timestamp']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        
    # Sort chronologically
    df = df.sort_values('timestamp')
    
    # Drop duplicates
    df = df.drop_duplicates(subset=['timestamp'])
    duplicates_removed = initial_rows - len(df)
    logging.info(f"Duplicates removed: {duplicates_removed}")
    
    # Fill missing timestamps (resample to 1H if needed)
    df = df.set_index('timestamp')
    df = df.resample('1h').mean(numeric_only=True)
    df = df.reset_index()
    
    # Handle missing values
    missing_before = df.isnull().sum().sum()
    df = df.interpolate(method='linear')
    df = df.fillna(0) # For edge cases
    logging.info(f"Missing values interpolated/filled: {missing_before}")
    
    # Detect impossible negative solar generation
    invalid_gen_mask = df['generation_w'] < 0
    invalid_gen_count = invalid_gen_mask.sum()
    df.loc[invalid_gen_mask, 'generation_w'] = 0
    logging.info(f"Negative generation values corrected to 0: {invalid_gen_count}")
    
    # Handle values exceeding installed capacity (50kW = 50000W)
    max_capacity_w = 50000
    exceeding_mask = df['generation_w'] > max_capacity_w
    exceeding_count = exceeding_mask.sum()
    df.loc[exceeding_mask, 'generation_w'] = max_capacity_w
    logging.info(f"Generation values exceeding capacity capped: {exceeding_count}")
    
    # Convert generation to MW for easier math later (50kW = 0.05 MW)
    df['generation_mw'] = df['generation_w'] / 1e6
    
    # Handle nighttime generation logically
    # If sun height <= 0, generation should be 0
    if 'sun_height' in df.columns:
        night_mask = (df['sun_height'] <= 0) & (df['generation_mw'] > 0)
        night_count = night_mask.sum()
        df.loc[night_mask, 'generation_mw'] = 0
        logging.info(f"Nighttime generation corrected to 0: {night_count}")
    
    final_rows = len(df)
    logging.info(f"Rows after cleaning: {final_rows}")

    stats = {
        "initial_rows": int(initial_rows),
        "final_rows": int(final_rows),
        "duplicates_removed": int(duplicates_removed),
        "missing_values_filled": int(missing_before),
        "negative_generation_corrected": int(invalid_gen_count),
        "over_capacity_capped": int(exceeding_count),
        "nighttime_generation_corrected": int(night_count),
        "date_range": [df['timestamp'].min().isoformat(), df['timestamp'].max().isoformat()],
        "completeness_pct": round(100 * (1 - missing_before / max(initial_rows * len(numeric_cols), 1)), 2),
    }

    return df, stats

def save_clean_data(df: pd.DataFrame, filepath: str):
    """Save cleaned dataset."""
    output_path = Path(filepath)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    logging.info(f"Cleaned data saved to {filepath}")

def save_data_health(stats: dict, filepath: str):
    """Save data quality report."""
    output_path = Path(filepath)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(stats, f, indent=4)
    logging.info(f"Data health report saved to {filepath}")

def main():
    raw_path = 'backend/data/raw/pvgis_data.csv'
    clean_path = 'backend/data/processed/clean_data.csv'
    health_path = 'backend/artifacts/metrics/data_health.json'
    df = load_data(raw_path)
    df, stats = validate_data(df)
    save_clean_data(df, clean_path)
    save_data_health(stats, health_path)

if __name__ == "__main__":
    main()
