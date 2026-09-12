import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Target, ShieldCheck, Package, Share2, Eye, EyeOff, ChevronDown } from "lucide-react";
import Logo from "../components/Logo.jsx";

const FEATURES = [
  { icon: Target, label: "Accurate Forecasting" },
  { icon: ShieldCheck, label: "Risk-aware Insights" },
  { icon: Package, label: "Actionable Recommendations" },
  { icon: Share2, label: "Built for Grid Operators" },
];

const ORGANIZATIONS = ["Grid Ops User", "Utility Company", "Renewable Energy Developer"];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", org: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Valid work email is required";
    if (!form.org) nextErrors.org = "Please select an organization";
    if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      navigate("/dashboard");
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-14">
        <img
          src="/images/hero-landscape.jpg"
          alt="Lake sunset background"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050D1A]/95 via-[#050D1A]/85 to-[#0A1A2C]/80" />

        <div className="relative z-10 flex items-center gap-3">
          <Logo />
          <span className="text-lg font-extrabold tracking-wide text-white">
            INTELLI<span className="text-[#38A3FF]">GEN</span>
          </span>
        </div>

        <div className="relative z-10 mt-14 max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight text-white">Join IntelliGen</h1>
          <p className="mt-4 text-base text-[#8FA7C1]">
            Be part of a smarter, more resilient energy future.
          </p>

          <ul className="mt-10 flex flex-col gap-5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5">
                  <Icon className="h-4.5 w-4.5 text-[#48C7FF]" />
                </span>
                <span className="text-sm font-medium text-white/90">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-14 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo />
            <span className="text-lg font-extrabold tracking-wide text-[#050D1A]">
              INTELLI<span className="text-[#1688F5]">GEN</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
          <p className="mt-1.5 text-sm text-slate-500">Get started with IntelliGen</p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Dhruv Parmar"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1688F5] focus:ring-4 focus:ring-[#1688F5]/10"
              />
              {errors.name && <p className="mt-1.5 text-xs text-rose-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="dhruv@yourorg.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1688F5] focus:ring-4 focus:ring-[#1688F5]/10"
              />
              {errors.email && <p className="mt-1.5 text-xs text-rose-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="org" className="block text-xs font-bold text-slate-700">
                Organization
              </label>
              <div className="relative mt-2">
                <select
                  id="org"
                  value={form.org}
                  onChange={(e) => update("org", e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1688F5] focus:ring-4 focus:ring-[#1688F5]/10"
                >
                  <option value="" disabled>
                    Select organization
                  </option>
                  {ORGANIZATIONS.map((org) => (
                    <option key={org} value={org}>
                      {org}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.org && <p className="mt-1.5 text-xs text-rose-500">{errors.org}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1688F5] focus:ring-4 focus:ring-[#1688F5]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-[#1688F5] py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#1177DD]"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#1688F5] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
