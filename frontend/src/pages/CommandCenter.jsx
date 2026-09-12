import { useEffect, useState } from "react";
import { Zap, TrendingUp, TriangleAlert, PackagePlus, Sun, HeartPulse } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import GenerationChart from "../components/GenerationChart.jsx";
import LivePlantView from "../components/LivePlantView.jsx";
import { getDashboardData, getRecent, mwToKw } from "../lib/api.js";

const RISK_TONE = { LOW: "emerald", MEDIUM: "amber", HIGH: "amber", CRITICAL: "rose" };

export default function CommandCenter() {
  const [dashboard, setDashboard] = useState(null);
  const [sparkHistory, setSparkHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dash, recent] = await Promise.all([getDashboardData(), getRecent(9)]);
        if (cancelled) return;
        setDashboard(dash);
        setSparkHistory(recent.map((r) => mwToKw(r.generation_mw)));
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isReady = dashboard && sparkHistory;

  const forecastSpark = isReady ? dashboard.forecast.slice(0, 9).map((f) => mwToKw(f.predicted_generation)) : [0];
  const riskSpark = isReady ? dashboard.risks.slice(0, 9).map((r) => r.risk_score) : [0];
  const currentKw = isReady ? mwToKw(dashboard.latest_actual.generation_mw) : 0;
  const nextHourKw = isReady ? mwToKw(dashboard.forecast[0].predicted_generation) : 0;
  const worstRisk = isReady ? dashboard.worst_risk : null;
  const topRec = isReady ? dashboard.recommendations[0] : null;

  const stats = isReady
    ? [
        {
          icon: Zap,
          label: "Current Generation",
          value: `${currentKw.toFixed(1)} kW`,
          meta: `of ${mwToKw(dashboard.config.installed_capacity_mw).toFixed(0)} kW installed`,
          tone: "emerald",
          sparkline: sparkHistory,
        },
        {
          icon: TrendingUp,
          label: "Forecast (next hour)",
          value: `${nextHourKw.toFixed(1)} kW`,
          meta: `at ${dashboard.forecast[0].timestamp.slice(11, 16)}`,
          tone: "blue",
          sparkline: forecastSpark,
        },
        {
          icon: TriangleAlert,
          label: "Risk Status",
          value: worstRisk ? `${worstRisk.risk_level} ${worstRisk.risk_type !== "NORMAL" ? worstRisk.risk_type : ""}`.trim() : "—",
          meta: worstRisk ? `at ${worstRisk.timestamp.slice(11, 16)}` : "",
          tone: RISK_TONE[worstRisk?.risk_level] ?? "amber",
          sparkline: riskSpark,
        },
        {
          icon: PackagePlus,
          label: "Recommended Action",
          value: topRec ? topRec.action : "Monitor system",
          meta: topRec ? `${mwToKw(topRec.amount_mw).toFixed(1)} kW` : "No action needed",
          tone: "rose",
          sparkline: riskSpark,
        },
      ]
    : [];

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="relative mb-7 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <img
          src="/images/dashboard-solar.jpg"
          alt="Solar plant at sunrise"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/10" />

        <div className="relative z-10 flex flex-col justify-between gap-6 p-6 sm:p-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[#48C7FF]">Good Morning, Dhruv</p>
            <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              Here's What's Happening Today.
            </h1>
            <p className="mt-1.5 text-sm text-[#8FA7C1]">
              Real-time insights for a more stable grid.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#050D1A]/60 px-4 py-3 backdrop-blur-sm">
              <Sun className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-sm font-bold text-white">28°C</p>
                <p className="text-[11px] text-[#8FA7C1]">Clear Sky</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#050D1A]/60 px-4 py-3 backdrop-blur-sm">
              <HeartPulse className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-white">
                  {worstRisk ? (worstRisk.risk_level === "LOW" ? "Stable" : worstRisk.risk_level) : "—"}
                </p>
                <p className="text-[11px] text-[#8FA7C1]">Grid Condition</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Couldn't reach the backend ({error}). Start it with{" "}
          <code className="rounded bg-rose-100 px-1 py-0.5 text-xs">uvicorn backend.app.main:app --reload</code> from the
          repo root.
        </p>
      )}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isReady
          ? stats.map((stat) => <StatCard key={stat.label} {...stat} />)
          : !error && Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[150px] animate-pulse rounded-2xl bg-slate-50" />)}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <GenerationChart />
        </div>
        <div className="lg:col-span-4">
          <LivePlantView currentOutputLabel={isReady ? `${currentKw.toFixed(1)} kW` : "—"} />
        </div>
      </div>
    </div>
  );
}
