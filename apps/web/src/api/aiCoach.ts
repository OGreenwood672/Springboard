import { apiClient } from "./client";
import { AICoachExtractedProfile } from "@springboard/shared-types";

export interface AICoachResponse {
  extracted_profile: AICoachExtractedProfile;
  confidence_note: string;
}

export const aiCoachApi = {
  extractProfile: (message: string) =>
    apiClient<AICoachResponse>("/ai-coach/extract-profile", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};
