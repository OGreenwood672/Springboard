import React, { useState, useEffect } from "react";
import { councilsApi } from "../api/councils";
import { WageSubsidyAllocation } from "@springboard/shared-types";
import { AllocationStatusBadge } from "../components/common/Badge";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import {
  FileSpreadsheet,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Building2,
  Calendar,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-300">
              Council Grants Ledger
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Wage Subsidy Pledges & Allocations Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Track individual hourly wage top-up contracts, active payment
            disbursements, and audit status.
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs text-xs font-semibold text-slate-600">
          Total Committed:{" "}
          <strong className="text-emerald-700">
            £{totalCommitted.toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner size="md" text="Loading wage subsidy ledger..." />
        </div>
      ) : allocations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">
            No wage subsidy pledges found.
          </p>
          <p className="text-xs mt-1">
            Use the Map or Eligible Businesses tab to offer subsidies to local
            employers.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="px-6 py-4">Business & Grant Scheme</th>
                  <th className="px-4 py-4">Subsidy Terms</th>
                  <th className="px-4 py-4">Total Amount</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Notes / Target</th>
                  <th className="px-6 py-4 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {allocations.map((alloc) => (
                  <tr
                    key={alloc.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Business & Scheme */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-sm block">
                        {alloc.business_name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {alloc.scheme_title}
                      </span>
                    </td>

                    {/* Terms */}
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <strong className="text-emerald-700">
                          £{alloc.hourly_subsidy.toFixed(2)} / hr top-up
                        </strong>
                        <p className="text-[11px] text-slate-500">
                          {alloc.max_hours_per_week} hrs/wk •{" "}
                          {alloc.duration_weeks} wks
                        </p>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-extrabold text-slate-900">
                        £{alloc.allocated_amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <AllocationStatusBadge status={alloc.status} />
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-4 max-w-xs text-[11px] text-slate-500">
                      {alloc.notes || "Youth low-income wage top-up"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-2">
                      {alloc.status === "pledged" && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(alloc.id, "active")}
                          disabled={updatingId === alloc.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs"
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
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] shadow-2xs"
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
                            className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-[11px]"
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
