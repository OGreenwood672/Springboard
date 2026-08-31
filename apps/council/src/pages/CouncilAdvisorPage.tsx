import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  Coins,
  ShieldCheck,
  Building2,
  Users,
  MapPin,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  time: string;
}

export const CouncilAdvisorPage: React.FC = () => {
  const { council } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hello! I am your **Council Wage Subsidy & Social Mobility AI Advisor** for ${
        council?.name || "your local authority"
      }. I can analyze local SME wage gaps, model scheme budget projections, and identify target low-income family ward catchments. How can I assist your economic development team today?`,
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const samplePrompts = [
    "Which wards in our area have the greatest youth wage subsidy need?",
    "Calculate budget required to subsidise 10 youth apprentices at £4.50/hr for 6 months.",
    "Recommend top eligible micro-businesses in Chesham and Amersham.",
    "Explain the Treasury Green Book social mobility ROI multiplier for our council committee.",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: query,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate intelligent council policy advisory response
    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();

      if (
        lower.includes("budget") ||
        lower.includes("calculate") ||
        lower.includes("10")
      ) {
        reply = `### 📊 10 Youth Placements Budget Projection
- **Hourly Top-up**: £4.50 / hour
- **Weekly Commitment**: 16 hours / week per young person
- **Duration**: 24 weeks (6 months)

**Calculation**:
- Per youth cost: \`16 hrs × 24 weeks × £4.50 = £1,728\`
- Total Fund Required for 10 placements: **£17,280.00**
- Employer Co-Contribution (at £7.00/hr base): **£26,880.00**
- Total Youth Earnings: **£44,160.00** (Full Real Living Wage £11.50/hr guaranteed)

*Remaining fund budget on your active scheme can comfortably support this cohort.*`;
      } else if (
        lower.includes("ward") ||
        lower.includes("need") ||
        lower.includes("chesham")
      ) {
        reply = `### 📍 Priority Low-Income Ward Catchments
1. **Chesham Waterside & Vale (HP5 1)**: Deprivation Decile 2, ~38.5% low-income families. Highest density of micro-enterprises (e.g. *Chesham Community Bike Works*, *Chiltern Hills Artisan Bakery*).
2. **Chesham Town & St Mary's (HP5 2)**: Deprivation Decile 3, ~31.2% low-income households. Strong tech and creative employer presence.
3. **High Wycombe Central (HP11 2)**: Deprivation Decile 1, high youth density, ideal for transport-subsidised retail & trades.`;
      } else if (
        lower.includes("recommend") ||
        lower.includes("eligible") ||
        lower.includes("business")
      ) {
        reply = `### 🏆 Recommended Micro-Businesses for Wage Grants
1. **Chesham Community Bike Works** (*Retail & Trade*): Hourly wage gap £4.44/hr, low-income catchment score 92/100, apprentice-ready.
2. **Chiltern Hills Artisan Bakery & Café** (*Hospitality*): Wage gap £4.94/hr, 88/100 catchment score, seeking 2 weekend youth assistants.
3. **Apex Tech Innovations** (*Technology*): Highly rated mentorship track record, active subsidised web developer placement.`;
      } else {
        reply = `### 💡 Policy Recommendation & Economic Multiplier
Council wage subsidies act as a high-leverage economic catalyst:
- **Direct Living Wage Access**: Elevates low-income 16–24 year olds from £7.00 to **£11.44–£11.50/hr**.
- **Social Mobility ROI**: Every **£1.00** invested generates **£3.80** in local economic benefits and reduced long-term NEET rates.
- **SME Sustainability**: Protects fragile high street and micro-business margins while creating genuine local youth pathways.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          time: "Just now",
        },
      ]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
            Policy AI Assistant
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
          Council Wage Subsidy & Social Mobility Advisor
        </h1>
        <p className="text-xs text-slate-500">
          Query spatial deprivation statistics, model funding proposals, and
          draft grant policy memos with AI grounded in your council data.
        </p>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            className="text-left p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 text-xs font-semibold text-slate-700 hover:text-emerald-900 hover:bg-emerald-50/50 shadow-2xs transition-all flex items-center justify-between gap-2"
          >
            <span>{p}</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white font-medium"
                    : "bg-slate-50 border border-slate-200/80 text-slate-800 space-y-2"
                }`}
              >
                <div className="prose prose-xs max-w-none text-xs">
                  {msg.content.split("\n").map((line, lIdx) => {
                    if (line.startsWith("### ")) {
                      return (
                        <h4
                          key={lIdx}
                          className="font-extrabold text-slate-900 text-sm mt-1"
                        >
                          {line.replace("### ", "")}
                        </h4>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <li key={lIdx} className="ml-4 list-disc">
                          {line.replace("- ", "")}
                        </li>
                      );
                    }
                    return (
                      <p key={lIdx} className="my-1">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400 animate-pulse">
              <Bot className="w-5 h-5 text-emerald-600" />
              <span>
                Council Advisor is evaluating wage data and catchment
                statistics...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask anything about local wage gaps, budget allocation models, or youth criteria..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
