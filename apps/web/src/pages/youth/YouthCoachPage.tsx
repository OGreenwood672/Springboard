import React from "react";
import { AgentChat } from "../../features/agent/AgentChat";

export const YouthCoachPage: React.FC = () => {
  const suggestedPrompts = [
    "I'm 17 in sixth form in Chesham (HP5). I know Python, Customer Service, and can work weekends.",
    "Show paid part-time roles near me",
    "Show my personalized opportunity matches",
    "What is currently on my profile?",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <AgentChat
        mode="youth"
        initialPrompts={suggestedPrompts}
        formFallbackLink={{
          label: "Manual Profile Form",
          to: "/profile",
        }}
      />
    </div>
  );
};
