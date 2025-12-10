import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GridProblem, SearchStep, ToolMode } from "@shared/schema";
import { gridCellToId } from "@shared/schema";

interface GridCanvasProps {
  problem: GridProblem;
  currentStep: SearchStep | null;
  selectedTool: ToolMode;
  showCosts: boolean;
  onCellClick: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
}

export function GridCanvas({
  problem,
  currentStep,
  selectedTool,
  showCosts,
  onCellClick,
  onCellDrag,
}: GridCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cellSize, setCellSize] = useState(30);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const cellLookup = useMemo(() => {
    const map = new Map<string, { cell: typeof problem.cells[0]; index: number }>();
    problem.cells.forEach((cell, index) => {
      map.set(`${cell.row}-${cell.col}`, { cell, index });
    });
    return map;
  }, [problem.cells]);

  const stepData = useMemo(() => {
    if (!currentStep) return { frontierSet: new Set<string>(), visitedSet: new Set<string>(), pathSet: new Set<string>() };
    return {
      frontierSet: new Set(currentStep.frontier),
      visitedSet: new Set(currentStep.visited),
      pathSet: new Set(currentStep.path ?? []),
    };
  }, [currentStep]);

  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32;
        const containerHeight = containerRef.current.clientHeight - 32;
        const maxCellWidth = Math.floor(containerWidth / problem.cols);
        const maxCellHeight = Math.floor(containerHeight / problem.rows);
        const newCellSize = Math.max(20, Math.min(50, Math.min(maxCellWidth, maxCellHeight)));
        setCellSize(newCellSize);
      }
    };

    updateCellSize();
    const resizeObserver = new ResizeObserver(updateCellSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [problem.rows, problem.cols]);

  const getCellState = useCallback(
    (row: number, col: number): string => {
      const cellId = gridCellToId(row, col);
      const entry = cellLookup.get(`${row}-${col}`);
      const cell = entry?.cell;

      if (!cell) return "unvisited";
      if (cell.isObstacle) return "obstacle";
      if (cell.isStart) return "start";
      if (cell.isGoal) return "goal";

      if (currentStep) {
        if (stepData.pathSet.has(cellId)) return "path";
        if (currentStep.currentNode === cellId) return "current";
        if (stepData.frontierSet.has(cellId)) return "frontier";
        if (stepData.visitedSet.has(cellId)) return "visited";
      }

      return "unvisited";
    },
    [cellLookup, currentStep, stepData]
  );

  const getCellColor = (state: string): string => {
    switch (state) {
      case "start":
        return "bg-node-start text-white";
      case "goal":
        return "bg-node-goal text-white";
      case "obstacle":
        return "bg-node-obstacle";
      case "frontier":
        return "bg-node-frontier/30 border-node-frontier border-2";
      case "visited":
        return "bg-node-visited";
      case "current":
        return "bg-node-current animate-pulse";
      case "path":
        return "bg-node-path text-white";
      default:
        return "bg-card hover:bg-muted/50";
    }
  };

  const handleMouseDown = useCallback((row: number, col: number) => {
    setIsDragging(true);
    onCellClick(row, col);
  }, [onCellClick]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    setHoveredCell({ row, col });
    if (isDragging && (selectedTool === "addObstacle" || selectedTool === "removeObstacle")) {
      onCellDrag(row, col);
    }
  }, [isDragging, selectedTool, onCellDrag]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const getCellCosts = useCallback((row: number, col: number) => {
    if (!currentStep) return null;
    const cellId = gridCellToId(row, col);
    const g = currentStep.gValues[cellId];
    const h = currentStep.hValues[cellId];
    const f = currentStep.fValues[cellId];
    if (g === undefined && h === undefined && f === undefined) return null;
    return { g, h, f };
  }, [currentStep]);

  const gridWidth = problem.cols * cellSize + (problem.cols - 1);
  const gridHeight = problem.rows * cellSize + (problem.rows - 1);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-4 overflow-auto"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      data-testid="grid-canvas"
    >
      <div
        className="grid gap-px bg-border rounded-lg overflow-hidden shadow-sm"
        style={{
          gridTemplateColumns: `repeat(${problem.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${problem.rows}, ${cellSize}px)`,
          width: gridWidth,
          height: gridHeight,
        }}
      >
        {problem.cells.map((cell) => {
          const state = getCellState(cell.row, cell.col);
          const costs = showCosts ? getCellCosts(cell.row, cell.col) : null;
          const isHovered = hoveredCell?.row === cell.row && hoveredCell?.col === cell.col;

          const cellContent = (
            <div
              key={`${cell.row}-${cell.col}`}
              className={`
                relative flex items-center justify-center cursor-pointer
                transition-colors duration-150
                ${getCellColor(state)}
                ${isHovered && selectedTool !== "select" ? "ring-2 ring-primary ring-inset" : ""}
              `}
              style={{ width: cellSize, height: cellSize }}
              onMouseDown={() => handleMouseDown(cell.row, cell.col)}
              onMouseEnter={() => handleMouseEnter(cell.row, cell.col)}
              onMouseLeave={handleMouseLeave}
              data-testid={`cell-${cell.row}-${cell.col}`}
            >
              {state === "start" && (
                <span className="text-[10px] font-bold">S</span>
              )}
              {state === "goal" && (
                <span className="text-[10px] font-bold">G</span>
              )}
              {costs && cellSize >= 35 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[8px] font-mono leading-tight">
                  {costs.g !== undefined && (
                    <span className="text-foreground/70">g:{costs.g.toFixed(1)}</span>
                  )}
                  {costs.h !== undefined && (
                    <span className="text-foreground/70">h:{costs.h.toFixed(1)}</span>
                  )}
                  {costs.f !== undefined && (
                    <span className="font-semibold text-foreground">f:{costs.f.toFixed(1)}</span>
                  )}
                </div>
              )}
            </div>
          );

          if (costs && cellSize < 35) {
            return (
              <Tooltip key={`${cell.row}-${cell.col}`}>
                <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                <TooltipContent side="top" className="font-mono text-xs">
                  <div className="space-y-0.5">
                    {costs.g !== undefined && <p>g(n) = {costs.g.toFixed(2)}</p>}
                    {costs.h !== undefined && <p>h(n) = {costs.h.toFixed(2)}</p>}
                    {costs.f !== undefined && <p>f(n) = {costs.f.toFixed(2)}</p>}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }

          return cellContent;
        })}
      </div>
    </div>
  );
}
