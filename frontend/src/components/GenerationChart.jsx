import { useEffect, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getRecent, getForecast, getDashboardData, mwToKw } from "../lib/api.js";

const HOUR_TICKS = [0, 6, 12, 18, 24, 30, 36, 42, 48];

function hourLabel(isoTimestamp) {
  return isoTimestamp.slice(11, 16);
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-lg">
      <p className="mb-1.5 font-mono font-semibold text-slate-700">{row.label}</p>
      {row.actual != null && (
        <p className="flex items-center justify-between gap-4 text-blue-600">
          Actual <span className="font-mono font-bold">{row.actual.toFixed(1)} kW</span>
        </p>
      )}
      {row.forecast != null && (
        <p className="flex items-center justify-between gap-4 text-slate-500">
          Forecast <span className="font-mono font-bold">{row.forecast.toFixed(1)} kW</span>
        </p>
      )}
      <p className="flex items-center justify-between gap-4 text-slate-400">
        Demand <span className="font-mono font-bold">{row.demand.toFixed(1)} kW</span>
      </p>
    </div>
  );
}

export default function GenerationChart() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [recent, forecast, dashboard] = await Promise.all([
          getRecent(24),
          getForecast(),
          getDashboardData(),
        ]);
        if (cancelled) return;

        const demandKw = mwToKw(dashboard.config.demand_mw);
        const points = [];
        recent.forEach((row, i) => {
          points.push({
            x: i,
            label: hourLabel(row.timestamp),
            actual: mwToKw(row.generation_mw),
            forecast: null,
            demand: demandKw,
          });
        });
        forecast.forEach((row, i) => {
          points.push({
            x: recent.length + i,
            label: hourLabel(row.timestamp),
            actual: null,
            forecast: mwToKw(row.predicted_generation),
            demand: demandKw,
          });
        });
        // Bridge the actual/forecast lines at the "now" boundary.
        if (points[recent.length - 1] && points[recent.length]) {
          points[recent.length - 1].forecast = points[recent.length - 1].actual;
        }
        setData(points);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const yMax = data ? Math.max(30, Math.ceil(Math.max(...data.map((p) => Math.max(p.actual ?? 0, p.forecast ?? 0, p.demand))) * 1.2 / 5) * 5) : 60;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900">Generation Outlook</h3>
          <p className="text-xs text-slate-500">Last 24h actual → next 24h forecast</p>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
          Couldn't reach the backend ({error}). Is it running on {import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}?
        </p>
      )}

      {!error && !data && <div className="mt-5 h-72 animate-pulse rounded-xl bg-slate-50 sm:h-80" />}

      {data && (
        <div className="mt-5 h-72 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, data.length - 1]}
                ticks={HOUR_TICKS.filter((t) => t < data.length)}
                tickFormatter={(i) => data[i]?.label ?? ""}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
                label={{
                  value: "Generation (kW)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#94A3B8",
                  fontSize: 10,
                  dx: 10,
                }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#CBD5E1" }} />

              <Area dataKey="forecast" stroke="none" fill="url(#forecastFill)" isAnimationActive={false} name="Forecast" />
              <Line dataKey="demand" stroke="#94A3B8" strokeWidth={2} dot={false} name="Demand" isAnimationActive={false} />
              <Line
                dataKey="forecast"
                stroke="#60A5FA"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                name="Forecast"
                isAnimationActive={false}
                connectNulls={false}
              />
              <Line
                dataKey="actual"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
                name="Actual"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
        <LegendItem color="#2563EB" label="Actual" />
        <LegendItem color="#60A5FA" label="Forecast" dashed />
        <LegendItem color="#94A3B8" label="Demand" />
      </div>
    </div>
  );
}

function LegendItem({ color, label, dashed }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-4"
        style={{
          background: dashed ? "none" : color,
          borderTop: dashed ? `2px dashed ${color}` : "none",
        }}
      />
      {label}
    </span>
  );
}
