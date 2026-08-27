import { apiClient } from "./client";
import { Application, ApplicationStatus } from "@springboard/shared-types";

export interface ApplicationSubmitPayload {
  opportunity_id: string;
  cover_note?: string;
}

export const applicationsApi = {
  apply: (data: ApplicationSubmitPayload) =>
    apiClient<Application>("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyApplications: () => apiClient<Application[]>("/applications/me"),

  updateStatus: (id: string, status: ApplicationStatus) =>
    apiClient<Application>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
