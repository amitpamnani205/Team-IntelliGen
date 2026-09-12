import Sparkline from "./Sparkline.jsx";

const TONES = {
  emerald: { badge: "bg-emerald-50 text-emerald-600 border-emerald-200", spark: "#10B981" },
  blue: { badge: "bg-blue-50 text-blue-600 border-blue-200", spark: "#2563EB" },
  amber: { badge: "bg-amber-50 text-amber-600 border-amber-200", spark: "#D97706" },
  rose: { badge: "bg-rose-50 text-rose-600 border-rose-200", spark: "#E11D48" },
};

export default function StatCard({ icon: Icon, label, value, meta, tone = "blue", sparkline }) {
  const t = TONES[tone];
  const metaColor = t.badge.split(" ")[1];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-lg border ${t.badge}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        {sparkline && <Sparkline points={sparkline} color={t.spark} width={72} height={28} />}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      </div>
      <p className={`mt-1 text-xs font-medium ${metaColor}`}>{meta}</p>
    </div>
  );
}
