import { z } from "zod";

// Algorithm types
export const algorithmTypes = [
  "bfs",
  "dfs",
  "ucs",
  "greedy",
  "astar",
  "hillClimbing",
  "beamSearch",
  "idaStar",
] as const;

export type AlgorithmType = (typeof algorithmTypes)[number];

export const algorithmNames: Record<AlgorithmType, string> = {
  bfs: "Breadth-First Search",
  dfs: "Depth-First Search",
  ucs: "Uniform Cost Search",
  greedy: "Greedy Best-First",
  astar: "A* Search",
  hillClimbing: "Hill Climbing",
  beamSearch: "Beam Search",
  idaStar: "IDA*",
};

export const coreAlgorithms: AlgorithmType[] = ["bfs", "dfs", "ucs", "greedy", "astar"];
export const optionalAlgorithms: AlgorithmType[] = ["hillClimbing", "beamSearch", "idaStar"];

// Problem types
export const problemTypes = ["grid", "graph"] as const;
export type ProblemType = (typeof problemTypes)[number];

// Node state for visualization
export const nodeStates = [
  "unvisited",
  "frontier",
  "visited",
  "current",
  "path",
  "start",
  "goal",
  "obstacle",
] as const;
export type NodeState = (typeof nodeStates)[number];

// Grid cell
export const gridCellSchema = z.object({
  row: z.number(),
  col: z.number(),
  isObstacle: z.boolean().default(false),
  isStart: z.boolean().default(false),
  isGoal: z.boolean().default(false),
  weight: z.number().default(1),
});

export type GridCell = z.infer<typeof gridCellSchema>;

// Graph node
export const graphNodeSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  label: z.string().optional(),
  isStart: z.boolean().default(false),
  isGoal: z.boolean().default(false),
  heuristic: z.number().optional(),
});

export type GraphNode = z.infer<typeof graphNodeSchema>;

// Graph edge
export const graphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  weight: z.number().default(1),
});

export type GraphEdge = z.infer<typeof graphEdgeSchema>;

// Grid problem
export const gridProblemSchema = z.object({
  type: z.literal("grid"),
  rows: z.number().min(3).max(50),
  cols: z.number().min(3).max(50),
  cells: z.array(gridCellSchema),
  start: z.object({ row: z.number(), col: z.number() }),
  goal: z.object({ row: z.number(), col: z.number() }),
  allowDiagonal: z.boolean().default(false),
});

export type GridProblem = z.infer<typeof gridProblemSchema>;

// Graph problem
export const graphProblemSchema = z.object({
  type: z.literal("graph"),
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
  startNodeId: z.string(),
  goalNodeId: z.string(),
  isDirected: z.boolean().default(false),
});

export type GraphProblem = z.infer<typeof graphProblemSchema>;

// Combined problem type
export const problemSchema = z.discriminatedUnion("type", [
  gridProblemSchema,
  graphProblemSchema,
]);

export type Problem = z.infer<typeof problemSchema>;

// Search step for visualization
export const searchStepSchema = z.object({
  stepNumber: z.number(),
  currentNode: z.string(),
  frontier: z.array(z.string()),
  visited: z.array(z.string()),
  parentMap: z.record(z.string(), z.string()),
  gValues: z.record(z.string(), z.number()),
  hValues: z.record(z.string(), z.number()),
  fValues: z.record(z.string(), z.number()),
  path: z.array(z.string()).optional(),
  isComplete: z.boolean().default(false),
  foundGoal: z.boolean().default(false),
});

export type SearchStep = z.infer<typeof searchStepSchema>;

// Search result
export const searchResultSchema = z.object({
  algorithm: z.enum(algorithmTypes),
  problem: problemSchema,
  steps: z.array(searchStepSchema),
  finalPath: z.array(z.string()).optional(),
  pathCost: z.number().optional(),
  nodesVisited: z.number(),
  executionTimeMs: z.number(),
  memoryUsageKb: z.number().optional(),
  success: z.boolean(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

// Performance metrics for comparison
export const performanceMetricsSchema = z.object({
  algorithm: z.enum(algorithmTypes),
  executionTimeMs: z.number(),
  nodesVisited: z.number(),
  pathCost: z.number().optional(),
  memoryUsageKb: z.number().optional(),
  pathLength: z.number().optional(),
  optimal: z.boolean().optional(),
});

export type PerformanceMetrics = z.infer<typeof performanceMetricsSchema>;

// Visualization state
export const visualizationStateSchema = z.object({
  isPlaying: z.boolean().default(false),
  isPaused: z.boolean().default(false),
  currentStep: z.number().default(0),
  totalSteps: z.number().default(0),
  speed: z.number().min(0.1).max(5).default(1),
  showCosts: z.boolean().default(true),
  showHeuristics: z.boolean().default(true),
});

export type VisualizationState = z.infer<typeof visualizationStateSchema>;

// Tool mode for problem construction
export const toolModes = [
  "select",
  "addObstacle",
  "removeObstacle",
  "setStart",
  "setGoal",
  "addNode",
  "addEdge",
  "setWeight",
] as const;

export type ToolMode = (typeof toolModes)[number];

// Saved problem for file operations
export const savedProblemSchema = z.object({
  id: z.string(),
  name: z.string(),
  problem: problemSchema,
  createdAt: z.string(),
});

export type SavedProblem = z.infer<typeof savedProblemSchema>;

// Comparison run
export const comparisonRunSchema = z.object({
  id: z.string(),
  problemName: z.string(),
  results: z.array(searchResultSchema),
  timestamp: z.string(),
});

export type ComparisonRun = z.infer<typeof comparisonRunSchema>;

// Helper functions
export function createEmptyGrid(rows: number, cols: number): GridProblem {
  const cells: GridCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        row: r,
        col: c,
        isObstacle: false,
        isStart: r === 0 && c === 0,
        isGoal: r === rows - 1 && c === cols - 1,
        weight: 1,
      });
    }
  }
  return {
    type: "grid",
    rows,
    cols,
    cells,
    start: { row: 0, col: 0 },
    goal: { row: rows - 1, col: cols - 1 },
    allowDiagonal: false,
  };
}

export function createEmptyGraph(): GraphProblem {
  return {
    type: "graph",
    nodes: [],
    edges: [],
    startNodeId: "",
    goalNodeId: "",
    isDirected: false,
  };
}

export function gridCellToId(row: number, col: number): string {
  return `${row}-${col}`;
}

export function idToGridCell(id: string): { row: number; col: number } {
  const [row, col] = id.split("-").map(Number);
  return { row, col };
}
