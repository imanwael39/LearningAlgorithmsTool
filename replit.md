# Search Algorithms Visualization Tool

Interactive visualization and comparison tool for learning search algorithms including BFS, DFS, UCS, Greedy Best-First, A*, Hill Climbing, Beam Search, and IDA*.

## Overview

This educational tool allows users to:

- Visualize search algorithm execution step-by-step
- Compare algorithm performance metrics side-by-side
- Create custom grid-based pathfinding or graph search problems
- Import/export problem configurations

## Project Architecture

### Frontend (`client/src/`)

- **React** with TypeScript
- **Tailwind CSS** for styling with Shadcn UI components
- **Recharts** for performance comparison charts
- **Wouter** for routing

### Backend (`server/`)

- **Express.js** REST API
- In-memory storage for saved problems and comparison runs

### Shared (`shared/`)

- TypeScript schemas and types shared between frontend and backend
- Zod validation schemas

## Key Files

### Core Components

- `client/src/pages/home.tsx` - Main visualization page with all controls
- `client/src/lib/algorithms.ts` - All search algorithm implementations
- `client/src/components/grid-canvas.tsx` - Grid visualization component
- `client/src/components/graph-canvas.tsx` - Graph visualization component
- `client/src/components/algorithm-selector.tsx` - Algorithm selection panel
- `client/src/components/playback-controls.tsx` - Play/pause/step controls
- `client/src/components/metrics-dashboard.tsx` - Performance metrics display
- `client/src/components/comparison-chart.tsx` - Algorithm comparison charts

### Data Models

- `shared/schema.ts` - All TypeScript types and Zod schemas

### API Routes

- `POST /api/problems` - Save a problem configuration
- `GET /api/problems` - List all saved problems
- `GET /api/problems/:id` - Get a specific problem
- `DELETE /api/problems/:id` - Delete a problem
- `POST /api/comparison-runs` - Save comparison results
- `GET /api/comparison-runs` - List comparison runs

## Supported Algorithms

### Core Algorithms

- **BFS** - Breadth-First Search (optimal, complete, uninformed)
- **DFS** - Depth-First Search (not optimal, not complete, uninformed)
- **UCS** - Uniform Cost Search (optimal, complete, uninformed)
- **Greedy** - Greedy Best-First Search (not optimal, informed)
- **A\*** - A\* Search (optimal with admissible heuristic, informed)

### Advanced Algorithms

- **Hill Climbing** - Local search (may get stuck in local optima)
- **Beam Search** - Limited-width search
- **IDA\*** - Iterative Deepening A\*

## Development

The application runs on port 3000 with hot reloading enabled.

```bash
npm run dev
```

## Recent Changes

- Initial implementation of search algorithms visualization
- Grid-based and graph-based problem types
- Real-time step-by-step animation
- Performance metrics dashboard
- Algorithm comparison charts with export functionality
