import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AgentChat } from "../features/agent/AgentChat";
import { conversationsApi } from "../api/conversations";
import { Conversation, AgentChatResponse } from "@springboard/shared-types";

vi.mock("../api/conversations", () => ({
  conversationsApi: {
    listConversations: vi.fn(),
    startConversation: vi.fn(),
    getConversation: vi.fn(),
    sendMessage: vi.fn(),
    confirmAction: vi.fn(),
    cancelAction: vi.fn(),
  },
}));

const mockConversation: Conversation = {
  id: "conv-123",
  user_id: "user-123",
  mode: "youth",
  title: "Job Coach Session",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  messages: [
    {
      id: "m1",
      conversation_id: "conv-123",
      role: "assistant",
      content:
        "Hello! I am your Springboard Job Coach. How can I help you today?",
      created_at: new Date().toISOString(),
    },
  ],
};

describe("AgentChat Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders existing conversation and message history", async () => {
    vi.mocked(conversationsApi.listConversations).mockResolvedValue([
      mockConversation,
    ]);
    vi.mocked(conversationsApi.getConversation).mockResolvedValue(
      mockConversation,
    );

    render(
      <BrowserRouter>
        <AgentChat
          mode="youth"
          formFallbackLink={{ label: "Manual Form", to: "/profile" }}
        />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Hello! I am your Springboard Job Coach. How can I help you today?",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("UK Youth Career Coach")).toBeInTheDocument();
    });
  });

  it("sends user message and displays assistant response with confirmation card", async () => {
    vi.mocked(conversationsApi.listConversations).mockResolvedValue([
      mockConversation,
    ]);
    vi.mocked(conversationsApi.getConversation).mockResolvedValue(
      mockConversation,
    );

    const mockResponse: AgentChatResponse = {
      conversation_id: "conv-123",
      message: "I've proposed updating your profile details.",
      ui_cards: [
        {
          id: "card-1",
          card_type: "confirmation_card",
          data: {
            pending_action_id: "action-999",
            action_type: "update_youth_profile",
            title: "Review Profile Updates",
            description: "Confirm updating your skills to Python.",
            diff_summary: { Skills: "Python" },
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            status: "pending",
          },
        },
      ],
    };

    vi.mocked(conversationsApi.sendMessage).mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <AgentChat
          mode="youth"
          formFallbackLink={{ label: "Manual Form", to: "/profile" }}
        />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Type your message or ask for advice/i),
      ).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(
      /Type your message or ask for advice/i,
    );
    fireEvent.change(textarea, {
      target: { value: "I know Python and live in Chesham" },
    });

    const sendBtn = textarea.closest("div")?.querySelector("button");
    if (sendBtn) fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(conversationsApi.sendMessage).toHaveBeenCalledWith(
        "conv-123",
        "I know Python and live in Chesham",
      );
      expect(
        screen.getByText("I've proposed updating your profile details."),
      ).toBeInTheDocument();
      expect(screen.getByText("Review Profile Updates")).toBeInTheDocument();
      expect(screen.getByText("Confirm & Apply")).toBeInTheDocument();
    });
  });

  it("confirms pending action when user clicks Confirm button", async () => {
    vi.mocked(conversationsApi.listConversations).mockResolvedValue([
      mockConversation,
    ]);
    vi.mocked(conversationsApi.getConversation).mockResolvedValue(
      mockConversation,
    );

    const mockResponse: AgentChatResponse = {
      conversation_id: "conv-123",
      message: "I've proposed updating your profile details.",
      ui_cards: [
        {
          id: "card-1",
          card_type: "confirmation_card",
          data: {
            pending_action_id: "action-999",
            action_type: "update_youth_profile",
            title: "Review Profile Updates",
            description: "Confirm updating your skills to Python.",
            diff_summary: { Skills: "Python" },
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            status: "pending",
          },
        },
      ],
    };

    vi.mocked(conversationsApi.sendMessage).mockResolvedValue(mockResponse);
    vi.mocked(conversationsApi.confirmAction).mockResolvedValue({
      pending_action_id: "action-999",
      status: "confirmed",
      message: "Your profile has been updated successfully!",
    });

    render(
      <BrowserRouter>
        <AgentChat
          mode="youth"
          formFallbackLink={{ label: "Manual Form", to: "/profile" }}
        />
      </BrowserRouter>,
    );

    const textarea = await screen.findByPlaceholderText(
      /Type your message or ask for advice/i,
    );
    fireEvent.change(textarea, { target: { value: "Update my profile" } });
    const sendBtn = textarea.closest("div")?.querySelector("button");
    if (sendBtn) fireEvent.click(sendBtn);

    const confirmBtn = await screen.findByText("Confirm & Apply");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(conversationsApi.confirmAction).toHaveBeenCalledWith(
        "conv-123",
        "action-999",
      );
      expect(
        screen.getByText("✅ Your profile has been updated successfully!"),
      ).toBeInTheDocument();
    });
  });
});
