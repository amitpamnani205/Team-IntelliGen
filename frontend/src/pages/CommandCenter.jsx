import { Zap, TrendingUp, TriangleAlert, PackagePlus, Sun, HeartPulse } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import GenerationChart from "../components/GenerationChart.jsx";
import LivePlantView from "../components/LivePlantView.jsx";

const STATS = [
  {
    icon: Zap,
    label: "Current Generation",
    value: "780 MW",
    meta: "↑ 2.4% vs last hour",
    tone: "emerald",
    sparkline: [420, 460, 510, 590, 660, 700, 740, 760, 780],
  },
  {
    icon: TrendingUp,
    label: "Forecast (14:00)",
    value: "820 MW",
    meta: "↑ 5.1% expected",
    tone: "blue",
    sparkline: [500, 540, 600, 650, 700, 750, 790, 810, 820],
  },
  {
    icon: TriangleAlert,
    label: "Risk Status",
    value: "High Surplus",
    meta: "Window 13:30 – 15:00",
    tone: "amber",
    sparkline: [20, 25, 30, 45, 60, 78, 90, 95, 88],
  },
  {
    icon: PackagePlus,
    label: "Recommended Action",
    value: "Charge Storage",
    meta: "100 MW opportunity",
    tone: "rose",
    sparkline: [10, 15, 18, 30, 42, 60, 75, 85, 100],
  },
];

export default function CommandCenter() {
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
                <p className="text-sm font-bold text-white">Stable</p>
                <p className="text-[11px] text-[#8FA7C1]">Grid Condition</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <GenerationChart />
        </div>
        <div className="lg:col-span-4">
          <LivePlantView />
        </div>
      </div>
    </div>
  );
}
