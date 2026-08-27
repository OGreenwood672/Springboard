import React from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { OpportunityFilterOptions } from '../../api/opportunities';

interface OpportunityFilterProps {
  filters: OpportunityFilterOptions;
  onChange: (filters: OpportunityFilterOptions) => void;
  onReset: () => void;
}

export const OpportunityFilter: React.FC<OpportunityFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const handleChange = (key: keyof OpportunityFilterOptions, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters =
    !!filters.opportunity_type || !!filters.workplace_type || !!filters.location || !!filters.keyword;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          Filter Opportunities
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Keyword */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.keyword || ''}
            onChange={(e) => handleChange('keyword', e.target.value)}
            placeholder="Role, skill, or keyword..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white uk-focus-ring"
          />
        </div>

        {/* Location / Postcode */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="UK Postcode or City..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white uk-focus-ring"
          />
        </div>

        {/* Opportunity Type */}
        <div>
          <select
            value={filters.opportunity_type || ''}
            onChange={(e) => handleChange('opportunity_type', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white uk-focus-ring"
          >
            <option value="">All Opportunity Types</option>
            <option value="part_time_job">Part-time Job</option>
            <option value="work_experience">Work Experience</option>
            <option value="volunteering">Volunteering</option>
          </select>
        </div>

        {/* Workplace Type */}
        <div>
          <select
            value={filters.workplace_type || ''}
            onChange={(e) => handleChange('workplace_type', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white uk-focus-ring"
          >
            <option value="">All Workplace Types</option>
            <option value="in_person">In-person</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>
    </div>
  );
};
