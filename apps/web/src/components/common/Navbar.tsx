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
  PlusCircle,
  LogOut,
  Menu,
  X,
  Layers,
  Bot,
  Users,
  Network,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              to={
                isAuthenticated
                  ? role === "business"
                    ? "/business/assistant"
                    : "/coach"
                  : "/"
              }
              className="flex items-center gap-2.5 text-emerald-700 font-extrabold text-xl tracking-tight hover:text-emerald-800 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <Compass className="w-5 h-5" />
              </div>
              <span className="bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                Springboard
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-md">
                UK MVP
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {isAuthenticated && role === "youth" && (
                <>
                  <Link
                    to="/coach"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/coach") || isActive("/")
                        ? "bg-emerald-100 text-emerald-900 font-bold shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Bot className="w-4 h-4 text-emerald-600" />
                    <span>Job Coach AI</span>
                  </Link>

                  <Link
                    to="/knowledge"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/knowledge")
                        ? "bg-emerald-50 text-emerald-800 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Network className="w-4 h-4 text-teal-600" />
                    <span>Knowledge Map</span>
                  </Link>

                  <Link
                    to="/matches"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/matches")
                        ? "bg-emerald-50 text-emerald-800 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Matches</span>
                  </Link>

                  <Link
                    to="/applications"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/applications")
                        ? "bg-emerald-50 text-emerald-800 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4 text-sky-600" />
                    <span>Applications</span>
                  </Link>
                </>
              )}

              {isAuthenticated && role === "business" && (
                <>
                  <Link
                    to="/business/assistant"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/business/assistant") || isActive("/business")
                        ? "bg-indigo-100 text-indigo-900 font-bold shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>Recruiter AI</span>
                  </Link>

                  <Link
                    to="/business/opportunities"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/business/opportunities")
                        ? "bg-emerald-50 text-emerald-800 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>Listings</span>
                  </Link>
                </>
              )}

              {!isAuthenticated && (
                <a
                  href="http://localhost:5174"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <span>🏛️ Council Wage Portal</span>
                </a>
              )}
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {role === "youth" ? (
                  <Link
                    to="/profile"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/profile")
                        ? "bg-slate-200 text-slate-900 font-semibold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-emerald-700" />
                    <span>Profile</span>
                  </Link>
                ) : (
                  <Link
                    to="/business/profile"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/business/profile")
                        ? "bg-slate-200 text-slate-900 font-semibold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-700" />
                    <span>Organisation</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/sign-in"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
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
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {isAuthenticated && role === "youth" && (
            <>
              <Link
                to="/coach"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-bold bg-emerald-50 text-emerald-900"
              >
                <Bot className="w-5 h-5 text-emerald-600" />
                Job Coach AI
              </Link>
              <Link
                to="/knowledge"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-100"
              >
                <Network className="w-5 h-5 text-teal-600" />
                My Knowledge Map
              </Link>
              <Link
                to="/matches"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-100"
              >
                <Sparkles className="w-5 h-5 text-amber-500" />
                My Matches
              </Link>
              <Link
                to="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-100"
              >
                <FileCheck2 className="w-5 h-5 text-sky-600" />
                My Applications
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-100"
              >
                <UserIcon className="w-5 h-5 text-emerald-600" />
                My Youth Profile
              </Link>
            </>
          )}

          {isAuthenticated && role === "business" && (
            <>
              <Link
                to="/business/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-bold bg-indigo-50 text-indigo-900"
              >
                <Bot className="w-5 h-5 text-indigo-600" />
                Recruiter AI Assistant
              </Link>
              <Link
                to="/business/opportunities"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-100"
              >
                <Layers className="w-5 h-5 text-indigo-600" />
                My Listings
              </Link>
              <Link
                to="/business/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-100"
              >
                <Building2 className="w-5 h-5 text-indigo-600" />
                Organisation Profile
              </Link>
            </>
          )}

          {!isAuthenticated && (
            <Link
              to="/opportunities"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-100"
            >
              <Briefcase className="w-5 h-5 text-emerald-600" />
              Browse Opportunities
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-base font-medium bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                <LogOut className="w-5 h-5" />
                Sign Out ({user?.email})
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-base font-medium text-slate-800 bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-base font-semibold bg-emerald-600 text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
