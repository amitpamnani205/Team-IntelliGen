import { useEffect, useMemo, useState } from "react";
import { TriangleAlert, ShieldAlert, Gauge, CloudFog } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { getRisk, mwToKw } from "../lib/api.js";

const TONE = {
  CRITICAL: { badge: "bg-rose-50 text-rose-600 border-rose-200", bar: "#E11D48", pill: "bg-rose-50 text-rose-600" },
  HIGH: { badge: "bg-rose-50 text-rose-600 border-rose-200", bar: "#E11D48", pill: "bg-rose-50 text-rose-600" },
  MEDIUM: { badge: "bg-amber-50 text-amber-600 border-amber-200", bar: "#D97706", pill: "bg-amber-50 text-amber-600" },
  LOW: { badge: "bg-blue-50 text-blue-600 border-blue-200", bar: "#2563EB", pill: "bg-blue-50 text-blue-600" },
};

const TYPE_ICON = { DEFICIT: ShieldAlert, SURPLUS: TriangleAlert, NORMAL: CloudFog };

const HOUR_MARKS = [0, 4, 8, 12, 16, 20, 24];
const HEATMAP_BUCKETS = [0, 3, 6, 9, 12, 15, 18, 21];

function groupIntoWindows(risks) {
  const windows = [];
  risks.forEach((r, i) => {
    const last = windows[windows.length - 1];
    if (last && last.level === r.risk_level && last.type === r.risk_type) {
      last.endIdx = i;
      last.hours.push(r);
    } else {
      windows.push({ level: r.risk_level, type: r.risk_type, startIdx: i, endIdx: i, hours: [r] });
    }
  });
  return windows;
}

export default function RiskIntelligence() {
  const [view, setView] = useState("timeline");
  const [selected, setSelected] = useState(null);
  const [risks, setRisks] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getRisk()
      .then((data) => !cancelled && setRisks(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const windows = useMemo(() => (risks ? groupIntoWindows(risks) : []), [risks]);
  const notableWindows = windows.filter((w) => w.level !== "LOW");

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Risk Intelligence"
        subtitle="Identify, understand and monitor operational risks over the next 24 hours."
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

      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Couldn't reach the backend ({error}).
        </p>
      )}

      {!risks && !error && <div className="h-96 animate-pulse rounded-2xl bg-slate-50" />}

      {risks && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-5">
            {notableWindows.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                No elevated risk windows detected in the next 24 hours — forecast fits comfortably within available
                flexibility.
              </div>
            )}
            {notableWindows.map((w, idx) => {
              const t = TONE[w.level];
              const Icon = TYPE_ICON[w.type] ?? Gauge;
              const id = `${w.startIdx}-${w.endIdx}`;
              const isSelected = selected === id;
              const startTs = w.hours[0].timestamp.slice(11, 16);
              const endTs = w.hours[w.hours.length - 1].timestamp.slice(11, 16);
              return (
                <button
                  key={id}
                  onClick={() => setSelected((cur) => (cur === id ? null : id))}
                  className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                    isSelected ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${t.badge}`}>
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">
                          {w.level} {w.type}
                        </p>
                        <p className="text-xs text-slate-500">{startTs} – {endTs}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Score: {w.hours[0].risk_score}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${t.pill}`}>
                      {w.level}
                    </span>
                  </div>

                  {isSelected && (
                    <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
                      {w.hours[0].risk_reason} Generation ≈ {mwToKw(w.hours[0].generation).toFixed(1)} kW vs. demand{" "}
                      {mwToKw(w.hours[0].demand).toFixed(1)} kW.
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
                <div className="flex flex-col gap-2">
                  {risks.map((r, i) => {
                    const t = TONE[r.risk_level];
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-14 shrink-0 text-xs font-medium text-slate-500">
                          {r.timestamp.slice(11, 16)}
                        </span>
                        <div className="relative h-4 flex-1 rounded-md bg-slate-100">
                          <div
                            className="absolute inset-y-0 left-0 rounded-md"
                            style={{ width: "100%", background: t.bar, opacity: r.risk_level === "LOW" ? 0.12 : 0.7 }}
                            title={`${r.risk_level} ${r.risk_type}`}
                          />
                        </div>
                        <span className="w-24 shrink-0 text-right text-[11px] font-semibold text-slate-500">
                          {r.risk_level}
                        </span>
                      </div>
                    );
                  })}
                  <div className="ml-[3.5rem] mr-24 mt-1 flex justify-between text-[11px] font-mono text-slate-400">
                    {HOUR_MARKS.map((h) => (
                      <span key={h}>{String(h).padStart(2, "0")}:00</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="ml-0 mb-1 grid grid-cols-8 gap-1.5">
                    {HEATMAP_BUCKETS.map((h) => (
                      <span key={h} className="text-center font-mono text-[10px] text-slate-400">
                        {String(h).padStart(2, "0")}h
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-8 gap-1.5">
                    {HEATMAP_BUCKETS.map((bucketStart) => {
                      const bucketRisks = risks.slice(bucketStart, bucketStart + 3);
                      const worst = bucketRisks.reduce(
                        (max, r) => (r.risk_score > max.risk_score ? r : max),
                        bucketRisks[0]
                      );
                      const t = TONE[worst.risk_level];
                      const intensity = worst.risk_level === "LOW" ? 0.08 : 0.3 + (worst.risk_score / 100) * 0.7;
                      return (
                        <div
                          key={bucketStart}
                          className="h-10 rounded-md"
                          style={{ background: t.bar, opacity: intensity }}
                          title={`${worst.risk_level} ${worst.risk_type} (score ${worst.risk_score})`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
