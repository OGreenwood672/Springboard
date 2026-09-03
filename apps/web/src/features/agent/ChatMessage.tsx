import React from "react";
import {
  ConversationMessage,
  UICard,
  ConfirmationCardData,
  OpportunityRecommendationCardData,
  CandidateMatchCardData,
  ProfileSummaryCardData,
  OpportunityDraftCardData,
} from "@springboard/shared-types";
import { ConfirmationCard } from "./ConfirmationCard";
import { OpportunityRecommendationCard } from "./OpportunityRecommendationCard";
import { CandidateMatchCard } from "./CandidateMatchCard";
import { ProfileSummaryCard } from "./ProfileSummaryCard";
import { OpportunityDraftCard } from "./OpportunityDraftCard";
import { Bot, User as UserIcon } from "lucide-react";

interface ChatMessageProps {
  message: ConversationMessage;
  uiCards?: UICard[];
  onConfirmAction?: (pendingActionId: string) => Promise<void>;
  onCancelAction?: (pendingActionId: string) => Promise<void>;
  onApplyClick?: (oppId: string, title: string) => void;
  onExplainClick?: (oppId: string, youthId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  uiCards = [],
  onConfirmAction,
  onCancelAction,
  onApplyClick,
  onExplainClick,
}) => {
  const isUser = message.role === "user";

  // Simple markdown renderer for bold, lists, and line breaks
  const formatContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Bold replacement
      let parsed = line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>");
      // Bullet list items
      if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
        return (
          <p
            key={idx}
            className="my-1 flex items-start gap-1.5 leading-relaxed pl-1 text-slate-200"
            dangerouslySetInnerHTML={{ __html: parsed }}
          />
        );
      }
      return (
        <p
          key={idx}
          className={`${idx > 0 ? "mt-2" : ""} leading-relaxed`}
          dangerouslySetInnerHTML={{ __html: parsed }}
        />
      );
    });
  };

  return (
    <div
      className={`flex gap-3 py-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-md ${
          isUser
            ? "bg-slate-800 text-white border border-slate-700"
            : "bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-950/40"
        }`}
      >
        {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Body & Embedded Cards */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
        <div
          className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
            isUser
              ? "bg-slate-800 text-white rounded-tr-xs border border-slate-700 shadow-md"
              : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs shadow-lg"
          }`}
        >
          {formatContent(message.content)}
        </div>

        {/* Embedded UI Cards */}
        {uiCards.length > 0 && (
          <div className="space-y-2 pt-1">
            {uiCards.map((card) => {
              switch (card.card_type) {
                case "confirmation_card":
                case "confirmation":
                  return onConfirmAction && onCancelAction ? (
                    <ConfirmationCard
                      key={card.id}
                      data={card.data as ConfirmationCardData}
                      onConfirm={onConfirmAction}
                      onCancel={onCancelAction}
                    />
                  ) : null;

                case "opportunity_recommendation":
                  return (
                    <OpportunityRecommendationCard
                      key={card.id}
                      data={card.data as OpportunityRecommendationCardData}
                      onApplyClick={onApplyClick}
                    />
                  );

                case "candidate_match":
                  return (
                    <CandidateMatchCard
                      key={card.id}
                      data={card.data as CandidateMatchCardData}
                      onExplainClick={onExplainClick}
                    />
                  );

                case "profile_summary":
                  return (
                    <ProfileSummaryCard
                      key={card.id}
                      data={card.data as ProfileSummaryCardData}
                    />
                  );

                case "opportunity_draft":
                  return (
                    <OpportunityDraftCard
                      key={card.id}
                      data={card.data as OpportunityDraftCardData}
                    />
                  );

                default:
                  return null;
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};
