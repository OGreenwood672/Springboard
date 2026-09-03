import React, { useState } from "react";
import { AICoachExtractedProfile } from "@springboard/shared-types";
import { aiCoachApi } from "../../api/aiCoach";
import { useToast } from "../../context/ToastContext";
import {
  Sparkles,
  Bot,
  ArrowRight,
  Check,
  X,
  Wand2,
  RefreshCw,
} from "lucide-react";

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExtractedProfile: (extracted: AICoachExtractedProfile) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: "Sixth Former in Tech/Retail",
    prompt:
      "Hi, I'm 16 in sixth form in Chesham (HP5). I want a weekend part-time job or summer work experience in tech or retail. I'm good with Python and customer service, can travel up to 15km, and got a 7 in GCSE Maths.",
  },
  {
    title: "College Student in Events/Charity",
    prompt:
      "I'm 18 at college in Central London (SW1A). Looking for volunteering or work experience in community events or charities. I have strong communication, event planning, social media skills and am free Saturdays.",
  },
  {
    title: "Secondary Student / First Job",
    prompt:
      "I'm 15 in secondary school in Birmingham (B1). Looking for weekend part-time jobs or volunteering. I love teamwork, customer service, and sports.",
  },
];

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  onApplyExtractedProfile,
}) => {
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] =
    useState<AICoachExtractedProfile | null>(null);

  if (!isOpen) return null;

  const handleExtract = async (textToExtract?: string) => {
    const text = textToExtract || message;
    if (!text.trim()) {
      showToast("Please type a message or select a prompt first", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await aiCoachApi.extractProfile(text);
      setExtractedData(response.extracted_profile);
      showToast("Extracted your strengths and preferences!", "success");
    } catch (err: any) {
      showToast(err.message || "Could not extract profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (extractedData) {
      onApplyExtractedProfile(extractedData);
      showToast("AI Coach profile data loaded into your form!", "success");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-950/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">
                  AI Career Coach (Agent Assistant)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md">
                  Agentic
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tell us about your interests, skills, and schedule in plain
                English to automatically build your profile.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {/* Sample Prompts */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Try a sample prompt:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMessage(sample.prompt);
                    handleExtract(sample.prompt);
                  }}
                  className="p-3 text-left rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-850 hover:border-emerald-500/50 text-xs text-slate-300 transition-all font-medium cursor-pointer"
                >
                  <p className="font-bold text-white mb-1 flex items-center gap-1">
                    <Wand2 className="w-3 h-3 text-emerald-400" />
                    {sample.title}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                    {sample.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* User Input Area */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Describe your background, skills, and what you're looking for:
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. I study in High Wycombe (HP11). I know Python, Customer Service, and want weekend part-time work within 15km."
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 uk-focus-ring resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleExtract()}
                disabled={loading || !message.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-emerald-950/40"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Profile...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5" />
                    <span>Extract Strengths & Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Extracted Output Review Card */}
          {extractedData && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Structured Profile Generated
                </span>
                <span className="text-[11px] text-emerald-300/80 font-mono">
                  Review & confirm below
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Skills */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-sm">
                  <span className="font-bold text-white block mb-1.5">
                    Identified Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {extractedData.skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-sm">
                  <span className="font-bold text-white block mb-1.5">
                    Interests:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {extractedData.interests.map((int, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold"
                      >
                        {int}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education Stage & Qualifications */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-sm">
                  <span className="font-bold text-white block mb-1">
                    Education & Qualifications:
                  </span>
                  <p className="text-slate-300 font-medium capitalize mb-1">
                    Stage: {extractedData.education_stage.replace("_", " ")}
                  </p>
                  <div className="space-y-0.5">
                    {extractedData.qualifications.map((q, i) => (
                      <p
                        key={i}
                        className="text-slate-400 text-[11px] font-mono"
                      >
                        • {q.name} (Grade: {q.grade})
                      </p>
                    ))}
                  </div>
                </div>

                {/* Location & Availability */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-sm">
                  <span className="font-bold text-white block mb-1">
                    Location & Schedule:
                  </span>
                  <p className="text-slate-300 font-medium">
                    Postcode: {extractedData.location?.postcode || "Local"}{" "}
                    (within {extractedData.location?.max_travel_km || 15}km)
                  </p>
                  <p className="text-slate-400 text-[11px] font-mono mt-1">
                    Available: {extractedData.availability.days.join(", ")} (
                    {extractedData.availability.hours_per_week || 8} hrs/wk)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {extractedData && (
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <span>Apply to Profile Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
