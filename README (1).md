# Search Algorithms Visualization Tool

An interactive, educational web application for visualizing and comparing search algorithms in real-time. Watch algorithms explore grid-based pathfinding problems and graph search spaces step-by-step, with detailed performance metrics and comparative analysis.

## Features

### Core Visualization
- **Interactive Canvas**: Drag-and-drop grid/graph problem construction
- **Real-time Animation**: Step-by-step algorithm execution with play/pause/speed controls
- **Visual Highlighting**: Color-coded display of explored nodes, frontier, current node, and optimal path
- **Problem Types**: Support for grid-based pathfinding and graph search problems

### Algorithms
- **BFS** (Breadth-First Search) - Complete and optimal for unit costs
- **DFS** (Depth-First Search) - Memory efficient, not complete/optimal
- **UCS** (Uniform Cost Search) - Optimal path finder for weighted graphs
- **Greedy Best-First** - Heuristic-guided exploration
- **A*** - Optimal informed search with admissible heuristics

### Analysis & Comparison
- **Performance Metrics**: Execution time, nodes visited, path cost, memory usage
- **Algorithm Costs**: Real-time display of g(n), h(n), and f(n) values during execution
- **Side-by-Side Comparison**: Visual charts comparing algorithm performance
- **Problem Management**: Save and load custom problem configurations

### User Interface
- **Algorithm Selection Panel**: Choose algorithms to run
- **Tool Palette**: Select, add obstacles, set start/goal positions
- **Playback Controls**: Play, pause, step, seek, speed adjustment
- **Metrics Dashboard**: View execution results and statistics
- **Comparison Charts**: Bar charts and tables for algorithm analysis
- **Dark Mode**: Full theme support for comfortable viewing

## Getting Started

### Installation

1. **Clone or Open in Replit**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will open on `http://localhost:5000`

### Quick Start Guide

1. **Select Problem Type**: Choose between Grid (pathfinding) or Graph (search) at the top
2. **Create Your Problem**:
   - Use the **Tool Palette** to add obstacles, set start/goal positions
   - Drag on grid cells to paint obstacles
   - Click cells to place start (S) and goal (G) positions
3. **Choose Algorithm**: Select from BFS, DFS, UCS, Greedy, or A*
4. **Run the Algorithm**: Click "Run Algorithm" to execute
5. **Watch Animation**: Use playback controls to step through execution
6. **View Metrics**: Check performance stats on the right panel
7. **Compare Algorithms**: Add multiple results to the comparison chart

## How Algorithms Work

### Uninformed Search
- **BFS**: Explores all nodes at current depth before moving deeper. Guaranteed to find shortest path.
- **DFS**: Explores as deep as possible before backtracking. Memory efficient but may find longer paths.
- **UCS**: Expands nodes with lowest cost first. Optimal when costs matter.

### Informed Search
- **Greedy Best-First**: Uses heuristic estimate h(n) to guide search. Fast but not guaranteed optimal.
- **A***: Combines actual cost g(n) and heuristic h(n) in f(n) = g(n) + h(n). Optimal with admissible heuristics.

### Cost Display
- **g(n)**: Actual cost from start to current node
- **h(n)**: Heuristic estimate of cost to goal
- **f(n)**: Total estimated cost (A* evaluation function)

## Grid Problem

- **Size**: 15 rows × 20 columns (configurable)
- **Movement**: 4-directional (up, down, left, right) or 8-directional
- **Cells**: 
  - Start (green) - Algorithm begins here
  - Goal (red) - Algorithm tries to reach here
  - Obstacles (dark gray) - Cannot be traversed
  - Regular cells - Cost 1 to traverse

## Graph Problem

- **Nodes**: Manually placed and labeled
- **Edges**: Connect nodes with optional weights
- **Directed/Undirected**: Choose graph type
- **Visualization**: Nodes show as circles, edges as lines with weight labels

## Controls

### Algorithm Selector
- **BFS, DFS, UCS, Greedy, A***: Click to select algorithm

### Tool Palette
- **Add Obstacle**: Paint obstacles on grid cells
- **Remove Obstacle**: Erase obstacles
- **Set Start**: Mark starting position (green)
- **Set Goal**: Mark goal position (red)
- **Add Node**: Place nodes in graph
- **Add Edge**: Connect graph nodes

### Playback Controls
- **Play**: Start step-by-step animation
- **Pause**: Pause animation
- **Reset**: Clear visualization state
- **Step Forward/Backward**: Navigate through steps
- **Speed Slider**: Control animation speed (0.1x - 5x)
- **Timeline**: Click to seek to specific step

### Problem Controls
- **Randomize**: Auto-generate obstacles or graph
- **Clear**: Remove all obstacles/edges
- **Show Costs**: Toggle g/h/f value display

## Architecture

### Frontend
- **React + TypeScript**: Component-based UI with type safety
- **Tailwind CSS + Shadcn**: Modern design system
- **React Query**: Data fetching and caching
- **Recharts**: Performance comparison charts

### Backend
- **Express.js**: REST API server
- **In-Memory Storage**: Problem and result caching
- **Zod Validation**: Request/response type checking

### Shared
- **Type Definitions**: Shared TypeScript types
- **Zod Schemas**: Data validation schemas
- **Algorithm Logic**: Search implementations

## Data Structures

### GridProblem
```typescript
{
  type: "grid"
  rows: number
  cols: number
  cells: GridCell[] // row, col, isObstacle, isStart, isGoal, weight
  start: Position
  goal: Position
  allowDiagonal: boolean
}
```

### GraphProblem
```typescript
{
  type: "graph"
  nodes: Node[] // id, label, x, y, isStart, isGoal
  edges: Edge[] // from, to, weight
  startNodeId: string
  goalNodeId: string
  isDirected: boolean
}
```

### SearchResult
```typescript
{
  algorithm: AlgorithmType
  success: boolean
  path: string[] // node IDs in solution path
  steps: SearchStep[] // visualization frames
  executionTimeMs: number
  nodesVisited: number
  pathCost: number
}
```

## Performance

### Optimization Techniques
- **useMemo**: Cached grid cell lookups and step data
- **Viewport-based Rendering**: Only renders visible cells
- **requestAnimationFrame**: Smooth 60fps animation
- **Cleanup**: Proper animation frame cancellation

### Memory Usage
- Grid: ~100KB per 15×20 grid
- Graph: ~50KB per 8 nodes with 12 edges
- Single run history: ~500KB per algorithm execution

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Project Structure
```
├── client/src/
│   ├── pages/
│   │   └── home.tsx              # Main visualization page
│   ├── components/
│   │   ├── grid-canvas.tsx       # Grid rendering
│   │   ├── graph-canvas.tsx      # Graph rendering
│   │   ├── algorithm-selector.tsx
│   │   ├── playback-controls.tsx
│   │   ├── metrics-dashboard.tsx
│   │   ├── comparison-chart.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── algorithms.ts         # Algorithm implementations
│   │   └── queryClient.ts        # React Query setup
│   └── App.tsx
├── server/
│   ├── index.ts                  # Express app
│   ├── routes.ts                 # API endpoints
│   └── storage.ts                # In-memory storage
├── shared/
│   └── schema.ts                 # TypeScript types & validation
└── README.md
```

## Learning Resources

### Understanding Search Algorithms
1. Start with **BFS** to understand breadth-first exploration
2. Compare **BFS** vs **DFS** to see depth-first differences
3. Try **UCS** to see cost-based ordering
4. Experiment with **A*** to understand heuristic guidance
5. Use the **comparison chart** to analyze performance trade-offs

### Tips for Exploration
- Create challenging mazes to stress-test algorithms
- Compare algorithms on the same problem to see differences
- Adjust heuristics (grid distance) to affect A* behavior
- Use cost weights to see how algorithms handle varying edge costs
- Toggle cost display to understand algorithm decision-making

## Keyboard Shortcuts
- `Enter`: Run algorithm
- `Space`: Play/Pause
- `R`: Reset visualization

## Troubleshooting

### Algorithm Not Running
- Ensure both start and goal are set (green S and red G visible)
- Grid must have at least one path or algorithm may take time

### Animation Stuttering
- Reduce grid size for smoother performance
- Lower animation speed
- Close other browser tabs

### Graph Nodes Overlap
- Drag nodes apart to reposition
- Use randomize to auto-spread nodes

## Future Enhancements
- Advanced algorithms (Hill Climbing, Beam Search, IDA*)
- 8-Puzzle problem type
- Maze generation algorithms
- PDF export with visualizations
- Execution history with replay
- Custom heuristic functions

## Contributing

To extend the tool with new algorithms:

1. **Add to Schema**: Update `shared/schema.ts` with algorithm type
2. **Implement Algorithm**: Add to `client/src/lib/algorithms.ts`
   - Must return `SearchResult` with steps array
   - Steps track visited, frontier, current node
3. **Test**: Run on multiple problem types
4. **Add to Selector**: Update algorithm selector component

## License

Educational tool - free to use and modify for learning purposes.

## Support

For issues or feature requests, check the implementation status and algorithm correctness. The tool prioritizes learning value over production optimization.

---

**Built with React, TypeScript, Tailwind CSS, and Express.js**
