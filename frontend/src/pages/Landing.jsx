import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  ChevronDown,
  TrendingUp,
  ShieldAlert,
  Lightbulb,
  Gauge,
  Sun,
  Building2,
} from "lucide-react";
import Logo from "../components/Logo.jsx";

const NAV_LINKS = ["Product", "Solutions", "About"];

const STATS = [
  { value: "99.2%", label: "Forecast Accuracy" },
  { value: "12M+", label: "Data Points Daily" },
  { value: "40%", label: "Lower Imbalance Risk" },
];

const PRODUCT_FEATURES = [
  {
    icon: TrendingUp,
    title: "Forecast Engine",
    body: "24–72 hour solar and wind generation forecasts with quantified uncertainty, not just a single number.",
  },
  {
    icon: ShieldAlert,
    title: "Risk Intelligence",
    body: "Forecasts are translated into surplus and deficit risk, weighed against real grid flexibility.",
  },
  {
    icon: Lightbulb,
    title: "Decision Support",
    body: "Ranked, explainable recommendations for storage, export and backup — before the risk arrives.",
  },
];

const SOLUTIONS = [
  {
    icon: Gauge,
    title: "Grid Operators",
    body: "See surplus and deficit windows early enough to charge storage, export, or prepare backup.",
  },
  {
    icon: Sun,
    title: "Renewable Developers",
    body: "Reduce curtailment and improve plant-level forecasting accuracy across your portfolio.",
  },
  {
    icon: Building2,
    title: "Utilities",
    body: "Plan scheduling and market participation around a forecast you can actually trust.",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050D1A]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 15% 0%, rgba(22,136,245,0.16) 0%, rgba(5,13,26,0) 60%), radial-gradient(50% 40% at 100% 10%, rgba(72,199,255,0.10) 0%, rgba(5,13,26,0) 60%)",
        }}
      />

      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-extrabold tracking-wide text-white">
              INTELLI<span className="text-[#38A3FF]">GEN</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-[#8FA7C1] transition hover:text-white"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/5 sm:block"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#050D1A] transition hover:bg-blue-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-10 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div>
            <p className="mb-6 flex items-center gap-3 font-mono text-xs font-semibold tracking-[0.2em] text-[#48C7FF]">
              <span className="h-px w-6 bg-[#48C7FF]/60" />
              RENEWABLE ENERGY INTELLIGENCE
            </p>

            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4rem]">
              Forecast Earlier.
              <br />
              Understand Risk.
              <br />
              <span className="bg-gradient-to-r from-[#90C5FF] to-[#48C7FF] bg-clip-text text-transparent">
                Prepare Smarter.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#8FA7C1] sm:text-lg">
              AI-powered forecasting and operational intelligence for a reliable, resilient
              and efficient renewable future.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1688F5] to-[#38A3FF] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:brightness-110"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <button className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10">
                  <Play className="h-2.5 w-2.5 fill-white text-white" />
                </span>
                Watch Demo
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 shadow-2xl shadow-black/40">
              <img
                src="/images/hero-landscape.jpg"
                alt="Renewable energy landscape at sunrise over a lake and mountains"
                className="h-[420px] w-full object-cover object-center sm:h-[480px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050D1A]/40 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-5 right-5 w-56 rounded-2xl border border-white/10 bg-[#0A1A2C]/90 p-4 shadow-xl backdrop-blur-sm sm:w-64">
              <p className="mb-2 text-xs font-semibold text-[#8FA7C1]">Tomorrow's Outlook</p>
              <div className="mb-2 flex items-center gap-1.5 text-lg font-bold text-emerald-400">
                <TrendingUp className="h-4 w-4" />
                +18% higher generation
              </div>
              <p className="mb-3 text-xs text-[#8FA7C1]">vs. today</p>
              <svg viewBox="0 0 160 40" className="h-9 w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="heroSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38A3FF" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#38A3FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,35 Q20,32 40,28 T80,22 T120,25 T140,10 T160,8"
                  fill="none"
                  stroke="#38A3FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path d="M0,35 Q20,32 40,28 T80,22 T120,25 T140,10 T160,8 V40 H0 Z" fill="url(#heroSparklineGrad)" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-10 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-[#8FA7C1]">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="max-w-xs">
            <p className="mb-3 text-xs font-medium text-[#8FA7C1]">Trusted by grid operators.</p>
            <div className="flex gap-2">
              <span className="h-1.5 w-16 rounded-full bg-white/15" />
              <span className="h-1.5 w-16 rounded-full bg-gradient-to-r from-[#1688F5] to-[#38A3FF]" />
              <span className="h-1.5 w-16 rounded-full bg-white/15" />
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-end gap-2 text-xs font-medium text-[#8FA7C1]">
          Scroll to explore
          <span className="grid h-6 w-6 place-items-center rounded-full border border-white/15">
            <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
          </span>
        </div>
      </main>

      <section id="product" className="relative z-10 border-t border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-[#48C7FF]">PRODUCT</p>
          <h2 className="mb-10 max-w-xl text-3xl font-extrabold text-white sm:text-4xl">
            One intelligence loop, three engines.
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {PRODUCT_FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-[#48C7FF]">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8FA7C1]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="relative z-10 border-t border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-[#48C7FF]">SOLUTIONS</p>
          <h2 className="mb-10 max-w-xl text-3xl font-extrabold text-white sm:text-4xl">Built for every seat in the room.</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {SOLUTIONS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-[#48C7FF]">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8FA7C1]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 border-t border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-[#48C7FF]">ABOUT</p>
          <h2 className="mb-5 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            From renewable uncertainty to renewable readiness.
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-[#8FA7C1]">
            IntelliGen is a decision-support layer, not an autonomous grid controller. We forecast generation,
            quantify the uncertainty, price it against real grid flexibility, and hand operators a ranked,
            explainable recommendation — final decisions always stay with the authorized operator.
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-xs text-[#8FA7C1] sm:flex-row lg:px-10">
          <span>© 2026 IntelliGen. Renewable Energy Intelligence.</span>
          <div className="flex gap-6">
            <a href="#product" className="hover:text-white">Product</a>
            <a href="#solutions" className="hover:text-white">Solutions</a>
            <a href="#about" className="hover:text-white">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
