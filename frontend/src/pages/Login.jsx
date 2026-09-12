import { Link } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import Logo from "../components/Logo.jsx";

const clerkAppearance = {
  variables: {
    colorPrimary: "#1688F5",
    colorBackground: "transparent",
    colorText: "#FFFFFF",
    colorTextSecondary: "#8FA7C1",
    colorInputBackground: "rgba(255,255,255,0.05)",
    colorInputText: "#FFFFFF",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full",
    card: "w-full bg-transparent shadow-none border-none p-0",
    header: "hidden",
    footer: "text-[#8FA7C1]",
    footerActionLink: "text-[#48C7FF] hover:text-[#38A3FF]",
    formButtonPrimary:
      "bg-gradient-to-r from-[#1688F5] to-[#38A3FF] hover:brightness-110 shadow-lg shadow-blue-900/40 text-sm normal-case",
    formFieldInput: "border-white/15 focus:border-[#38A3FF] focus:ring-[#38A3FF]/15",
    formFieldLabel: "text-white/80",
    dividerLine: "bg-white/10",
    dividerText: "text-[#8FA7C1]",
    socialButtonsBlockButton: "border-white/15 hover:bg-white/5 text-white",
    identityPreviewEditButton: "text-[#48C7FF]",
  },
};

export default function Login() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050D1A] px-6 py-14">
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
          Sign in to access the Command Center
        </p>

        <div className="mt-8">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/signup"
            afterSignInUrl="/dashboard"
            appearance={clerkAppearance}
          />
        </div>
      </div>
    </div>
  );
}
