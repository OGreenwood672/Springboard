import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Building,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs sm:text-sm font-semibold border border-emerald-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Connecting young UK talent with local opportunity</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Launch your career journey with{" "}
              <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Springboard
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover vetted part-time jobs, work experience placements, and
              volunteering roles across the UK tailored to your skills,
              interests, and availability.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to={role === "business" ? "/business/assistant" : "/coach"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                >
                  <span>
                    Open{" "}
                    {role === "business"
                      ? "Recruiter Assistant"
                      : "Job Coach AI"}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/sign-up"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                  >
                    <span>I'm a Young Person</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/sign-up?role=business"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all"
                  >
                    <Building className="w-5 h-5 text-indigo-600" />
                    <span>I'm an Employer / Organisation</span>
                  </Link>
                </>
              )}
            </div>

            {/* Micro proof tags */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>UK Postcode Proximity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Career Profile Assist</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Safeguarded & Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars of Opportunities */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Three pathways to build your future
            </h2>
            <p className="mt-3 text-slate-600">
              Whether you want to earn alongside your studies, gain insight into
              an industry, or make a social impact in your community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 font-bold">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Part-time Jobs
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Flexible weekend and evening roles offering fair UK hourly pay
                (£11.44+), customer experience, and team collaboration skills.
              </p>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Earn & Gain Confidence
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5 font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Work Experience
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                1–2 week summer and half-term placements shadowing developers,
                marketers, and designers to build practical CV experience.
              </p>
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Industry Insights
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Volunteering Roles
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Support local charities, youth events, STEM workshops, and
                environmental initiatives while demonstrating leadership.
              </p>
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                Community Impact
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How Springboard works for you
            </h2>
            <p className="mt-3 text-slate-600">
              A frictionless four-step journey designed for young UK candidates
              and local employers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-4">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                Create Profile
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                State your skills, GCSE/BTEC qualifications, location, and
                weekend availability in under 3 minutes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-4">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                AI Coach Assistant
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use our conversational AI coach placeholder to automatically
                convert your thoughts into structured strengths.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-4">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                Smart Matches
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our deterministic matching engine generates transparent match %
                scores based on distance, skills, and schedules.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-4">
                4
              </span>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                Track Applications
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apply with one click and track your status in real time as
                organisations review and shortlist candidates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to find your next opportunity?
          </h2>
          <p className="text-emerald-100 text-base sm:text-lg max-w-xl mx-auto">
            Join other young people finding work experience and part-time jobs
            across the UK today.
          </p>
          <div className="pt-2">
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg transition-all"
            >
              Browse Open Opportunities Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
