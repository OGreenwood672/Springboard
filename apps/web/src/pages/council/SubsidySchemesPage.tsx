import React, { useState, useEffect } from "react";
import { councilsApi } from "../../api/councils";
import { WageSubsidyScheme } from "@springboard/shared-types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import {
  Coins,
  PlusCircle,
  X,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  TrendingUp,
  Zap,
} from "lucide-react";

export const SubsidySchemesPage: React.FC = () => {
  const { council, refreshCouncil } = useAuth();
  const { showToast } = useToast();
  const [schemes, setSchemes] = useState<WageSubsidyScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Scheme Form State
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [totalBudget, setTotalBudget] = useState<number>(50000);
  const [subsidyRate, setSubsidyRate] = useState<number>(4.5);
  const [maxHours, setMaxHours] = useState<number>(16);
  const [maxMonths, setMaxMonths] = useState<number>(6);
  const [targetPostcodes, setTargetPostcodes] =
    useState<string>("HP5, HP6, HP11");
  const [targetSectors, setTargetSectors] = useState<string>(
    "Technology, Hospitality, Retail, Green Energy",
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const data = await councilsApi.listSchemes();
      setSchemes(data);
    } catch (err) {
      console.error("Failed to load schemes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Please enter a title for the subsidy fund scheme.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const postcodes = targetPostcodes
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const sectors = targetSectors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await councilsApi.createScheme({
        title: title.trim(),
        description: description.trim(),
        total_budget: totalBudget,
        subsidy_rate_per_hour: subsidyRate,
        max_hours_per_week_per_youth: maxHours,
        max_duration_months: maxMonths,
        target_postcodes: postcodes,
        target_sectors: sectors,
      });

      await refreshCouncil();
      showToast(`Scheme "${title}" successfully launched!`, "success");
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      loadSchemes();
    } catch (err: any) {
      showToast(err.message || "Failed to create scheme.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Council Fund Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Wage Subsidy Funding Schemes
          </h1>
          <p className="text-xs text-slate-400">
            Create and oversee designated ring-fenced budgets for youth wage
            co-funding across target wards and sectors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch New Fund Scheme</span>
        </button>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="py-20 flex justify-center bg-slate-950 min-h-[50vh]">
          <LoadingSpinner size="md" text="Loading subsidy schemes..." />
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 text-slate-400 font-mono">
          <Coins className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-white">
            No wage subsidy schemes created yet.
          </p>
          <p className="text-xs mt-1 text-slate-500">
            Click "Launch New Fund Scheme" above to create your council's first
            fund pool.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((scheme) => {
            const percentRemaining = Math.round(
              (scheme.remaining_budget / scheme.total_budget) * 100,
            );
            return (
              <div
                key={scheme.id}
                className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Active Funding Pool
                      </span>
                      <h3 className="text-lg font-black text-white mt-1">
                        {scheme.title}
                      </h3>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-xl font-black text-white">
                        £{scheme.total_budget.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        Total Cap
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {scheme.description}
                  </p>

                  {/* Key Parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Hourly Top-Up
                      </span>
                      <strong className="text-emerald-400">
                        £{scheme.subsidy_rate_per_hour.toFixed(2)} / hr
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Max Hours / Wk
                      </span>
                      <strong className="text-slate-200">
                        {scheme.max_hours_per_week_per_youth} hrs / week
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Placements
                      </span>
                      <strong className="text-sky-400">
                        {scheme.allocations_count || 0} committed
                      </strong>
                    </div>
                  </div>

                  {/* Target Postcodes & Sectors */}
                  <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        Target Postcodes:{" "}
                        <strong className="text-slate-300">
                          {(scheme.target_postcodes || []).join(", ") ||
                            "All County"}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        Sectors:{" "}
                        <strong className="text-slate-300">
                          {(scheme.target_sectors || []).join(", ") ||
                            "All Sectors"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Budget Progress Bar */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Remaining Available Budget:
                    </span>
                    <span className="font-black text-emerald-400">
                      £{scheme.remaining_budget.toLocaleString()} (
                      {percentRemaining}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                      style={{ width: `${percentRemaining}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Launch New Scheme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-lg w-full p-6 sm:p-8 relative animate-in fade-in-50 zoom-in-95 my-8 text-slate-100 font-mono">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Launch New Wage Subsidy Fund
                </h3>
                <p className="text-xs text-slate-400">
                  Ring-fence a dedicated budget for local small business wage
                  support.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Scheme Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Buckinghamshire Youth Living Wage Bridge 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Policy Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Dedicated hourly wage co-funding for micro businesses hiring young job-seekers from pupil-premium households..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Total Fund Budget (£)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="5000"
                    value={totalBudget}
                    onChange={(e) =>
                      setTotalBudget(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Hourly Subsidy Rate (£)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="1.00"
                    max="10.00"
                    value={subsidyRate}
                    onChange={(e) =>
                      setSubsidyRate(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Max Hours / Week / Youth
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="40"
                    value={maxHours}
                    onChange={(e) => setMaxHours(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Max Placement (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={maxMonths}
                    onChange={(e) =>
                      setMaxMonths(parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Target Postcode Sectors (comma-separated)
                </label>
                <input
                  type="text"
                  value={targetPostcodes}
                  onChange={(e) => setTargetPostcodes(e.target.value)}
                  placeholder="HP5, HP6, HP11, HP12"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Priority Industry Sectors
                </label>
                <input
                  type="text"
                  value={targetSectors}
                  onChange={(e) => setTargetSectors(e.target.value)}
                  placeholder="Technology, Hospitality, Retail, Green Energy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-950/40 disabled:opacity-50 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>
                    {submitting ? "Creating Scheme..." : "Launch Fund Scheme"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
