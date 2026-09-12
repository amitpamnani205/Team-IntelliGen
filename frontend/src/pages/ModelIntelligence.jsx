import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { getModelInfo } from "../lib/api.js";

export default function ModelIntelligence() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getModelInfo()
      .then((data) => !cancelled && setInfo(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const maxImportance = info ? Math.max(...info.feature_importance.map((f) => f.importance)) : 1;

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Model Intelligence"
        subtitle="Real evaluation metrics and feature importance from the trained XGBoost model."
      />

      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Couldn't reach the backend ({error}).
        </p>
      )}

      {!info && !error && <div className="h-64 animate-pulse rounded-2xl bg-slate-50" />}

      {info && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-1 font-bold text-slate-900">Model Performance</h3>
            <p className="mb-5 text-xs text-slate-500">Held-out test set (chronological split)</p>
            <p className="text-3xl font-extrabold text-slate-900">
              {info.metrics.improvement_over_baseline_pct.toFixed(1)}%
            </p>
            <p className="mb-4 text-xs text-slate-500">MAE improvement vs. 24h persistence baseline</p>
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <Metric label="R²" value={info.metrics.xgboost_r2.toFixed(4)} />
              <Metric label="MAE" value={`${(info.metrics.xgboost_mae * 1000).toFixed(3)} kW`} />
              <Metric label="RMSE" value={`${(info.metrics.xgboost_rmse * 1000).toFixed(3)} kW`} />
              <Metric label="Baseline MAE" value={`${(info.metrics.baseline_mae * 1000).toFixed(3)} kW`} />
              <Metric label="Model" value={info.model_type} />
              <Metric label="Features used" value={info.n_features} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-1 font-bold text-slate-900">Feature Importance</h3>
            <p className="mb-5 text-xs text-slate-500">Gain-based importance from the trained XGBoost model</p>
            <div className="flex flex-col gap-4">
              {info.feature_importance.map((f) => (
                <div key={f.feature}>
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
                    <span>{f.feature}</span>
                    <span className="font-mono text-slate-700">{(f.importance * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${(f.importance / maxImportance) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-2 first:border-none first:pt-0">
      <span>{label}</span>
      <span className="font-mono font-semibold text-slate-700">{value}</span>
    </div>
  );
}
