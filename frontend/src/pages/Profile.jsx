import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Shield, Mail } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "Dhruv Parmar",
    email: "dhruv@intelligen.io",
    org: "Grid Ops User",
    role: "Grid Operator",
  });
  const [notifications, setNotifications] = useState({
    riskAlerts: true,
    dailyDigest: true,
    modelUpdates: false,
  });
  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function toggleNotification(key) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <PageHeader title="Profile & Settings" subtitle="Manage your account and notification preferences." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#1688F5] to-[#0A4B8C] text-lg font-bold text-white">
              DP
            </div>
            <p className="mt-4 font-bold text-slate-900">{form.name}</p>
            <p className="text-sm text-slate-500">{form.role}</p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              {form.email}
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-8">
          <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <Shield className="h-4.5 w-4.5 text-blue-600" />
              Account Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name" value={form.name} onChange={(v) => update("name", v)} />
              <Field label="Work Email" value={form.email} onChange={(v) => update("email", v)} type="email" />
              <Field label="Organization" value={form.org} onChange={(v) => update("org", v)} />
              <Field label="Role" value={form.role} onChange={(v) => update("role", v)} />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                Save Changes
              </button>
              {saved && <span className="text-xs font-medium text-emerald-600">Saved.</span>}
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <Bell className="h-4.5 w-4.5 text-blue-600" />
              Notification Preferences
            </h3>
            <div className="flex flex-col divide-y divide-slate-100">
              <Toggle
                label="Risk alerts"
                sub="High and critical risk windows"
                checked={notifications.riskAlerts}
                onChange={() => toggleNotification("riskAlerts")}
              />
              <Toggle
                label="Daily digest"
                sub="Summary of forecast and recommendations"
                checked={notifications.dailyDigest}
                onChange={() => toggleNotification("dailyDigest")}
              />
              <Toggle
                label="Model updates"
                sub="Notify when the forecasting model recalibrates"
                checked={notifications.modelUpdates}
                onChange={() => toggleNotification("modelUpdates")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function Toggle({ label, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-blue-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
