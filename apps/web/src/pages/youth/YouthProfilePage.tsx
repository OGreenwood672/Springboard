import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { profilesApi } from "../../api/profiles";
import { AICoachModal } from "../../components/youth/AICoachModal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  AICoachExtractedProfile,
  OpportunityType,
  YouthQualification,
} from "@springboard/shared-types";
import {
  User,
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Calendar,
} from "lucide-react";

const COMMON_SKILLS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "HTML/CSS",
  "Customer Service",
  "Communication",
  "Teamwork",
  "Problem Solving",
  "Social Media",
  "Retail",
  "Cash Handling",
  "Event Planning",
  "First Aid",
  "Graphic Design",
  "Writing",
  "Video Editing",
  "Administration",
  "Leadership",
];

const COMMON_INTERESTS = [
  "Technology",
  "Retail",
  "Charity",
  "Arts & Culture",
  "Environment",
  "Hospitality",
  "Healthcare",
  "Sports & Fitness",
  "Education",
  "Marketing",
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const YouthProfilePage: React.FC = () => {
  const { profile, refreshProfile, user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiCoachOpen, setAiCoachOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [postcode, setPostcode] = useState("");
  const [maxTravelKm, setMaxTravelKm] = useState(15);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [educationStage, setEducationStage] = useState("sixth_form");
  const [bio, setBio] = useState("");
  const [preferredTypes, setPreferredTypes] = useState<OpportunityType[]>([]);
  const [qualifications, setQualifications] = useState<YouthQualification[]>(
    [],
  );
  const [newQualName, setNewQualName] = useState("");
  const [newQualGrade, setNewQualGrade] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPreferredLocation(profile.preferred_location || "");
      setPostcode(profile.postcode || "");
      setMaxTravelKm(profile.max_travel_km || 15);
      setSkills(profile.skills || []);
      setInterests(profile.interests || []);
      setSelectedDays(profile.availability?.days || []);
      setHoursPerWeek(profile.availability?.hours_per_week || 8);
      setEducationStage(profile.education_stage || "sixth_form");
      setBio(profile.bio || "");
      setPreferredTypes(profile.preferred_opportunity_types || []);
      setQualifications(profile.qualifications || []);
    }
  }, [profile]);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleOppType = (type: OpportunityType) => {
    setPreferredTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const addQualification = () => {
    if (!newQualName.trim()) return;
    setQualifications((prev) => [
      ...prev,
      {
        name: newQualName.trim(),
        grade: newQualGrade.trim() || undefined,
        year_obtained: 2024,
      },
    ]);
    setNewQualName("");
    setNewQualGrade("");
  };

  const removeQualification = (index: number) => {
    setQualifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyFromAICoach = (data: AICoachExtractedProfile) => {
    if (data.skills?.length) setSkills(data.skills);
    if (data.interests?.length) setInterests(data.interests);
    if (data.education_stage) setEducationStage(data.education_stage);
    if (data.location?.postcode) setPostcode(data.location.postcode);
    if (data.location?.max_travel_km)
      setMaxTravelKm(data.location.max_travel_km);
    if (data.availability?.days?.length)
      setSelectedDays(data.availability.days);
    if (data.availability?.hours_per_week)
      setHoursPerWeek(data.availability.hours_per_week);
    if (data.preferred_opportunity_types?.length)
      setPreferredTypes(data.preferred_opportunity_types);
    if (data.qualifications?.length) {
      setQualifications(
        data.qualifications.map((q) => ({
          name: q.name,
          grade: q.grade,
          year_obtained: 2024,
        })),
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Full name is required", "error");
      return;
    }

    setSaving(true);
    try {
      await profilesApi.updateMyProfile({
        full_name: fullName.trim(),
        preferred_location: preferredLocation.trim() || undefined,
        postcode: postcode.trim() || undefined,
        max_travel_km: maxTravelKm,
        skills,
        interests,
        availability: {
          days: selectedDays,
          hours_per_week: hoursPerWeek,
        },
        education_stage: educationStage,
        bio: bio.trim() || undefined,
        preferred_opportunity_types: preferredTypes,
        qualifications: qualifications.map((q) => ({
          name: q.name,
          grade: q.grade,
          year_obtained: q.year_obtained,
        })),
      });

      await refreshProfile();
      showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Youth Profile
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {user?.email}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Keep your profile up to date for higher matching scores and
              employer shortlisting.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAiCoachOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Coach Assist</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Education Stage
                </label>
                <select
                  value={educationStage}
                  onChange={(e) => setEducationStage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
                >
                  <option value="secondary">
                    Secondary School (Years 10–11 / GCSE)
                  </option>
                  <option value="sixth_form">
                    Sixth Form (Years 12–13 / A-Levels / T-Levels)
                  </option>
                  <option value="college">
                    Further Education College / BTEC
                  </option>
                  <option value="university">
                    University / Higher Education
                  </option>
                  <option value="other">Other / Gap Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Location & Travel Limit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Area / City
                </label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  UK Postcode
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Max Travel: {maxTravelKm} km
                </label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="1"
                  value={maxTravelKm}
                  onChange={(e) => setMaxTravelKm(Number(e.target.value))}
                  className="w-full accent-emerald-600 mt-2"
                />
              </div>
            </div>
          </div>

          {/* Preferred Types */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Preferred Opportunity Types
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "part_time_job" as OpportunityType,
                  label: "Part-time Job",
                  desc: "Paid hourly roles",
                },
                {
                  id: "work_experience" as OpportunityType,
                  label: "Work Experience",
                  desc: "Industry insights & shadowing",
                },
                {
                  id: "volunteering" as OpportunityType,
                  label: "Volunteering",
                  desc: "Charity & social impact",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleOppType(item.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    preferredTypes.includes(item.id)
                      ? "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <p className="text-sm">{item.label}</p>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Skills & Interests */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Skills & Interests
            </h3>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Skills:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      skills.includes(skill)
                        ? "bg-emerald-700 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Interests:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      interests.includes(interest)
                        ? "bg-teal-700 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Availability
            </h3>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedDays.includes(day)
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="max-w-xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Hours per week: {hoursPerWeek}
              </label>
              <input
                type="number"
                min="1"
                max="40"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
              />
            </div>
          </div>

          {/* Qualifications */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              Qualifications
            </h3>
            {qualifications.map((q, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{q.name}</span>
                  {q.grade && (
                    <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                      Grade {q.grade}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeQualification(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newQualName}
                onChange={(e) => setNewQualName(e.target.value)}
                placeholder="e.g. A-Level Maths, BTEC IT"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white uk-focus-ring"
              />
              <input
                type="text"
                value={newQualGrade}
                onChange={(e) => setNewQualGrade(e.target.value)}
                placeholder="Grade"
                className="w-28 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white uk-focus-ring"
              />
              <button
                type="button"
                onClick={addQualification}
                className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Short Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving ? "Saving changes..." : "Save Profile Changes"}
              </span>
            </button>
          </div>
        </form>
      </div>

      <AICoachModal
        isOpen={aiCoachOpen}
        onClose={() => setAiCoachOpen(false)}
        onApplyExtractedProfile={handleApplyFromAICoach}
      />
    </div>
  );
};
