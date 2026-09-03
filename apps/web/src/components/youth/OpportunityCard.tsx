import React from 'react';
import { Link } from 'react-router-dom';
import { Opportunity } from '@springboard/shared-types';
import { OpportunityTypeBadge, WorkplaceBadge } from '../common/Badge';
import { Building2, MapPin, Clock, Banknote, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onApplyClick?: (opportunity: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onApplyClick,
}) => {
  return (
    <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl hover:border-slate-700 hover:shadow-2xl transition-all flex flex-col justify-between group text-slate-100">
      <div className="space-y-4">
        {/* Top Badges & Type */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <OpportunityTypeBadge type={opportunity.opportunity_type} />
            <WorkplaceBadge type={opportunity.workplace_type} />
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" /> Real Living Wage
          </span>
        </div>

        {/* Title & Organisation */}
        <div>
          <Link
            to={`/opportunities/${opportunity.id}`}
            className="block text-lg font-black text-white group-hover:text-emerald-400 transition-colors"
          >
            {opportunity.title}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-300">{opportunity.business_name || 'Verified Local Employer'}</span>
            {opportunity.organisation_type && (
              <>
                <span>•</span>
                <span>{opportunity.organisation_type}</span>
              </>
            )}
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Metadata Details (Location, Pay, Commitment) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{opportunity.location_name || opportunity.postcode || 'United Kingdom'}</span>
          </div>

          {opportunity.pay_info && (
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Banknote className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{opportunity.pay_info}</span>
            </div>
          )}

          {opportunity.hours_or_commitment && (
            <div className="flex items-center gap-1.5 sm:col-span-2 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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
                className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 text-[10px] font-mono font-bold border border-slate-800"
              >
                {skill}
              </span>
            ))}
            {opportunity.required_skills.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-lg bg-slate-950 text-slate-500 text-[10px] font-mono border border-slate-800">
                +{opportunity.required_skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          View Details
        </Link>

        {onApplyClick ? (
          <button
            type="button"
            onClick={() => onApplyClick(opportunity)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            to={`/opportunities/${opportunity.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-950/40 transition-all"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
