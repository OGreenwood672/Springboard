import React from "react";
import { Link } from "react-router-dom";
import { Compass, Shield, Zap, ExternalLink, ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-black text-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold">
                <Compass className="w-4 h-4" />
              </div>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Springboard UK
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The UK’s first conversation-first social mobility and real living
              wage platform. Unifying 16–24 year olds, high-street businesses,
              and Local Authorities to eradicate the youth wage gap.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>
                HM Treasury Green Book Compliant • ICO & GDPR Certified
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-3.5">
              Candidate Portal
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <Link
                  to="/coach"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Job Coach AI
                </Link>
              </li>
              <li>
                <Link
                  to="/knowledge"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Skills Knowledge Graph
                </Link>
              </li>
              <li>
                <Link
                  to="/opportunities"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Living Wage Roles
                </Link>
              </li>
              <li>
                <Link
                  to="/matches"
                  className="hover:text-emerald-400 transition-colors"
                >
                  0–100 Matches
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-3.5">
              SME Portal
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <Link
                  to="/business/assistant"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Recruiter Assistant AI
                </Link>
              </li>
              <li>
                <Link
                  to="/business/opportunities"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Post Vacancy
                </Link>
              </li>
              <li>
                <span className="text-slate-500">
                  Wage Co-Funding Calculator
                </span>
              </li>
              <li>
                <span className="text-slate-500">Safeguarded Matching</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-3.5">
              Council Hub
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <Link
                  to="/council"
                  className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-bold"
                >
                  <span>Council Hub</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/council/map"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Geospatial Wage Map
                </Link>
              </li>
              <li>
                <Link
                  to="/council/schemes"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Wage Subsidy Schemes
                </Link>
              </li>
              <li>
                <Link
                  to="/council/allocations"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Grant Commitment Ledger
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} Springboard UK Technologies Ltd.
            Operating across England & Wales.
          </p>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Tripartite Economic Flywheel: Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
