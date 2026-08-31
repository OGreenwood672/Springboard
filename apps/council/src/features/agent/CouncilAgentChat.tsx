import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  Building2,
  TrendingUp,
  Coins,
  MapPin,
  HelpCircle,
} from "lucide-react";
import { apiClient } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { SubsidyOfferCard } from "./cards/SubsidyOfferCard";
import { SchemeDraftCard } from "./cards/SchemeDraftCard";
import { CompanyAssessmentCard } from "./cards/CompanyAssessmentCard";
import { BudgetForecastCard } from "./cards/BudgetForecastCard";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tool_name?: string;
  tool_payload?: any;
  created_at: string;
}

interface UICard {
  id: string;
  card_type:
    | "subsidy_offer"
    | "scheme_draft"
    | "company_assessment"
    | "budget_forecast"
    | "profile_summary"
    | "confirmation_card";
  data: any;
}

interface PendingAction {
  id: string;
  action_type: string;
  payload: any;
  status: string;
  expires_at: string;
}

interface CouncilAgentChatProps {
  onSelectBusiness?: (businessId: string) => void;
  prefillMessage?: string;
}

export const CouncilAgentChat: React.FC<CouncilAgentChatProps> = ({
  onSelectBusiness,
  prefillMessage,
}) => {
  const { showToast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [uiCards, setUiCards] = useState<UICard[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestions
  const SUGGESTIONS = [
    {
      label: "🚲 Assess Chesham Bike Works",
      prompt: "Assess Chesham Community Bike Works wage subsidy proposal",
    },
    {
      label: "📊 Model 10 Youth Cohort",
      prompt:
        "Model 10 youth placements at £4.50 per hour for 16 hrs a week for 24 weeks",
    },
    {
      label: "📍 Deprivation Catchments",
      prompt: "Show high deprivation wards and SME density in Buckinghamshire",
    },
    {
      label: "🏢 Find Eligible Tech SMEs",
      prompt: "Find eligible technology businesses needing wage subsidies",
    },
    {
      label: "💰 Draft £50k Scheme",
      prompt: "Draft a new £50,000 High Street Youth Wage Subsidy Scheme",
    },
  ];

  // Initialize or fetch active council conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        setInitialising(true);
        const res: any = await apiClient("/conversations", {
          method: "POST",
          body: JSON.stringify({ mode: "council" }),
        });
        setConversationId(res.id);
        setMessages(res.messages || []);
        if (res.pending_actions && res.pending_actions.length > 0) {
          setPendingAction(res.pending_actions[0]);
        }
      } catch (err: any) {
        showToast("Failed to connect to Council AI Orchestrator.", "error");
      } finally {
        setInitialising(false);
      }
    };

    initConversation();
  }, []);

  // Handle prefill message from external trigger (e.g. clicking "Ask AI" on map pin)
  useEffect(() => {
    if (prefillMessage && conversationId && !loading) {
      sendMessage(prefillMessage);
    }
  }, [prefillMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, uiCards, loading]);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !conversationId || loading) return;

    setInputText("");
    setLoading(true);

    // Optimistic user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res: any = await apiClient(
        `/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message: text.trim() }),
        },
      );

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: res.message,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (res.ui_cards && res.ui_cards.length > 0) {
        setUiCards((prev) => [...prev, ...res.ui_cards]);
      }
      if (res.pending_action) {
        setPendingAction(res.pending_action);
      }
    } catch (err: any) {
      showToast(err.message || "Error sending message.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (actionId: string) => {
    if (!conversationId) return;
    try {
      const res: any = await apiClient(
        `/conversations/${conversationId}/confirm-action/${actionId}`,
        {
          method: "POST",
        },
      );
      showToast(res.message || "Grant pledge confirmed!", "success");
      setPendingAction(null);

      // Append assistant confirmation message
      const confirmMsg: Message = {
        id: `confirm-${Date.now()}`,
        role: "assistant",
        content: `✅ ${res.message || "Action confirmed successfully."}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err: any) {
      showToast(err.message || "Confirmation failed.", "error");
    }
  };

  const handleCancelAction = async (actionId: string) => {
    if (!conversationId) return;
    try {
      const res: any = await apiClient(
        `/conversations/${conversationId}/cancel-action/${actionId}`,
        {
          method: "POST",
        },
      );
      showToast(res.message || "Action cancelled.", "info");
      setPendingAction(null);

      const cancelMsg: Message = {
        id: `cancel-${Date.now()}`,
        role: "assistant",
        content: "❌ Proposal cancelled. How else can I assist you?",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, cancelMsg]);
    } catch (err: any) {
      showToast(err.message || "Cancellation failed.", "error");
    }
  };

  const handlePledgeFromCard = (
    businessId: string,
    businessName: string,
    rate: number,
  ) => {
    sendMessage(
      `Pledge wage subsidy of £${rate.toFixed(2)}/hr to ${businessName} for 16 hours a week`,
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Agent Chat Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold shadow-md ring-2 ring-emerald-400/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">
                Council AI Director
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Live Orchestrator
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Spatial Wage Gap Analysis, Grant Drafting & Cohort ROI Modeler
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessages([]);
            setUiCards([]);
            sendMessage("Hello! What is my council fund status?");
          }}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
          title="Reset conversation feed"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" /> Prompts:
        </span>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(s.prompt)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 hover:text-emerald-900 transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {initialising ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">
              Connecting to Council Policy Orchestrator...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 my-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="font-extrabold text-sm text-slate-800">
                Welcome to your AI Policy & Wage Subsidy Agent
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                I can evaluate local micro/small business wage gaps, model
                multi-youth cohort budgets, and draft grant pledges to co-fund
                living wages.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role !== "user" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-none shadow-md font-medium"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Render Generated UI Cards */}
        {uiCards.map((card) => (
          <div key={card.id} className="pt-1">
            {card.card_type === "subsidy_offer" && (
              <SubsidyOfferCard
                data={card.data}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelAction}
                onSelectBusiness={onSelectBusiness}
              />
            )}
            {card.card_type === "scheme_draft" && (
              <SchemeDraftCard
                data={card.data}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelAction}
              />
            )}
            {card.card_type === "company_assessment" && (
              <CompanyAssessmentCard
                data={card.data}
                onPledgeClick={handlePledgeFromCard}
                onLocateMap={onSelectBusiness}
              />
            )}
            {card.card_type === "budget_forecast" && (
              <BudgetForecastCard data={card.data} />
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 max-w-[200px]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold">AI Director is calculating...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="p-3.5 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Policy Director (e.g. 'Pledge £4.50/hr to Chesham Bikes' or 'Model 10 youth')..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-900/20 disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
