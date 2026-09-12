import pytest
import pandas as pd
from backend.risk.risk_engine import calculate_surplus_deficit, calculate_risk
from backend.risk.recommendation_engine import generate_recommendations

def test_surplus_calculation():
    # generation > demand
    res = calculate_surplus_deficit(
        generation_mw=0.05, demand_mw=0.02, 
        battery_charge_cap=0.01, battery_discharge_cap=0.01, 
        export_cap=0.01, backup_cap=0.01
    )
    assert res['surplus_mw'] == pytest.approx(0.03)
    assert res['deficit_mw'] == 0
    # available flex for surplus is bat_charge (0.01) + export (0.01) = 0.02
    # residual surplus = 0.03 - 0.02 = 0.01
    assert res['residual_surplus_mw'] == pytest.approx(0.01)

def test_deficit_calculation():
    # demand > generation
    res = calculate_surplus_deficit(
        generation_mw=0.01, demand_mw=0.04, 
        battery_charge_cap=0.01, battery_discharge_cap=0.01, 
        export_cap=0.01, backup_cap=0.01
    )
    assert res['deficit_mw'] == pytest.approx(0.03)
    assert res['surplus_mw'] == 0
    # available flex for deficit is bat_discharge (0.01) + backup (0.01) = 0.02
    # residual deficit = 0.03 - 0.02 = 0.01
    assert res['residual_deficit_mw'] == pytest.approx(0.01)

def test_risk_classification():
    # CRITICAL Deficit
    risk = calculate_risk(
        generation_mw=0.01, lower_bound=0.00, upper_bound=0.02,
        demand_mw=0.05, battery_charge_cap=0.01, battery_discharge_cap=0.01,
        export_cap=0.01, backup_cap=0.01, residual_surplus=0, residual_deficit=0.02,
        uncertainty_width=0.01
    )
    assert risk['risk_level'] == "CRITICAL"
    assert risk['risk_type'] == "DEFICIT"

    # NORMAL
    risk = calculate_risk(
        generation_mw=0.02, lower_bound=0.01, upper_bound=0.03,
        demand_mw=0.02, battery_charge_cap=0.01, battery_discharge_cap=0.01,
        export_cap=0.01, backup_cap=0.01, residual_surplus=0, residual_deficit=0,
        uncertainty_width=0.01
    )
    assert risk['risk_level'] == "LOW" or risk['risk_level'] == "NORMAL"

def test_recommendations():
    recs = generate_recommendations(
        risk_level="CRITICAL", risk_type="DEFICIT",
        surplus=0, deficit=0.03, residual_surplus=0, residual_deficit=0.01, timestamp="2026-09-12T12:00:00"
    )
    assert len(recs) > 0
    assert recs[0]['action'] == "Escalate residual exposure"

    recs_surplus = generate_recommendations(
        risk_level="CRITICAL", risk_type="SURPLUS",
        surplus=0.03, deficit=0, residual_surplus=0.01, residual_deficit=0, timestamp="2026-09-12T12:00:00"
    )
    assert len(recs_surplus) > 0
    assert recs_surplus[0]['action'] == "Curtail residual surplus"
