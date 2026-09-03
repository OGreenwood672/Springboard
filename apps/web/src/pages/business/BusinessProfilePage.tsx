import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { businessesApi } from "../../api/businesses";
import { Save } from "lucide-react";

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

export const BusinessProfilePage: React.FC = () => {
  const { business, refreshProfile, user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [organisationType, setOrganisationType] = useState(
    "Technology & Digital",
  );
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [website, setWebsite] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name || "");
      setOrganisationType(business.organisation_type || "Technology & Digital");
      setContactName(business.contact_name || "");
      setContactEmail(business.contact_email || user?.email || "");
      setDescription(business.description || "");
      setAddress(business.address || "");
      setPostcode(business.postcode || "");
      setWebsite(business.website || "");
    }
  }, [business, user]);

  const handleSave = async (e: React.FormEvent) => {
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
      showToast("Organisation profile updated successfully!", "success");
    } catch (err: any) {
      showToast(
        err.message || "Failed to update organisation profile",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100">
      <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Organisation Profile
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {user?.email}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage your organisation branding and contact details for
              applicants.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Organisation Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-indigo-500 uk-focus-ring"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Organisation Sector
              </label>
              <select
                value={organisationType}
                onChange={(e) => setOrganisationType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:bg-slate-900 focus:border-indigo-500 uk-focus-ring cursor-pointer"
              >
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-indigo-500 uk-focus-ring"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Contact Person
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-indigo-500 uk-focus-ring"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-indigo-500 uk-focus-ring"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-indigo-500 uk-focus-ring"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                UK Postcode
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:bg-slate-900 focus:border-indigo-500 uk-focus-ring uppercase font-mono"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              About Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-indigo-500 uk-focus-ring resize-none"
            />
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 shadow-lg shadow-indigo-950/50 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
