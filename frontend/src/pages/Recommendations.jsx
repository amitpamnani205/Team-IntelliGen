import { useState } from "react";
import { BatteryCharging, Gauge, CloudFog, Check, ChevronDown } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

const RECOMMENDATIONS = [
  {
    id: "charge",
    icon: BatteryCharging,
    tone: "emerald",
    title: "Charge Storage",
    subtitle: "100 MW · 13:30 – 15:00",
    impact: "High Impact",
    impactTone: "rose",
    actionLabel: "Take Action",
    why: [
      { label: "Forecast driver", value: "Solar output +18% vs. yesterday" },
      { label: "Demand level", value: "700 MW, moderate" },
      { label: "Storage headroom", value: "120 MW available" },
      { label: "Export limit", value: "50 MW" },
      { label: "Uncertainty range", value: "±90 MW" },
      { label: "Trigger threshold", value: "Surplus > 150 MW" },
    ],
  },
  {
    id: "ramp",
    icon: Gauge,
    tone: "amber",
    title: "Prepare Ramping",
    subtitle: "Reduce output by 15%",
    impact: "Medium",
    impactTone: "amber",
    actionLabel: "View Details",
    why: [
      { label: "Forecast driver", value: "Evening solar decline accelerating" },
      { label: "Demand level", value: "610 MW, rising" },
      { label: "Battery availability", value: "80 MW" },
      { label: "Trigger threshold", value: "Ramp rate > 12 MW/min" },
    ],
  },
  {
    id: "monitor",
    icon: CloudFog,
    tone: "blue",
    title: "Monitor Weather",
    subtitle: "Increased cloud variability",
    impact: "Informational",
    impactTone: "blue",
    actionLabel: "View Details",
    why: [
      { label: "Forecast driver", value: "Passing cloud cover, 11:00–12:00" },
      { label: "Expected spike", value: "±45 MW generation swing" },
      { label: "Recommended response", value: "No action required, monitor only" },
    ],
  },
];

const TONE = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  rose: "bg-rose-50 text-rose-600",
};

export default function Recommendations() {
  const [actioned, setActioned] = useState(() => new Set());
  const [expanded, setExpanded] = useState(() => new Set());

  function toggleActioned(id) {
    setActioned((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleExpanded(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader title="AI-Powered Recommendations" subtitle="Actionable insights for better grid operations." />

      <div className="flex flex-col gap-4">
        {RECOMMENDATIONS.map((rec) => {
          const isActioned = actioned.has(rec.id);
          const isExpanded = expanded.has(rec.id);
          const isTakeAction = rec.actionLabel === "Take Action";

          return (
            <div key={rec.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${TONE[rec.tone]}`}>
                    <rec.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{rec.title}</p>
                    <p className="text-sm text-slate-500">{rec.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${TONE[rec.impactTone]}`}>
                    {rec.impact}
                  </span>

                  {isTakeAction ? (
                    <button
                      onClick={() => toggleActioned(rec.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                        isActioned
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-900 text-white hover:bg-slate-700"
                      }`}
                    >
                      {isActioned && <Check className="h-3.5 w-3.5" />}
                      {isActioned ? "Actioned" : rec.actionLabel}
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleExpanded(rec.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {rec.actionLabel}
                      <ChevronDown className={`h-3.5 w-3.5 transition ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
              </div>

              {isTakeAction && (
                <button
                  onClick={() => toggleExpanded(rec.id)}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  Why this recommendation?
                  <ChevronDown className={`h-3 w-3 transition ${isExpanded ? "rotate-180" : ""}`} />
                </button>
              )}

              {isExpanded && (
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 md:grid-cols-3">
                  {rec.why.map((item) => (
                    <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-700">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
