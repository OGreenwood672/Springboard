import React from "react";
import {
  BusinessSubsidyStatus,
  CompanySize,
  WageSubsidyAllocationStatus,
} from "@springboard/shared-types";

export const SubsidyStatusBadge: React.FC<{
  status: BusinessSubsidyStatus | string;
}> = ({ status }) => {
  const styles: Record<string, string> = {
    active_subsidised:
      "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold",
    approved: "bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold",
    pledged: "bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold",
    eligible: "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold",
    ineligible: "bg-slate-800 text-slate-400 border-slate-700 font-medium",
    not_applied: "bg-slate-800 text-slate-400 border-slate-700 font-medium",
  };

  const labels: Record<string, string> = {
    active_subsidised: "Active Subsidised",
    approved: "Subsidy Approved",
    pledged: "Pledge Offered",
    eligible: "Subsidy Eligible",
    ineligible: "Ineligible (Large)",
    not_applied: "Not Assessed",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border ${
        styles[status] || "bg-slate-800 text-slate-300 border-slate-700"
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

export const CompanySizeBadge: React.FC<{ size: CompanySize | string }> = ({
  size,
}) => {
  const styles: Record<string, string> = {
    micro: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    small: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    large: "bg-slate-800 text-slate-400 border-slate-700",
  };

  const labels: Record<string, string> = {
    micro: "Micro (<10)",
    small: "Small (10-49)",
    medium: "Medium (50-249)",
    large: "Large (250+)",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
        styles[size] || "bg-slate-800 text-slate-300 border-slate-700"
      }`}
    >
      {labels[size] || size}
    </span>
  );
};

export const AllocationStatusBadge: React.FC<{
  status: WageSubsidyAllocationStatus | string;
}> = ({ status }) => {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold",
    pledged: "bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold",
    approved: "bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold",
    completed: "bg-slate-800 text-slate-300 border-slate-700 font-bold",
    cancelled: "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border uppercase tracking-wider font-bold ${
        styles[status] || "bg-slate-800 text-slate-300 border-slate-700"
      }`}
    >
      {status}
    </span>
  );
};
