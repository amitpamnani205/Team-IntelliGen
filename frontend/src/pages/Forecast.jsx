import { useMemo, useState } from "react";
import { Target, Gauge, BatteryCharging } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import ForecastChart from "../components/ForecastChart.jsx";

const HORIZONS = ["24h", "48h", "7d"];
const SERIES = ["Generation", "Irradiance"];

function gaussian(x, center, width) {
  return Math.exp(-(((x - center) / width) ** 2));
}

function buildHourly({ hours, peakCenters, peakValue, spanWidth, nowX, bandBase }) {
  const data = [];
  for (let i = 0; i <= hours; i += 1) {
    const shape = Math.max(...peakCenters.map((c) => gaussian(i, c, spanWidth)));
    const forecast = Math.round(Math.max(2, peakValue * shape + Math.sin(i * 1.6) * peakValue * 0.01));
    const actual = i <= nowX ? Math.round(forecast - Math.sin(i * 2.1) * peakValue * 0.015) : null;
    const distanceFromNow = Math.max(0, i - nowX);
    const uncertainty = Math.round(bandBase * (0.3 + 0.7 * (1 - shape)) + distanceFromNow * bandBase * 0.012);
    data.push({
      x: i,
      actual,
      forecast,
      range: [Math.max(0, forecast - uncertainty), forecast + uncertainty],
    });
  }
  return data;
}

function buildDaily({ days, peaks, nowX, bandRatio }) {
  return peaks.slice(0, days).map((forecast, i) => {
    const actual = i <= nowX ? Math.round(forecast * 0.97) : null;
    const uncertainty = Math.round(forecast * bandRatio);
    return {
      x: i,
      actual,
      forecast,
      range: [forecast - uncertainty, forecast + uncertainty],
    };
  });
}

const DATASETS = {
  Generation: {
    unit: "MW",
    yMax: 1000,
    "24h": () =>
      buildHourly({ hours: 24, peakCenters: [13], peakValue: 900, spanWidth: 4.2, nowX: 12, bandBase: 90 }),
    "48h": () =>
      buildHourly({ hours: 48, peakCenters: [13, 37], peakValue: 900, spanWidth: 4.2, nowX: 12, bandBase: 90 }),
    "7d": () => buildDaily({ days: 7, peaks: [810, 860, 720, 890, 840, 780, 830], nowX: 1, bandRatio: 0.12 }),
  },
  Irradiance: {
    unit: "W/m²",
    yMax: 1000,
    "24h": () =>
      buildHourly({ hours: 24, peakCenters: [13], peakValue: 960, spanWidth: 4.0, nowX: 12, bandBase: 70 }),
    "48h": () =>
      buildHourly({ hours: 48, peakCenters: [13, 37], peakValue: 960, spanWidth: 4.0, nowX: 12, bandBase: 70 }),
    "7d": () => buildDaily({ days: 7, peaks: [880, 910, 790, 940, 900, 860, 890], nowX: 1, bandRatio: 0.1 }),
  },
};

const TICKS = {
  "24h": { ticks: [0, 4, 8, 12, 16, 20, 24], format: (h) => `${String(h).padStart(2, "0")}:00` },
  "48h": {
    ticks: [0, 6, 12, 18, 24, 30, 36, 42, 48],
    format: (h) => `${String(h % 24).padStart(2, "0")}:00`,
  },
  "7d": { ticks: [0, 1, 2, 3, 4, 5, 6], format: (i) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] },
};

export default function Forecast() {
  const [horizon, setHorizon] = useState("24h");
  const [series, setSeries] = useState("Generation");

  const config = DATASETS[series];
  const data = useMemo(() => config[horizon](), [series, horizon]);
  const tickConfig = TICKS[horizon];

  const stats = useMemo(() => {
    const peakRow = data.reduce((max, row) => (row.forecast > max.forecast ? row : max), data[0]);
    const avgUncertainty =
      data.reduce((sum, row) => sum + (row.range[1] - row.range[0]) / 2, 0) / data.length;
    const confidence = Math.max(55, Math.min(96, Math.round(100 - (avgUncertainty / peakRow.forecast) * 180)));
    const isHourly = horizon !== "7d";
    const energyGWh = isHourly
      ? data.reduce((sum, row) => sum + row.forecast, 0) / 1000
      : (data.reduce((sum, row) => sum + row.forecast, 0) * 5.2) / 1000;

    return {
      peakValue: peakRow.forecast,
      peakLabel: tickConfig.format(peakRow.x),
      confidence,
      energyGWh: energyGWh.toFixed(1),
    };
  }, [data, horizon, tickConfig]);

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Generation Forecast"
        subtitle="AI-powered forecasting with uncertainty quantification."
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {SERIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeries(s)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  series === s
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <LegendDot color="#2563EB" label="Actual" />
            <LegendDot color="#93C5FD" label="Forecast" />
            <LegendDot color="#2563EB" label="Uncertainty" faded />
          </div>
        </div>

        <ForecastChart
          data={data}
          unit={config.unit}
          ticks={tickConfig.ticks}
          formatTick={tickConfig.format}
          yMax={config.yMax}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Target}
          label="Peak Generation"
          value={`${stats.peakValue} ${config.unit}`}
          meta={`at ${stats.peakLabel}`}
        />
        <MetricCard icon={Gauge} label="Confidence Level" value={`${stats.confidence}%`} meta="model calibration" />
        <MetricCard
          icon={BatteryCharging}
          label="Total Expected Energy"
          value={`${stats.energyGWh} GWh`}
          meta={series === "Generation" ? "across selected horizon" : "irradiance-derived estimate"}
        />
      </div>
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
