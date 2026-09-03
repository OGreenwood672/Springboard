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
    <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4 text-slate-100">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          Filter Vacancies
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Keyword */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.keyword || ''}
            onChange={(e) => handleChange('keyword', e.target.value)}
            placeholder="Role, skill, or keyword..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Location / Postcode */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="UK Postcode or City..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Opportunity Type */}
        <div>
          <select
            value={filters.opportunity_type || ''}
            onChange={(e) => handleChange('opportunity_type', e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
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
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none"
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
