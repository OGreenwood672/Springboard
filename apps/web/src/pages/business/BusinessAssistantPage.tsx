import React from "react";
import { AgentChat } from "../../features/agent/AgentChat";

export const BusinessAssistantPage: React.FC = () => {
  const suggestedPrompts = [
    "We need two students to help at our café in Amersham on Saturday mornings, paying £11.50/hr.",
    "Show candidate matches for our weekend role",
    "List my organisation's active vacancies",
    "Explain candidate match factors for our listings",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <AgentChat
        mode="business"
        initialPrompts={suggestedPrompts}
        formFallbackLink={{
          label: "View Listings",
          to: "/business/opportunities",
        }}
      />
    </div>
  );
};
