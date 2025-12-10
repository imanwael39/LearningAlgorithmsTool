import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import type { GraphProblem, SearchStep, ToolMode } from "@shared/schema";

interface GraphCanvasProps {
  problem: GraphProblem;
  currentStep: SearchStep | null;
  selectedTool: ToolMode;
  showCosts: boolean;
  onNodeClick: (nodeId: string) => void;
  onCanvasClick: (x: number, y: number) => void;
  onNodeDrag: (nodeId: string, x: number, y: number) => void;
  onEdgeCreate: (fromId: string, toId: string) => void;
  selectedEdgeStart: string | null;
  onEdgeStartSelect: (nodeId: string | null) => void;
}

export function GraphCanvas({
  problem,
  currentStep,
  selectedTool,
  showCosts,
  onNodeClick,
  onCanvasClick,
  onNodeDrag,
  onEdgeCreate,
  selectedEdgeStart,
  onEdgeStartSelect,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const nodeRadius = 24;

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const parent = svgRef.current.parentElement;
        setDimensions({
          width: parent.clientWidth - 32,
          height: parent.clientHeight - 32,
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (svgRef.current?.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const stepData = useMemo(() => {
    if (!currentStep) {
      return { frontierSet: new Set<string>(), visitedSet: new Set<string>(), pathSet: new Set<string>() };
    }
    return {
      frontierSet: new Set(currentStep.frontier),
      visitedSet: new Set(currentStep.visited),
      pathSet: new Set(currentStep.path ?? []),
    };
  }, [currentStep]);

  const getNodeState = useCallback(
    (nodeId: string): string => {
      const node = problem.nodes.find((n) => n.id === nodeId);
      if (!node) return "unvisited";
      if (node.isStart) return "start";
      if (node.isGoal) return "goal";

      if (currentStep) {
        if (stepData.pathSet.has(nodeId)) return "path";
        if (currentStep.currentNode === nodeId) return "current";
        if (stepData.frontierSet.has(nodeId)) return "frontier";
        if (stepData.visitedSet.has(nodeId)) return "visited";
      }

      return "unvisited";
    },
    [problem.nodes, currentStep, stepData]
  );

  const getNodeColor = (state: string): { fill: string; stroke: string; text: string } => {
    switch (state) {
      case "start":
        return { fill: "hsl(142 76% 36%)", stroke: "hsl(142 76% 26%)", text: "#fff" };
      case "goal":
        return { fill: "hsl(0 84% 60%)", stroke: "hsl(0 84% 50%)", text: "#fff" };
      case "frontier":
        return { fill: "hsl(217 91% 60% / 0.3)", stroke: "hsl(217 91% 60%)", text: "currentColor" };
      case "visited":
        return { fill: "hsl(262 83% 58% / 0.4)", stroke: "hsl(262 83% 48%)", text: "currentColor" };
      case "current":
        return { fill: "hsl(27 87% 67%)", stroke: "hsl(27 87% 57%)", text: "#fff" };
      case "path":
        return { fill: "hsl(142 76% 50%)", stroke: "hsl(142 76% 40%)", text: "#fff" };
      default:
        return { fill: "hsl(var(--card))", stroke: "hsl(var(--border))", text: "currentColor" };
    }
  };

  const isEdgeInPath = useCallback((from: string, to: string): boolean => {
    if (!stepData.pathSet.size) return false;
    const path = currentStep?.path ?? [];
    for (let i = 0; i < path.length - 1; i++) {
      if ((path[i] === from && path[i + 1] === to) || (path[i] === to && path[i + 1] === from)) {
        return true;
      }
    }
    return false;
  }, [currentStep?.path, stepData.pathSet]);

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool === "addNode" && e.target === svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onCanvasClick(x, y);
    }
  }, [selectedTool, onCanvasClick]);

  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedTool === "select") {
      setDraggingNode(nodeId);
    } else if (selectedTool === "addEdge") {
      if (selectedEdgeStart === null) {
        onEdgeStartSelect(nodeId);
      } else if (selectedEdgeStart !== nodeId) {
        onEdgeCreate(selectedEdgeStart, nodeId);
        onEdgeStartSelect(null);
      }
    } else {
      onNodeClick(nodeId);
    }
  }, [selectedTool, selectedEdgeStart, onEdgeStartSelect, onEdgeCreate, onNodeClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNode && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = Math.max(nodeRadius, Math.min(dimensions.width - nodeRadius, e.clientX - rect.left));
      const y = Math.max(nodeRadius, Math.min(dimensions.height - nodeRadius, e.clientY - rect.top));
      onNodeDrag(draggingNode, x, y);
    }
  }, [draggingNode, dimensions, onNodeDrag]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  const getNodeCosts = useCallback((nodeId: string) => {
    if (!currentStep) return null;
    const g = currentStep.gValues[nodeId];
    const h = currentStep.hValues[nodeId];
    const f = currentStep.fValues[nodeId];
    if (g === undefined && h === undefined && f === undefined) return null;
    return { g, h, f };
  }, [currentStep]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4" data-testid="graph-canvas">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-card rounded-lg border border-card-border"
        onClick={handleSvgClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        data-testid="graph-svg"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" />
          </marker>
          <marker
            id="arrowhead-path"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(142 76% 50%)" />
          </marker>
        </defs>

        {problem.edges.map((edge, index) => {
          const fromNode = problem.nodes.find((n) => n.id === edge.from);
          const toNode = problem.nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const inPath = isEdgeInPath(edge.from, edge.to);
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) return null;
          const nx = dx / dist;
          const ny = dy / dist;

          const startX = fromNode.x + nx * nodeRadius;
          const startY = fromNode.y + ny * nodeRadius;
          const endX = toNode.x - nx * (nodeRadius + (problem.isDirected ? 8 : 0));
          const endY = toNode.y - ny * (nodeRadius + (problem.isDirected ? 8 : 0));

          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;

          return (
            <g key={`edge-${index}`} data-testid={`edge-${edge.from}-${edge.to}`}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={inPath ? "hsl(142 76% 50%)" : "hsl(var(--muted-foreground))"}
                strokeWidth={inPath ? 3 : 2}
                markerEnd={problem.isDirected ? (inPath ? "url(#arrowhead-path)" : "url(#arrowhead)") : undefined}
                className="transition-colors"
              />
              {edge.weight !== 1 && (
                <g>
                  <rect
                    x={midX - 12}
                    y={midY - 10}
                    width={24}
                    height={20}
                    rx={4}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    className="text-xs font-mono fill-current"
                  >
                    {edge.weight}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {problem.nodes.map((node) => {
          const state = getNodeState(node.id);
          const colors = getNodeColor(state);
          const costs = showCosts ? getNodeCosts(node.id) : null;
          const isSelected = selectedEdgeStart === node.id;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              className="cursor-pointer"
              data-testid={`node-${node.id}`}
            >
              <circle
                r={nodeRadius}
                fill={colors.fill}
                stroke={isSelected ? "hsl(var(--primary))" : colors.stroke}
                strokeWidth={isSelected ? 3 : 2}
                className={`transition-all ${state === "current" ? "animate-pulse" : ""}`}
              />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-semibold select-none pointer-events-none"
                fill={colors.text}
              >
                {node.label || node.id}
              </text>
              {costs && (
                <g transform="translate(0, 35)">
                  <rect
                    x={-28}
                    y={-8}
                    width={56}
                    height={state === "current" || state === "frontier" ? 38 : 16}
                    rx={4}
                    fill="hsl(var(--background) / 0.9)"
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    y={0}
                    className="text-[9px] font-mono fill-current"
                  >
                    {costs.g !== undefined && `g:${costs.g.toFixed(1)}`}
                  </text>
                  {(state === "current" || state === "frontier") && (
                    <>
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        y={10}
                        className="text-[9px] font-mono fill-current"
                      >
                        {costs.h !== undefined && `h:${costs.h.toFixed(1)}`}
                      </text>
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        y={20}
                        className="text-[9px] font-mono font-semibold fill-current"
                      >
                        {costs.f !== undefined && `f:${costs.f.toFixed(1)}`}
                      </text>
                    </>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {problem.nodes.length === 0 && (
          <text
            x={dimensions.width / 2}
            y={dimensions.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm fill-muted-foreground"
            data-testid="text-empty-state"
          >
            Click "Add Node" tool and click here to add nodes
          </text>
        )}
      </svg>
    </div>
  );
}
