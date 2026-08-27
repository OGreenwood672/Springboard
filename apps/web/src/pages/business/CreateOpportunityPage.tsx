import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Opportunity } from '@springboard/shared-types';
import { opportunitiesApi } from '../../api/opportunities';
import { useToast } from '../../context/ToastContext';
import { OpportunityForm } from '../../components/business/OpportunityForm';

export const CreateOpportunityPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCreate = async (data: Partial<Opportunity>) => {
    try {
      const created = await opportunitiesApi.createOpportunity(data);
      showToast(`Listing '${created.title}' created successfully!`, 'success');
      navigate('/business/opportunities');
    } catch (err: any) {
      showToast(err.message || 'Failed to create opportunity', 'error');
      throw err;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
            Employer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Post an Opportunity
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a part-time job, work experience placement, or volunteering opening for young people.
          </p>
        </div>

        <OpportunityForm onSubmit={handleCreate} />
      </div>
    </div>
  );
};
