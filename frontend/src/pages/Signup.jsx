import { Link } from "react-router-dom";
import { SignUp } from "@clerk/clerk-react";
import { Target, ShieldCheck, Package, Share2 } from "lucide-react";
import Logo from "../components/Logo.jsx";

const FEATURES = [
  { icon: Target, label: "Accurate Forecasting" },
  { icon: ShieldCheck, label: "Risk-aware Insights" },
  { icon: Package, label: "Actionable Recommendations" },
  { icon: Share2, label: "Built for Grid Operators" },
];

const clerkAppearance = {
  variables: {
    colorPrimary: "#1688F5",
    colorBackground: "transparent",
    colorText: "#0F172A",
    colorTextSecondary: "#64748B",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#0F172A",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full",
    card: "w-full bg-transparent shadow-none border-none p-0",
    header: "hidden",
    footerActionLink: "text-[#1688F5] hover:text-[#1177DD]",
    formButtonPrimary: "bg-[#1688F5] hover:bg-[#1177DD] shadow-lg shadow-blue-500/25 text-sm normal-case",
    formFieldInput: "border-slate-200 focus:border-[#1688F5] focus:ring-[#1688F5]/10",
    formFieldLabel: "text-slate-700",
    dividerLine: "bg-slate-200",
    dividerText: "text-slate-400",
    socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50 text-slate-700",
  },
};

export default function Signup() {
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
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo />
            <span className="text-lg font-extrabold tracking-wide text-[#050D1A]">
              INTELLI<span className="text-[#1688F5]">GEN</span>
            </span>
          </Link>

          <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
          <p className="mt-1.5 text-sm text-slate-500">Get started with IntelliGen</p>

          <div className="mt-8">
            <SignUp
              routing="path"
              path="/signup"
              signInUrl="/login"
              afterSignUpUrl="/dashboard"
              appearance={clerkAppearance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
