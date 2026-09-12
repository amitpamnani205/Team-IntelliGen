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

function ChartTooltip({ active, payload, label, unit, formatLabel }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-lg">
      <p className="mb-1.5 font-mono font-semibold text-slate-700">{formatLabel(label)}</p>
      {row.actual != null && (
        <p className="flex items-center justify-between gap-4 text-blue-600">
          Actual <span className="font-mono font-bold">{row.actual} {unit}</span>
        </p>
      )}
      <p className="flex items-center justify-between gap-4 text-slate-500">
        Forecast <span className="font-mono font-bold">{row.forecast} {unit}</span>
      </p>
      <p className="flex items-center justify-between gap-4 text-slate-400">
        Range{" "}
        <span className="font-mono font-bold">
          {row.range[0]}–{row.range[1]} {unit}
        </span>
      </p>
    </div>
  );
}

export default function ForecastChart({ data, unit, ticks, formatTick, yMax }) {
  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 14, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="uncertaintyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#EEF2F7" vertical={false} />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, data.length - 1]}
            ticks={ticks}
            tickFormatter={formatTick}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax]}
            ticks={[0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax]}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            content={<ChartTooltip unit={unit} formatLabel={formatTick} />}
            cursor={{ stroke: "#CBD5E1" }}
          />

          <Area
            dataKey="range"
            stroke="none"
            fill="url(#uncertaintyFill)"
            isAnimationActive={false}
            name="Uncertainty"
          />
          <Line
            dataKey="forecast"
            stroke="#93C5FD"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
            name="Forecast"
          />
          <Line
            dataKey="actual"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
            name="Actual"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
