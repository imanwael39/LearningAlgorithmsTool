import type {
  AlgorithmType,
  GridProblem,
  GraphProblem,
  Problem,
  SearchStep,
  SearchResult,
  GridCell,
} from "@shared/schema";
import { gridCellToId, idToGridCell } from "@shared/schema";

class PriorityQueue<T> {
  private items: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number): void {
    this.items.push({ item, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  contains(item: T, equals: (a: T, b: T) => boolean): boolean {
    return this.items.some(({ item: i }) => equals(i, item));
  }

  toArray(): T[] {
    return this.items.map(({ item }) => item);
  }
}

function getGridNeighbors(
  problem: GridProblem,
  nodeId: string
): { id: string; cost: number }[] {
  const { row, col } = idToGridCell(nodeId);
  const neighbors: { id: string; cost: number }[] = [];
  const directions = problem.allowDiagonal
    ? [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ]
    : [
        [-1, 0],
        [0, -1], [0, 1],
        [1, 0],
      ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < problem.rows && newCol >= 0 && newCol < problem.cols) {
      const cell = problem.cells.find((c) => c.row === newRow && c.col === newCol);
      if (cell && !cell.isObstacle) {
        const cost = Math.abs(dr) + Math.abs(dc) === 2 ? 1.414 : 1;
        neighbors.push({ id: gridCellToId(newRow, newCol), cost: cost * cell.weight });
      }
    }
  }

  return neighbors;
}

function getGraphNeighbors(
  problem: GraphProblem,
  nodeId: string
): { id: string; cost: number }[] {
  const neighbors: { id: string; cost: number }[] = [];
  
  for (const edge of problem.edges) {
    if (edge.from === nodeId) {
      neighbors.push({ id: edge.to, cost: edge.weight });
    }
    if (!problem.isDirected && edge.to === nodeId) {
      neighbors.push({ id: edge.from, cost: edge.weight });
    }
  }

  return neighbors;
}

function getNeighbors(problem: Problem, nodeId: string): { id: string; cost: number }[] {
  if (problem.type === "grid") {
    return getGridNeighbors(problem, nodeId);
  }
  return getGraphNeighbors(problem, nodeId);
}

function getStartId(problem: Problem): string {
  if (problem.type === "grid") {
    return gridCellToId(problem.start.row, problem.start.col);
  }
  return problem.startNodeId;
}

function getGoalId(problem: Problem): string {
  if (problem.type === "grid") {
    return gridCellToId(problem.goal.row, problem.goal.col);
  }
  return problem.goalNodeId;
}

function manhattanDistance(id: string, goalId: string, problem: Problem): number {
  if (problem.type === "grid") {
    const current = idToGridCell(id);
    const goal = idToGridCell(goalId);
    return Math.abs(current.row - goal.row) + Math.abs(current.col - goal.col);
  }
  
  const currentNode = (problem as GraphProblem).nodes.find((n) => n.id === id);
  const goalNode = (problem as GraphProblem).nodes.find((n) => n.id === goalId);
  
  if (currentNode && goalNode) {
    return Math.sqrt(
      Math.pow(currentNode.x - goalNode.x, 2) + Math.pow(currentNode.y - goalNode.y, 2)
    ) / 50;
  }
  
  return 0;
}

function reconstructPath(parentMap: Record<string, string>, goalId: string): string[] {
  const path: string[] = [];
  let current = goalId;
  
  while (current && parentMap[current] !== undefined) {
    path.unshift(current);
    current = parentMap[current];
  }
  
  if (current) {
    path.unshift(current);
  }
  
  return path;
}

function createStep(
  stepNumber: number,
  currentNode: string,
  frontier: string[],
  visited: string[],
  parentMap: Record<string, string>,
  gValues: Record<string, number>,
  hValues: Record<string, number>,
  fValues: Record<string, number>,
  isComplete: boolean,
  foundGoal: boolean,
  path?: string[]
): SearchStep {
  return {
    stepNumber,
    currentNode,
    frontier: [...frontier],
    visited: [...visited],
    parentMap: { ...parentMap },
    gValues: { ...gValues },
    hValues: { ...hValues },
    fValues: { ...fValues },
    isComplete,
    foundGoal,
    path,
  };
}

export function runBFS(problem: Problem): SearchResult {
  const startTime = performance.now();
  const startId = getStartId(problem);
  const goalId = getGoalId(problem);
  
  const queue: string[] = [startId];
  const visited = new Set<string>();
  const parentMap: Record<string, string> = {};
  const steps: SearchStep[] = [];
  let stepNumber = 0;

  steps.push(createStep(stepNumber++, startId, queue, [], parentMap, {}, {}, {}, false, false));

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (visited.has(current)) continue;
    visited.add(current);

    if (current === goalId) {
      const path = reconstructPath(parentMap, goalId);
      steps.push(createStep(
        stepNumber,
        current,
        queue,
        Array.from(visited),
        parentMap,
        {},
        {},
        {},
        true,
        true,
        path
      ));

      return {
        algorithm: "bfs",
        problem,
        steps,
        finalPath: path,
        pathCost: path.length - 1,
        nodesVisited: visited.size,
        executionTimeMs: performance.now() - startTime,
        memoryUsageKb: Math.round((visited.size * 100) / 1024),
        success: true,
      };
    }

    const neighbors = getNeighbors(problem, current);
    for (const { id } of neighbors) {
      if (!visited.has(id) && !queue.includes(id)) {
        queue.push(id);
        parentMap[id] = current;
      }
    }

    steps.push(createStep(
      stepNumber++,
      current,
      queue,
      Array.from(visited),
      parentMap,
      {},
      {},
      {},
      false,
      false
    ));
  }

  return {
    algorithm: "bfs",
    problem,
    steps,
    nodesVisited: visited.size,
    executionTimeMs: performance.now() - startTime,
    memoryUsageKb: Math.round((visited.size * 100) / 1024),
    success: false,
  };
}

export function runDFS(problem: Problem): SearchResult {
  const startTime = performance.now();
  const startId = getStartId(problem);
  const goalId = getGoalId(problem);
  
  const stack: string[] = [startId];
  const visited = new Set<string>();
  const parentMap: Record<string, string> = {};
  const steps: SearchStep[] = [];
  let stepNumber = 0;

  steps.push(createStep(stepNumber++, startId, stack, [], parentMap, {}, {}, {}, false, false));

  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (visited.has(current)) continue;
    visited.add(current);

    if (current === goalId) {
      const path = reconstructPath(parentMap, goalId);
      steps.push(createStep(
        stepNumber,
        current,
        stack,
        Array.from(visited),
        parentMap,
        {},
        {},
        {},
        true,
        true,
        path
      ));

      return {
        algorithm: "dfs",
        problem,
        steps,
        finalPath: path,
        pathCost: path.length - 1,
        nodesVisited: visited.size,
        executionTimeMs: performance.now() - startTime,
        memoryUsageKb: Math.round((visited.size * 100) / 1024),
        success: true,
      };
    }

    const neighbors = getNeighbors(problem, current);
    for (const { id } of neighbors.reverse()) {
      if (!visited.has(id)) {
        stack.push(id);
        if (!parentMap[id]) {
          parentMap[id] = current;
        }
      }
    }

    steps.push(createStep(
      stepNumber++,
      current,
      stack,
      Array.from(visited),
      parentMap,
      {},
      {},
      {},
      false,
      false
    ));
  }

  return {
    algorithm: "dfs",
    problem,
    steps,
    nodesVisited: visited.size,
    executionTimeMs: performance.now() - startTime,
    memoryUsageKb: Math.round((visited.size * 100) / 1024),
    success: false,
  };
}

export function runUCS(problem: Problem): SearchResult {
  const startTime = performance.now();
  const startId = getStartId(problem);
  const goalId = getGoalId(problem);
  
  const pq = new PriorityQueue<string>();
  pq.enqueue(startId, 0);
  
  const visited = new Set<string>();
  const parentMap: Record<string, string> = {};
  const gValues: Record<string, number> = { [startId]: 0 };
  const steps: SearchStep[] = [];
  let stepNumber = 0;

  steps.push(createStep(stepNumber++, startId, [startId], [], parentMap, gValues, {}, {}, false, false));

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    
    if (visited.has(current)) continue;
    visited.add(current);

    if (current === goalId) {
      const path = reconstructPath(parentMap, goalId);
      steps.push(createStep(
        stepNumber,
        current,
        pq.toArray(),
        Array.from(visited),
        parentMap,
        gValues,
        {},
        {},
        true,
        true,
        path
      ));

      return {
        algorithm: "ucs",
        problem,
        steps,
        finalPath: path,
        pathCost: gValues[goalId],
        nodesVisited: visited.size,
        executionTimeMs: performance.now() - startTime,
        memoryUsageKb: Math.round((visited.size * 100) / 1024),
        success: true,
      };
    }

    const neighbors = getNeighbors(problem, current);
    for (const { id, cost } of neighbors) {
      if (!visited.has(id)) {
        const newG = gValues[current] + cost;
        if (gValues[id] === undefined || newG < gValues[id]) {
          gValues[id] = newG;
          parentMap[id] = current;
          pq.enqueue(id, newG);
        }
      }
    }

    steps.push(createStep(
      stepNumber++,
      current,
      pq.toArray(),
      Array.from(visited),
      parentMap,
      gValues,
      {},
      {},
      false,
      false
    ));
  }

  return {
    algorithm: "ucs",
    problem,
    steps,
    nodesVisited: visited.size,
    executionTimeMs: performance.now() - startTime,
    memoryUsageKb: Math.round((visited.size * 100) / 1024),
    success: false,
  };
}

export function runGreedy(problem: Problem): SearchResult {
  const startTime = performance.now();
  const startId = getStartId(problem);
  const goalId = getGoalId(problem);
  
  const pq = new PriorityQueue<string>();
  const h = manhattanDistance(startId, goalId, problem);
  pq.enqueue(startId, h);
  
  const visited = new Set<string>();
  const parentMap: Record<string, string> = {};
  const hValues: Record<string, number> = { [startId]: h };
  const gValues: Record<string, number> = { [startId]: 0 };
  const steps: SearchStep[] = [];
  let stepNumber = 0;

  steps.push(createStep(stepNumber++, startId, [startId], [], parentMap, gValues, hValues, hValues, false, false));

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    
    if (visited.has(current)) continue;
    visited.add(current);

    if (current === goalId) {
      const path = reconstructPath(parentMap, goalId);
      let pathCost = 0;
      for (let i = 1; i < path.length; i++) {
        const neighbors = getNeighbors(problem, path[i - 1]);
        const edge = neighbors.find((n) => n.id === path[i]);
        if (edge) pathCost += edge.cost;
      }

      steps.push(createStep(
        stepNumber,
        current,
        pq.toArray(),
        Array.from(visited),
        parentMap,
        gValues,
        hValues,
        hValues,
        true,
        true,
        path
      ));

      return {
        algorithm: "greedy",
        problem,
        steps,
        finalPath: path,
        pathCost,
        nodesVisited: visited.size,
        executionTimeMs: performance.now() - startTime,
        memoryUsageKb: Math.round((visited.size * 100) / 1024),
        success: true,
      };
    }

    const neighbors = getNeighbors(problem, current);
    for (const { id, cost } of neighbors) {
      if (!visited.has(id)) {
        const hVal = manhattanDistance(id, goalId, problem);
        hValues[id] = hVal;
        gValues[id] = (gValues[current] || 0) + cost;
        parentMap[id] = current;
        pq.enqueue(id, hVal);
      }
    }

    steps.push(createStep(
      stepNumber++,
      current,
      pq.toArray(),
      Array.from(visited),
      parentMap,
      gValues,
      hValues,
      hValues,
      false,
      false
    ));
  }

  return {
    algorithm: "greedy",
    problem,
    steps,
    nodesVisited: visited.size,
    executionTimeMs: performance.now() - startTime,
    memoryUsageKb: Math.round((visited.size * 100) / 1024),
    success: false,
  };
}

export function runAStar(problem: Problem): SearchResult {
  const startTime = performance.now();
  const startId = getStartId(problem);
  const goalId = getGoalId(problem);
  
  const pq = new PriorityQueue<string>();
  const h = manhattanDistance(startId, goalId, problem);
  pq.enqueue(startId, h);
  
  const visited = new Set<string>();
  const parentMap: Record<string, string> = {};
  const gValues: Record<string, number> = { [startId]: 0 };
  const hValues: Record<string, number> = { [startId]: h };
  const fValues: Record<string, number> = { [startId]: h };
  const steps: SearchStep[] = [];
  let stepNumber = 0;

  steps.push(createStep(stepNumber++, startId, [startId], [], parentMap, gValues, hValues, fValues, false, false));

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    
    if (visited.has(current)) continue;
    visited.add(current);

    if (current === goalId) {
      const path = reconstructPath(parentMap, goalId);
      steps.push(createStep(
        stepNumber,
        current,
        pq.toArray(),
        Array.from(visited),
        parentMap,
        gValues,
        hValues,
        fValues,
        true,
        true,
        path
      ));

      return {
        algorithm: "astar",
        problem,
        steps,
        finalPath: path,
        pathCost: gValues[goalId],
        nodesVisited: visited.size,
        executionTimeMs: performance.now() - startTime,
        memoryUsageKb: Math.round((visited.size * 100) / 1024),
        success: true,
      };
    }

    const neighbors = getNeighbors(problem, current);
    for (const { id, cost } of neighbors) {
      if (!visited.has(id)) {
        const newG = gValues[current] + cost;
        if (gValues[id] === undefined || newG < gValues[id]) {
          gValues[id] = newG;
          const hVal = manhattanDistance(id, goalId, problem);
          hValues[id] = hVal;
          fValues[id] = newG + hVal;
          parentMap[id] = current;
          pq.enqueue(id, newG + hVal);
        }
      }
    }

    steps.push(createStep(
      stepNumber++,
      current,
      pq.toArray(),
      Array.from(visited),
      parentMap,
      gValues,
      hValues,
      fValues,
      false,
      false
    ));
  }

  return {
    algorithm: "astar",
    problem,
    steps,
    nodesVisited: visited.size,
    executionTimeMs: performance.now() - startTime,
    memoryUsageKb: Math.round((visited.size * 100) / 1024),
    success: false,
  };
}

export function runHillClimbing(problem: Problem): SearchResult {
  const startTime = performance.now();
  const startId = getStartId(problem);
  const goalId = getGoalId(problem);
  
  let current = startId;
  const visited = new Set<string>([startId]);
  const parentMap: Record<string, string> = {};
  const hValues: Record<string, number> = { [startId]: manhattanDistance(startId, goalId, problem) };
  const gValues: Record<string, number> = { [startId]: 0 };
  const steps: SearchStep[] = [];
  let stepNumber = 0;

  steps.push(createStep(stepNumber++, startId, [], [startId], parentMap, gValues, hValues, hValues, false, false));

  while (current !== goalId) {
    const neighbors = getNeighbors(problem, current);
    let bestNeighbor: string | null = null;
    let bestH = hValues[current];

    for (const { id, cost } of neighbors) {
      if (!visited.has(id)) {
        const h = manhattanDistance(id, goalId, problem);
        hValues[id] = h;
        gValues[id] = (gValues[current] || 0) + cost;
        if (h < bestH) {
          bestH = h;
          bestNeighbor = id;
        }
      }
    }

    if (!bestNeighbor) {
      steps.push(createStep(
        stepNumber,
        current,
        [],
        Array.from(visited),
        parentMap,
        gValues,
        hValues,
        hValues,
        true,
        false
      ));

      return {
        algorithm: "hillClimbing",
        problem,
        steps,
        nodesVisited: visited.size,
        executionTimeMs: performance.now() - startTime,
        memoryUsageKb: Math.round((visited.size * 100) / 1024),
        success: false,
      };
    }

    parentMap[bestNeighbor] = current;
    current = bestNeighbor;
    visited.add(current);

    steps.push(createStep(
      stepNumber++,
      current,
      [],
      Array.from(visited),
      parentMap,
      gValues,
      hValues,
      hValues,
      false,
      current === goalId
    ));
  }

  const path = reconstructPath(parentMap, goalId);
  return {
    algorithm: "hillClimbing",
    problem,
    steps,
    finalPath: path,
    pathCost: gValues[goalId],
    nodesVisited: visited.size,
    executionTimeMs: performance.now() - startTime,
    memoryUsageKb: Math.round((visited.size * 100) / 1024),
    success: true,
  };
}

export function runBeamSearch(problem: Problem, beamWidth: number = 2): SearchResult {
  const startTime = performance.now();
  const startId = getStartId(problem);
  const goalId = getGoalId(problem);
  
  let beam: string[] = [startId];
  const visited = new Set<string>([startId]);
  const parentMap: Record<string, string> = {};
  const hValues: Record<string, number> = { [startId]: manhattanDistance(startId, goalId, problem) };
  const gValues: Record<string, number> = { [startId]: 0 };
  const steps: SearchStep[] = [];
  let stepNumber = 0;

  steps.push(createStep(stepNumber++, startId, beam, [startId], parentMap, gValues, hValues, hValues, false, false));

  while (beam.length > 0) {
    const candidates: { id: string; h: number; parent: string }[] = [];

    for (const current of beam) {
      if (current === goalId) {
        const path = reconstructPath(parentMap, goalId);
        steps.push(createStep(
          stepNumber,
          current,
          beam,
          Array.from(visited),
          parentMap,
          gValues,
          hValues,
          hValues,
          true,
          true,
          path
        ));

        return {
          algorithm: "beamSearch",
          problem,
          steps,
          finalPath: path,
          pathCost: gValues[goalId],
          nodesVisited: visited.size,
          executionTimeMs: performance.now() - startTime,
          memoryUsageKb: Math.round((visited.size * 100) / 1024),
          success: true,
        };
      }

      const neighbors = getNeighbors(problem, current);
      for (const { id, cost } of neighbors) {
        if (!visited.has(id)) {
          const h = manhattanDistance(id, goalId, problem);
          hValues[id] = h;
          gValues[id] = (gValues[current] || 0) + cost;
          candidates.push({ id, h, parent: current });
        }
      }
    }

    if (candidates.length === 0) {
      steps.push(createStep(
        stepNumber,
        beam[0] || startId,
        [],
        Array.from(visited),
        parentMap,
        gValues,
        hValues,
        hValues,
        true,
        false
      ));

      return {
        algorithm: "beamSearch",
        problem,
        steps,
        nodesVisited: visited.size,
        executionTimeMs: performance.now() - startTime,
        memoryUsageKb: Math.round((visited.size * 100) / 1024),
        success: false,
      };
    }

    candidates.sort((a, b) => a.h - b.h);
    beam = candidates.slice(0, beamWidth).map((c) => c.id);
    
    for (const c of candidates.slice(0, beamWidth)) {
      visited.add(c.id);
      parentMap[c.id] = c.parent;
    }

    steps.push(createStep(
      stepNumber++,
      beam[0],
      beam,
      Array.from(visited),
      parentMap,
      gValues,
      hValues,
      hValues,
      false,
      false
    ));
  }

  return {
    algorithm: "beamSearch",
    problem,
    steps,
    nodesVisited: visited.size,
    executionTimeMs: performance.now() - startTime,
    memoryUsageKb: Math.round((visited.size * 100) / 1024),
    success: false,
  };
}

export function runIDAStar(problem: Problem): SearchResult {
  const startTime = performance.now();
  const startId = getStartId(problem);
  const goalId = getGoalId(problem);
  
  const gValues: Record<string, number> = { [startId]: 0 };
  const hValues: Record<string, number> = { [startId]: manhattanDistance(startId, goalId, problem) };
  const fValues: Record<string, number> = { [startId]: hValues[startId] };
  const parentMap: Record<string, string> = {};
  const steps: SearchStep[] = [];
  let stepNumber = 0;
  let totalVisited = 0;

  let bound = hValues[startId];
  const path = [startId];

  steps.push(createStep(stepNumber++, startId, path, [], parentMap, gValues, hValues, fValues, false, false));

  while (true) {
    const result = search(path, 0, bound, goalId, problem, gValues, hValues, fValues, parentMap, steps, stepNumber, new Set());
    stepNumber = result.stepNumber;
    totalVisited += result.visited;

    if (result.found) {
      return {
        algorithm: "idaStar",
        problem,
        steps,
        finalPath: result.path,
        pathCost: result.cost,
        nodesVisited: totalVisited,
        executionTimeMs: performance.now() - startTime,
        memoryUsageKb: Math.round((totalVisited * 50) / 1024),
        success: true,
      };
    }

    if (result.t === Infinity) {
      steps.push(createStep(
        stepNumber,
        startId,
        [],
        [],
        parentMap,
        gValues,
        hValues,
        fValues,
        true,
        false
      ));

      return {
        algorithm: "idaStar",
        problem,
        steps,
        nodesVisited: totalVisited,
        executionTimeMs: performance.now() - startTime,
        memoryUsageKb: Math.round((totalVisited * 50) / 1024),
        success: false,
      };
    }

    bound = result.t;
  }
}

function search(
  path: string[],
  g: number,
  bound: number,
  goalId: string,
  problem: Problem,
  gValues: Record<string, number>,
  hValues: Record<string, number>,
  fValues: Record<string, number>,
  parentMap: Record<string, string>,
  steps: SearchStep[],
  stepNumber: number,
  visited: Set<string>
): { found: boolean; t: number; path?: string[]; cost?: number; stepNumber: number; visited: number } {
  const node = path[path.length - 1];
  const h = manhattanDistance(node, goalId, problem);
  hValues[node] = h;
  gValues[node] = g;
  const f = g + h;
  fValues[node] = f;
  visited.add(node);

  steps.push(createStep(
    stepNumber++,
    node,
    path,
    Array.from(visited),
    parentMap,
    gValues,
    hValues,
    fValues,
    false,
    node === goalId
  ));

  if (f > bound) {
    return { found: false, t: f, stepNumber, visited: visited.size };
  }

  if (node === goalId) {
    return { found: true, t: f, path: [...path], cost: g, stepNumber, visited: visited.size };
  }

  let min = Infinity;
  const neighbors = getNeighbors(problem, node);

  for (const { id, cost } of neighbors) {
    if (!path.includes(id)) {
      path.push(id);
      parentMap[id] = node;
      
      const result = search(path, g + cost, bound, goalId, problem, gValues, hValues, fValues, parentMap, steps, stepNumber, visited);
      stepNumber = result.stepNumber;

      if (result.found) {
        return result;
      }

      if (result.t < min) {
        min = result.t;
      }

      path.pop();
    }
  }

  return { found: false, t: min, stepNumber, visited: visited.size };
}

export function runAlgorithm(algorithm: AlgorithmType, problem: Problem): SearchResult {
  switch (algorithm) {
    case "bfs":
      return runBFS(problem);
    case "dfs":
      return runDFS(problem);
    case "ucs":
      return runUCS(problem);
    case "greedy":
      return runGreedy(problem);
    case "astar":
      return runAStar(problem);
    case "hillClimbing":
      return runHillClimbing(problem);
    case "beamSearch":
      return runBeamSearch(problem);
    case "idaStar":
      return runIDAStar(problem);
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
}
