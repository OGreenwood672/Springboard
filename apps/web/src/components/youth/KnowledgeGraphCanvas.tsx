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
import {
  GitBranchPlus,
  LoaderCircle,
} from "lucide-react";
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
  const current = nodes.filter((node) => node.kind === "skill" && node.status === "current");
  const interests = nodes.filter((node) => node.kind === "interest");
  const frontier = nodes.filter((node) => node.kind === "skill" && node.status === "frontier");
  const isDimmed = (node: KnowledgeGraphNode) =>
    Boolean(activeSector && activeSector !== "All sectors" && !node.sectors.includes(activeSector));

  const placeRing = (
    ring: KnowledgeGraphNode[],
    radiusX: number,
    radiusY: number,
    angleOffset: number,
  ): SkillFlowNode[] =>
    ring.map((skill, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(ring.length, 1) - Math.PI / 2 + angleOffset;
      return {
        id: skill.id,
        type: "skill",
        position: {
          x: CENTER_X + Math.cos(angle) * radiusX - NODE_WIDTH / 2,
          y: CENTER_Y + Math.sin(angle) * radiusY - NODE_HEIGHT / 2,
        },
        data: {
          skill,
          dimmed: isDimmed(skill),
          expanding: skill.id === expandingNodeId,
          onExpand,
        },
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        ariaLabel: `${skill.label}, ${skill.kind === "interest" ? "interest" : `${skill.status} skill`}`,
      };
    });

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
      className={`group skill-graph-node relative h-[76px] w-[174px] rounded-lg border px-3.5 py-3 shadow-sm transition-[opacity,box-shadow,border-color] ${
        interest
          ? "border-teal-700 bg-teal-700 text-white"
          : current
          ? "border-emerald-800 bg-emerald-800 text-white"
          : "border-amber-300 bg-white text-slate-900"
      } ${selected ? "skill-graph-node--selected" : ""}`}
      style={{ opacity: dimmed ? 0.3 : 1 }}
    >
      {[Position.Top, Position.Right, Position.Bottom, Position.Left].map((position) => (
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
      ))}

      <div className="flex items-center justify-between gap-2">
        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${interest ? "text-teal-50" : current ? "text-emerald-100" : "text-amber-700"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${interest ? "bg-teal-200" : current ? "bg-emerald-300" : "bg-amber-500"}`} />
          {interest ? "Interest" : current ? "Current" : "Frontier"}
        </span>
        {!interest && skill.opportunity_count > 0 && (
          <span className={`text-[10px] font-bold ${current ? "text-emerald-100" : "text-slate-500"}`}>
            {skill.opportunity_count} role{skill.opportunity_count === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <p className="mt-1 truncate text-sm font-bold" title={skill.label}>{skill.label}</p>
      <p className={`mt-0.5 truncate text-[10px] font-medium ${interest ? "text-teal-50" : current ? "text-emerald-100" : "text-slate-500"}`} title={skill.category}>
        {skill.category}
      </p>
      <button
        type="button"
        className="nodrag nopan uk-focus-ring absolute left-1/2 top-[calc(100%+6px)] z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-800 opacity-0 shadow-md transition-opacity hover:bg-slate-50 focus:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 disabled:cursor-wait disabled:opacity-100"
        onClick={(event) => {
          event.stopPropagation();
          onExpand(skill);
        }}
        disabled={expanding}
        aria-label={`Expand frontier from ${skill.label}`}
      >
        {expanding
          ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          : <GitBranchPlus className="h-3.5 w-3.5" />}
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
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<SkillFlowNode>(initialNodes);
  const { setCenter } = useReactFlow<SkillFlowNode>();

  useEffect(() => {
    setFlowNodes(
      placeNodes(nodes, activeSector, expandingNodeId, onExpand).map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    );
  }, [nodes, activeSector, expandingNodeId, onExpand, selectedNodeId, setFlowNodes]);

  useEffect(() => {
    setFlowNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
        data: {
          ...node.data,
          dimmed: Boolean(
            activeSector
            && activeSector !== "All sectors"
            && !node.data.skill.sectors.includes(activeSector),
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
    () => edges.flatMap((edge) => {
      const source = positions.get(edge.source);
      const target = positions.get(edge.target);
      if (!source || !target) return [];

      const connected = selectedNodeId === edge.source || selectedNodeId === edge.target;
      const relationshipColor = edge.relationship === "used_together"
        ? "#64748b"
        : edge.relationship === "interest_alignment"
          ? "#0f766e"
          : "#d97706";
      const sides = edgeSides(source, target);

      return [{
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: `source-${sides.source}`,
        targetHandle: `target-${sides.target}`,
        type: "default",
        interactionWidth: 20,
        focusable: false,
        selectable: false,
        style: {
          stroke: relationshipColor,
          strokeWidth: connected ? 2.8 : 1.5,
          strokeDasharray: edge.relationship === "related"
            ? "7 6"
            : edge.relationship === "interest_alignment"
              ? "2 6"
              : undefined,
          opacity: selectedNodeId ? (connected ? 0.95 : 0.1) : 0.45,
        },
      }];
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
      <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#cbd5e1" />
      <Controls
        position="top-right"
        orientation="horizontal"
        showInteractive={false}
        fitViewOptions={{ padding: 0.22, duration: 300 }}
        className="skill-graph-controls"
      />
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-slate-200 bg-white/95 px-3 py-2.5 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur">
        <p className="mb-2 font-bold uppercase text-slate-800">Connections</p>
        <div className="space-y-1.5">
          <span className="flex items-center gap-2"><span className="block h-0.5 w-7 bg-slate-500" /> Used together in a role</span>
          <span className="flex items-center gap-2"><span className="block w-7 border-t-2 border-dashed border-amber-600" /> Related growth path</span>
          <span className="flex items-center gap-2"><span className="block w-7 border-t-2 border-dotted border-teal-700" /> Aligned with an interest</span>
        </div>
        <p className="mb-1.5 mt-3 font-bold uppercase text-slate-800">Nodes</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-700" /> Skill</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-600" /> Interest</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-amber-500 bg-white" /> Frontier</span>
        </div>
      </div>
    </ReactFlow>
  );
};

export const KnowledgeGraphCanvas: React.FC<Props> = (props) => (
  <div className="relative h-full min-h-0 overflow-hidden bg-slate-50">
    <ReactFlowProvider>
      <GraphViewport {...props} />
    </ReactFlowProvider>
  </div>
);
