# IntelliGen — AI-Powered Renewable Generation Forecasting Platform

**From Renewable Uncertainty to Actionable Grid Intelligence**
HACKOUT '26 — Theme: Renewable Energy Intelligence

## Core Idea

We don't just predict renewable generation — we predict the operational risk it creates and recommend how the grid should prepare for it.

```
FORECAST → UNDERSTAND RISK → RECOMMEND ACTION
```

The platform forecasts solar/wind generation for the next 24–72 hours, quantifies forecast uncertainty, compares it against demand and available flexibility (battery, export, backup), and produces explainable, ranked operational recommendations for surplus and deficit conditions. It is a **decision-support system**, not an autonomous grid controller — final decisions remain with authorized operators.

## Intelligence Loop

```
Weather + Generation Data → AI Forecast → Uncertainty & Risk Analysis →
Operational Recommendation → Operator Decision → Actual Generation Feedback → Updated Forecast
```

## Architecture

```
Data Sources → Data Processing & Feature Engineering → AI Forecasting Engine →
Uncertainty Estimation → Risk Engine → Decision Engine → Operator Dashboard
```

| Layer | Responsibility |
|---|---|
| Data Ingestion | Historical generation, weather data/APIs, plant params, demand, storage, export/backup limits |
| Data Processing | Cleaning, validation, time alignment, feature engineering |
| Forecasting Engine | Persistence baseline, XGBoost (primary), optional LSTM/ensemble — 24–72h horizon |
| Risk Engine | Surplus/deficit detection using forecast + uncertainty + grid flexibility |
| Decision Engine | Ranked, explainable recommendations (charge/export/curtail, discharge/backup/escalate) |
| Operator Dashboard | Forecast timeline, confidence bands, risk timeline, action center, scenario simulator |

## Repository Structure

```
IntelliGen/
├── backend/    # Python API — data pipeline, forecasting, risk & decision engines
├── frontend/   # React dashboard — forecast, risk timeline, recommendations, scenario simulator
└── README.md
```

## MVP Scope

- **Renewable source:** Solar first (wind after core architecture is validated)
- **Forecast horizon:** 24–72 hours
- **Models:** Persistence baseline → XGBoost (primary) → LSTM (optional, only if validated as an improvement)
- **Data:** Public/historical generation + weather datasets/APIs; demand, storage and export constraints simulated and explicitly labelled as such
- **Backend:** Python API service (data preprocessing, model inference, risk calculation, recommendation generation, scenario simulation)
- **Frontend:** React dashboard (forecast chart, risk timeline, recommendation cards, explanation panel, scenario simulator)

## Risk Categories

| Level | Meaning | Action |
|---|---|---|
| LOW | Forecast range comfortably within flexibility | Continue monitoring |
| MEDIUM | Forecast approaching an operational constraint | Prepare flexibility |
| HIGH | Forecast range overlaps a meaningful surplus/deficit | Pre-position resources |
| CRITICAL | Expected condition exceeds available flexibility | Escalate to operators |

## Design Boundary

The platform does **not** autonomously control generators, batteries, or grid infrastructure. It provides prediction, risk assessment, and recommendations only — authorized operators make the final call.

## Team

**IntelliGen** — HACKOUT '26 Ideation Submission
