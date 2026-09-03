import { apiClient } from "./client";
import {
  Council,
  WageSubsidyScheme,
  WageSubsidyAllocation,
  CouncilMapData,
  CouncilAnalytics,
  EligibleBusiness,
} from "@springboard/shared-types";

export interface CreateSchemePayload {
  title: string;
  description?: string;
  total_budget: number;
  subsidy_rate_per_hour: number;
  max_hours_per_week_per_youth: number;
  max_duration_months: number;
  target_postcodes?: string[];
  target_sectors?: string[];
}

export interface CreateAllocationPayload {
  scheme_id: string;
  business_id: string;
  opportunity_id?: string;
  youth_profile_id?: string;
  hourly_subsidy: number;
  max_hours_per_week: number;
  duration_weeks: number;
  notes?: string;
}

export interface EligibleBusinessFilters {
  sector?: string;
  company_size?: string;
  status?: string;
  min_catchment_score?: number;
  search?: string;
}

export const councilsApi = {
  getMyCouncil: async (): Promise<Council> => {
    return apiClient<Council>("/councils/me");
  },

  updateMyCouncil: async (data: Partial<Council>): Promise<Council> => {
    return apiClient<Council>("/councils/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  getMapData: async (): Promise<CouncilMapData> => {
    return apiClient<CouncilMapData>("/councils/map-data");
  },

  getEligibleBusinesses: async (
    filters: EligibleBusinessFilters = {},
  ): Promise<EligibleBusiness[]> => {
    const params = new URLSearchParams();
    if (filters.sector && filters.sector !== "all")
      params.append("sector", filters.sector);
    if (filters.company_size && filters.company_size !== "all")
      params.append("company_size", filters.company_size);
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.min_catchment_score !== undefined)
      params.append(
        "min_catchment_score",
        filters.min_catchment_score.toString(),
      );
    if (filters.search) params.append("search", filters.search);

    const qs = params.toString();
    return apiClient<EligibleBusiness[]>(
      `/councils/eligible-businesses${qs ? `?${qs}` : ""}`,
    );
  },

  getBusinessWageDetails: async (
    businessId: string,
  ): Promise<EligibleBusiness> => {
    return apiClient<EligibleBusiness>(`/councils/businesses/${businessId}`);
  },

  listSchemes: async (): Promise<WageSubsidyScheme[]> => {
    return apiClient<WageSubsidyScheme[]>("/councils/schemes");
  },

  createScheme: async (
    payload: CreateSchemePayload,
  ): Promise<WageSubsidyScheme> => {
    return apiClient<WageSubsidyScheme>("/councils/schemes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listAllocations: async (
    statusFilter?: string,
  ): Promise<WageSubsidyAllocation[]> => {
    const qs =
      statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
    return apiClient<WageSubsidyAllocation[]>(`/councils/allocations${qs}`);
  },

  createAllocation: async (
    payload: CreateAllocationPayload,
  ): Promise<WageSubsidyAllocation> => {
    return apiClient<WageSubsidyAllocation>("/councils/allocations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateAllocationStatus: async (
    allocationId: string,
    status: string,
    notes?: string,
  ): Promise<WageSubsidyAllocation> => {
    return apiClient<WageSubsidyAllocation>(
      `/councils/allocations/${allocationId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      },
    );
  },

  getAnalytics: async (): Promise<CouncilAnalytics> => {
    return apiClient<CouncilAnalytics>("/councils/analytics");
  },
};
