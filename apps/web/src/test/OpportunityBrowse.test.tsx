import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { OpportunityBrowsePage } from "../pages/youth/OpportunityBrowsePage";
import { opportunitiesApi } from "../api/opportunities";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { Opportunity } from "@springboard/shared-types";

vi.mock("../api/opportunities", () => ({
  opportunitiesApi: {
    getOpportunities: vi.fn(),
  },
}));

const mockOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    business_id: "biz-1",
    business_name: "Apex Tech Innovations",
    organisation_type: "Technology",
    title: "Weekend Junior Web Developer",
    opportunity_type: "part_time_job",
    description: "Build web components with Python and HTML.",
    required_skills: ["Python", "Problem Solving"],
    preferred_skills: ["Teamwork"],
    location_name: "Chesham, Buckinghamshire",
    postcode: "HP5 2UR",
    workplace_type: "hybrid",
    pay_info: "£11.44 / hour",
    hours_or_commitment: "8 hours / week",
    deadline: null,
    status: "published",
    applications_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe("OpportunityBrowsePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders and displays opportunities list", async () => {
    vi.mocked(opportunitiesApi.getOpportunities).mockResolvedValue(
      mockOpportunities,
    );

    render(
      <MemoryRouter>
        <ToastProvider>
          <AuthProvider>
            <OpportunityBrowsePage />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Weekend Junior Web Developer"),
      ).toBeInTheDocument();
      expect(screen.getByText("Apex Tech Innovations")).toBeInTheDocument();
      expect(screen.getByText("£11.44 / hour")).toBeInTheDocument();
    });
  });
});
