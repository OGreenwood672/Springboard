import { apiClient } from './client';
import { Opportunity } from '@springboard/shared-types';

export interface OpportunityFilterOptions {
  opportunity_type?: string;
  location?: string;
  keyword?: string;
  workplace_type?: string;
  my_business_only?: boolean;
}

export const opportunitiesApi = {
  getOpportunities: (filters: OpportunityFilterOptions = {}) => {
    const params = new URLSearchParams();
    if (filters.opportunity_type) params.append('opportunity_type', filters.opportunity_type);
    if (filters.location) params.append('location', filters.location);
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.workplace_type) params.append('workplace_type', filters.workplace_type);
    if (filters.my_business_only) params.append('my_business_only', 'true');

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<Opportunity[]>(`/opportunities${queryString}`);
  },

  getOpportunity: (id: string) => apiClient<Opportunity>(`/opportunities/${id}`),

  createOpportunity: (data: Partial<Opportunity>) =>
    apiClient<Opportunity>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOpportunity: (id: string, data: Partial<Opportunity>) =>
    apiClient<Opportunity>(`/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  publishOpportunity: (id: string) =>
    apiClient<Opportunity>(`/opportunities/${id}/publish`, {
      method: 'POST',
    }),

  closeOpportunity: (id: string) =>
    apiClient<Opportunity>(`/opportunities/${id}/close`, {
      method: 'POST',
    }),
};
