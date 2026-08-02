# Search Algorithms Visualization Tool

An interactive educational web application for visualizing and comparing search algorithms on grid and graph problems. Algorithms can be executed step by step with playback controls, node-state highlighting, and performance metrics.

## Features

- Interactive grid and graph problem construction
- Step-by-step algorithm visualization with play, pause, reset, and speed controls
- BFS, DFS, Uniform Cost Search, Greedy Best-First, A*, Hill Climbing, Beam Search, and IDA*
- Metrics for execution time, visited nodes, path cost, and memory usage
- Side-by-side comparison charts
- Light and dark themes
- Import and export of problem configurations

## Tech stack

- React 18 and TypeScript
- Vite and esbuild
- Express.js
- Tailwind CSS and Radix UI components
- Recharts
- Zod
- npm

The backend currently uses in-memory storage. PostgreSQL is configured only for the optional Drizzle database workflow and is not required to run the application.

## Prerequisites

- Node.js 20 LTS is recommended. Node.js 18+ is supported by the project dependencies.
- npm 9 or newer

## Installation

```bash
npm ci
```

Use `npm install` instead if you need to update dependencies or do not have a lockfile-compatible npm installation.

## Environment variables

Copy the example file if you want a local configuration reference:

```bash
cp .env.example .env
```

The current npm scripts do not load `.env` automatically. Set variables in your shell or your process manager when they are needed.

| Variable | Required for runtime | Description | Default |
| --- | --- | --- | --- |
| `PORT` | No | HTTP port used by the combined API/frontend server | `5000` |
| `NODE_ENV` | No | Runtime mode; set automatically by the npm scripts | `development` or `production` |
| `DATABASE_URL` | No | PostgreSQL connection string for `npm run db:push` | Not set |

`DATABASE_URL` must contain a real PostgreSQL connection string before running the database command. Do not commit credentials or put them in `.env.example`.

## Run locally

Start the development server, which serves both the API and the Vite frontend:

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000).

On PowerShell, you can override the port for one session with:

```powershell
$env:PORT = "5000"
npm run dev
```

## Build and run production output

```bash
npm run check
npm run build
npm run start
```

The production build is written to `dist/`, which is intentionally ignored by Git.

## Database workflow

The repository contains Drizzle Kit configuration for PostgreSQL:

```bash
npm run db:push
```

This command requires `DATABASE_URL`. The current API uses `server/storage.ts` and `MemStorage`, so database provisioning, migrations, and seed data are not required for normal local development.

## Project structure

```text
client/
  public/                 Static browser assets
  src/
    components/           Application and UI components
    hooks/                React hooks
    lib/                  Algorithms and frontend utilities
    pages/                Page components
server/
  index.ts               Express entry point and HTTP listener
  routes.ts              REST API routes
  storage.ts             In-memory persistence implementation
  static.ts              Production static-file serving
  vite.ts                Vite development middleware
shared/
  schema.ts              Shared TypeScript types and Zod schemas
script/
  build.ts               Combined frontend/backend production build

vite.config.ts            Vite configuration and path aliases
tailwind.config.ts        Tailwind CSS configuration
tsconfig.json             TypeScript configuration
package.json              npm scripts and dependencies
package-lock.json         Locked dependency tree
.env.example              Safe environment-variable template
```

## API endpoints

- `GET /api/problems`
- `POST /api/problems`
- `GET /api/problems/:id`
- `DELETE /api/problems/:id`
- `GET /api/comparison-runs`
- `POST /api/comparison-runs`

## Validation

```bash
npm run check
npm run build
```

There is currently no automated test script in `package.json`.

## Contributing

Keep shared data contracts in `shared/schema.ts`, application behavior in the appropriate client/server module, and generated output out of Git. See [design_guidelines.md](design_guidelines.md) for the visual and interaction conventions used by the project.

## License

The package metadata declares the project under the MIT license. Add a `LICENSE` file with the approved copyright holder before publishing if a formal license file is required for the distribution.
