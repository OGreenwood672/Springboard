import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KnowledgeGraph } from "@springboard/shared-types";
import { profilesApi } from "../api/profiles";
import { YouthKnowledgePage } from "../pages/youth/YouthKnowledgePage";

vi.mock("../api/profiles", () => ({
  profilesApi: {
    getMyKnowledgeGraph: vi.fn(),
  },
}));

const graph: KnowledgeGraph = {
  nodes: [
    {
      id: "python",
      label: "Python",
      status: "current",
      sector: "Technology",
      demand: 2,
      opportunity_count: 2,
      reason: "Part of your profile and used by 2 open roles.",
    },
    {
      id: "html-css",
      label: "HTML/CSS",
      status: "frontier",
      sector: "Technology",
      demand: 1,
      opportunity_count: 1,
      reason: "Builds on Python and strengthens 1 open role.",
    },
  ],
  edges: [{ source: "python", target: "html-css", relationship: "used_together" }],
  sectors: [
    {
      name: "Technology",
      fit_score: 75,
      matching_skills: ["Python"],
      frontier_skills: ["HTML/CSS"],
      opportunity_count: 1,
    },
  ],
  opportunities: [
    {
      id: "opp-1",
      title: "Junior Web Developer",
      business_name: "Apex Tech",
      sector: "Technology",
      workplace_type: "hybrid",
      location_name: "Chesham",
      fit_score: 75,
      matched_skills: ["Python"],
      missing_skills: ["HTML/CSS"],
    },
  ],
  stats: {
    current_skills: 1,
    frontier_skills: 1,
    sectors_in_reach: 1,
    roles_in_reach: 1,
  },
};

describe("YouthKnowledgePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(profilesApi.getMyKnowledgeGraph).mockResolvedValue(graph);
  });

  it("shows the frontier skill and its connected role", async () => {
    render(
      <MemoryRouter>
        <YouthKnowledgePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Your knowledge frontier" })).toBeInTheDocument();
    });

    expect(screen.getAllByText("HTML/CSS").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("tab", { name: "Roles" }));
    expect(screen.getByText("Junior Web Developer")).toBeInTheDocument();
    expect(screen.getByText("Grow: HTML/CSS")).toBeInTheDocument();
  });
});
