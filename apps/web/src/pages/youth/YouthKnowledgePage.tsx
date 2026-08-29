import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleAlert,
  MapPin,
  Network,
  PanelRightClose,
  PanelRightOpen,
  Radar,
  Target,
  X,
} from "lucide-react";
import { KnowledgeGraph, KnowledgeGraphNode } from "@springboard/shared-types";
import { profilesApi } from "../../api/profiles";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { KnowledgeGraphCanvas } from "../../components/youth/KnowledgeGraphCanvas";

type PanelTab = "overview" | "growth" | "roles";

const formatWorkplace = (value: string) => value.replace("_", " ");

export const YouthKnowledgePage: React.FC = () => {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [activeSector, setActiveSector] = useState("All sectors");
  const [activeTab, setActiveTab] = useState<PanelTab>("overview");
  const [panelOpen, setPanelOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    profilesApi
      .getMyKnowledgeGraph()
      .then((data) => {
        setGraph(data);
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
      const selected = selectedNode.label.toLowerCase();
      const related = roles.filter((role) =>
        [...role.matched_skills, ...role.missing_skills].some(
          (skill) => skill.toLowerCase() === selected,
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

        <div className="pointer-events-none absolute left-4 top-4 max-w-[calc(100%-11rem)] rounded-lg border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:left-6 sm:top-6 sm:max-w-none">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <Network className="h-4 w-4" /> Knowledge map
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Your knowledge frontier</h1>
          <p className="mt-1 hidden text-xs text-slate-500 sm:block">Select a skill to inspect its connections.</p>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-6 hidden flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur lg:flex">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-700" /> In your profile</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-50" /> Frontier</span>
        </div>

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
                <p className="text-xs font-bold uppercase text-slate-500">Graph insights</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{graph.stats.current_skills} skills · {graph.stats.frontier_skills} next steps · {graph.stats.roles_in_reach} roles</p>
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
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${selectedNode.status === "frontier" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {selectedNode.status === "frontier" ? <Target className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate text-lg font-bold text-slate-950">{selectedNode.label}</h2>
                    <span className={`shrink-0 text-[10px] font-bold uppercase ${selectedNode.status === "frontier" ? "text-amber-700" : "text-emerald-700"}`}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{selectedNode.reason}</p>
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
                    [graph.stats.frontier_skills, "Frontier skills"],
                    [graph.stats.sectors_in_reach, "Relevant sectors"],
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

                <div className="p-5">
                  <Link to="/profile" className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <BookOpen className="h-4 w-4" /> Update my skills
                  </Link>
                </div>
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
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{node.sector} · {node.opportunity_count} roles</span>
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
