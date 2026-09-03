import React from "react";
import { OpportunityDraftCardData } from "@springboard/shared-types";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Banknote,
  Clock,
} from "lucide-react";
import { OpportunityTypeBadge } from "../../components/common/Badge";

interface OpportunityDraftCardProps {
  data: OpportunityDraftCardData;
}

export const OpportunityDraftCard: React.FC<OpportunityDraftCardProps> = ({
  data,
}) => {
  const draft = data.draft;

  return (
    <div className="my-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl space-y-3.5 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">
              {draft.title || "Untitled Vacancy"}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Live Requisition Draft
            </span>
          </div>
        </div>

        {data.is_publish_ready ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-black text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="h-3 w-3" />
            <span>Ready to Publish</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-black text-amber-300 border border-amber-500/40">
            <AlertTriangle className="h-3 w-3" />
            <span>Incomplete Draft</span>
          </span>
        )}
      </div>

      {/* Badges & Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {draft.opportunity_type && (
          <OpportunityTypeBadge type={draft.opportunity_type} size="sm" />
        )}
        {draft.pay_info && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-950/60 px-2.5 py-1 font-mono font-bold text-emerald-300 border border-emerald-500/30">
            <Banknote className="h-3 w-3" />
            {draft.pay_info}
          </span>
        )}
        {draft.hours_or_commitment && (
          <span className="inline-flex items-center gap-1 text-slate-300">
            <Clock className="h-3 w-3 text-slate-500" />
            {draft.hours_or_commitment}
          </span>
        )}
        {(draft.location_name || draft.postcode) && (
          <span className="inline-flex items-center gap-1 text-slate-300">
            <MapPin className="h-3 w-3 text-emerald-400" />
            {draft.location_name || draft.postcode}
          </span>
        )}
      </div>

      {/* Description */}
      {draft.description && (
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
          {draft.description}
        </p>
      )}

      {/* Missing Required Fields Notice */}
      {data.missing_required_fields &&
        data.missing_required_fields.length > 0 && (
          <div className="rounded-xl bg-amber-950/40 p-3 text-xs text-amber-300 border border-amber-500/30">
            <span className="font-bold">Missing for publishing: </span>
            <span>{data.missing_required_fields.join(", ")}</span>
          </div>
        )}
    </div>
  );
};
