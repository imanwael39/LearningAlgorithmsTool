import { runAlgorithm } from "../client/src/lib/algorithms";
import {
  algorithmTypes,
  createEmptyGrid,
  gridCellToId,
  type GraphProblem,
  type Problem,
} from "../shared/schema";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function pathCost(problem: Problem, path: string[]): number {
  let cost = 0;

  for (let index = 1; index < path.length; index++) {
    const from = path[index - 1];
    const to = path[index];

    if (problem.type === "grid") {
      const [fromRow, fromCol] = from.split("-").map(Number);
      const [toRow, toCol] = to.split("-").map(Number);
      const rowDelta = Math.abs(fromRow - toRow);
      const colDelta = Math.abs(fromCol - toCol);
      assert(rowDelta <= 1 && colDelta <= 1 && rowDelta + colDelta > 0, `Invalid grid edge ${from} -> ${to}`);
      const cell = problem.cells.find((candidate) => candidate.row === toRow && candidate.col === toCol);
      assert(cell && !cell.isObstacle, `Path includes an invalid grid cell: ${to}`);
      cost += (rowDelta === 1 && colDelta === 1 ? 1.414 : 1) * cell.weight;
    } else {
      const edge = problem.edges.find(
        (candidate) =>
          (candidate.from === from && candidate.to === to) ||
          (!problem.isDirected && candidate.from === to && candidate.to === from),
      );
      assert(edge, `Path includes a missing graph edge: ${from} -> ${to}`);
      cost += edge.weight;
    }
  }

  return cost;
}

function verifyProblem(problem: Problem, expectedOptimalCost?: number) {
  for (const algorithm of algorithmTypes) {
    const result = runAlgorithm(algorithm, problem);
    assert(result.success, `${algorithm} did not find a path`);
    assert(result.finalPath && result.finalPath.length > 1, `${algorithm} returned no usable path`);
    assert(result.steps.length > 0, `${algorithm} returned no visualization steps`);

    const start = problem.type === "grid"
      ? gridCellToId(problem.start.row, problem.start.col)
      : problem.startNodeId;
    const goal = problem.type === "grid"
      ? gridCellToId(problem.goal.row, problem.goal.col)
      : problem.goalNodeId;

    assert(result.finalPath[0] === start, `${algorithm} path does not start at the start node`);
    assert(result.finalPath.at(-1) === goal, `${algorithm} path does not end at the goal node`);

    const computedCost = pathCost(problem, result.finalPath);
    assert(Math.abs((result.pathCost ?? NaN) - computedCost) < 0.001, `${algorithm} reports an incorrect path cost`);

    if (expectedOptimalCost !== undefined && ["bfs", "ucs", "astar", "idaStar"].includes(algorithm)) {
      assert(Math.abs(computedCost - expectedOptimalCost) < 0.001, `${algorithm} did not find the expected optimal path`);
    }
  }
}

const grid = createEmptyGrid(3, 3);
grid.cells.find((cell) => cell.row === 1 && cell.col === 1)!.isObstacle = true;
verifyProblem(grid, 4);

const graph: GraphProblem = {
  type: "graph",
  nodes: ["A", "B", "C", "D"].map((id, index) => ({
    id,
    label: id,
    x: index * 50,
    y: 0,
    isStart: id === "A",
    isGoal: id === "D",
  })),
  edges: [
    { from: "A", to: "B", weight: 1 },
    { from: "B", to: "D", weight: 1 },
    { from: "A", to: "C", weight: 4 },
    { from: "C", to: "D", weight: 4 },
  ],
  startNodeId: "A",
  goalNodeId: "D",
  isDirected: false,
};
verifyProblem(graph, 2);

console.log(`Verified ${algorithmTypes.length} algorithms on grid and graph visualizations.`);
