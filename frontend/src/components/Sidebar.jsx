import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  ShieldAlert,
  Lightbulb,
  FlaskConical,
  Cpu,
  Database,
} from "lucide-react";
import Logo from "./Logo.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Command Center", icon: LayoutDashboard, end: true },
  { to: "/dashboard/forecast", label: "Forecast", icon: TrendingUp },
  { to: "/dashboard/risk-intelligence", label: "Risk Intelligence", icon: ShieldAlert },
  { to: "/dashboard/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/dashboard/scenario-lab", label: "Scenario Lab", icon: FlaskConical },
  { to: "/dashboard/model-intelligence", label: "Model Intelligence", icon: Cpu },
  { to: "/dashboard/data-health", label: "Data Health", icon: Database },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <Link to="/dashboard" className="flex items-center gap-3 px-6 py-6 transition hover:opacity-80">
        <Logo size={34} />
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold tracking-wide text-slate-900">
            INTELLI<span className="text-blue-600">GEN</span>
          </p>
          <p className="truncate text-[10.5px] font-medium text-slate-400">
            Renewable Energy Intelligence
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-[inset_2px_0_0_0_#2563EB]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
          System Online
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Last updated
          <br />
          <span className="font-mono text-slate-600">12 Sep 2026, 10:24</span>
        </p>
        <p className="mt-1.5 font-mono text-[11px] text-slate-400">Model v2.10</p>
      </div>

      <Link
        to="/dashboard/profile"
        className="flex items-center gap-3 border-t border-slate-200 px-5 py-4 transition hover:bg-slate-50"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1688F5] to-[#0A4B8C] text-xs font-bold text-white">
          DP
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">Dhruv Parmar</p>
          <p className="truncate text-[11px] text-slate-400">Grid Operator</p>
        </div>
      </Link>
    </aside>
  );
}
