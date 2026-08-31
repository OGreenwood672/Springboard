import { apiClient } from "./client";
import { User } from "@springboard/shared-types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCouncilData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  registerCouncil: async (data: RegisterCouncilData): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...data, role: "council" }),
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient<User>("/auth/me");
  },
};
