import React, { useState, useEffect } from "react";
import { councilsApi } from "../../api/councils";
import { WageSubsidyAllocation } from "@springboard/shared-types";
import { AllocationStatusBadge } from "../../components/council/Badge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import {
  FileSpreadsheet,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Building2,
  Calendar,
  Zap,
} from "lucide-react";

export const AllocationsPage: React.FC = () => {
  const { refreshCouncil } = useAuth();
  const { showToast } = useToast();
  const [allocations, setAllocations] = useState<WageSubsidyAllocation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAllocations = async () => {
    setLoading(true);
    try {
      const data = await councilsApi.listAllocations(statusFilter);
      setAllocations(data);
    } catch (err) {
      console.error("Failed to load allocations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllocations();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await councilsApi.updateAllocationStatus(id, newStatus);
      await refreshCouncil();
      showToast(`Allocation status updated to ${newStatus}.`, "success");
      loadAllocations();
    } catch (err: any) {
      showToast(err.message || "Failed to update allocation status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalCommitted = allocations.reduce(
    (sum, a) => sum + (a.status !== "cancelled" ? a.allocated_amount : 0),
    0,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Council Grants Ledger
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Wage Subsidy Pledges & Allocations Ledger
          </h1>
          <p className="text-xs text-slate-400">
            Track individual hourly wage top-up contracts, active payment
            disbursements, and audit status.
          </p>
        </div>

        <div className="bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 shadow-xl text-xs font-mono text-slate-300">
          Total Committed:{" "}
          <strong className="text-emerald-400 font-black">
            £{totalCommitted.toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Filter By Status:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            "all",
            "active",
            "pledged",
            "approved",
            "completed",
            "cancelled",
          ].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="py-20 flex justify-center bg-slate-950 min-h-[50vh]">
          <LoadingSpinner size="md" text="Loading wage subsidy ledger..." />
        </div>
      ) : allocations.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 text-slate-400 font-mono">
          <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-white">No wage subsidy pledges found.</p>
          <p className="text-xs mt-1 text-slate-500 font-mono">
            Use the Map or Eligible Businesses tab to offer subsidies to local
            employers.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Business & Grant Scheme</th>
                  <th className="px-4 py-4">Subsidy Terms</th>
                  <th className="px-4 py-4">Total Amount</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Notes / Target</th>
                  <th className="px-6 py-4 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                {allocations.map((alloc) => (
                  <tr
                    key={alloc.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Business & Scheme */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-white text-sm block font-sans">
                        {alloc.business_name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        {alloc.scheme_title}
                      </span>
                    </td>

                    {/* Terms */}
                    <td className="px-4 py-4">
                      <div className="space-y-0.5 font-mono">
                        <strong className="text-emerald-400">
                          £{alloc.hourly_subsidy.toFixed(2)} / hr top-up
                        </strong>
                        <p className="text-[11px] text-slate-400">
                          {alloc.max_hours_per_week} hrs/wk •{" "}
                          {alloc.duration_weeks} wks
                        </p>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-black text-white font-mono">
                        £{alloc.allocated_amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <AllocationStatusBadge status={alloc.status} />
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-4 max-w-xs text-[11px] text-slate-400">
                      {alloc.notes || "Youth low-income wage top-up"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-2">
                      {alloc.status === "pledged" && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(alloc.id, "active")}
                          disabled={updatingId === alloc.id}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                        >
                          Activate Grant
                        </button>
                      )}
                      {alloc.status === "active" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(alloc.id, "completed")
                          }
                          disabled={updatingId === alloc.id}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      )}
                      {alloc.status !== "cancelled" &&
                        alloc.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(alloc.id, "cancelled")
                            }
                            disabled={updatingId === alloc.id}
                            className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 font-bold text-xs cursor-pointer"
                          >
                            Cancel / Refund
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
