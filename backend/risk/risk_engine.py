def calculate_surplus_deficit(generation_mw, demand_mw, battery_charge_cap, battery_discharge_cap, export_cap, backup_cap):
    initial_surplus = max(generation_mw - demand_mw, 0)
    available_surplus_flexibility = battery_charge_cap + export_cap
    residual_surplus = max(initial_surplus - available_surplus_flexibility, 0)

    initial_deficit = max(demand_mw - generation_mw, 0)
    available_deficit_flexibility = battery_discharge_cap + backup_cap
    residual_deficit = max(initial_deficit - available_deficit_flexibility, 0)

    return {
        "surplus_mw": initial_surplus,
        "deficit_mw": initial_deficit,
        "residual_surplus_mw": residual_surplus,
        "residual_deficit_mw": residual_deficit
    }

def calculate_risk(generation_mw, lower_bound, upper_bound, demand_mw, 
                   battery_charge_cap, battery_discharge_cap, export_cap, backup_cap,
                   residual_surplus, residual_deficit, uncertainty_width):
                   
    # Ensure variables are non-negative
    residual_surplus = max(0, residual_surplus)
    residual_deficit = max(0, residual_deficit)

    risk_level = "LOW"
    risk_score = 0
    risk_type = "NORMAL"
    risk_reason = "Forecast comfortably fits available flexibility."

    if residual_deficit > 0:
        risk_level = "CRITICAL"
        risk_score = 90 + min(10, (residual_deficit / max(demand_mw, 1e-9)) * 10)
        risk_type = "DEFICIT"
        risk_reason = f"Expected deficit ({residual_deficit:.2f} MW) exceeds available flexibility."
    elif residual_surplus > 0:
        risk_level = "CRITICAL"
        risk_score = 90 + min(10, (residual_surplus / max(generation_mw, 1e-9)) * 10)
        risk_type = "SURPLUS"
        risk_reason = f"Expected surplus ({residual_surplus:.2f} MW) exceeds export and battery charge capacity."
    else:
        # Check uncertainty overlap
        worst_case_generation = lower_bound
        worst_case_deficit = max(demand_mw - worst_case_generation, 0)
        worst_case_residual_deficit = max(worst_case_deficit - (battery_discharge_cap + backup_cap), 0)
        
        best_case_generation = upper_bound
        best_case_surplus = max(best_case_generation - demand_mw, 0)
        worst_case_residual_surplus = max(best_case_surplus - (battery_charge_cap + export_cap), 0)

        if worst_case_residual_deficit > 0:
            risk_level = "HIGH"
            risk_score = 75
            risk_type = "DEFICIT"
            risk_reason = "Forecast uncertainty overlaps a meaningful deficit condition."
        elif worst_case_residual_surplus > 0:
            risk_level = "HIGH"
            risk_score = 75
            risk_type = "SURPLUS"
            risk_reason = "Forecast uncertainty overlaps a meaningful surplus condition."
        else:
            # Check if approaching constraints (Medium Risk)
            # Arbitrary threshold: if we are using > 80% of flexibility
            if demand_mw > generation_mw:
                deficit = demand_mw - generation_mw
                flex_used = deficit / max((battery_discharge_cap + backup_cap), 1e-9)
                if flex_used > 0.8:
                    risk_level = "MEDIUM"
                    risk_score = 50
                    risk_type = "DEFICIT"
                    risk_reason = "Forecast approaches deficit operational constraint (>80% flexibility used)."
            elif generation_mw > demand_mw:
                surplus = generation_mw - demand_mw
                flex_used = surplus / max((battery_charge_cap + export_cap), 1e-9)
                if flex_used > 0.8:
                    risk_level = "MEDIUM"
                    risk_score = 50
                    risk_type = "SURPLUS"
                    risk_reason = "Forecast approaches surplus operational constraint (>80% flexibility used)."

    return {
        "risk_level": risk_level,
        "risk_score": round(risk_score, 1),
        "risk_type": risk_type,
        "risk_reason": risk_reason
    }

def evaluate_situation(generation, lower, upper, demand, bat_charge, bat_discharge, export, backup, uncertainty):
    sd = calculate_surplus_deficit(generation, demand, bat_charge, bat_discharge, export, backup)
    risk = calculate_risk(generation, lower, upper, demand, bat_charge, bat_discharge, export, backup, 
                          sd['residual_surplus_mw'], sd['residual_deficit_mw'], uncertainty)
    
    return {**sd, **risk}
