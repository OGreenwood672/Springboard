import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Compass,
  Briefcase,
  Sparkles,
  FileCheck2,
  User as UserIcon,
  Building2,
  LogOut,
  Menu,
  X,
  Layers,
  Bot,
  Network,
  Zap,
  Landmark,
  MapPin,
  Coins,
  FileSpreadsheet,
  TrendingUp,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, role, business, council, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  // Compute dashboard badge label
  const getDashboardBadge = () => {
    if (!isAuthenticated) {
      return (
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 rounded-md border border-emerald-500/30 font-mono">
          <Zap className="w-2.5 h-2.5" /> 16–24 Social Mobility
        </span>
      );
    }
    if (role === "council") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 rounded-md border border-amber-500/30 font-mono">
          <Landmark className="w-2.5 h-2.5" /> Council Hub
        </span>
      );
    }
    if (role === "business") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 rounded-md border border-indigo-500/30 font-mono">
          <Building2 className="w-2.5 h-2.5" /> SME Employer Portal
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 rounded-md border border-emerald-500/30 font-mono">
        <Zap className="w-2.5 h-2.5" /> Candidate Portal
      </span>
    );
  };

  return (
    <>
      {/* Tier 1: Sticky Top Primary Header (Brand, Dashboard Type, Profile, Sign Out) */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand Logo & Dashboard Type */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to={
                  isAuthenticated
                    ? role === "council"
                      ? "/council"
                      : role === "business"
                        ? "/business/assistant"
                        : "/coach"
                    : "/"
                }
                className="flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-950/50 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent font-black">
                  Springboard
                </span>
              </Link>

              {getDashboardBadge()}
            </div>

            {/* Right Action Controls: Profile Settings & Sign Out */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {role === "youth" ? (
                    <Link
                      to="/profile"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActive("/profile")
                          ? "bg-slate-800 text-white border border-slate-700"
                          : "text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent"
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Profile</span>
                    </Link>
                  ) : role === "business" ? (
                    <Link
                      to="/business/profile"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all max-w-[220px] ${
                        isActive("/business/profile")
                          ? "bg-slate-800 text-white border border-slate-700"
                          : "text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">
                        {business?.name || "Organisation Name"}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to="/council"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all max-w-[240px] ${
                        isActive("/council")
                          ? "bg-slate-800 text-white border border-slate-700"
                          : "text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent"
                      }`}
                    >
                      <Landmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">
                        {council?.name || "Buckinghamshire Council"}
                      </span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
                    title="Sign out of account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/sign-in"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-950/40 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
                aria-label="Toggle Menu"
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
      </header>

      {/* Tier 2: Non-Sticky Sub-Navbar (Specific Pages Within That Particular Dashboard) */}
      {isAuthenticated && (
        <nav className="bg-slate-900/90 border-b border-slate-800/80 shadow-inner relative z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 py-1">
                {/* Youth Sub-Nav */}
                {role === "youth" && (
                  <>
                    <Link
                      to="/coach"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/coach") || isActive("/")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Job Coach AI</span>
                    </Link>

                    <Link
                      to="/knowledge"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/knowledge")
                          ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <Network className="w-3.5 h-3.5 text-teal-400" />
                      <span>Skills Graph</span>
                    </Link>

                    <Link
                      to="/matches"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/matches")
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Match Matrix</span>
                    </Link>

                    <Link
                      to="/applications"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/applications")
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>My Applications</span>
                    </Link>
                  </>
                )}

                {/* Business Sub-Nav */}
                {role === "business" && (
                  <>
                    <Link
                      to="/business/assistant"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/business/assistant") || isActive("/business")
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Recruiter AI</span>
                    </Link>

                    <Link
                      to="/business/opportunities"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/business/opportunities")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Live Vacancies</span>
                    </Link>
                  </>
                )}

                {/* Council Sub-Nav */}
                {role === "council" && (
                  <>
                    <Link
                      to="/council"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/council")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/council/map"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/council/map")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>Wage Map</span>
                    </Link>

                    <Link
                      to="/council/companies"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/council/companies")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Businesses & AI Ratings</span>
                    </Link>

                    <Link
                      to="/council/schemes"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/council/schemes")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Schemes</span>
                    </Link>

                    <Link
                      to="/council/allocations"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/council/allocations")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
                      <span>Ledger</span>
                    </Link>

                    <Link
                      to="/council/analytics"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/council/analytics")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                      <span>Social ROI</span>
                    </Link>

                    <Link
                      to="/council/advisor"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive("/council/advisor")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>AI Advisor</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Council Fund Balance Ticker (Right side of Sub-Nav) */}
              {role === "council" && (
                <div className="hidden lg:flex items-center gap-2 pl-4 text-[11px] font-mono shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-400">Available Fund:</span>
                  <strong className="text-emerald-300 font-bold">
                    £
                    {(
                      (council?.total_budget_allocated || 100000) -
                      (council?.total_budget_spent || 0)
                    ).toLocaleString()}{" "}
                    unpledged
                  </strong>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2.5">
          {isAuthenticated && role === "youth" && (
            <>
              <Link
                to="/coach"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>Job Coach AI</span>
              </Link>
              <Link
                to="/knowledge"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30"
              >
                <Network className="w-4 h-4 text-teal-400" />
                <span>Skills Knowledge Graph</span>
              </Link>
              <Link
                to="/matches"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Match Matrix</span>
              </Link>
              <Link
                to="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900"
              >
                <FileCheck2 className="w-4 h-4 text-sky-400" />
                <span>My Applications</span>
              </Link>
            </>
          )}

          {isAuthenticated && role === "business" && (
            <>
              <Link
                to="/business/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Recruiter AI</span>
              </Link>
              <Link
                to="/business/opportunities"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900"
              >
                <Layers className="w-4 h-4" />
                <span>Manage Vacancies</span>
              </Link>
            </>
          )}

          {isAuthenticated && role === "council" && (
            <>
              <Link
                to="/council"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              >
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Council Hub Dashboard</span>
              </Link>
              <Link
                to="/council/map"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900"
              >
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>Geospatial Wage Map</span>
              </Link>
              <Link
                to="/council/companies"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900"
              >
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Businesses & AI Ratings</span>
              </Link>
              <Link
                to="/council/schemes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Subsidy Schemes</span>
              </Link>
              <Link
                to="/council/allocations"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900"
              >
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                <span>Allocations Ledger</span>
              </Link>
              <Link
                to="/council/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900"
              >
                <TrendingUp className="w-4 h-4 text-rose-400" />
                <span>Social ROI Analytics</span>
              </Link>
              <Link
                to="/council/advisor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI Policy Advisor</span>
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <Link
                to={
                  role === "youth"
                    ? "/profile"
                    : role === "business"
                      ? "/business/profile"
                      : "/council"
                }
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-900"
              >
                <UserIcon className="w-4 h-4" />
                <span>
                  {role === "youth"
                    ? "Profile Settings"
                    : role === "business"
                      ? business?.name || "Organisation Name"
                      : council?.name || "Council Hub"}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <Link
                to="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-500"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};
