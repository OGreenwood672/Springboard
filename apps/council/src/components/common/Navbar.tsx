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
  Zap,
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
    { label: "Dashboard", path: "/", icon: Landmark },
    { label: "Wage Map", path: "/map", icon: MapPin },
    { label: "Businesses", path: "/companies", icon: Building2 },
    { label: "Schemes", path: "/schemes", icon: Coins },
    { label: "Ledger", path: "/allocations", icon: FileSpreadsheet },
    { label: "Analytics", path: "/analytics", icon: LineChart },
    { label: "Policy Advisor AI", path: "/advisor", icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Council Name */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-950/40">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    Springboard
                  </span>
                  <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-500/30">
                    Council Command Center
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                  {council?.name || "Local Authority Command"}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {user && (
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : "text-slate-400"}`}
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
                <div className="text-right hidden md:block border-r border-slate-800 pr-3 font-mono">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Available Fund Capital
                  </p>
                  <p className="text-xs font-black text-emerald-400">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-sm"
                  title="Switch to Youth / Employer Portal"
                >
                  <span>Portal (Port 5173)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="http://localhost:5173"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 font-bold"
                >
                  <span>Go to Youth/Employer Web</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="xl:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900"
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
        <div className="xl:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-1 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold ${
                  active
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <a
              href="http://localhost:5173"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <span>Youth & Business Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold text-rose-400 hover:text-rose-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
