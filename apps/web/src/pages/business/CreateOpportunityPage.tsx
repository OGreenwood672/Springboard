import React from "react";
import { useNavigate } from "react-router-dom";
import { Opportunity } from "@springboard/shared-types";
import { opportunitiesApi } from "../../api/opportunities";
import { useToast } from "../../context/ToastContext";
import { OpportunityForm } from "../../components/business/OpportunityForm";

export const CreateOpportunityPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCreate = async (data: Partial<Opportunity>) => {
    try {
      const created = await opportunitiesApi.createOpportunity(data);
      showToast(`Listing '${created.title}' created successfully!`, "success");
      navigate("/business/opportunities");
    } catch (err: any) {
      showToast(err.message || "Failed to create opportunity", "error");
      throw err;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100">
      <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
            Employer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            Post an Opportunity
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create a part-time job, work experience placement, or volunteering
            opening for young people.
          </p>
        </div>

        <OpportunityForm onSubmit={handleCreate} />
      </div>
    </div>
  );
};
