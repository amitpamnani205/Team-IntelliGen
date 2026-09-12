import { useEffect, useMemo, useState } from "react";
import { BatteryCharging, Gauge, CloudFog, TriangleAlert, Check, ChevronDown } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { getRecommendations, mwToKw } from "../lib/api.js";

const TONE = {
  CRITICAL: "bg-rose-50 text-rose-600 border-rose-200",
  HIGH: "bg-rose-50 text-rose-600 border-rose-200",
  MEDIUM: "bg-amber-50 text-amber-600 border-amber-200",
  LOW: "bg-blue-50 text-blue-600 border-blue-200",
};

const IMPACT_TONE = {
  CRITICAL: "bg-rose-50 text-rose-600",
  HIGH: "bg-rose-50 text-rose-600",
  MEDIUM: "bg-amber-50 text-amber-600",
  LOW: "bg-blue-50 text-blue-600",
};

const ACTION_ICON = {
  "Charge battery / Export": BatteryCharging,
  "Curtail residual surplus": TriangleAlert,
  "Evaluate flexible demand": Gauge,
  "Prepare battery discharge": BatteryCharging,
  "Prepare authorized backup generation": TriangleAlert,
  "Escalate residual exposure": TriangleAlert,
  "Monitor system": CloudFog,
};

function groupRecommendations(recs) {
  const groups = new Map();
  for (const rec of recs) {
    const key = `${rec.action}__${rec.risk_level}`;
    if (!groups.has(key)) {
      groups.set(key, {
        action: rec.action,
        reason: rec.reason,
        riskLevel: rec.risk_level,
        priority: rec.priority,
        times: [],
        maxAmount: 0,
      });
    }
    const g = groups.get(key);
    g.times.push(rec.time);
    g.maxAmount = Math.max(g.maxAmount, rec.amount_mw);
  }
  return Array.from(groups.values()).sort((a, b) => a.priority - b.priority || b.times.length - a.times.length);
}

export default function Recommendations() {
  const [recs, setRecs] = useState(null);
  const [error, setError] = useState(null);
  const [actioned, setActioned] = useState(() => new Set());
  const [expanded, setExpanded] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    getRecommendations()
      .then((data) => !cancelled && setRecs(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => (recs ? groupRecommendations(recs) : []), [recs]);

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

      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Couldn't reach the backend ({error}).
        </p>
      )}

      {!recs && !error && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-50" />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {groups.map((g, idx) => {
          const id = `${g.action}-${idx}`;
          const isActioned = actioned.has(id);
          const isExpanded = expanded.has(id);
          const Icon = ACTION_ICON[g.action] ?? Gauge;
          const isMonitor = g.action === "Monitor system";
          const startTime = g.times[0].slice(11, 16);
          const endTime = g.times[g.times.length - 1].slice(11, 16);

          return (
            <div key={id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${TONE[g.riskLevel]}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{g.action}</p>
                    <p className="text-sm text-slate-500">
                      {g.maxAmount > 0 ? `${mwToKw(g.maxAmount).toFixed(1)} kW · ` : ""}
                      {startTime} – {endTime} ({g.times.length}h)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${IMPACT_TONE[g.riskLevel]}`}>
                    {g.riskLevel}
                  </span>

                  {!isMonitor ? (
                    <button
                      onClick={() => toggleActioned(id)}
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                        isActioned ? "bg-emerald-50 text-emerald-600" : "bg-slate-900 text-white hover:bg-slate-700"
                      }`}
                    >
                      {isActioned && <Check className="h-3.5 w-3.5" />}
                      {isActioned ? "Actioned" : "Take Action"}
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleExpanded(id)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Details
                      <ChevronDown className={`h-3.5 w-3.5 transition ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
              </div>

              {!isMonitor && (
                <button
                  onClick={() => toggleExpanded(id)}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  Why this recommendation?
                  <ChevronDown className={`h-3 w-3 transition ${isExpanded ? "rotate-180" : ""}`} />
                </button>
              )}

              {isExpanded && (
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 md:grid-cols-3">
                  <WhyItem label="Forecast driver" value={g.reason} />
                  <WhyItem label="Risk level" value={g.riskLevel} />
                  <WhyItem label="Affected hours" value={`${g.times.length}h between ${startTime} and ${endTime}`} />
                  {g.maxAmount > 0 && <WhyItem label="Peak amount" value={`${mwToKw(g.maxAmount).toFixed(1)} kW`} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WhyItem({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-700">{value}</p>
    </div>
  );
}
