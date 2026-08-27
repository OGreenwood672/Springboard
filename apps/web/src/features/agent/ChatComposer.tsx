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
    <div className="border-t border-slate-200/80 bg-white/95 p-3 sm:p-4 backdrop-blur-md">
      {/* Suggested Prompt Chips */}
      {suggestedPrompts.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSend(prompt)}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="relative flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50/70 p-1.5 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="max-h-28 w-full resize-none bg-transparent px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>
          Springboard AI assistant provides guidance & recommendations.
        </span>
        <span>
          Press{" "}
          <kbd className="rounded border border-slate-200 bg-slate-100 px-1 font-mono text-[10px]">
            Enter ↵
          </kbd>
        </span>
      </div>
    </div>
  );
};
