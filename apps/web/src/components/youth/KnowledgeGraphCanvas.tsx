import React, { memo, useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Node,
  NodeProps,
  PanOnScrollMode,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GitBranchPlus, LoaderCircle } from "lucide-react";
import {
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
} from "@springboard/shared-types";

interface Props {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  selectedNodeId?: string;
  activeSector?: string;
  expandingNodeId?: string;
  onSelect: (node: KnowledgeGraphNode) => void;
  onExpand: (node: KnowledgeGraphNode) => void;
}

interface SkillNodeData extends Record<string, unknown> {
  skill: KnowledgeGraphNode;
  dimmed: boolean;
  expanding: boolean;
  onExpand: (node: KnowledgeGraphNode) => void;
}

type SkillFlowNode = Node<SkillNodeData, "skill">;

const NODE_WIDTH = 174;
const NODE_HEIGHT = 76;
const CENTER_X = 600;
const CENTER_Y = 440;

function placeNodes(
  nodes: KnowledgeGraphNode[],
  activeSector: string | undefined,
  expandingNodeId: string | undefined,
  onExpand: (node: KnowledgeGraphNode) => void,
): SkillFlowNode[] {
  const current = nodes.filter(
    (node) => node.kind === "skill" && node.status === "current",
  );
  const interests = nodes.filter((node) => node.kind === "interest");
  const frontier = nodes.filter(
    (node) => node.kind === "skill" && node.status === "frontier",
  );
  const isDimmed = (node: KnowledgeGraphNode) =>
    Boolean(
      activeSector &&
      activeSector !== "All sectors" &&
      !node.sectors.includes(activeSector),
    );

  const placeRing = (
    ringNodes: KnowledgeGraphNode[],
    radiusX: number,
    radiusY: number,
    angleOffset = 0,
  ): SkillFlowNode[] => {
    const total = ringNodes.length;
    if (total === 0) return [];
    return ringNodes.map((node, index) => {
      const angle = angleOffset + (2 * Math.PI * index) / total;
      return {
        id: node.id,
        type: "skill",
        position: {
          x: Math.round(CENTER_X + radiusX * Math.cos(angle) - NODE_WIDTH / 2),
          y: Math.round(CENTER_Y + radiusY * Math.sin(angle) - NODE_HEIGHT / 2),
        },
        data: {
          skill: node,
          dimmed: isDimmed(node),
          expanding: node.id === expandingNodeId,
          onExpand,
        },
      };
    });
  };

  return [
    ...placeRing(current, 235, 165, 0),
    ...placeRing(interests, 375, 270, Math.PI / Math.max(interests.length, 1)),
    ...placeRing(frontier, 535, 385, Math.PI / Math.max(frontier.length, 1)),
  ];
}

const handleStyle = {
  width: 2,
  height: 2,
  minWidth: 0,
  minHeight: 0,
  border: 0,
  opacity: 0,
  pointerEvents: "none" as const,
};

const SkillNode = memo(({ data, selected }: NodeProps<SkillFlowNode>) => {
  const { skill, dimmed, expanding, onExpand } = data;
  const current = skill.status === "current";
  const interest = skill.kind === "interest";

  return (
    <div
      className={`group skill-graph-node relative h-[76px] w-[174px] rounded-xl border px-3.5 py-2.5 shadow-xl transition-[opacity,box-shadow,border-color] ${
        interest
          ? "border-teal-500/50 bg-teal-950/90 text-teal-100"
          : current
            ? "border-emerald-500/50 bg-emerald-950/90 text-emerald-100"
            : "border-amber-400/50 bg-slate-900/95 text-amber-100"
      } ${selected ? "skill-graph-node--selected" : ""}`}
      style={{ opacity: dimmed ? 0.25 : 1 }}
    >
      {[Position.Top, Position.Right, Position.Bottom, Position.Left].map(
        (position) => (
          <React.Fragment key={position}>
            <Handle
              id={`target-${position}`}
              type="target"
              position={position}
              isConnectable={false}
              style={handleStyle}
            />
            <Handle
              id={`source-${position}`}
              type="source"
              position={position}
              isConnectable={false}
              style={handleStyle}
            />
          </React.Fragment>
        ),
      )}

      <div className="flex items-center justify-between gap-2">
        <span
          className={`flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider ${interest ? "text-teal-300" : current ? "text-emerald-300" : "text-amber-400"}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${interest ? "bg-teal-400" : current ? "bg-emerald-400" : "bg-amber-400"}`}
          />
          {interest ? "Interest" : current ? "Aptitude" : "Frontier"}
        </span>
        {!interest && skill.opportunity_count > 0 && (
          <span
            className={`text-[9px] font-mono font-bold ${current ? "text-emerald-300" : "text-amber-300"}`}
          >
            {skill.opportunity_count} role
            {skill.opportunity_count === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <p
        className="mt-1 truncate text-xs font-black text-white"
        title={skill.label}
      >
        {skill.label}
      </p>
      <p
        className={`truncate text-[10px] font-medium ${interest ? "text-teal-400" : current ? "text-emerald-400" : "text-slate-400"}`}
        title={skill.category}
      >
        {skill.category}
      </p>
      <button
        type="button"
        className="nodrag nopan uk-focus-ring absolute left-1/2 top-[calc(100%+6px)] z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-100 opacity-0 shadow-lg transition-opacity hover:bg-slate-700 focus:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 disabled:cursor-wait disabled:opacity-100"
        onClick={(event) => {
          event.stopPropagation();
          onExpand(skill);
        }}
        disabled={expanding}
        aria-label={`Expand frontier from ${skill.label}`}
      >
        {expanding ? (
          <LoaderCircle className="h-3 w-3 animate-spin text-emerald-400" />
        ) : (
          <GitBranchPlus className="h-3 w-3 text-emerald-400" />
        )}
        Expand frontier
      </button>
    </div>
  );
});

SkillNode.displayName = "SkillNode";

const nodeTypes = { skill: SkillNode };

function edgeSides(source: SkillFlowNode, target: SkillFlowNode) {
  const sourceCenter = {
    x: source.position.x + NODE_WIDTH / 2,
    y: source.position.y + NODE_HEIGHT / 2,
  };
  const targetCenter = {
    x: target.position.x + NODE_WIDTH / 2,
    y: target.position.y + NODE_HEIGHT / 2,
  };
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx >= 0
      ? { source: Position.Right, target: Position.Left }
      : { source: Position.Left, target: Position.Right };
  }
  return dy >= 0
    ? { source: Position.Bottom, target: Position.Top }
    : { source: Position.Top, target: Position.Bottom };
}

const GraphViewport: React.FC<Props> = ({
  nodes,
  edges,
  selectedNodeId,
  activeSector,
  expandingNodeId,
  onSelect,
  onExpand,
}) => {
  const initialNodes = useMemo(
    () => placeNodes(nodes, activeSector, expandingNodeId, onExpand),
    [nodes, activeSector, expandingNodeId, onExpand],
  );
  const [flowNodes, setFlowNodes, onNodesChange] =
    useNodesState<SkillFlowNode>(initialNodes);
  const { setCenter } = useReactFlow<SkillFlowNode>();

  useEffect(() => {
    setFlowNodes(
      placeNodes(nodes, activeSector, expandingNodeId, onExpand).map(
        (node) => ({
          ...node,
          selected: node.id === selectedNodeId,
        }),
      ),
    );
  }, [
    nodes,
    activeSector,
    expandingNodeId,
    onExpand,
    selectedNodeId,
    setFlowNodes,
  ]);

  useEffect(() => {
    setFlowNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
        data: {
          ...node.data,
          dimmed: Boolean(
            activeSector &&
            activeSector !== "All sectors" &&
            !node.data.skill.sectors.includes(activeSector),
          ),
        },
      })),
    );
  }, [activeSector, selectedNodeId, setFlowNodes]);

  const positions = useMemo(
    () => new Map(flowNodes.map((node) => [node.id, node])),
    [flowNodes],
  );

  const flowEdges = useMemo(
    () =>
      edges.flatMap((edge) => {
        const source = positions.get(edge.source);
        const target = positions.get(edge.target);
        if (!source || !target) return [];

        const connected =
          selectedNodeId === edge.source || selectedNodeId === edge.target;
        const relationshipColor =
          edge.relationship === "used_together"
            ? "#475569"
            : edge.relationship === "interest_alignment"
              ? "#0d9488"
              : "#d97706";
        const sides = edgeSides(source, target);

        return [
          {
            id: `${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
            sourceHandle: `source-${sides.source}`,
            targetHandle: `target-${sides.target}`,
            type: "smoothstep",
            animated: connected,
            style: {
              stroke: connected ? "#10b981" : relationshipColor,
              strokeWidth: connected ? 2.5 : 1.2,
              opacity: connected ? 1 : 0.45,
              strokeDasharray:
                edge.relationship === "related"
                  ? "6 4"
                  : edge.relationship === "interest_alignment"
                    ? "2 4"
                    : undefined,
            },
          },
        ];
      }),
    [edges, positions, selectedNodeId],
  );

  return (
    <ReactFlow<SkillFlowNode>
      nodes={flowNodes}
      edges={flowEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={(_, node) => onSelect(node.data.skill)}
      onNodeDoubleClick={(_, node) => {
        onSelect(node.data.skill);
        void setCenter(
          node.position.x + NODE_WIDTH / 2,
          node.position.y + NODE_HEIGHT / 2,
          { zoom: 1.35, duration: 350 },
        );
      }}
      fitView
      fitViewOptions={{ padding: 0.22, minZoom: 0.45, maxZoom: 1 }}
      minZoom={0.3}
      maxZoom={2.25}
      panOnDrag
      panOnScroll
      panOnScrollMode={PanOnScrollMode.Free}
      panOnScrollSpeed={0.8}
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      deleteKeyCode={null}
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      proOptions={{ hideAttribution: false }}
      aria-label="Interactive map of skills, interests, and growth opportunities"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1.2}
        color="#334155"
      />
      <Controls
        position="top-right"
        orientation="horizontal"
        showInteractive={false}
        fitViewOptions={{ padding: 0.22, duration: 300 }}
        className="skill-graph-controls"
      />
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-xl border border-slate-800 bg-slate-950/85 px-3.5 py-3 text-[10px] font-semibold text-slate-300 shadow-xl backdrop-blur-md">
        <p className="mb-2 font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Graph Topography
        </p>
        <div className="space-y-1.5">
          <span className="flex items-center gap-2">
            <span className="block h-0.5 w-6 bg-slate-500" /> Co-occuring Skill
          </span>
          <span className="flex items-center gap-2">
            <span className="block w-6 border-t-2 border-dashed border-amber-500" />{" "}
            Upward Growth Path
          </span>
          <span className="flex items-center gap-2">
            <span className="block w-6 border-t-2 border-dotted border-teal-500" />{" "}
            Interest Alignment
          </span>
        </div>
        <p className="mb-1.5 mt-3 font-mono font-bold uppercase tracking-wider text-white">
          Nodes
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Current
            Skill
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-400" /> Passion
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Frontier
            Skill
          </span>
        </div>
      </div>
    </ReactFlow>
  );
};

export const KnowledgeGraphCanvas: React.FC<Props> = (props) => (
  <div className="relative h-full min-h-0 overflow-hidden bg-slate-950">
    <ReactFlowProvider>
      <GraphViewport {...props} />
    </ReactFlowProvider>
  </div>
);
