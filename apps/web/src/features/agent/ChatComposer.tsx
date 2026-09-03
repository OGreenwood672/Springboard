import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  suggestedPrompts?: string[];
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  disabled = false,
  placeholder = "Type your message or ask for advice...",
  suggestedPrompts = [],
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/90 p-3 sm:p-4 backdrop-blur-md">
      {/* Suggested Prompt Chips */}
      {suggestedPrompts.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSend(prompt)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:bg-emerald-950/40 hover:text-emerald-300 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="relative flex items-end gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="max-h-28 w-full resize-none bg-transparent px-3 py-1.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-40"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md hover:from-emerald-400 hover:to-teal-300 disabled:opacity-30 disabled:hover:from-emerald-500 transition-all cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
        <span>
          Springboard Agent Orchestrator • Pydantic Validated
        </span>
        <span className="hidden sm:inline">
          Press{" "}
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 font-mono text-[10px] text-slate-400">
            Enter ↵
          </kbd>
        </span>
      </div>
    </div>
  );
};
