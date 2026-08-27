import { apiClient } from "./client";
import { Match } from "@springboard/shared-types";

export interface GenerateMatchesResponse {
  message: string;
  generated_count: number;
  matches: Match[];
}

export const matchesApi = {
  generateMatches: (youthProfileId: string) =>
    apiClient<GenerateMatchesResponse>(`/matches/generate/${youthProfileId}`, {
      method: "POST",
    }),

  getMyMatches: () => apiClient<Match[]>("/matches/me"),
};
