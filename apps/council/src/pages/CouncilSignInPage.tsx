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
  Zap,
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full bg-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -right-12 -top-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-950/50">
            <Landmark className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="font-black text-white text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Springboard
            </span>
            <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase border border-emerald-500/30">
              Council Auth
            </span>
          </div>
          <h2 className="text-lg font-black text-white">
            Local Authority Wage Subsidy Portal
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Disburse regeneration funding, co-fund SME entry-level wages, and deterministically eliminate NEET friction.
          </p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <span className="text-[10px] font-mono font-black uppercase text-slate-400 block tracking-wider text-center flex items-center justify-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-400" />
            1-Click Demo Local Authorities
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("council@example.com")}
              disabled={submitting}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <span className="block font-black text-emerald-400">
                🏛️ Buckinghamshire
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Chesham & Amersham
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("camden@example.com")}
              disabled={submitting}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-left text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <span className="block font-black text-teal-400">
                🏛️ Camden London
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Urban Catchment
              </span>
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 text-xs font-bold text-slate-400 border border-slate-800">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === "signin"
                ? "bg-slate-800 text-white font-black shadow-sm"
                : "hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === "register"
                ? "bg-slate-800 text-white font-black shadow-sm"
                : "hover:text-white"
            }`}
          >
            Register Authority
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Council Officer Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@council.gov.uk"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>
              {submitting
                ? "Authenticating Authority..."
                : mode === "signin"
                  ? "Sign In to Command Center"
                  : "Register Council Authority"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link to Youth and Business Portals */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-bold transition-colors"
          >
            <span>Switch to Springboard Youth & Business Web (Port 5173)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
