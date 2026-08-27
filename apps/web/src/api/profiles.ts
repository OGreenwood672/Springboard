import { apiClient } from "./client";
import { YouthProfile } from "@springboard/shared-types";

export const profilesApi = {
  getMyProfile: () => apiClient<YouthProfile>("/profiles/me"),

  updateMyProfile: (data: Partial<YouthProfile>) =>
    apiClient<YouthProfile>("/profiles/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
