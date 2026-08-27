import React from 'react';
import { Compass, Shield, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Compass className="w-5 h-5 text-emerald-400" />
              <span>Springboard UK</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering young people aged 14–24 across the United Kingdom to discover local part-time jobs, meaningful work experience, and community volunteering opportunities.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Built for safeguarding, privacy, and accessible UK opportunities</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              For Young People
            </h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">Browse Part-time Jobs</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Work Experience Placements</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Volunteering Projects</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">AI Career Coach (Mock)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              For Organisations
            </h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">Post Opportunities</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Manage Applicants</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Match Engine</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">UK Employment Guidelines</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Springboard UK MVP. Local development and demonstration release.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Made with</span>
            <HeartHandshake className="w-3.5 h-3.5 text-rose-400 inline" />
            <span>for UK youth development</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
