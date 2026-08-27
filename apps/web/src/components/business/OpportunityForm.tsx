import React, { useState } from 'react';
import { Opportunity, OpportunityType, WorkplaceType, OpportunityStatus } from '@springboard/shared-types';
import { Briefcase, MapPin, Sparkles, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const COMMON_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Customer Service',
  'Communication', 'Teamwork', 'Problem Solving', 'Social Media',
  'Retail', 'Cash Handling', 'Event Planning', 'First Aid', 'Graphic Design',
  'Writing', 'Video Editing', 'Administration', 'Leadership'
];

interface OpportunityFormProps {
  initialData?: Partial<Opportunity>;
  onSubmit: (data: Partial<Opportunity>) => Promise<void>;
  isEditing?: boolean;
}

export const OpportunityForm: React.FC<OpportunityFormProps> = ({
  initialData = {},
  onSubmit,
  isEditing = false,
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [opportunityType, setOpportunityType] = useState<OpportunityType>(
    initialData.opportunity_type || 'part_time_job'
  );
  const [description, setDescription] = useState(initialData.description || '');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(initialData.required_skills || ['Communication']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(initialData.preferred_skills || []);
  const [locationName, setLocationName] = useState(initialData.location_name || '');
  const [postcode, setPostcode] = useState(initialData.postcode || '');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>(initialData.workplace_type || 'in_person');
  const [payInfo, setPayInfo] = useState(initialData.pay_info || '£11.44 / hour');
  const [hoursOrCommitment, setHoursOrCommitment] = useState(initialData.hours_or_commitment || '8 hours / week (Saturdays)');
  const [status, setStatus] = useState<OpportunityStatus>(initialData.status || 'draft');
  const [saving, setSaving] = useState(false);

  const toggleReqSkill = (skill: string) => {
    setRequiredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const togglePrefSkill = (skill: string) => {
    setPreferredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        opportunity_type: opportunityType,
        description: description.trim(),
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        location_name: locationName.trim() || undefined,
        postcode: postcode.trim() || undefined,
        workplace_type: workplaceType,
        pay_info: payInfo.trim() || undefined,
        hours_or_commitment: hoursOrCommitment.trim() || undefined,
        status,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Title & Type */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          1. Opportunity Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Role Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Junior Web Developer, Retail Assistant"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Opportunity Type *
            </label>
            <select
              value={opportunityType}
              onChange={(e) => setOpportunityType(e.target.value as OpportunityType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
            >
              <option value="part_time_job">Part-time Job (Hourly Paid)</option>
              <option value="work_experience">Work Experience / Internship</option>
              <option value="volunteering">Volunteering Project</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Listing Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
            >
              <option value="draft">Draft (Private, not accepting applications)</option>
              <option value="published">Published (Live to UK youth candidates)</option>
              <option value="closed">Closed (Applications finished)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Workplace & Location */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          2. Workplace & Location
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Workplace Arrangement *
            </label>
            <select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
            >
              <option value="in_person">In-person (On-site)</option>
              <option value="hybrid">Hybrid (Split on-site & remote)</option>
              <option value="remote">Fully Remote</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Town / City Location Name
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Chesham, London, Manchester"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              UK Postcode (for proximity)
            </label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              placeholder="e.g. HP5 2UR, EC1A, M1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring uppercase font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Pay & Hours */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          3. Pay & Commitment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Pay Information / Rate
            </label>
            <input
              type="text"
              value={payInfo}
              onChange={(e) => setPayInfo(e.target.value)}
              placeholder="e.g. £11.44 / hour or Voluntary (Expenses covered)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Hours / Working Commitment
            </label>
            <input
              type="text"
              value={hoursOrCommitment}
              onChange={(e) => setHoursOrCommitment(e.target.value)}
              placeholder="e.g. 8 hours / week (Saturdays 9am-5pm)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
            />
          </div>
        </div>
      </div>

      {/* 4. Skills Requirements */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          4. Skills & Matching Criteria
        </h3>

        {/* Required skills */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Required Skills:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleReqSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  requiredSkills.includes(skill)
                    ? 'bg-indigo-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred skills */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Preferred / Bonus Skills:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => togglePrefSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  preferredSkills.includes(skill)
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Description */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Detailed Description *
        </label>
        <textarea
          rows={6}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the day-to-day responsibilities, learning opportunities, mentoring, and support young candidates will receive..."
          className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
        />
      </div>

      {/* Actions */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <Link
          to="/business/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </Link>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving listing...' : isEditing ? 'Update Opportunity' : 'Create Opportunity'}</span>
        </button>
      </div>
    </form>
  );
};
