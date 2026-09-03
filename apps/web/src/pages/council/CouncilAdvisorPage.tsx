import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
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
  Zap,
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

**Calculations:**
- Cost per youth: £4.50 × 16 hrs × 24 wks = **£1,728**
- **Total 10-Cohort Budget Required**: **£17,280**
- Remaining in your active £100k fund: **£82,720**

**Treasury SROI Multiplier:**
- At £3.80 return per £1 invested, this £17,280 allocation is projected to generate **£65,664** in net economic value (reduced NEET friction, wage local multiplier, and youth retention).`;
      } else if (
        lower.includes("ward") ||
        lower.includes("deprivation") ||
        lower.includes("need")
      ) {
        reply = `### 📍 Priority Catchment Wards
Based on the Index of Multiple Deprivation (IMD) Deciles & Free School Meals density:

1. **Chesham Waterside & Vale (HP5 1)**
   - IMD Decile: **2** (High Priority)
   - Estimated NEET/At-Risk Youth: **1,240**
   - Recommended Hourly Subsidy: **£4.50 / hr**
   - Anchor SMEs: Chesham Community Bike Works, Waterside Print Co.

2. **Newtown & Lowndes (HP5 2)**
   - IMD Decile: **3**
   - High concentration of micro trade and independent retail SMEs.`;
      } else if (
        lower.includes("recommend") ||
        lower.includes("chesham") ||
        lower.includes("sme")
      ) {
        reply = `### 🏢 Top Recommended SME Candidates
1. **Chesham Community Bike Works**
   - Size: Micro (3 staff)
   - Current Affordable Wage: **£7.00 / hr**
   - Hourly Wage Gap: **+£4.44 / hr** to reach £11.44
   - Catchment Fit: **92/100** (Adjacent to low-income pupil premium wards)

2. **Chiltern Green Woodcraft**
   - Size: Small (12 staff)
   - Current Affordable Wage: **£8.00 / hr**
   - Hourly Wage Gap: **+£3.44 / hr**
   - Catchment Fit: **84/100**`;
      } else {
        reply = `### 🏛️ Treasury Green Book Economic Analysis
Council wage subsidies under the Springboard model demonstrate a **£3.80 Social Return on Investment (SROI)** ratio:

1. **Direct Fiscal Relief**: Reduced Universal Credit claims and youth NEET intervention expenditures.
2. **Local Velocity of Money**: Every £1 disbursed is spent 84% in local catchment businesses within 5 miles.
3. **Employer Retention**: 88% of subsidised young people transition into permanent un-subsidised contracts by month 6.`;
      }

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: reply,
        time: "Just now",
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            AI Grant Strategist
          </span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">
          Council Policy & Wage Subsidy Advisor
        </h1>
        <p className="text-xs text-slate-400">
          Query spatial wage statistics, forecast multi-youth grant costs, and
          draft grant policy memos with AI grounded in your council data.
        </p>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            className="text-left p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 shadow-xl transition-all flex items-center justify-between gap-2 cursor-pointer"
          >
            <span>{p}</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[560px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 font-semibold"
                    : "bg-slate-950 border border-slate-800 text-slate-200 space-y-2"
                }`}
              >
                <div className="prose prose-invert prose-xs max-w-none text-xs">
                  {msg.content.split("\n").map((line, lIdx) => {
                    if (line.startsWith("### ")) {
                      return (
                        <h4
                          key={lIdx}
                          className="font-black text-white text-sm mt-1"
                        >
                          {line.replace("### ", "")}
                        </h4>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <li
                          key={lIdx}
                          className="ml-4 list-disc text-slate-300"
                        >
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
            <div className="flex gap-3 items-center text-xs text-slate-400 animate-pulse font-mono">
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>
                Council Advisor is evaluating wage data and catchment
                statistics...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask anything about local wage gaps, budget allocation models, or youth criteria..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 transition-all shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
