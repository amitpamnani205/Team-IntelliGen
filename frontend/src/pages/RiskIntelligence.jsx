import { useState } from "react";
import { TriangleAlert, ShieldAlert, Gauge, CloudFog } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

const RISKS = [
  {
    id: "surplus",
    icon: TriangleAlert,
    tone: "rose",
    title: "High Surplus",
    window: "13:30 – 15:00",
    range: [13.5, 15],
    probability: 70,
    level: "High",
    detail: "Solar generation is expected to exceed local transmission capacity by roughly 140 MW during this window.",
  },
  {
    id: "deficit",
    icon: ShieldAlert,
    tone: "rose",
    title: "High Deficit",
    window: "17:00 – 18:00",
    range: [17, 18],
    probability: 70,
    level: "High",
    detail: "Solar drop-off combined with the evening demand ramp is expected to open a supply gap near 17:00.",
  },
  {
    id: "ramp",
    icon: Gauge,
    tone: "amber",
    title: "Ramp Down Risk",
    window: "20:00 – 22:00",
    range: [20, 22],
    probability: 50,
    level: "Medium",
    detail: "Ramp rate deficit is possible as generation continues its evening decline into base load hours.",
  },
  {
    id: "cloud",
    icon: CloudFog,
    tone: "blue",
    title: "Cloud Variability",
    window: "11:00 – 12:00",
    range: [11, 12],
    probability: 40,
    level: "Low",
    detail: "Transient cloud movement may cause +/- 45 MW generation spikes around midday.",
  },
];

const TONE = {
  rose: { badge: "bg-rose-50 text-rose-600 border-rose-200", bar: "#E11D48", pill: "bg-rose-50 text-rose-600" },
  amber: { badge: "bg-amber-50 text-amber-600 border-amber-200", bar: "#D97706", pill: "bg-amber-50 text-amber-600" },
  blue: { badge: "bg-blue-50 text-blue-600 border-blue-200", bar: "#2563EB", pill: "bg-blue-50 text-blue-600" },
};

const HOUR_MARKS = [0, 4, 8, 12, 16, 20, 24];
const HEATMAP_BUCKETS = [0, 3, 6, 9, 12, 15, 18, 21];

export default function RiskIntelligence() {
  const [view, setView] = useState("timeline");
  const [selected, setSelected] = useState(null);

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Risk Intelligence"
        subtitle="Identify, understand and monitor operational risks."
        actions={
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {[
              { id: "timeline", label: "Risk Timeline" },
              { id: "heatmap", label: "Risk Heatmap" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                  view === t.id ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-5">
          {RISKS.map((risk) => {
            const t = TONE[risk.tone];
            const isSelected = selected === risk.id;
            return (
              <button
                key={risk.id}
                onClick={() => setSelected((cur) => (cur === risk.id ? null : risk.id))}
                className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                  isSelected ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${t.badge}`}>
                      <risk.icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{risk.title}</p>
                      <p className="text-xs text-slate-500">{risk.window}</p>
                      <p className="mt-0.5 text-xs text-slate-400">Probability: {risk.probability}%</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${t.pill}`}>
                    {risk.level}
                  </span>
                </div>

                {isSelected && (
                  <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
                    {risk.detail}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-5 font-bold text-slate-900">
              {view === "timeline" ? "Risk Timeline (Next 24 Hours)" : "Risk Heatmap (Next 24 Hours)"}
            </h3>

            {view === "timeline" ? (
              <div className="flex flex-col gap-4">
                {RISKS.map((risk) => {
                  const t = TONE[risk.tone];
                  const isSelected = selected === risk.id;
                  const left = (risk.range[0] / 24) * 100;
                  const width = ((risk.range[1] - risk.range[0]) / 24) * 100;
                  return (
                    <div key={risk.id} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-xs font-medium text-slate-500">{risk.title}</span>
                      <div className="relative h-6 flex-1 rounded-md bg-slate-100">
                        <div
                          className="absolute top-0 h-full rounded-md transition-all"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            background: t.bar,
                            opacity: isSelected ? 1 : 0.55,
                            boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${t.bar}` : "none",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="ml-[6.5rem] flex justify-between text-[11px] font-mono text-slate-400">
                  {HOUR_MARKS.map((h) => (
                    <span key={h}>{String(h).padStart(2, "0")}:00</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="ml-24 mb-1 grid grid-cols-8 gap-1.5">
                  {HEATMAP_BUCKETS.map((h) => (
                    <span key={h} className="text-center font-mono text-[10px] text-slate-400">
                      {String(h).padStart(2, "0")}h
                    </span>
                  ))}
                </div>
                {RISKS.map((risk) => {
                  const t = TONE[risk.tone];
                  return (
                    <div key={risk.id} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 text-xs font-medium text-slate-500">{risk.title}</span>
                      <div className="grid flex-1 grid-cols-8 gap-1.5">
                        {HEATMAP_BUCKETS.map((bucketStart) => {
                          const bucketEnd = bucketStart + 3;
                          const overlaps = risk.range[0] < bucketEnd && risk.range[1] > bucketStart;
                          const intensity = overlaps ? risk.probability / 100 : 0.06;
                          return (
                            <div
                              key={bucketStart}
                              className="h-7 rounded-md"
                              style={{ background: t.bar, opacity: intensity }}
                              title={`${risk.title}: ${overlaps ? risk.probability + "%" : "low"}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
