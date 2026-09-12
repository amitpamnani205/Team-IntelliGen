import { useEffect, useState } from "react";
import { Sun, Database, CalendarRange } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { getDataHealth } from "../lib/api.js";

function Gauge({ value }) {
  const size = 176;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#10B981"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DataHealth() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getDataHealth()
      .then((data) => !cancelled && setHealth(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const issues = health
    ? [
        { label: "Duplicate timestamps removed", value: health.duplicates_removed },
        { label: "Missing values interpolated", value: health.missing_values_filled },
        { label: "Negative generation corrected", value: health.negative_generation_corrected },
        { label: "Over-capacity values capped", value: health.over_capacity_capped },
        { label: "Nighttime generation corrected", value: health.nighttime_generation_corrected },
      ]
    : [];
  const warnings = issues.filter((i) => i.value > 0).length;
  const critical = health && health.completeness_pct < 95 ? 1 : 0;

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader title="Data Health" subtitle="Data quality report from the preprocessing pipeline." />

      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Couldn't reach the backend ({error}).
        </p>
      )}

      {!health && !error && <div className="h-64 animate-pulse rounded-2xl bg-slate-50" />}

      {health && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 font-bold text-slate-900">Overall Data Health</h3>
              <div className="relative mx-auto grid place-items-center">
                <Gauge value={health.completeness_pct} />
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-900">{health.completeness_pct}%</span>
                  <span className="text-xs text-slate-500">Completeness</span>
                  <span className="mt-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                    {health.completeness_pct >= 99 ? "Good" : "Needs review"}
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-rose-50 px-4 py-3 text-center">
                  <p className="text-2xl font-extrabold text-rose-600">{critical}</p>
                  <p className="text-xs font-medium text-rose-500">Critical Issues</p>
                </div>
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
                  <p className="text-2xl font-extrabold text-amber-600">{warnings}</p>
                  <p className="text-xs font-medium text-amber-600">Warnings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-1 font-bold text-slate-900">Dataset</h3>
              <p className="mb-4 text-xs text-slate-500">PVGIS solar + weather time series, resampled to 1h</p>
              <div className="mb-5 flex flex-col gap-3">
                <SourceRow icon={Sun} label="PVGIS (solar + weather)" detail="Source API" />
                <SourceRow
                  icon={CalendarRange}
                  label={`${health.date_range[0].slice(0, 10)} → ${health.date_range[1].slice(0, 10)}`}
                  detail="Date range"
                />
                <SourceRow icon={Database} label={`${health.final_rows.toLocaleString()} hourly rows`} detail="Row count" />
              </div>

              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Cleaning pipeline results
              </h4>
              <div className="flex flex-col divide-y divide-slate-100">
                {issues.map((i) => (
                  <div key={i.label} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="text-sm text-slate-600">{i.label}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        i.value > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {i.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SourceRow({ icon: Icon, label, detail }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-[11px] text-slate-400">{detail}</p>
      </div>
    </div>
  );
}
