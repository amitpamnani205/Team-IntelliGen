import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Sun, Calendar, Clock, ChevronDown, Search, Bell, Check, User, Settings, LogOut } from "lucide-react";
import useClickOutside from "../hooks/useClickOutside.js";

const SELECTORS = [
  { icon: Sun, options: ["Solar Plant A", "Solar Plant B", "Wind Farm C"] },
  { icon: Calendar, options: ["12 Sep 2026", "11 Sep 2026", "10 Sep 2026"] },
  { icon: Clock, options: ["24 Hours", "48 Hours", "7 Days"] },
];

const NOTIFICATIONS = [
  { title: "High Surplus Risk approaching", time: "2 min ago" },
  { title: "Charge Storage recommendation ready", time: "18 min ago" },
  { title: "Model v2.10 recalibrated", time: "1 hr ago" },
];

function getInitials(user) {
  if (!user) return "??";
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  if (first || last) return `${first}${last}`.toUpperCase();
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  return email.slice(0, 2).toUpperCase() || "??";
}

export default function DashboardTopbar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Account";
  const [values, setValues] = useState(SELECTORS.map((s) => s.options[0]));
  const [openIndex, setOpenIndex] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const selectorsRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useClickOutside(selectorsRef, () => setOpenIndex(null));
  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  function selectValue(i, option) {
    setValues((prev) => prev.map((v, idx) => (idx === i ? option : v)));
    setOpenIndex(null);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3.5 sm:px-8">
      <div ref={selectorsRef} className="flex flex-wrap items-center gap-2.5">
        {SELECTORS.map(({ icon: Icon, options }, i) => (
          <div key={i} className="relative">
            <button
              onClick={() => setOpenIndex((cur) => (cur === i ? null : i))}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Icon className="h-3.5 w-3.5 text-blue-600" />
              {values[i]}
              <ChevronDown className={`h-3 w-3 text-slate-400 transition ${openIndex === i ? "rotate-180" : ""}`} />
            </button>

            {openIndex === i && (
              <div className="absolute left-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => selectValue(i, option)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {option}
                    {values[i] === option && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">
          <Search className="h-4 w-4" />
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-20 mt-1.5 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <p className="border-b border-slate-100 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Notifications
              </p>
              {NOTIFICATIONS.map((n) => (
                <div key={n.title} className="px-3.5 py-2.5 hover:bg-slate-50">
                  <p className="text-xs font-medium text-slate-800">{n.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#1688F5] to-[#0A4B8C] text-xs font-bold text-white"
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              getInitials(user)
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-20 mt-1.5 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <div className="border-b border-slate-100 px-3.5 py-2.5">
                <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="truncate text-xs text-slate-400">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/dashboard/profile");
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <User className="h-3.5 w-3.5" />
                Profile
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/dashboard/profile");
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-2.5 border-t border-slate-100 px-3.5 py-2.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
