import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  MapPin,
  Building2,
  Coins,
  FileSpreadsheet,
  LineChart,
  Bot,
  LogOut,
  Menu,
  X,
  Landmark,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, council, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  const navLinks = [
    { label: "Executive Dashboard", path: "/", icon: Landmark },
    { label: "Wage Subsidy Map", path: "/map", icon: MapPin },
    { label: "Eligible Businesses", path: "/companies", icon: Building2 },
    { label: "Subsidy Schemes", path: "/schemes", icon: Coins },
    { label: "Pledges Ledger", path: "/allocations", icon: FileSpreadsheet },
    { label: "Impact Analytics", path: "/analytics", icon: LineChart },
    { label: "Policy AI Advisor", path: "/advisor", icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Council Name */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                    Springboard
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-300">
                    Council Portal
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                  {council?.name || "UK Local Authority Portal"}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${active ? "text-emerald-600" : "text-slate-400"}`}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Status / Budget Ticker / Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <div className="text-right hidden md:block border-r border-slate-200 pr-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Available Fund Budget
                  </p>
                  <p className="text-xs font-extrabold text-emerald-700">
                    £
                    {(
                      (council?.total_budget_allocated || 100000) -
                      (council?.total_budget_spent || 0)
                    ).toLocaleString()}
                  </p>
                </div>
                <a
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-all"
                  title="Switch to Youth / Employer Portal"
                >
                  <span>Main Web App</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="http://localhost:5173"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <span>Go to Youth/Employer Web</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  active
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-600" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <a
              href="http://localhost:5173"
              className="inline-flex items-center gap-1 text-xs text-slate-600"
            >
              <span>Main Youth App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
