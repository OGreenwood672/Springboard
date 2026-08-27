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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-emerald-700 font-extrabold text-2xl"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <span>Springboard</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-sm text-slate-500">
            Enter your email and password to access your dashboard
          </p>
        </div>

        {/* Demo Account Quick-Fill Helper for Evaluation */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <span>⚡ Demo Accounts (One-Click Auto-fill)</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount("youth@example.com")}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 text-left font-medium text-emerald-900 transition-colors shadow-2xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Alex (Youth)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("business@example.com")}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-50 text-left font-medium text-indigo-900 transition-colors shadow-2xs cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Apex Tech (Biz)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. youth@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white uk-focus-ring transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white uk-focus-ring transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{submitting ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-600">
            Don't have an account yet?{" "}
            <Link
              to="/sign-up"
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
