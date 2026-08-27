import React from 'react';
import { Link } from 'react-router-dom';
import { Opportunity } from '@springboard/shared-types';
import { OpportunityTypeBadge, WorkplaceBadge } from '../common/Badge';
import { Building2, MapPin, Clock, Banknote, ArrowRight } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onApplyClick?: (opportunity: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onApplyClick,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Top Badges & Type */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <OpportunityTypeBadge type={opportunity.opportunity_type} />
          <WorkplaceBadge type={opportunity.workplace_type} />
        </div>

        {/* Title & Organisation */}
        <div>
          <Link
            to={`/opportunities/${opportunity.id}`}
            className="block text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors"
          >
            {opportunity.title}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">{opportunity.business_name || 'Verified Organisation'}</span>
            {opportunity.organisation_type && (
              <>
                <span>•</span>
                <span>{opportunity.organisation_type}</span>
              </>
            )}
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Metadata Details (Location, Pay, Commitment) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{opportunity.location_name || opportunity.postcode || 'United Kingdom'}</span>
          </div>

          {opportunity.pay_info && (
            <div className="flex items-center gap-1.5 font-medium text-emerald-800">
              <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{opportunity.pay_info}</span>
            </div>
          )}

          {opportunity.hours_or_commitment && (
            <div className="flex items-center gap-1.5 sm:col-span-2 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{opportunity.hours_or_commitment}</span>
            </div>
          )}
        </div>

        {/* Skills Pills */}
        {opportunity.required_skills && opportunity.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {opportunity.required_skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {opportunity.required_skills.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px]">
                +{opportunity.required_skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
        >
          View Details
        </Link>

        {onApplyClick ? (
          <button
            type="button"
            onClick={() => onApplyClick(opportunity)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-all cursor-pointer"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            to={`/opportunities/${opportunity.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-all"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
