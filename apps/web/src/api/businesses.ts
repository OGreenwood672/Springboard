import { apiClient } from './client';
import { Business, Application, Match } from '@springboard/shared-types';

export const businessesApi = {
  getMyBusiness: () => apiClient<Business>('/businesses/me'),

  updateMyBusiness: (data: Partial<Business>) =>
    apiClient<Business>('/businesses/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getOpportunityApplications: (opportunityId: string) =>
    apiClient<Application[]>(`/businesses/me/opportunities/${opportunityId}/applications`),

  getOpportunityMatches: (opportunityId: string) =>
    apiClient<Match[]>(`/businesses/me/opportunities/${opportunityId}/matches`),
};
