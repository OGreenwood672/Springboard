import { apiClient } from "./client";
import {
  Conversation,
  AgentChatResponse,
  ActionConfirmationResult,
  ConversationMode,
} from "@springboard/shared-types";

export const conversationsApi = {
  startConversation: async (
    mode: ConversationMode,
    title?: string,
  ): Promise<Conversation> => {
    return apiClient<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify({ mode, title }),
    });
  },

  listConversations: async (
    mode?: ConversationMode,
  ): Promise<Conversation[]> => {
    const query = mode ? `?mode=${mode}` : "";
    return apiClient<Conversation[]>(`/conversations${query}`);
  },

  getConversation: async (conversationId: string): Promise<Conversation> => {
    return apiClient<Conversation>(`/conversations/${conversationId}`);
  },

  sendMessage: async (
    conversationId: string,
    message: string,
  ): Promise<AgentChatResponse> => {
    return apiClient<AgentChatResponse>(
      `/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      },
    );
  },

  confirmAction: async (
    conversationId: string,
    pendingActionId: string,
  ): Promise<ActionConfirmationResult> => {
    return apiClient<ActionConfirmationResult>(
      `/conversations/${conversationId}/confirm-action/${pendingActionId}`,
      {
        method: "POST",
      },
    );
  },

  cancelAction: async (
    conversationId: string,
    pendingActionId: string,
  ): Promise<ActionConfirmationResult> => {
    return apiClient<ActionConfirmationResult>(
      `/conversations/${conversationId}/cancel-action/${pendingActionId}`,
      {
        method: "POST",
      },
    );
  },
};
