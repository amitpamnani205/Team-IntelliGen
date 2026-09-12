import { useMemo, useState } from "react";
import { LayoutDashboard, CloudFog, TrendingUp, BatteryCharging, Check } from "lucide-react";
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

const HORIZONS = ["24h", "48h", "7d"];

const SCENARIOS = [
  {
    id: "base",
    icon: LayoutDashboard,
    label: "Base Case",
    sub: "Current forecast",
    factor: 1,
    color: "#2563EB",
    dashed: false,
    locked: true,
  },
  {
    id: "cloud",
    icon: CloudFog,
    label: "High Cloud Cover",
    sub: "-20% generation",
    factor: 0.8,
    color: "#D97706",
    dashed: true,
  },
  {
    id: "demand",
    icon: TrendingUp,
    label: "High Demand",
    sub: "+25% demand",
    factor: 1.15,
    color: "#E11D48",
    dashed: true,
  },
  {
    id: "storage",
    icon: BatteryCharging,
    label: "Storage Support",
    sub: "100 MW absorption",
    factor: 0.88,
    color: "#0EA5E9",
    dashed: true,
  },
];

function gaussian(x, center, width) {
  return Math.exp(-(((x - center) / width) ** 2));
}

function buildBase(hours, peakCenters) {
  const points = [];
  for (let i = 0; i <= hours; i += 1) {
    const shape = Math.max(...peakCenters.map((c) => gaussian(i, c, 4.2)));
    points.push({ x: i, base: Math.round(Math.max(2, 900 * shape)) });
  }
  return points;
}

const BASE_DATA = {
  "24h": () => buildBase(24, [13]),
  "48h": () => buildBase(48, [13, 37]),
  "7d": () =>
    [810, 860, 720, 890, 840, 780, 830].map((base, i) => ({ x: i, base })),
};

const TICKS = {
  "24h": { ticks: [0, 4, 8, 12, 16, 20, 24], format: (h) => `${String(h).padStart(2, "0")}:00` },
  "48h": { ticks: [0, 6, 12, 18, 24, 30, 36, 42, 48], format: (h) => `${String(h % 24).padStart(2, "0")}:00` },
  "7d": { ticks: [0, 1, 2, 3, 4, 5, 6], format: (i) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] },
};

export default function ScenarioLab() {
  const [horizon, setHorizon] = useState("24h");
  const [active, setActive] = useState(() => new Set(["base", "cloud", "demand"]));

  const baseData = useMemo(() => BASE_DATA[horizon](), [horizon]);
  const tickConfig = TICKS[horizon];

  const chartData = useMemo(
    () =>
      baseData.map((row) => {
        const point = { x: row.x };
        SCENARIOS.forEach((s) => {
          if (active.has(s.id)) point[s.id] = Math.round(row.base * s.factor);
        });
        return point;
      }),
    [baseData, active]
  );

  const peaks = useMemo(() => {
    const result = {};
    SCENARIOS.forEach((s) => {
      if (!active.has(s.id)) return;
      result[s.id] = Math.max(...chartData.map((row) => row[s.id] ?? 0));
    });
    return result;
  }, [chartData, active]);

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
        subtitle="Test scenarios and understand potential outcomes."
        actions={
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {HORIZONS.map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                  horizon === h ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        }
      />

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
                {SCENARIOS.filter((s) => active.has(s.id)).map((s) => (
                  <span key={s.id} className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold" style={{ color: s.color }}>
                      {peaks[s.id]} MW
                    </span>
                    peak · {s.label}
                  </span>
                ))}
              </div>
            </div>
            <p className="mb-5 text-xs text-slate-500">Peak generation under each active scenario</p>

            <div className="h-72 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 14, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#EEF2F7" vertical={false} />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[0, chartData.length - 1]}
                    ticks={tickConfig.ticks}
                    tickFormatter={tickConfig.format}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    axisLine={{ stroke: "#E2E8F0" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 1200]}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    labelFormatter={tickConfig.format}
                    contentStyle={{ borderRadius: 10, borderColor: "#E2E8F0", fontSize: 12 }}
                  />
                  <Legend
                    formatter={(value) => SCENARIOS.find((s) => s.id === value)?.label ?? value}
                    wrapperStyle={{ fontSize: 12, color: "#64748B" }}
                  />
                  {SCENARIOS.filter((s) => active.has(s.id)).map((s) => (
                    <Line
                      key={s.id}
                      dataKey={s.id}
                      stroke={s.color}
                      strokeWidth={s.id === "base" ? 2.5 : 2}
                      strokeDasharray={s.dashed ? "5 4" : undefined}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
