import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050D1A] px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 0%, rgba(22,136,245,0.14) 0%, rgba(5,13,26,0) 65%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0A1A2C]/80 p-8 shadow-2xl backdrop-blur-sm">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <Logo />
          <span className="text-lg font-extrabold tracking-wide text-white">
            INTELLI<span className="text-[#38A3FF]">GEN</span>
          </span>
        </Link>

        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-[#8FA7C1]">
          Enter your credentials to access the Command Center
        </p>

        <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-white/80">
              Work Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="dhruv@yourorg.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#38A3FF] focus:ring-4 focus:ring-[#38A3FF]/15"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-white/80">
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 pr-11 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#38A3FF] focus:ring-4 focus:ring-[#38A3FF]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-gradient-to-r from-[#1688F5] to-[#38A3FF] py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:brightness-110"
          >
            Sign In to Command Center
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8FA7C1]">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-[#48C7FF] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
