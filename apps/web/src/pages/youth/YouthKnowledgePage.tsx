import React, { useEffect, useMemo, useState } from "react";
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
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [activeSector, setActiveSector] = useState("All sectors");
  const [activeTab, setActiveTab] = useState<PanelTab>("overview");
  const [panelOpen, setPanelOpen] = useState(true);
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [currentInterests, setCurrentInterests] = useState<string[]>([]);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingInterests, setSavingInterests] = useState(false);
  const [skillError, setSkillError] = useState<string | null>(null);
  const [interestError, setInterestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([profilesApi.getMyKnowledgeGraph(), profilesApi.getMyProfile()])
      .then(([data, profile]) => {
        setGraph(data);
        setCurrentSkills(profile.skills || []);
        setCurrentInterests(profile.interests || []);
        setSelectedNode(
          data.nodes.find((node) => node.status === "frontier") ?? data.nodes[0] ?? null,
        );
      })
      .catch((err) => setError(err.message || "Could not build your knowledge map."))
      .finally(() => setLoading(false));
  }, []);

  const visibleRoles = useMemo(() => {
    if (!graph) return [];
    let roles = graph.opportunities;
    if (activeSector !== "All sectors") {
      roles = roles.filter((role) => role.sector === activeSector);
    }
    if (selectedNode) {
      const connectedSkillLabels = selectedNode.kind === "interest"
        ? graph.edges
            .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
            .map((edge) => edge.source === selectedNode.id ? edge.target : edge.source)
            .map((nodeId) => graph.nodes.find((node) => node.id === nodeId))
            .filter((node): node is KnowledgeGraphNode => Boolean(node?.kind === "skill"))
            .map((node) => node.label.toLowerCase())
        : [selectedNode.label.toLowerCase()];
      const related = roles.filter((role) =>
        [...role.matched_skills, ...role.missing_skills].some(
          (skill) => connectedSkillLabels.includes(skill.toLowerCase()),
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

  const saveSkills = async (nextSkills: string[], preferredSkill?: string) => {
    if (!graph || savingSkills) return;
    setSavingSkills(true);
    setSkillError(null);

    try {
      const updatedProfile = await profilesApi.updateMyProfile({ skills: nextSkills });
      setCurrentSkills(updatedProfile.skills ?? nextSkills);
      const updatedGraph = await profilesApi.getMyKnowledgeGraph();
      setGraph(updatedGraph);

      const preferred = preferredSkill
        ? updatedGraph.nodes.find(
            (node) => node.kind === "skill"
              && node.label.toLowerCase() === preferredSkill.toLowerCase(),
          )
        : undefined;
      const retained = selectedNode
        ? updatedGraph.nodes.find((node) => node.id === selectedNode.id)
        : undefined;
      setSelectedNode(
        preferred
        ?? retained
        ?? updatedGraph.nodes.find((node) => node.status === "frontier")
        ?? updatedGraph.nodes[0]
        ?? null,
      );
    } catch (err: any) {
      setSkillError(err.message || "Could not update your skills.");
    } finally {
      setSavingSkills(false);
    }
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (currentSkills.some((current) => current.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    void saveSkills([...currentSkills, trimmed], trimmed);
  };

  const saveInterests = async (nextInterests: string[], preferredInterest?: string) => {
    if (!graph || savingInterests) return;
    setSavingInterests(true);
    setInterestError(null);

    try {
      const updatedProfile = await profilesApi.updateMyProfile({ interests: nextInterests });
      setCurrentInterests(updatedProfile.interests ?? nextInterests);
      const updatedGraph = await profilesApi.getMyKnowledgeGraph();
      setGraph(updatedGraph);

      const preferred = preferredInterest
        ? updatedGraph.nodes.find(
            (node) => node.kind === "interest"
              && node.label.toLowerCase() === preferredInterest.toLowerCase(),
          )
        : undefined;
      const retained = selectedNode
        ? updatedGraph.nodes.find((node) => node.id === selectedNode.id)
        : undefined;
      setSelectedNode(
        preferred
        ?? retained
        ?? updatedGraph.nodes.find((node) => node.status === "frontier")
        ?? updatedGraph.nodes[0]
        ?? null,
      );
    } catch (err: any) {
      setInterestError(err.message || "Could not update your interests.");
    } finally {
      setSavingInterests(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Mapping your skills and nearby opportunities..." />
      </div>
    );
  }

  if (error || !graph) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-xl text-center">
          <CircleAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Your knowledge map is not ready</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Link to="/profile" className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
            Add skills to your profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const frontierNodes = graph.nodes.filter((node) => node.status === "frontier");
  const tabs: { id: PanelTab; label: string; icon: typeof Network }[] = [
    { id: "overview", label: "Overview", icon: Network },
    { id: "growth", label: "Growth", icon: Radar },
    { id: "roles", label: "Roles", icon: BriefcaseBusiness },
  ];

  return (
    <div
      className={`grid h-[calc(100dvh-4rem)] overflow-hidden bg-slate-100 grid-rows-[minmax(260px,45vh)_minmax(0,1fr)] lg:grid-rows-1 ${
        panelOpen
          ? "lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px]"
          : "lg:grid-cols-[minmax(0,1fr)_0px]"
      }`}
    >
      <section className="relative min-h-0 overflow-hidden" aria-label="Knowledge graph workspace">
        <KnowledgeGraphCanvas
          nodes={graph.nodes}
          edges={graph.edges}
          selectedNodeId={selectedNode?.id}
          activeSector={activeSector}
          onSelect={selectNode}
        />

        {!panelOpen && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="uk-focus-ring absolute right-4 top-20 hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 lg:flex"
          >
            <PanelRightOpen className="h-4 w-4" /> Open insights
          </button>
        )}
      </section>

      <aside className={`min-h-0 overflow-hidden border-t border-slate-200 bg-white lg:border-l lg:border-t-0 ${panelOpen ? "" : "lg:hidden"}`}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-slate-200 px-4 pb-4 pt-4 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xs font-bold uppercase text-emerald-700">Knowledge frontier</h1>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{graph.stats.current_skills} skills · {graph.stats.current_interests} interests · {graph.stats.frontier_skills} next steps</p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="uk-focus-ring hidden p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:block"
                aria-label="Close insights panel"
                title="Close panel"
              >
                <PanelRightClose className="h-5 w-5" />
              </button>
            </div>

            {selectedNode && (
              <div className="mt-4 flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${selectedNode.kind === "interest" ? "bg-teal-100 text-teal-700" : selectedNode.status === "frontier" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {selectedNode.kind === "interest" ? <Heart className="h-5 w-5" /> : selectedNode.status === "frontier" ? <Target className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate text-lg font-bold text-slate-950">{selectedNode.label}</h2>
                    <span className={`shrink-0 text-[10px] font-bold uppercase ${selectedNode.kind === "interest" ? "text-teal-700" : selectedNode.status === "frontier" ? "text-amber-700" : "text-emerald-700"}`}>
                      {selectedNode.kind === "interest" ? "interest" : selectedNode.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{selectedNode.reason}</p>
                  {selectedNode.kind === "skill" && selectedNode.status === "frontier" && (
                    <button
                      type="button"
                      onClick={() => addSkill(selectedNode.label)}
                      disabled={savingSkills}
                      className="uk-focus-ring mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
                      aria-label={`Add ${selectedNode.label} to my skills`}
                    >
                      {savingSkills ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Add to my skills
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid shrink-0 grid-cols-3 border-b border-slate-200" role="tablist" aria-label="Knowledge insights">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={`uk-focus-ring flex items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-xs font-bold ${
                  activeTab === id
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {activeTab === "overview" && (
              <div className="divide-y divide-slate-200">
                <section className="grid grid-cols-2 gap-px bg-slate-200">
                  {[
                    [graph.stats.current_skills, "Skills mapped"],
                    [graph.stats.current_interests, "Interests mapped"],
                    [graph.stats.frontier_skills, "Frontier skills"],
                    [graph.stats.roles_in_reach, "Open roles"],
                  ].map(([value, label]) => (
                    <div key={String(label)} className="bg-white px-5 py-3">
                      <p className="text-lg font-bold text-slate-950">{value}</p>
                      <p className="text-xs text-slate-500">{label}</p>
                    </div>
                  ))}
                </section>

                <section className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-emerald-700">Sector outlook</p>
                      <h3 className="mt-1 text-base font-bold text-slate-950">Where your graph travels</h3>
                    </div>
                    {activeSector !== "All sectors" && (
                      <button type="button" onClick={() => setActiveSector("All sectors")} className="uk-focus-ring p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Clear sector filter" title="Clear filter">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    {graph.sectors.map((sector) => (
                      <button
                        key={sector.name}
                        type="button"
                        onClick={() => setActiveSector(activeSector === sector.name ? "All sectors" : sector.name)}
                        className={`uk-focus-ring w-full rounded-md border p-3 text-left ${activeSector === sector.name ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold text-slate-900">{sector.name}</span>
                          <span className="text-sm font-bold text-emerald-700">{sector.fit_score}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${sector.fit_score}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{sector.matching_skills.length} matching · {sector.frontier_skills.length} nearby · {sector.opportunity_count} roles</p>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="p-5">
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Skills & Interests
                  </h3>

                  <div className="mt-4">
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

                  <div className="mt-5 border-t border-slate-100 pt-5">
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
              <div>
                <div className="border-b border-slate-200 p-5">
                  <p className="text-xs font-bold uppercase text-emerald-700">Growth paths</p>
                  <h3 className="mt-1 text-base font-bold text-slate-950">Skills closest to your frontier</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Ranked by connections to your graph and demand in live roles.</p>
                </div>
                <div className="divide-y divide-slate-200">
                  {frontierNodes.map((node, index) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => selectNode(node)}
                      className={`uk-focus-ring flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 ${selectedNode?.id === node.id ? "bg-amber-50" : ""}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">{index + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-slate-900">{node.label}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{node.category} · {node.opportunity_count} roles</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "roles" && (
              <div>
                <div className="border-b border-slate-200 p-5">
                  <p className="text-xs font-bold uppercase text-emerald-700">Role relevance</p>
                  <h3 className="mt-1 text-base font-bold text-slate-950">{selectedNode ? `Connected to ${selectedNode.label}` : "Connected roles"}</h3>
                  <p className="mt-1 text-xs text-slate-500">{visibleRoles.length} role{visibleRoles.length === 1 ? "" : "s"} in view</p>
                </div>
                <div className="divide-y divide-slate-200">
                  {visibleRoles.map((role) => (
                    <article key={role.id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-500">{role.sector} · <span className="capitalize">{formatWorkplace(role.workplace_type)}</span></p>
                          <h4 className="mt-1 text-sm font-bold leading-5 text-slate-950">{role.title}</h4>
                        </div>
                        <div className="shrink-0 rounded-md bg-emerald-50 px-2.5 py-1.5 text-center text-emerald-800">
                          <p className="text-sm font-bold">{role.fit_score}%</p>
                          <p className="text-[9px] font-bold uppercase">fit</p>
                        </div>
                      </div>
                      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {role.business_name || "Organisation"}</span>
                        {role.location_name && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {role.location_name}</span>}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {role.matched_skills.map((skill) => <span key={skill} className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800">{skill}</span>)}
                        {role.missing_skills.map((skill) => <span key={skill} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800">Grow: {skill}</span>)}
                      </div>
                      <Link to={`/opportunities/${role.id}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900">
                        View opportunity <ArrowRight className="h-3.5 w-3.5" />
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
