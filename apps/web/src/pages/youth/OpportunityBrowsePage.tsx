import React, { useState, useEffect, useCallback } from 'react';
import { Opportunity } from '@springboard/shared-types';
import { opportunitiesApi, OpportunityFilterOptions } from '../../api/opportunities';
import { OpportunityCard } from '../../components/youth/OpportunityCard';
import { OpportunityFilter } from '../../components/youth/OpportunityFilter';
import { ApplicationModal } from '../../components/youth/ApplicationModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Sparkles, Frown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OpportunityBrowsePage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OpportunityFilterOptions>({});
  const [selectedOppForApply, setSelectedOppForApply] = useState<Opportunity | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await opportunitiesApi.getOpportunities(filters);
      setOpportunities(data);
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
            <Briefcase className="w-3.5 h-3.5" />
            <span>UK Opportunity Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Explore Opportunities Near You
          </h1>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Find vetted weekend jobs, corporate work experience, and community volunteering across the UK.
          </p>
        </div>

        {isAuthenticated && role === 'youth' && (
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white text-emerald-900 hover:bg-emerald-50 shadow-md transition-all shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>View My Matched Roles</span>
          </Link>
        )}
      </div>

      {/* Filter Component */}
      <OpportunityFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs sm:text-sm font-semibold text-slate-600">
          Showing <span className="text-slate-900 font-bold">{opportunities.length}</span> published opportunit{opportunities.length === 1 ? 'y' : 'ies'}
        </p>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Searching available UK opportunities..." />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4 max-w-md mx-auto my-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Frown className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No opportunities found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We couldn't find any opportunities matching your current search criteria. Try adjusting your keyword or clearing filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onApplyClick={
                isAuthenticated && role === 'youth'
                  ? (o) => setSelectedOppForApply(o)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <ApplicationModal
        opportunity={selectedOppForApply}
        isOpen={!!selectedOppForApply}
        onClose={() => setSelectedOppForApply(null)}
        onSuccess={() => {
          fetchOpportunities();
        }}
      />
    </div>
  );
};
