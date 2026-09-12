def generate_recommendations(risk_level, risk_type, surplus, deficit, residual_surplus, residual_deficit, timestamp):
    recs = []
    
    if risk_type == "SURPLUS":
        if residual_surplus > 0:
            recs.append({
                "priority": 1,
                "action": "Curtail residual surplus",
                "reason": "Expected surplus exceeds all available export and storage capacity.",
                "amount_mw": round(residual_surplus, 2),
                "time": timestamp,
                "risk_level": risk_level
            })
            recs.append({
                "priority": 2,
                "action": "Evaluate flexible demand",
                "reason": "Shift flexible loads to absorb excess generation and avoid curtailment.",
                "amount_mw": round(residual_surplus, 2),
                "time": timestamp,
                "risk_level": risk_level
            })
        else:
            recs.append({
                "priority": 1,
                "action": "Charge battery / Export",
                "reason": "Forecast renewable generation exceeds demand. Store or export excess.",
                "amount_mw": round(surplus, 2),
                "time": timestamp,
                "risk_level": risk_level
            })
            
    elif risk_type == "DEFICIT":
        if residual_deficit > 0:
            recs.append({
                "priority": 1,
                "action": "Escalate residual exposure",
                "reason": "Expected deficit exceeds all available flexibility and backup.",
                "amount_mw": round(residual_deficit, 2),
                "time": timestamp,
                "risk_level": risk_level
            })
        else:
            recs.append({
                "priority": 1,
                "action": "Prepare battery discharge",
                "reason": "Forecast renewable generation falls below demand.",
                "amount_mw": round(deficit, 2),
                "time": timestamp,
                "risk_level": risk_level
            })
            recs.append({
                "priority": 2,
                "action": "Prepare authorized backup generation",
                "reason": "Ensure backup is ready in case of higher than expected deficit.",
                "amount_mw": round(deficit, 2),
                "time": timestamp,
                "risk_level": risk_level
            })
            
    if risk_level in ["LOW", "NORMAL"] and risk_type == "NORMAL":
        recs.append({
            "priority": 1,
            "action": "Monitor system",
            "reason": "Forecast comfortably fits available flexibility. No immediate action required.",
            "amount_mw": 0,
            "time": timestamp,
            "risk_level": risk_level
        })
        
    return recs
