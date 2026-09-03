import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  Compass,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Building,
  Zap,
  Landmark,
} from "lucide-react";

export const SignInPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter both your email address and password", "error");
      return;
    }

    setSubmitting(true);
    try {
      const user = await login({ email, password });
      showToast(`Welcome back, ${user.email}!`, "success");

      if (from !== "/") {
        navigate(from, { replace: true });
      } else if (user.role === "youth") {
        navigate("/coach", { replace: true });
      } else if (user.role === "business") {
        navigate("/business/assistant", { replace: true });
      } else if (user.role === "council") {
        navigate("/council", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      showToast(
        err.message || "Sign in failed. Please check your credentials.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full space-y-8 bg-slate-900/90 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-800">
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-white font-black text-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Springboard
            </span>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Sign In to Your Portal
          </h2>
          <p className="text-xs text-slate-400">
            Access your Youth Coach, Recruiter AI, or Council Hub
          </p>
        </div>

        {/* Demo Account Quick-Fill Helper */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            <span>Instant Demo Accounts</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => fillDemoAccount("youth@example.com")}
              className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-slate-800 text-left font-bold text-emerald-300 transition-all cursor-pointer shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Alex (Youth)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("business@example.com")}
              className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800 text-left font-bold text-indigo-300 transition-all cursor-pointer shadow-sm"
            >
              <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Apex Tech (SME)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("council@example.com")}
              className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 hover:bg-slate-800 text-left font-bold text-amber-300 transition-all cursor-pointer shadow-sm"
            >
              <Landmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Bucks (Council)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("youth2@example.com")}
              className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 hover:bg-slate-800 text-left font-bold text-purple-300 transition-all cursor-pointer shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Sarah (Youth - Wycombe)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. youth@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-950/50 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{submitting ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{" "}
            <Link
              to="/sign-up"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
