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
    getMyProfile: vi.fn(),
    updateMyProfile: vi.fn(),
    expandKnowledgeFrontier: vi.fn(),
  },
}));

const graph: KnowledgeGraph = {
  nodes: [
    {
      id: "python",
      label: "Python",
      kind: "skill",
      status: "current",
      category: "Technical Skills",
      sectors: ["Technology"],
      demand: 2,
      opportunity_count: 2,
      reason: "Part of your profile and used by 2 open roles.",
    },
    {
      id: "html-css",
      label: "HTML/CSS",
      kind: "skill",
      status: "frontier",
      category: "Technical Skills",
      sectors: ["Technology"],
      demand: 1,
      opportunity_count: 1,
      reason: "Builds on Python and strengthens 1 open role.",
    },
    {
      id: "interest-technology",
      label: "Technology",
      kind: "interest",
      status: "current",
      category: "Technology Interests",
      sectors: [],
      demand: 0,
      opportunity_count: 0,
      reason: "An interest on your profile.",
    },
  ],
  edges: [
    { source: "python", target: "html-css", relationship: "used_together" },
    { source: "interest-technology", target: "python", relationship: "interest_alignment" },
  ],
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
    current_interests: 1,
    frontier_skills: 1,
    sectors_in_reach: 1,
    roles_in_reach: 1,
  },
};

describe("YouthKnowledgePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(profilesApi.getMyKnowledgeGraph).mockResolvedValue(graph);
    vi.mocked(profilesApi.getMyProfile).mockResolvedValue({
      skills: ["Python"],
      interests: ["Technology"],
    } as any);
    vi.mocked(profilesApi.updateMyProfile).mockResolvedValue({} as any);
    vi.mocked(profilesApi.expandKnowledgeFrontier).mockResolvedValue({
      nodes: [],
      edges: [],
    });
  });

  it("shows the frontier skill and its connected role", async () => {
    render(
      <MemoryRouter>
        <YouthKnowledgePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Knowledge frontier" })).toBeInTheDocument();
    });

    expect(screen.getAllByText("HTML/CSS").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("tab", { name: "Roles" }));
    expect(screen.getByText("Junior Web Developer")).toBeInTheDocument();
    expect(screen.getByText("Grow: HTML/CSS")).toBeInTheDocument();
  });

  it("promotes a frontier skill and refreshes the graph in place", async () => {
    const updatedGraph: KnowledgeGraph = {
      ...graph,
      nodes: graph.nodes.map((node) =>
        node.id === "html-css" ? { ...node, status: "current" as const } : node,
      ),
      stats: { ...graph.stats, current_skills: 2, frontier_skills: 0 },
    };
    vi.mocked(profilesApi.getMyKnowledgeGraph)
      .mockResolvedValueOnce(graph)
      .mockResolvedValueOnce(updatedGraph);

    render(
      <MemoryRouter>
        <YouthKnowledgePage />
      </MemoryRouter>,
    );

    const addButton = await screen.findByRole("button", {
      name: "Add HTML/CSS to my skills",
    });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(profilesApi.updateMyProfile).toHaveBeenCalledWith({
        skills: ["Python", "HTML/CSS"],
      });
      expect(
        screen.queryByRole("button", { name: "Add HTML/CSS to my skills" }),
      ).not.toBeInTheDocument();
    });
  });

  it("uses the profile skill list and saves selector changes immediately", async () => {
    render(
      <MemoryRouter>
        <YouthKnowledgePage />
      </MemoryRouter>,
    );

    const communication = await screen.findByRole("button", { name: "Communication" });
    expect(communication).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(communication);

    await waitFor(() => {
      expect(profilesApi.updateMyProfile).toHaveBeenCalledWith({
        skills: ["Python", "Communication"],
      });
      expect(communication).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("shows profile interests and saves interest changes immediately", async () => {
    render(
      <MemoryRouter>
        <YouthKnowledgePage />
      </MemoryRouter>,
    );

    const environment = await screen.findByRole("button", { name: "Environment" });
    expect(environment).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(environment);

    await waitFor(() => {
      expect(profilesApi.updateMyProfile).toHaveBeenCalledWith({
        interests: ["Technology", "Environment"],
      });
      expect(environment).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("expands a hovered node with more specific frontier skills", async () => {
    vi.mocked(profilesApi.expandKnowledgeFrontier).mockResolvedValue({
      nodes: [{
        id: "async-python",
        label: "Asynchronous Python",
        kind: "skill",
        status: "frontier",
        category: "Software Development",
        sectors: [],
        demand: 0,
        opportunity_count: 0,
        reason: "A more specific next step from Python.",
      }],
      edges: [{ source: "python", target: "async-python", relationship: "related" }],
    });
    render(
      <MemoryRouter>
        <YouthKnowledgePage />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", {
      name: "Expand frontier from Python",
    }));

    await waitFor(() => {
      expect(profilesApi.expandKnowledgeFrontier).toHaveBeenCalledWith(
        expect.objectContaining({ id: "python", label: "Python", kind: "skill" }),
      );
      expect(screen.getAllByText("Asynchronous Python").length).toBeGreaterThan(0);
    });
  });
});
