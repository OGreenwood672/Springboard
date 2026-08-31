import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Landmark,
  ShieldCheck,
  Coins,
  ArrowRight,
  Sparkles,
  MapPin,
  Lock,
  Mail,
  ExternalLink,
} from "lucide-react";

export const CouncilSignInPage: React.FC = () => {
  const { login, registerCouncil } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState<string>("council@example.com");
  const [password, setPassword] = useState<string>("Password123!");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await login({ email, password });
        showToast("Successfully signed in to Council Portal.", "success");
      } else {
        await registerCouncil({ email, password });
        showToast("Council account created successfully.", "success");
      }
      navigate("/");
    } catch (err: any) {
      showToast(err.message || "Authentication failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword("Password123!");
    setSubmitting(true);
    try {
      await login({ email: quickEmail, password: "Password123!" });
      showToast(`Signed in as ${quickEmail.split("@")[0]} council!`, "success");
      navigate("/");
    } catch (err: any) {
      showToast(err.message || "Authentication failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -right-12 -top-12 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl" />

        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white mx-auto shadow-md ring-4 ring-emerald-500/20">
            <Landmark className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="font-extrabold text-slate-900 text-xl tracking-tight">
              Springboard
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase border border-emerald-300">
              Council
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Local Authority Wage Subsidy Portal
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Access spatial wage analytics, identify SME wage gaps, and allocate
            targeted youth living wage grants.
          </p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider text-center">
            ⚡ Quick 1-Click Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("council@example.com")}
              disabled={submitting}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-left text-xs font-semibold text-slate-800 hover:text-emerald-900 transition-all shadow-2xs cursor-pointer"
            >
              <span className="block font-bold text-emerald-800">
                🏛️ Buckinghamshire
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Chesham & Amersham
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("camden@example.com")}
              disabled={submitting}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-500 text-left text-xs font-semibold text-slate-800 hover:text-teal-900 transition-all shadow-2xs cursor-pointer"
            >
              <span className="block font-bold text-teal-800">
                🏛️ Camden London
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Urban Catchment
              </span>
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === "signin"
                ? "bg-white text-slate-900 shadow-2xs"
                : "hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-2xs"
                : "hover:text-slate-900"
            }`}
          >
            Register Council
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Council Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@council.gov.uk"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>
              {submitting
                ? "Authenticating..."
                : mode === "signin"
                  ? "Sign In to Portal"
                  : "Register Council Authority"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link to Youth and Business Portals */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-700 font-semibold"
          >
            <span>Switch to Springboard Youth & Business Web</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
