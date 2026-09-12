import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, CloudFog, BatteryWarning, ArrowUpRightFromCircle, Check } from "lucide-react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PageHeader from "../components/PageHeader.jsx";
import { runScenario, mwToKw } from "../lib/api.js";

const SCENARIOS = [
  {
    id: "base",
    icon: LayoutDashboard,
    label: "Base Case",
    sub: "Current forecast",
    params: {},
    color: "#2563EB",
    dashed: false,
    locked: true,
  },
  {
    id: "cloud",
    icon: CloudFog,
    label: "High Cloud Cover",
    sub: "-30% generation",
    params: { solarChangePercent: -30 },
    color: "#D97706",
    dashed: true,
  },
  {
    id: "battery_outage",
    icon: BatteryWarning,
    label: "Battery Outage",
    sub: "-100% storage capacity",
    params: { batteryChangePercent: -100 },
    color: "#E11D48",
    dashed: true,
  },
  {
    id: "export_boost",
    icon: ArrowUpRightFromCircle,
    label: "Export Capacity Boost",
    sub: "+100% export capacity",
    params: { exportChangePercent: 100 },
    color: "#0EA5E9",
    dashed: true,
  },
];

const TICKS = [0, 4, 8, 12, 16, 20, 23];

export default function ScenarioLab() {
  const [active, setActive] = useState(() => new Set(["base", "cloud"]));
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const activeScenarios = useMemo(() => SCENARIOS.filter((s) => active.has(s.id)), [active]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const entries = await Promise.all(
          activeScenarios.map(async (s) => [s.id, await runScenario(s.params)])
        );
        if (!cancelled) setResults(Object.fromEntries(entries));
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.from(active).sort().join(",")]);

  const chartData = useMemo(() => {
    const anyResult = Object.values(results)[0];
    if (!anyResult) return [];
    return anyResult.map((row, i) => {
      const point = { x: i, label: row.timestamp.slice(11, 16) };
      activeScenarios.forEach((s) => {
        const r = results[s.id]?.[i];
        if (r) point[s.id] = Number(mwToKw(r.generation).toFixed(2));
      });
      return point;
    });
  }, [results, activeScenarios]);

  const summary = useMemo(() => {
    const out = {};
    activeScenarios.forEach((s) => {
      const rows = results[s.id];
      if (!rows) return;
      const peak = Math.max(...rows.map((r) => mwToKw(r.generation)));
      const worst = rows.reduce((max, r) => (r.risk_score > max.risk_score ? r : max), rows[0]);
      out[s.id] = { peak, worstLevel: worst.risk_level };
    });
    return out;
  }, [results, activeScenarios]);

  function toggleScenario(id) {
    if (id === "base") return;
    setActive((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Scenario Lab"
        subtitle="Re-run the risk engine under hypothetical solar, battery and export conditions."
      />

      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Couldn't reach the backend ({error}).
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-900">Select Scenario</h3>
            <div className="flex flex-col gap-2.5">
              {SCENARIOS.map((s) => {
                const isActive = active.has(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleScenario(s.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      isActive ? "border-blue-300 bg-blue-50/60" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border"
                      style={{
                        color: s.color,
                        borderColor: `${s.color}40`,
                        backgroundColor: `${s.color}12`,
                      }}
                    >
                      <s.icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                      <p className="text-xs text-slate-500">{s.sub}</p>
                    </div>
                    {isActive && (
                      <span
                        className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-white"
                        style={{ background: s.color }}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-slate-400">Base Case is always included. Toggle others to compare.</p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900">Scenario Comparison</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {activeScenarios.map((s) => (
                  <span key={s.id} className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold" style={{ color: s.color }}>
                      {summary[s.id] ? `${summary[s.id].peak.toFixed(1)} kW` : "…"}
                    </span>
                    peak · {s.label}
                    {summary[s.id] && summary[s.id].worstLevel !== "LOW" && (
                      <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                        {summary[s.id].worstLevel}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <p className="mb-5 text-xs text-slate-500">Forecast generation (kW) under each active scenario</p>

            {chartData.length === 0 ? (
              <div className="h-72 animate-pulse rounded-xl bg-slate-50 sm:h-80" />
            ) : (
              <div className="h-72 w-full sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 8, right: 14, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="#EEF2F7" vertical={false} />
                    <XAxis
                      dataKey="x"
                      type="number"
                      domain={[0, chartData.length - 1]}
                      ticks={TICKS.filter((t) => t < chartData.length)}
                      tickFormatter={(i) => chartData[i]?.label ?? ""}
                      tick={{ fill: "#94A3B8", fontSize: 11 }}
                      axisLine={{ stroke: "#E2E8F0" }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip
                      labelFormatter={(i) => chartData[i]?.label ?? ""}
                      contentStyle={{ borderRadius: 10, borderColor: "#E2E8F0", fontSize: 12 }}
                    />
                    <Legend
                      formatter={(value) => SCENARIOS.find((s) => s.id === value)?.label ?? value}
                      wrapperStyle={{ fontSize: 12, color: "#64748B" }}
                    />
                    {activeScenarios.map((s) => (
                      <Line
                        key={s.id}
                        dataKey={s.id}
                        stroke={s.color}
                        strokeWidth={s.id === "base" ? 2.5 : 2}
                        strokeDasharray={s.dashed ? "5 4" : undefined}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
