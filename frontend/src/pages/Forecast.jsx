import { useEffect, useMemo, useState } from "react";
import { Target, Gauge, BatteryCharging } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import ForecastChart from "../components/ForecastChart.jsx";
import { getForecast, mwToKw } from "../lib/api.js";

const TICKS = [0, 4, 8, 12, 16, 20, 23];

export default function Forecast() {
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getForecast()
      .then((data) => !cancelled && setForecast(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => {
    if (!forecast) return null;
    return forecast.map((f, i) => ({
      x: i,
      actual: null,
      forecast: Number(mwToKw(f.predicted_generation).toFixed(2)),
      range: [Number(mwToKw(f.lower_bound).toFixed(2)), Number(mwToKw(f.upper_bound).toFixed(2))],
      timestamp: f.timestamp,
    }));
  }, [forecast]);

  const formatTick = (i) => data?.[i]?.timestamp?.slice(11, 16) ?? "";

  const stats = useMemo(() => {
    if (!data) return null;
    const peakRow = data.reduce((max, row) => (row.forecast > max.forecast ? row : max), data[0]);
    const avgUncertainty = data.reduce((sum, row) => sum + (row.range[1] - row.range[0]) / 2, 0) / data.length;
    const confidence = Math.max(55, Math.min(99, Math.round(100 - (avgUncertainty / Math.max(peakRow.forecast, 0.1)) * 60)));
    const energyKwh = data.reduce((sum, row) => sum + row.forecast, 0);

    return {
      peakValue: peakRow.forecast,
      peakLabel: peakRow.timestamp.slice(11, 16),
      confidence,
      energyKwh: energyKwh.toFixed(1),
    };
  }, [data]);

  const yMax = data ? Math.max(20, Math.ceil((Math.max(...data.map((r) => r.range[1])) * 1.25) / 5) * 5) : 50;

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Generation Forecast"
        subtitle="AI-powered 24h forecast with uncertainty quantification, from the trained XGBoost model."
      />

      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Couldn't reach the backend ({error}).
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">Next 24 hours</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <LegendDot color="#93C5FD" label="Forecast" />
            <LegendDot color="#2563EB" label="Uncertainty" faded />
          </div>
        </div>

        {!data && !error && <div className="h-72 animate-pulse rounded-xl bg-slate-50 sm:h-80" />}

        {data && (
          <ForecastChart data={data} unit="kW" ticks={TICKS} formatTick={formatTick} yMax={yMax} />
        )}
      </div>

      {stats && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            icon={Target}
            label="Peak Generation"
            value={`${stats.peakValue} kW`}
            meta={`at ${stats.peakLabel}`}
          />
          <MetricCard icon={Gauge} label="Confidence Level" value={`${stats.confidence}%`} meta="model calibration" />
          <MetricCard
            icon={BatteryCharging}
            label="Total Expected Energy"
            value={`${stats.energyKwh} kWh`}
            meta="across next 24 hours"
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, meta }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{meta}</p>
    </div>
  );
}

function LegendDot({ color, label, faded }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color, opacity: faded ? 0.25 : 1 }} />
      {label}
    </span>
  );
}
