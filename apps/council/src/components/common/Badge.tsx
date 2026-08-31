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
      "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
    approved: "bg-teal-100 text-teal-800 border-teal-300",
    pledged: "bg-sky-100 text-sky-800 border-sky-300 font-semibold",
    eligible: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
    ineligible: "bg-slate-100 text-slate-600 border-slate-300",
    not_applied: "bg-slate-100 text-slate-600 border-slate-300",
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${
        styles[status] || "bg-slate-100 text-slate-700 border-slate-200"
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
    micro: "bg-purple-100 text-purple-800 border-purple-200",
    small: "bg-blue-100 text-blue-800 border-blue-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    large: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const labels: Record<string, string> = {
    micro: "Micro (<10)",
    small: "Small (10-49)",
    medium: "Medium (50-249)",
    large: "Large (250+)",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
        styles[size] || "bg-slate-100 text-slate-700"
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
    active: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
    pledged: "bg-sky-100 text-sky-800 border-sky-300 font-semibold",
    approved: "bg-teal-100 text-teal-800 border-teal-300",
    completed: "bg-slate-100 text-slate-800 border-slate-300",
    cancelled: "bg-rose-100 text-rose-800 border-rose-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border uppercase tracking-wider font-bold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
};
