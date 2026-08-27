import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Opportunity } from '@springboard/shared-types';
import { opportunitiesApi } from '../../api/opportunities';
import { useToast } from '../../context/ToastContext';
import { OpportunityForm } from '../../components/business/OpportunityForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const EditOpportunityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      opportunitiesApi
        .getOpportunity(id)
        .then((data) => setOpportunity(data))
        .catch(() => setOpportunity(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleUpdate = async (data: Partial<Opportunity>) => {
    if (!id) return;
    try {
      await opportunitiesApi.updateOpportunity(id, data);
      showToast('Opportunity updated successfully!', 'success');
      navigate('/business/opportunities');
    } catch (err: any) {
      showToast(err.message || 'Failed to update opportunity', 'error');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Loading opportunity..." />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Listing not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
            Edit Listing
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {opportunity.title}
          </h1>
        </div>

        <OpportunityForm
          initialData={opportunity}
          onSubmit={handleUpdate}
          isEditing={true}
        />
      </div>
    </div>
  );
};
