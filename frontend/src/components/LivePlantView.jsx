import { MapPin } from "lucide-react";

export default function LivePlantView() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Live Plant View</h3>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Feed
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl">
        <img
          src="/images/live-plant-aerial.jpg"
          alt="Aerial view of Solar Plant A"
          className="absolute inset-0 h-full w-full min-h-[220px] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
          <span className="block h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-[0_0_0_6px_rgba(37,99,235,0.3)]" />
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 backdrop-blur-sm">
          <MapPin className="h-4 w-4 shrink-0 text-blue-300" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">Solar Plant A</p>
            <p className="text-[11px] font-mono text-white/70">780 MW</p>
          </div>
        </div>
      </div>
    </div>
  );
}
