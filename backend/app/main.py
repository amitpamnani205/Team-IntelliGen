from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
from typing import List, Optional
import datetime

from backend.ml.predict import generate_24h_forecast, load_model_artifacts
from backend.risk.risk_engine import evaluate_situation
from backend.risk.recommendation_engine import generate_recommendations

app = FastAPI(title="IntelliGen Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration (Simulated Grid Context)
class GridConfig:
    installed_capacity = 0.05  # MW (50kW)
    demand = 0.012            # MW (12kW baseline)
    battery_capacity = 0.1    # MW (100kWh)
    battery_soc = 0.05        # Current charge
    battery_charge_capacity = 0.006   # MW (6kW)
    battery_discharge_capacity = 0.008  # MW (8kW)
    export_capacity = 0.006   # MW (6kW)
    backup_capacity = 0.006   # MW (6kW)

config = GridConfig()

# We need a way to get "recent data" for the forecast. In a real system, this comes from a DB.
# Here we'll just load the last few rows of our clean data.
def get_recent_data():
    df = pd.read_csv('backend/data/processed/clean_data.csv')
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    return df.tail(48) # Last 48 hours is enough for up to 24h lag and rolling window 24h

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/model-info")
def get_model_info():
    model, features, uncertainty_width = load_model_artifacts()
    with open('backend/artifacts/metrics/evaluation.json', 'r') as f:
        metrics = json.load(f)

    importances = model.feature_importances_
    feature_importance = sorted(
        [{"feature": f, "importance": round(float(i), 4)} for f, i in zip(features, importances)],
        key=lambda x: x["importance"],
        reverse=True,
    )[:8]

    improvement_pct = round(
        100 * (metrics["baseline_mae"] - metrics["xgboost_mae"]) / metrics["baseline_mae"], 2
    )

    return {
        "metrics": {**metrics, "improvement_over_baseline_pct": improvement_pct},
        "feature_importance": feature_importance,
        "model_type": "XGBoost Regressor",
        "n_features": len(features),
    }

@app.get("/data-health")
def get_data_health():
    with open('backend/artifacts/metrics/data_health.json', 'r') as f:
        return json.load(f)

@app.get("/forecast")
def get_forecast():
    recent_data = get_recent_data()
    forecast = generate_24h_forecast(recent_data)
    return forecast

@app.get("/recent")
def get_recent(hours: int = 24):
    recent_data = get_recent_data().tail(hours)
    return [
        {"timestamp": row['timestamp'].isoformat(), "generation_mw": float(row['generation_mw'])}
        for _, row in recent_data.iterrows()
    ]

@app.get("/risk")
def get_risk():
    recent_data = get_recent_data()
    forecast = generate_24h_forecast(recent_data)
    
    risks = []
    for f in forecast:
        gen = f['predicted_generation']
        # Simulated demand with some noise or daily profile (simplified here to constant for now)
        # We can add a basic diurnal demand profile later if needed.
        demand = config.demand
        
        eval_res = evaluate_situation(
            generation=gen,
            lower=f['lower_bound'],
            upper=f['upper_bound'],
            demand=demand,
            bat_charge=config.battery_charge_capacity,
            bat_discharge=config.battery_discharge_capacity,
            export=config.export_capacity,
            backup=config.backup_capacity,
            uncertainty=f['interval_width']
        )
        eval_res['timestamp'] = f['timestamp']
        eval_res['generation'] = gen
        eval_res['demand'] = demand
        risks.append(eval_res)
        
    return risks

@app.get("/recommendations")
def get_recommendations():
    risks = get_risk()
    all_recs = []
    
    for r in risks:
        recs = generate_recommendations(
            risk_level=r['risk_level'],
            risk_type=r['risk_type'],
            surplus=r['surplus_mw'],
            deficit=r['deficit_mw'],
            residual_surplus=r['residual_surplus_mw'],
            residual_deficit=r['residual_deficit_mw'],
            timestamp=r['timestamp']
        )
        all_recs.extend(recs)
        
    # Sort by priority and time
    all_recs.sort(key=lambda x: (x['priority'], x['time']))
    return all_recs

class ScenarioRequest(BaseModel):
    solar_change_percent: float = 0.0
    battery_change_percent: float = 0.0
    export_change_percent: float = 0.0

@app.post("/scenario")
def run_scenario(scenario: ScenarioRequest):
    recent_data = get_recent_data()
    base_forecast = generate_24h_forecast(recent_data)
    
    results = []
    for f in base_forecast:
        # Apply scenario changes
        gen = f['predicted_generation'] * (1 + scenario.solar_change_percent / 100.0)
        lower = f['lower_bound'] * (1 + scenario.solar_change_percent / 100.0)
        upper = f['upper_bound'] * (1 + scenario.solar_change_percent / 100.0)
        
        bat_charge = config.battery_charge_capacity * (1 + scenario.battery_change_percent / 100.0)
        bat_discharge = config.battery_discharge_capacity * (1 + scenario.battery_change_percent / 100.0)
        export_cap = config.export_capacity * (1 + scenario.export_change_percent / 100.0)
        
        demand = config.demand
        
        eval_res = evaluate_situation(
            generation=gen,
            lower=lower,
            upper=upper,
            demand=demand,
            bat_charge=bat_charge,
            bat_discharge=bat_discharge,
            export=export_cap,
            backup=config.backup_capacity,
            uncertainty=f['interval_width']
        )
        eval_res['timestamp'] = f['timestamp']
        eval_res['generation'] = gen
        eval_res['demand'] = demand
        results.append(eval_res)

    return results

@app.get("/dashboard-data")
def get_dashboard_data():
    recent_data = get_recent_data()
    forecast = get_forecast()
    risks = get_risk()
    recs = get_recommendations()

    # Just return top 5 recommendations
    top_recs = [r for r in recs if r['priority'] == 1][:5]

    latest_row = recent_data.iloc[-1]
    worst_risk = max(risks, key=lambda r: r['risk_score']) if risks else None

    return {
        "forecast": forecast,
        "risks": risks,
        "recommendations": top_recs,
        "latest_actual": {
            "timestamp": latest_row['timestamp'].isoformat(),
            "generation_mw": float(latest_row['generation_mw']),
        },
        "worst_risk": worst_risk,
        "config": {
            "installed_capacity_mw": config.installed_capacity,
            "demand_mw": config.demand,
            "battery_capacity_mw": config.battery_capacity
        }
    }
