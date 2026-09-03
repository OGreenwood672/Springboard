import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleAlert,
  Heart,
  LoaderCircle,
  MapPin,
  Network,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Radar,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import { KnowledgeGraph, KnowledgeGraphNode } from "@springboard/shared-types";
import { profilesApi } from "../../api/profiles";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { KnowledgeGraphCanvas } from "../../components/youth/KnowledgeGraphCanvas";
import { ProfileTagSelector } from "../../components/youth/ProfileTagSelector";
import { COMMON_INTERESTS, COMMON_SKILLS } from "../../data/profileOptions";

type PanelTab = "overview" | "growth" | "roles";

const formatWorkplace = (value: string) => value.replace("_", " ");

export const YouthKnowledgePage: React.FC = () => {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(
    null,
  );
  const [activeSector, setActiveSector] = useState("All sectors");
  const [activeTab, setActiveTab] = useState<PanelTab>("overview");
  const [panelOpen, setPanelOpen] = useState(true);
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [currentInterests, setCurrentInterests] = useState<string[]>([]);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingInterests, setSavingInterests] = useState(false);
  const [skillError, setSkillError] = useState<string | null>(null);
  const [interestError, setInterestError] = useState<string | null>(null);
  const [expandingNodeId, setExpandingNodeId] = useState<string | null>(null);
  const [expansionError, setExpansionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([profilesApi.getMyKnowledgeGraph(), profilesApi.getMyProfile()])
      .then(([data, profile]) => {
        setGraph(data);
        setCurrentSkills(profile.skills || []);
        setCurrentInterests(profile.interests || []);
        setSelectedNode(
          data.nodes.find((node) => node.status === "frontier") ??
            data.nodes[0] ??
            null,
        );
      })
      .catch((err) =>
        setError(err.message || "Could not build your knowledge map."),
      )
      .finally(() => setLoading(false));
  }, []);

  const visibleRoles = useMemo(() => {
    if (!graph) return [];
    let roles = graph.opportunities;
    if (activeSector !== "All sectors") {
      roles = roles.filter((role) => role.sector === activeSector);
    }
    if (selectedNode) {
      const connectedSkillLabels =
        selectedNode.kind === "interest"
          ? graph.edges
              .filter(
                (edge) =>
                  edge.source === selectedNode.id ||
                  edge.target === selectedNode.id,
              )
              .map((edge) =>
                edge.source === selectedNode.id ? edge.target : edge.source,
              )
              .map((nodeId) => graph.nodes.find((node) => node.id === nodeId))
              .filter((node): node is KnowledgeGraphNode =>
                Boolean(node?.kind === "skill"),
              )
              .map((node) => node.label.toLowerCase())
          : [selectedNode.label.toLowerCase()];
      const related = roles.filter((role) =>
        [...role.matched_skills, ...role.missing_skills].some((skill) =>
          connectedSkillLabels.includes(skill.toLowerCase()),
        ),
      );
      if (related.length) return related;
    }
    return roles;
  }, [activeSector, graph, selectedNode]);

  const selectNode = (node: KnowledgeGraphNode) => {
    setSelectedNode(node);
    setPanelOpen(true);
  };

  const expandFrontier = useCallback(
    async (node: KnowledgeGraphNode) => {
      if (expandingNodeId) return;
      setExpandingNodeId(node.id);
      setExpansionError(null);
      try {
        const expansion = await profilesApi.expandKnowledgeFrontier(node);
        setGraph((current) => {
          if (!current) return current;
          const existingNodeIds = new Set(current.nodes.map((n) => n.id));
          const newNodes = expansion.nodes.filter(
            (n) => !existingNodeIds.has(n.id),
          );
          const existingEdgeKeys = new Set(
            current.edges.map((e) => `${e.source}-${e.target}`),
          );
          const newEdges = expansion.edges.filter(
            (e) => !existingEdgeKeys.has(`${e.source}-${e.target}`),
          );
          return {
            ...current,
            nodes: [...current.nodes, ...newNodes],
            edges: [...current.edges, ...newEdges],
            stats: {
              ...current.stats,
              frontier_skills: current.stats.frontier_skills + newNodes.length,
            },
          };
        });
      } catch (err: any) {
        setExpansionError(err.message || "Could not expand frontier skills.");
      } finally {
        setExpandingNodeId(null);
      }
    },
    [expandingNodeId],
  );

  const saveSkills = async (skills: string[], added?: string) => {
    setSavingSkills(true);
    setSkillError(null);
    try {
      await profilesApi.updateMyProfile({ skills });
      setCurrentSkills(skills);
      const updatedGraph = await profilesApi.getMyKnowledgeGraph();
      setGraph(updatedGraph);
      if (added) {
        const addedNode = updatedGraph.nodes.find(
          (n) => n.label.toLowerCase() === added.toLowerCase(),
        );
        if (addedNode) setSelectedNode(addedNode);
      }
    } catch (err: any) {
      setSkillError(err.message || "Failed to update skills.");
    } finally {
      setSavingSkills(false);
    }
  };

  const saveInterests = async (interests: string[], added?: string) => {
    setSavingInterests(true);
    setInterestError(null);
    try {
      await profilesApi.updateMyProfile({ interests });
      setCurrentInterests(interests);
      const updatedGraph = await profilesApi.getMyKnowledgeGraph();
      setGraph(updatedGraph);
      if (added) {
        const addedNode = updatedGraph.nodes.find(
          (n) => n.label.toLowerCase() === added.toLowerCase(),
        );
        if (addedNode) setSelectedNode(addedNode);
      }
    } catch (err: any) {
      setInterestError(err.message || "Failed to update interests.");
    } finally {
      setSavingInterests(false);
    }
  };

  const addSkill = (label: string) => {
    if (currentSkills.includes(label)) return;
    void saveSkills([...currentSkills, label], label);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-slate-950">
        <LoadingSpinner
          size="lg"
          text="Mapping skills network and local wage opportunities..."
        />
      </div>
    );
  }

  if (error || !graph) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="max-w-xl text-center">
          <CircleAlert className="mx-auto h-10 w-10 text-amber-400" />
          <h1 className="mt-4 text-xl font-black text-white">
            Your knowledge map is not ready
          </h1>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <Link
            to="/profile"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 shadow-md"
          >
            Add skills to your profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const frontierNodes = graph.nodes.filter(
    (node) => node.status === "frontier",
  );
  const tabs: { id: PanelTab; label: string; icon: typeof Network }[] = [
    { id: "overview", label: "Overview", icon: Network },
    { id: "growth", label: "Growth", icon: Radar },
    { id: "roles", label: "Roles", icon: BriefcaseBusiness },
  ];

  return (
    <div
      className={`grid h-[calc(100dvh-4rem)] overflow-hidden bg-slate-950 grid-rows-[minmax(260px,45vh)_minmax(0,1fr)] lg:grid-rows-1 ${
        panelOpen
          ? "lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px]"
          : "lg:grid-cols-[minmax(0,1fr)_0px]"
      }`}
    >
      <section
        className="relative min-h-0 overflow-hidden bg-slate-950"
        aria-label="Knowledge graph workspace"
      >
        <KnowledgeGraphCanvas
          nodes={graph.nodes}
          edges={graph.edges}
          selectedNodeId={selectedNode?.id}
          activeSector={activeSector}
          expandingNodeId={expandingNodeId ?? undefined}
          onSelect={selectNode}
          onExpand={expandFrontier}
        />

        {expansionError && (
          <div
            role="alert"
            className="absolute bottom-4 left-4 z-20 flex max-w-sm items-start gap-2 rounded-xl border border-rose-500/40 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-rose-300 shadow-xl"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{expansionError}</span>
            <button
              type="button"
              onClick={() => setExpansionError(null)}
              className="ml-auto p-0.5 text-rose-400 hover:text-white"
              aria-label="Dismiss expansion error"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {!panelOpen && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="absolute right-4 top-4 hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-200 shadow-xl hover:bg-slate-800 hover:text-white lg:flex backdrop-blur-md"
          >
            <PanelRightOpen className="h-4 w-4 text-emerald-400" /> Open
            Insights
          </button>
        )}
      </section>

      <aside
        className={`min-h-0 overflow-hidden border-t border-slate-800 bg-slate-900/95 lg:border-l lg:border-t-0 ${panelOpen ? "" : "lg:hidden"} text-slate-100`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-slate-800 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xs font-bold uppercase text-emerald-400">
                  Knowledge frontier
                </h1>
                <p className="mt-0.5 text-xs font-mono font-bold text-slate-400">
                  {graph.stats.current_skills} aptitudes ·{" "}
                  {graph.stats.current_interests} passions ·{" "}
                  {graph.stats.frontier_skills} frontier
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:block transition-colors"
                aria-label="Close insights panel"
                title="Close panel"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>

            {selectedNode && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-950 p-3.5 border border-slate-800">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${selectedNode.kind === "interest" ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : selectedNode.status === "frontier" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}
                >
                  {selectedNode.kind === "interest" ? (
                    <Heart className="h-4 w-4" />
                  ) : selectedNode.status === "frontier" ? (
                    <Target className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate text-base font-black text-white">
                      {selectedNode.label}
                    </h2>
                    <span
                      className={`shrink-0 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${selectedNode.kind === "interest" ? "bg-teal-500/20 text-teal-300" : selectedNode.status === "frontier" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}
                    >
                      {selectedNode.kind === "interest"
                        ? "Interest"
                        : selectedNode.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {selectedNode.reason}
                  </p>
                  {selectedNode.kind === "skill" &&
                    selectedNode.status === "frontier" && (
                      <button
                        type="button"
                        onClick={() => addSkill(selectedNode.label)}
                        disabled={savingSkills}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 transition-all shadow-md cursor-pointer"
                        aria-label={`Add ${selectedNode.label} to my skills`}
                      >
                        {savingSkills ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        Add to my skills
                      </button>
                    )}
                </div>
              </div>
            )}
          </div>

          <div
            className="grid shrink-0 grid-cols-3 border-b border-slate-800 bg-slate-950/40"
            role="tablist"
            aria-label="Knowledge insights"
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-xs font-bold transition-all ${
                  activeTab === id
                    ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <section className="grid grid-cols-2 gap-2">
                  {[
                    [graph.stats.current_skills, "Skills Mapped"],
                    [graph.stats.current_interests, "Interests"],
                    [graph.stats.frontier_skills, "Frontier Targets"],
                    [graph.stats.roles_in_reach, "Living Wage Roles"],
                  ].map(([value, label]) => (
                    <div
                      key={String(label)}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-center"
                    >
                      <p className="text-xl font-black text-white">{value}</p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">
                        {label}
                      </p>
                    </div>
                  ))}
                </section>

                <section className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                        Sector Outlook
                      </p>
                      <h3 className="text-sm font-black text-white">
                        Local Industrial Demand
                      </h3>
                    </div>
                    {activeSector !== "All sectors" && (
                      <button
                        type="button"
                        onClick={() => setActiveSector("All sectors")}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        aria-label="Clear sector filter"
                        title="Clear filter"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {graph.sectors.map((sector) => (
                      <button
                        key={sector.name}
                        type="button"
                        onClick={() =>
                          setActiveSector(
                            activeSector === sector.name
                              ? "All sectors"
                              : sector.name,
                          )
                        }
                        className={`w-full rounded-xl border p-3 text-left transition-all cursor-pointer ${activeSector === sector.name ? "border-emerald-500 bg-emerald-950/40 text-white" : "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-white">
                            {sector.name}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {sector.fit_score}% Fit
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            style={{ width: `${sector.fit_score}%` }}
                          />
                        </div>
                        <p className="mt-2 text-[10px] font-mono text-slate-400">
                          {sector.matching_skills.length} matching ·{" "}
                          {sector.opportunity_count} roles
                        </p>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <h3 className="flex items-center gap-1.5 text-sm font-black text-white">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    Manage Skills & Passions
                  </h3>

                  <div>
                    <ProfileTagSelector
                      id="knowledge-skill-input"
                      label="Skills"
                      options={COMMON_SKILLS}
                      values={currentSkills}
                      placeholder="Add a skill"
                      busy={savingSkills}
                      error={skillError}
                      onChange={(values, addedValue) => {
                        void saveSkills(values, addedValue);
                      }}
                    />
                  </div>

                  <div className="border-t border-slate-800 pt-4">
                    <ProfileTagSelector
                      id="knowledge-interest-input"
                      label="Interests"
                      options={COMMON_INTERESTS}
                      values={currentInterests}
                      placeholder="Add an interest"
                      tone="teal"
                      busy={savingInterests}
                      error={interestError}
                      onChange={(values, addedValue) => {
                        void saveInterests(values, addedValue);
                      }}
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === "growth" && (
              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                    Frontier Nodes
                  </p>
                  <h3 className="text-sm font-black text-white">
                    High-ROI Skills to Learn Next
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Ranked by real vacancies posted by local SMEs.
                  </p>
                </div>
                <div className="space-y-2">
                  {frontierNodes.map((node, index) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => selectNode(node)}
                      className={`flex w-full items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${selectedNode?.id === node.id ? "bg-amber-950/40 border-amber-500/50" : "bg-slate-950 border-slate-800 hover:bg-slate-800/60"}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 font-mono text-xs font-black">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-white">
                          {node.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] font-mono text-slate-400">
                          {node.category} · {node.opportunity_count} live roles
                        </span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "roles" && (
              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                    Live Opportunities
                  </p>
                  <h3 className="text-sm font-black text-white">
                    {selectedNode
                      ? `Connected to ${selectedNode.label}`
                      : "Connected roles"}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {visibleRoles.length} vacancies in reach
                  </p>
                </div>
                <div className="space-y-2.5">
                  {visibleRoles.map((role) => (
                    <article
                      key={role.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono text-slate-400 uppercase">
                            {role.sector} ·{" "}
                            {formatWorkplace(role.workplace_type)}
                          </p>
                          <h4 className="mt-0.5 text-xs font-black text-white">
                            {role.title}
                          </h4>
                        </div>
                        <div className="shrink-0 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 text-center text-emerald-300 font-mono">
                          <p className="text-xs font-black">
                            {role.fit_score}%
                          </p>
                        </div>
                      </div>
                      <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <Building2 className="h-3 w-3 text-slate-500" />{" "}
                          {role.business_name || "Organisation Name"}
                        </span>
                        {role.location_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-emerald-400" />{" "}
                            {role.location_name}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {role.matched_skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {role.missing_skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-amber-500/30 bg-amber-950/60 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300"
                          >
                            Grow: {skill}
                          </span>
                        ))}
                      </div>
                      <Link
                        to={`/opportunities/${role.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1"
                      >
                        View Opportunity Details{" "}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
