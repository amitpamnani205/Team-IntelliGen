import { useMemo, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";

const TABS = ["Today", "Tomorrow", "7 Days"];
const Y_TICKS = [0, 200, 400, 600, 800, 1000];

function gaussian(x, center, width) {
  return Math.exp(-(((x - center) / width) ** 2));
}

function solarForecast(hour, peakMw, peakHour) {
  return Math.max(5, peakMw * gaussian(hour, peakHour, 4.2));
}

function demandCurve(hour, morningPeak, eveningPeak) {
  const base = 180;
  const morning = morningPeak * gaussian(hour, 9, 3);
  const evening = eveningPeak * gaussian(hour, 19, 2.6);
  return Math.round(base + morning + evening);
}

function buildHourlySeries({ peakMw, peakHour = 13, morningPeak = 130, eveningPeak = 430, nowHour, noise = 1 }) {
  const points = [];
  for (let h = 0; h <= 24; h += 1) {
    const forecast = Math.round(solarForecast(h, peakMw, peakHour) + Math.sin(h * 1.7) * 5 * noise);
    const actual = h <= nowHour ? Math.round(forecast - Math.sin(h * 2.3) * 8 * noise) : null;
    const demand = demandCurve(h, morningPeak, eveningPeak);
    const surplusTop = forecast > demand ? forecast : demand;
    const deficitBottom = demand > forecast ? forecast : demand;
    points.push({
      hour: h,
      label: `${String(h).padStart(2, "0")}:00`,
      actual,
      forecast,
      demand,
      surplusRange: [demand, surplusTop],
      deficitRange: [deficitBottom, demand],
    });
  }
  return points;
}

const TODAY_DATA = buildHourlySeries({ peakMw: 900, nowHour: 12 });
const TOMORROW_DATA = buildHourlySeries({ peakMw: 800, peakHour: 12, nowHour: 0, noise: 1.4 });

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_DATA = WEEK_DAYS.map((day, i) => {
  const peak = [810, 860, 720, 890, 840, 780, 830][i];
  const demand = [640, 610, 660, 600, 655, 590, 605][i];
  return {
    hour: i,
    label: day,
    actual: i < 2 ? peak : null,
    forecast: peak,
    demand,
    surplusRange: [demand, Math.max(demand, peak)],
    deficitRange: [Math.min(demand, peak), demand],
  };
});

const RISK_WINDOWS = {
  Today: [
    { x1: 10, x2: 15.5, label: "High Surplus · 10:00–15:30", color: "#10B981" },
    { x1: 17, x2: 18.5, label: "High Deficit · 17:00–18:30", color: "#E11D48" },
  ],
  Tomorrow: [{ x1: 9, x2: 14.5, label: "High Surplus · 09:00–14:30", color: "#10B981" }],
  "7 Days": [],
};

const HOUR_TICKS = [0, 4, 8, 12, 16, 20, 24];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-lg">
      <p className="mb-1.5 font-mono font-semibold text-slate-700">{row.label ?? label}</p>
      {row.actual != null && (
        <p className="flex items-center justify-between gap-4 text-blue-600">
          Actual <span className="font-mono font-bold">{row.actual} MW</span>
        </p>
      )}
      <p className="flex items-center justify-between gap-4 text-slate-500">
        Forecast <span className="font-mono font-bold">{row.forecast} MW</span>
      </p>
      <p className="flex items-center justify-between gap-4 text-slate-400">
        Demand <span className="font-mono font-bold">{row.demand} MW</span>
      </p>
    </div>
  );
}

export default function GenerationChart() {
  const [tab, setTab] = useState("Today");

  const data = useMemo(() => {
    if (tab === "Today") return TODAY_DATA;
    if (tab === "Tomorrow") return TOMORROW_DATA;
    return WEEK_DATA;
  }, [tab]);

  const windows = RISK_WINDOWS[tab];
  const isWeekly = tab === "7 Days";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900">Generation Outlook</h3>
          <p className="text-xs text-slate-500">{isWeekly ? "Next 7 Days" : "Next 24 Hours"}</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === t ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {!isWeekly && windows.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {windows.map((w) => (
            <span
              key={w.label}
              className="rounded-full border px-3 py-1 text-[11px] font-semibold"
              style={{ borderColor: `${w.color}33`, color: w.color, backgroundColor: `${w.color}10` }}
            >
              {w.label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="surplusFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="deficitFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E11D48" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#E11D48" stopOpacity="0.28" />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#EEF2F7" vertical={false} />

            {isWeekly ? (
              <XAxis
                dataKey="label"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
            ) : (
              <XAxis
                dataKey="hour"
                type="number"
                domain={[0, 24]}
                ticks={HOUR_TICKS}
                tickFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
            )}

            <YAxis
              domain={[0, 1000]}
              ticks={Y_TICKS}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={44}
              label={{
                value: "Generation (MW)",
                angle: -90,
                position: "insideLeft",
                fill: "#94A3B8",
                fontSize: 10,
                dx: 10,
              }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#CBD5E1" }} />

            {!isWeekly &&
              windows.map((w) => (
                <ReferenceArea
                  key={w.label}
                  x1={w.x1}
                  x2={w.x2}
                  y1={0}
                  y2={1000}
                  strokeOpacity={0}
                  fill={w.color}
                  fillOpacity={0.05}
                />
              ))}

            <Area dataKey="surplusRange" stroke="none" fill="url(#surplusFill)" isAnimationActive={false} name="Surplus" />
            <Area dataKey="deficitRange" stroke="none" fill="url(#deficitFill)" isAnimationActive={false} name="Deficit" />

            <Line dataKey="demand" stroke="#94A3B8" strokeWidth={2} dot={false} name="Demand" isAnimationActive={false} />
            <Line
              dataKey="forecast"
              stroke="#60A5FA"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              name="Forecast"
              isAnimationActive={false}
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

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
        <LegendItem color="#2563EB" label="Actual" />
        <LegendItem color="#60A5FA" label="Forecast" dashed />
        <LegendItem color="#94A3B8" label="Demand" />
        <LegendItem color="#10B981" label="Surplus" swatch />
        <LegendItem color="#E11D48" label="Deficit" swatch />
      </div>
    </div>
  );
}

function LegendItem({ color, label, dashed, swatch }) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch ? (
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color, opacity: 0.6 }} />
      ) : (
        <span
          className="inline-block h-0.5 w-4"
          style={{
            background: dashed ? "none" : color,
            borderTop: dashed ? `2px dashed ${color}` : "none",
          }}
        />
      )}
      {label}
    </span>
  );
}
