import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { businessesApi } from "../../api/businesses";
import { ArrowRight } from "lucide-react";

const ORG_TYPES = [
  "Technology & Digital",
  "Retail & Commerce",
  "Charity & Community",
  "Hospitality & Catering",
  "Healthcare & Wellbeing",
  "Creative Arts & Media",
  "Education & Training",
  "Engineering & Construction",
  "Professional Services",
  "Other",
];

export const BusinessOnboardingPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [organisationType, setOrganisationType] = useState(
    "Technology & Digital",
  );
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [website, setWebsite] = useState("");

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactName.trim() || !contactEmail.trim()) {
      showToast("Please fill in all required organisation fields", "error");
      return;
    }

    setSaving(true);
    try {
      await businessesApi.updateMyBusiness({
        name: name.trim(),
        organisation_type: organisationType,
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        postcode: postcode.trim() || undefined,
        website: website.trim() || undefined,
      });

      await refreshProfile();
      showToast("Organisation profile created successfully!", "success");
      navigate("/business/assistant", { replace: true });
    } catch (err: any) {
      showToast(err.message || "Failed to save organisation profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
            Employer Setup • Step 1 of 1
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Register your organisation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Post opportunities, review youth applicants, and connect with young
            local talent.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Organisation / Company Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Tech Innovations Ltd"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Organisation Sector / Type *
              </label>
              <select
                value={organisationType}
                onChange={(e) => setOrganisationType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
              >
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Website (Optional)
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.co.uk"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. David Clarke"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@company.co.uk"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Office / Premises Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 14 High Street"
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
                placeholder="e.g. HP5 2UR, EC1A"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring uppercase font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              About your organisation
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell young candidates about your workplace culture, mission, and the support you provide to learners..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white uk-focus-ring"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>
                {saving ? "Creating profile..." : "Complete Organisation Setup"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
