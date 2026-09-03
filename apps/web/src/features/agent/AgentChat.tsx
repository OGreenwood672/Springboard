import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Conversation,
  ConversationMessage,
  ConversationMode,
  UICard,
} from "@springboard/shared-types";
import { conversationsApi } from "../../api/conversations";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import {
  Bot,
  Plus,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Zap,
} from "lucide-react";

interface AgentChatProps {
  mode: ConversationMode;
  initialPrompts?: string[];
  formFallbackLink: {
    label: string;
    to: string;
  };
}

export const AgentChat: React.FC<AgentChatProps> = ({
  mode,
  initialPrompts = [],
  formFallbackLink,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [latestCards, setLatestCards] = useState<UICard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const feedContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTop =
        feedContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, latestCards]);

  // Load conversations on mount
  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      try {
        const convList = await conversationsApi.listConversations(mode);
        setConversations(convList);

        if (convList.length > 0) {
          const current = await conversationsApi.getConversation(
            convList[0].id,
          );
          setActiveConversation(current);
          setMessages(current.messages || []);
        } else {
          // Start initial conversation
          const newConv = await conversationsApi.startConversation(
            mode,
            mode === "youth" ? "Job Coach Session" : "Recruitment Session",
          );
          setActiveConversation(newConv);
          setConversations([newConv]);
          setMessages(newConv.messages || []);
        }
      } catch (err) {
        console.error("Failed to initialize conversation:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [mode]);

  const handleSelectConversation = async (convId: string) => {
    try {
      setLoading(true);
      const conv = await conversationsApi.getConversation(convId);
      setActiveConversation(conv);
      setMessages(conv.messages || []);
      setLatestCards([]);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewChat = async () => {
    try {
      const newConv = await conversationsApi.startConversation(
        mode,
        mode === "youth" ? "New Coaching Session" : "New Requisition Session",
      );
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
      setMessages(newConv.messages || []);
      setLatestCards([]);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to start new chat:", err);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeConversation || sending) return;

    setSending(true);
    setLatestCards([]);

    // Optimistic user message
    const tempUserMsg: ConversationMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversation.id,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await conversationsApi.sendMessage(
        activeConversation.id,
        text,
      );

      // Assistant reply
      const assistantMsg: ConversationMessage = {
        id: `asst-${Date.now()}`,
        conversation_id: activeConversation.id,
        role: "assistant",
        content: response.message,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Set UI cards if returned
      if (response.ui_cards && response.ui_cards.length > 0) {
        setLatestCards(response.ui_cards);
      }
    } catch (err: any) {
      console.error("Send message error:", err);
      const errorMsg: ConversationMessage = {
        id: `err-${Date.now()}`,
        conversation_id: activeConversation.id,
        role: "assistant",
        content: `⚠️ Error: ${err.message || "Failed to process message."}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleConfirmAction = async (pendingActionId: string) => {
    if (!activeConversation) return;
    try {
      const res = await conversationsApi.confirmAction(
        activeConversation.id,
        pendingActionId,
      );
      const confirmMsg: ConversationMessage = {
        id: `conf-${Date.now()}`,
        conversation_id: activeConversation.id,
        role: "assistant",
        content: `✅ ${res.message}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, confirmMsg]);
      setLatestCards([]);
    } catch (err: any) {
      console.error("Action confirmation failed:", err);
    }
  };

  const handleCancelAction = async (pendingActionId: string) => {
    if (!activeConversation) return;
    try {
      const res = await conversationsApi.cancelAction(
        activeConversation.id,
        pendingActionId,
      );
      const cancelMsg: ConversationMessage = {
        id: `canc-${Date.now()}`,
        conversation_id: activeConversation.id,
        role: "assistant",
        content: `❌ ${res.message}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, cancelMsg]);
      setLatestCards([]);
    } catch (err: any) {
      console.error("Action cancellation failed:", err);
    }
  };

  const handleApplyClick = (oppId: string, title: string) => {
    handleSendMessage(`I'd like to apply for the "${title}" opportunity.`);
  };

  const handleExplainClick = (oppId: string, youthId: string) => {
    handleSendMessage(`Why is this candidate recommended for this role?`);
  };

  return (
    <div className="flex h-[calc(100vh-5.5rem)] max-w-7xl mx-auto rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
      {/* Sidebar - Conversation History */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block w-72 shrink-0 border-r border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-md shadow-emerald-950/40">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-white text-sm">
                {mode === "youth" ? "Job Coach AI" : "Recruiter AI"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartNewChat}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
              Active Sessions
            </span>
            <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-1 scrollbar-none">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectConversation(c.id)}
                  className={`w-full text-left rounded-xl px-3 py-2 text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    activeConversation?.id === c.id
                      ? "bg-emerald-500/20 font-bold text-emerald-300 border border-emerald-500/40 shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium border border-transparent"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{c.title || "Chat session"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary fallback link to manual forms */}
        <div className="border-t border-slate-800 pt-3 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Deterministic 0–100 Algorithm</span>
          </div>
          <Link
            to={formFallbackLink.to}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white font-semibold transition-colors"
          >
            <span>{formFallbackLink.label}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Chat Feed Area */}
      <div className="flex flex-1 flex-col min-w-0 bg-slate-950/60">
        {/* Top Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>
                    {mode === "youth"
                      ? "UK Youth Career Coach"
                      : "Employer Recruitment Assistant"}
                  </span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {mode === "youth"
                  ? "Conversational skill extraction, aptitude mapping & Living Wage matches"
                  : "Two-minute vacancy drafting, base wage calculation & candidate discovery"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {formFallbackLink && (
              <Link
                to={formFallbackLink.to}
                className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-xs"
              >
                <span>{formFallbackLink.label}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}

            <button
              type="button"
              onClick={handleStartNewChat}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Start new conversation"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Message Scroll View */}
        <div
          ref={feedContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center text-slate-500 text-xs">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500 mr-2" />
              Initializing Agent Session...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 max-w-md mx-auto space-y-3 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">
                {mode === "youth"
                  ? "Welcome to your AI Job Coach"
                  : "Welcome to your AI Recruiter Assistant"}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {mode === "youth"
                  ? "Describe your interests, skills, location, or school schedule. I will build your profile and surface Real Living Wage matches."
                  : "Tell me what role you are looking to fill and the hours needed. I will calculate your wage gap and prepare your vacancy."}
              </p>
            </div>
          ) : (
            <>
              {messages.map((m, idx) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  uiCards={idx === messages.length - 1 ? latestCards : []}
                  onConfirmAction={handleConfirmAction}
                  onCancelAction={handleCancelAction}
                  onApplyClick={handleApplyClick}
                  onExplainClick={handleExplainClick}
                />
              ))}

              {sending && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 p-3 rounded-2xl border border-slate-800 max-w-[220px]">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-[11px]">
                    AI Orchestrator reasoning...
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Composer */}
        <ChatComposer
          onSend={handleSendMessage}
          disabled={sending || loading}
          placeholder="Type your message or ask for advice..."
          suggestedPrompts={initialPrompts}
        />
      </div>
    </div>
  );
};
