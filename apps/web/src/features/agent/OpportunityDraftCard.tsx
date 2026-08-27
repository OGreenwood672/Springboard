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
    <div className="my-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {draft.title || "Untitled Vacancy"}
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Opportunity Vacancy Preview
            </span>
          </div>
        </div>

        {data.is_publish_ready ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            <span>Ready to Publish</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
            <AlertTriangle className="h-3 w-3" />
            <span>Draft</span>
          </span>
        )}
      </div>

      {/* Badges & Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {draft.opportunity_type && (
          <OpportunityTypeBadge type={draft.opportunity_type} size="sm" />
        )}
        {draft.pay_info && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800">
            <Banknote className="h-3 w-3 text-emerald-600" />
            {draft.pay_info}
          </span>
        )}
        {draft.hours_or_commitment && (
          <span className="inline-flex items-center gap-1 text-slate-600">
            <Clock className="h-3 w-3 text-slate-400" />
            {draft.hours_or_commitment}
          </span>
        )}
        {(draft.location_name || draft.postcode) && (
          <span className="inline-flex items-center gap-1 text-slate-600">
            <MapPin className="h-3 w-3 text-emerald-600" />
            {draft.location_name || draft.postcode}
          </span>
        )}
      </div>

      {/* Description */}
      {draft.description && (
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {draft.description}
        </p>
      )}

      {/* Missing Required Fields Notice */}
      {data.missing_required_fields &&
        data.missing_required_fields.length > 0 && (
          <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200">
            <span className="font-bold">Missing for publishing: </span>
            <span>{data.missing_required_fields.join(", ")}</span>
          </div>
        )}
    </div>
  );
};
