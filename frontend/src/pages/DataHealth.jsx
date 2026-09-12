import { Sun, Server, Satellite } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

const SOURCES = [
  { icon: Sun, name: "Weather Data", uptime: 99 },
  { icon: Server, name: "SCADA Data", uptime: 100 },
  { icon: Satellite, name: "Satellite Imagery", uptime: 98 },
];

const HEALTH_SCORE = 98;

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
  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader title="Data Health" subtitle="Monitor data quality and system health." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 font-bold text-slate-900">Overall Data Health</h3>
            <div className="relative mx-auto grid place-items-center">
              <Gauge value={HEALTH_SCORE} />
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900">{HEALTH_SCORE}%</span>
                <span className="text-xs text-slate-500">Data Quality</span>
                <span className="mt-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                  Good
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-center">
                <p className="text-2xl font-extrabold text-rose-600">0</p>
                <p className="text-xs font-medium text-rose-500">Critical Issues</p>
              </div>
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
                <p className="text-2xl font-extrabold text-amber-600">2</p>
                <p className="text-xs font-medium text-amber-600">Warnings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-900">Data Sources</h3>
            <div className="flex flex-col divide-y divide-slate-100">
              {SOURCES.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
                      <s.icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live · {s.uptime}% uptime
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
