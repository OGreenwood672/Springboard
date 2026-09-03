import React, { useState, useEffect } from "react";
import {
  WageSubsidyScheme,
  CouncilMapMarker,
  EligibleBusiness,
} from "@springboard/shared-types";
import { councilsApi } from "../../../api/councils";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import {
  X,
  Coins,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Zap,
} from "lucide-react";

interface OfferSubsidyModalProps {
  business: CouncilMapMarker | EligibleBusiness | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const OfferSubsidyModal: React.FC<OfferSubsidyModalProps> = ({
  business,
  onClose,
  onSuccess,
}) => {
  const { council, refreshCouncil } = useAuth();
  const { showToast } = useToast();

  const [schemes, setSchemes] = useState<WageSubsidyScheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("");
  const [hourlySubsidy, setHourlySubsidy] = useState<number>(4.5);
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState<number>(16);
  const [durationWeeks, setDurationWeeks] = useState<number>(24);
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loadingSchemes, setLoadingSchemes] = useState<boolean>(true);

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        const list = await councilsApi.listSchemes();
        const active = list.filter(
          (s) => s.is_active && s.remaining_budget > 0,
        );
        setSchemes(active);
        if (active.length > 0) {
          setSelectedSchemeId(active[0].id);
          setHourlySubsidy(active[0].subsidy_rate_per_hour || 4.5);
          setMaxHoursPerWeek(active[0].max_hours_per_week_per_youth || 16);
        }
      } catch (err: any) {
        showToast(err.message || "Failed to load subsidy schemes", "error");
      } finally {
        setLoadingSchemes(false);
      }
    };

    loadSchemes();
  }, [showToast]);

  if (!business) return null;

  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId);
  const totalAmount =
    Math.round(hourlySubsidy * maxHoursPerWeek * durationWeeks * 100) / 100;
  const companyWage = business.current_wage_offered || 7.0;
  const totalWageForYouth =
    Math.round((companyWage + hourlySubsidy) * 100) / 100;
  const livingWageTarget = business.target_wage || 11.44;
  const meetsLivingWage = totalWageForYouth >= livingWageTarget;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeId) {
      showToast("Please select an active subsidy scheme fund.", "error");
      return;
    }

    if (selectedScheme && totalAmount > selectedScheme.remaining_budget) {
      showToast(
        `Allocation exceeds scheme remaining budget (£${selectedScheme.remaining_budget.toFixed(2)} available).`,
        "error",
      );
      return;
    }

    setSubmitting(true);
    try {
      await councilsApi.createAllocation({
        scheme_id: selectedSchemeId,
        business_id: business.id || (business as any).business_id,
        hourly_subsidy: hourlySubsidy,
        max_hours_per_week: maxHoursPerWeek,
        duration_weeks: durationWeeks,
        notes: notes.trim() || undefined,
      });

      await refreshCouncil();
      showToast(
        `Wage subsidy pledge of £${totalAmount.toLocaleString()} committed to ${business.name}!`,
        "success",
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to create subsidy allocation.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 max-w-xl w-full p-6 sm:p-8 relative animate-in fade-in-50 zoom-in-95 my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />
                Council Subsidy Grant
              </span>
              <span className="text-xs text-slate-400 font-mono">
                SME Wage Support
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">
              Offer Wage Subsidy to {business.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bridge the wage affordability gap so this company can hire young
              people from low-income families at the Real Living Wage.
            </p>
          </div>
        </div>

        {/* Company Wage Gap Context Banner */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 mb-6 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Company Affordability:</span>
            <span className="font-bold text-white">
              £{companyWage.toFixed(2)} / hr
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">UK Real Living Wage Target:</span>
            <span className="font-bold text-white">
              £{livingWageTarget.toFixed(2)} / hr
            </span>
          </div>
          <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">
              Hourly Wage Gap (To Bridge):
            </span>
            <span className="text-sm font-black text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
              £{(business.hourly_wage_gap || 4.44).toFixed(2)} / hr
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Scheme Selection */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Funding Scheme:
            </label>
            {loadingSchemes ? (
              <div className="text-xs text-slate-500 font-mono py-2">
                Loading active schemes...
              </div>
            ) : schemes.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-mono">
                No active subsidy schemes available with remaining budget.
                Please create a scheme first under Subsidy Schemes.
              </div>
            ) : (
              <select
                value={selectedSchemeId}
                onChange={(e) => {
                  setSelectedSchemeId(e.target.value);
                  const s = schemes.find((sc) => sc.id === e.target.value);
                  if (s) {
                    setHourlySubsidy(s.subsidy_rate_per_hour);
                    setMaxHoursPerWeek(s.max_hours_per_week_per_youth);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                required
              >
                {schemes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} (Remaining: £{s.remaining_budget.toLocaleString()}
                    )
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Hourly Top-up & Hours per week */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Council Hourly Top-up (£)
              </label>
              <input
                type="number"
                step="0.10"
                min="1.00"
                max="10.00"
                value={hourlySubsidy}
                onChange={(e) =>
                  setHourlySubsidy(parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Max Hours / Week
              </label>
              <input
                type="number"
                min="4"
                max="40"
                value={maxHoursPerWeek}
                onChange={(e) =>
                  setMaxHoursPerWeek(parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Duration (Weeks)
              </label>
              <input
                type="number"
                min="4"
                max="52"
                value={durationWeeks}
                onChange={(e) =>
                  setDurationWeeks(parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="bg-slate-950 text-white rounded-2xl p-4 space-y-2.5 border border-emerald-500/30 shadow-xl font-mono">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Hourly wage received by youth:</span>
              <span className="font-bold text-white text-sm">
                £{totalWageForYouth.toFixed(2)} / hr{" "}
                {meetsLivingWage && "✨ (Living Wage)"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total hours subsidised:</span>
              <span className="font-semibold text-emerald-400">
                {maxHoursPerWeek * durationWeeks} hours
              </span>
            </div>
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Total Council Grant Pledge:
              </span>
              <span className="text-base font-black text-emerald-400">
                £{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Officer Notes */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Officer Grant Notes (Optional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Targeted at youth from pupil-premium households in Chesham Waterside..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Low-Income Requirement Notice */}
          <div className="flex items-start gap-2.5 text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">Statutory Compliance</strong>: This
              wage subsidy is earmarked for recruiting verified young people
              (14–24) from low-income families, pupil-premium catchments, or
              free-school-meals backgrounds.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || schemes.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>
                {submitting
                  ? "Approving Pledge..."
                  : "Confirm & Commit Wage Subsidy"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
