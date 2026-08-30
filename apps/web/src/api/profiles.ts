import { apiClient } from "./client";
import {
  KnowledgeFrontierExpansion,
  KnowledgeGraph,
  YouthProfile,
} from "@springboard/shared-types";

export const profilesApi = {
  getMyProfile: () => apiClient<YouthProfile>("/profiles/me"),

  getMyKnowledgeGraph: () =>
    apiClient<KnowledgeGraph>("/profiles/me/knowledge-graph"),

  expandKnowledgeFrontier: (node: Pick<KnowledgeGraph["nodes"][number], "id" | "label" | "kind">) =>
    apiClient<KnowledgeFrontierExpansion>("/profiles/me/knowledge-graph/expand", {
      method: "POST",
      body: JSON.stringify({
        node_id: node.id,
        label: node.label,
        kind: node.kind,
      }),
    }),

  updateMyProfile: (data: Partial<YouthProfile>) =>
    apiClient<YouthProfile>("/profiles/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
