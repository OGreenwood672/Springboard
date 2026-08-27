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
      setSending(true);
      const newConv = await conversationsApi.startConversation(
        mode,
        `${mode === "youth" ? "Job Coach" : "Recruiter"} - ${new Date().toLocaleDateString()}`,
      );
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
      setMessages([]);
      setLatestCards([]);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to create new conversation:", err);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeConversation || !text.trim() || sending) return;

    // Optimistic user message
    const tempUserMsg: ConversationMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversation.id,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const res = await conversationsApi.sendMessage(
        activeConversation.id,
        text,
      );

      const assistantMsg: ConversationMessage = {
        id: `assist-${Date.now()}`,
        conversation_id: activeConversation.id,
        role: "assistant",
        content: res.message,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLatestCards(res.ui_cards || []);
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorMsg: ConversationMessage = {
        id: `err-${Date.now()}`,
        conversation_id: activeConversation.id,
        role: "assistant",
        content:
          "⚠️ Sorry, there was an issue processing your request. Please try again.",
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
      const errMsg: ConversationMessage = {
        id: `err-${Date.now()}`,
        conversation_id: activeConversation.id,
        role: "assistant",
        content: `⚠️ Failed to confirm action: ${err.message || "Please try again."}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
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
    <div className="flex h-[calc(100vh-6rem)] max-w-7xl mx-auto rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Sidebar - Conversation History */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block w-72 shrink-0 border-r border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm">
                {mode === "youth" ? "Job Coach AI" : "Recruiter AI"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartNewChat}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Conversations
            </span>
            <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-1">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectConversation(c.id)}
                  className={`w-full text-left rounded-xl px-3 py-2 text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    activeConversation?.id === c.id
                      ? "bg-emerald-600 font-bold text-white shadow-2xs"
                      : "text-slate-700 hover:bg-slate-200/60 font-medium"
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
        <div className="border-t border-slate-200/80 pt-3 text-xs space-y-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Deterministic Matching & Data Security</span>
          </div>
          <Link
            to={formFallbackLink.to}
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
          >
            <span>{formFallbackLink.label}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Chat Feed Area */}
      <div className="flex flex-1 flex-col justify-between bg-slate-50/30 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>
                  {mode === "youth"
                    ? "UK Youth Career Coach"
                    : "Employer Recruitment Assistant"}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                  Active
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === "youth"
                  ? "Ask for job advice, build your profile, explore matches, or draft applications"
                  : "Post vacancies, find local candidates, or manage your opportunity listings"}
              </p>
            </div>
          </div>

          <Link
            to={formFallbackLink.to}
            className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <span>{formFallbackLink.label}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Message Feed */}
        <div
          ref={feedContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center text-slate-400 gap-2 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
              <span>Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {mode === "youth"
                    ? "Welcome to your Job Coach!"
                    : "Welcome to the Recruitment Assistant!"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  {mode === "youth"
                    ? "Tell me about your location, availability, and skills, or pick one of the suggestions below to get started."
                    : "Describe the role you need or search existing candidate matches across local young talent."}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isLastAssistant =
                msg.role === "assistant" && index === messages.length - 1;
              return (
                <ChatMessage
                  key={msg.id || index}
                  message={msg}
                  uiCards={isLastAssistant ? latestCards : []}
                  onConfirmAction={handleConfirmAction}
                  onCancelAction={handleCancelAction}
                  onApplyClick={handleApplyClick}
                  onExplainClick={handleExplainClick}
                />
              );
            })
          )}

          {sending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-11 py-2">
              <Bot className="h-3.5 w-3.5 text-emerald-600 animate-bounce" />
              <span>Thinking & checking opportunities...</span>
            </div>
          )}
        </div>

        {/* Chat Composer */}
        <ChatComposer
          onSend={handleSendMessage}
          disabled={sending || loading}
          suggestedPrompts={messages.length <= 2 ? initialPrompts : []}
          placeholder={
            mode === "youth"
              ? "Type your message or ask for advice... (e.g. 'I know Python and live in Chesham')"
              : "Type your message... (e.g. 'We need students for café work on Saturdays')"
          }
        />
      </div>
    </div>
  );
};
