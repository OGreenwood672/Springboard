import { apiClient } from "./client";
import { KnowledgeGraph, YouthProfile } from "@springboard/shared-types";

export const profilesApi = {
  getMyProfile: () => apiClient<YouthProfile>("/profiles/me"),

  getMyKnowledgeGraph: () =>
    apiClient<KnowledgeGraph>("/profiles/me/knowledge-graph"),

  updateMyProfile: (data: Partial<YouthProfile>) =>
    apiClient<YouthProfile>("/profiles/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
