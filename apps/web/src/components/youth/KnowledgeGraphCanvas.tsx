import React, { useMemo, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import {
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
} from "@springboard/shared-types";

interface Props {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  selectedNodeId?: string;
  activeSector?: string;
  onSelect: (node: KnowledgeGraphNode) => void;
}

interface PositionedNode extends KnowledgeGraphNode {
  x: number;
  y: number;
}

const WIDTH = 900;
const HEIGHT = 560;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

function placeNodes(nodes: KnowledgeGraphNode[]): PositionedNode[] {
  const current = nodes.filter((node) => node.status === "current");
  const frontier = nodes.filter((node) => node.status === "frontier");
  const placeRing = (
    ring: KnowledgeGraphNode[],
    radiusX: number,
    radiusY: number,
    offset: number,
  ) =>
    ring.map((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(ring.length, 1) - Math.PI / 2 + offset;
      return {
        ...node,
        x: CENTER_X + Math.cos(angle) * radiusX,
        y: CENTER_Y + Math.sin(angle) * radiusY,
      };
    });

  return [
    ...placeRing(current, 155, 118, 0),
    ...placeRing(frontier, 340, 220, Math.PI / Math.max(frontier.length, 1)),
  ];
}

function labelLines(label: string): string[] {
  if (label.length <= 14) return [label];
  const words = label.split(" ");
  if (words.length === 1) return [label];
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

export const KnowledgeGraphCanvas: React.FC<Props> = ({
  nodes,
  edges,
  selectedNodeId,
  activeSector,
  onSelect,
}) => {
  const [zoom, setZoom] = useState(1);
  const positioned = useMemo(() => placeNodes(nodes), [nodes]);
  const positions = useMemo(
    () => new Map(positioned.map((node) => [node.id, node])),
    [positioned],
  );

  const isDimmed = (node: KnowledgeGraphNode) =>
    Boolean(activeSector && activeSector !== "All sectors" && node.sector !== activeSector);

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-slate-50">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}
          className="uk-focus-ring p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="uk-focus-ring p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((value) => Math.min(1.3, value + 0.1))}
          className="uk-focus-ring p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <svg
        className="h-full w-full"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Interactive map of current and frontier skills"
      >
        <g transform={`translate(${CENTER_X * (1 - zoom)} ${CENTER_Y * (1 - zoom)}) scale(${zoom})`}>
          {edges.map((edge) => {
            const source = positions.get(edge.source);
            const target = positions.get(edge.target);
            if (!source || !target) return null;
            const faded = isDimmed(source) && isDimmed(target);
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={edge.relationship === "used_together" ? "#94a3b8" : "#cbd5e1"}
                strokeWidth={edge.relationship === "used_together" ? 2 : 1.5}
                strokeDasharray={edge.relationship === "related" ? "5 6" : undefined}
                opacity={faded ? 0.18 : 0.75}
              />
            );
          })}

          <circle cx={CENTER_X} cy={CENTER_Y} r="205" fill="none" stroke="#dbe4ea" strokeDasharray="3 8" />
          <circle cx={CENTER_X} cy={CENTER_Y} r="82" fill="#ecfdf5" stroke="#a7f3d0" />
          <text x={CENTER_X} y={CENTER_Y - 7} textAnchor="middle" className="fill-emerald-900 text-[17px] font-bold">
            Your knowledge
          </text>
          <text x={CENTER_X} y={CENTER_Y + 17} textAnchor="middle" className="fill-emerald-700 text-[12px] font-semibold">
            {nodes.filter((node) => node.status === "current").length} skills
          </text>

          {positioned.map((node) => {
            const current = node.status === "current";
            const selected = node.id === selectedNodeId;
            const dimmed = isDimmed(node);
            const lines = labelLines(node.label);
            const radius = current ? 48 : 42;
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`${node.label}, ${current ? "current skill" : "frontier skill"}`}
                onClick={() => onSelect(node)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(node);
                  }
                }}
                className="cursor-pointer outline-none"
                opacity={dimmed ? 0.28 : 1}
              >
                {selected && (
                  <circle cx={node.x} cy={node.y} r={radius + 7} fill="none" stroke="#0f766e" strokeWidth="3" />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={current ? "#047857" : "#fffbeb"}
                  stroke={current ? "#065f46" : "#f59e0b"}
                  strokeWidth={current ? 2 : 3}
                />
                <text
                  x={node.x}
                  y={node.y - (lines.length - 1) * 8}
                  textAnchor="middle"
                  className={`${current ? "fill-white" : "fill-amber-950"} text-[12px] font-bold`}
                >
                  {lines.map((line, index) => (
                    <tspan key={line} x={node.x} dy={index === 0 ? 0 : 16}>
                      {line}
                    </tspan>
                  ))}
                </text>
                {!current && node.opportunity_count > 0 && (
                  <g>
                    <circle cx={node.x + 31} cy={node.y - 31} r="13" fill="#f59e0b" />
                    <text x={node.x + 31} y={node.y - 27} textAnchor="middle" className="fill-white text-[10px] font-bold">
                      {node.opportunity_count}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
