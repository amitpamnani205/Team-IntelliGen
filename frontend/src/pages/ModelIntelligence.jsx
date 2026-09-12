import PageHeader from "../components/PageHeader.jsx";
import Sparkline from "../components/Sparkline.jsx";

const PERFORMANCE_TREND = [88.1, 89.4, 90.2, 90.8, 91.5, 91.9, 92.4];

const FEATURE_IMPORTANCE = [
  { label: "Solar Irradiance", value: 32 },
  { label: "Cloud Cover", value: 24 },
  { label: "Temperature", value: 14 },
  { label: "Humidity", value: 12 },
  { label: "Wind Speed", value: 8 },
];

const SHAP_VALUES = [
  { label: "Cloud Cover", value: 0.3 },
  { label: "Irradiance", value: -0.26 },
  { label: "Temperature", value: -0.12 },
  { label: "Humidity", value: -0.08 },
  { label: "Wind Speed", value: 0.06 },
];

export default function ModelIntelligence() {
  const maxShap = Math.max(...SHAP_VALUES.map((s) => Math.abs(s.value)));

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Model Intelligence"
        subtitle="Transparent, explainable and continuously improving AI models."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 font-bold text-slate-900">Model Performance</h3>
          <p className="mb-5 text-xs text-slate-500">7-day rolling accuracy trend</p>
          <p className="text-3xl font-extrabold text-slate-900">92.4%</p>
          <p className="mb-4 text-xs text-slate-500">MAPE (normalized)</p>
          <Sparkline points={PERFORMANCE_TREND} color="#2563EB" width={220} height={60} responsive />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-bold text-slate-900">Feature Importance</h3>
          <div className="flex flex-col gap-4">
            {FEATURE_IMPORTANCE.map((f) => (
              <div key={f.label}>
                <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
                  <span>{f.label}</span>
                  <span className="font-mono text-slate-700">{f.value}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${f.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-bold text-slate-900">Explainability (SHAP)</h3>
          <div className="flex flex-col gap-3.5">
            {SHAP_VALUES.map((s) => {
              const positive = s.value >= 0;
              const widthPct = (Math.abs(s.value) / maxShap) * 50;
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-slate-500">{s.label}</span>
                  <div className="relative h-4 flex-1">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-slate-200" />
                    <div
                      className={`absolute inset-y-0 rounded-sm ${positive ? "bg-emerald-500" : "bg-rose-500"}`}
                      style={
                        positive
                          ? { left: "50%", width: `${widthPct}%` }
                          : { right: "50%", width: `${widthPct}%` }
                      }
                    />
                  </div>
                  <span
                    className={`w-12 shrink-0 text-right font-mono text-xs font-bold ${
                      positive ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {s.value.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
