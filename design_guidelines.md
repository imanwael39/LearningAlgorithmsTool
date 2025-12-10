# Design Guidelines: Search Algorithms Visualization Tool

## Design Approach
**System Selected**: Material Design principles adapted for educational/technical applications, with emphasis on data visualization clarity and interactive controls.

**Rationale**: This is a utility-focused educational tool where clarity, efficiency, and data comprehension are paramount. The interface must support complex interactions (algorithm visualization, metric comparison) while remaining intuitive for academic users.

## Typography System

**Font Family**: Inter (via Google Fonts CDN)
- Primary: Inter for all UI text (clean, technical aesthetic)
- Monospace: JetBrains Mono for code, metrics, and numerical data

**Hierarchy**:
- Page Title: text-2xl font-bold (algorithm names, section headers)
- Section Headers: text-lg font-semibold
- Controls/Labels: text-sm font-medium
- Body Text: text-sm font-normal
- Metrics/Data: text-sm font-mono (monospace for alignment)
- Small Labels: text-xs font-medium

## Layout & Spacing System

**Tailwind Units**: Use 2, 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-4, p-6
- Section spacing: gap-4, gap-6, gap-8
- Margins: m-2, m-4, m-8
- Canvas padding: p-8 minimum around visualization area

**Application Structure**:
```
┌─────────────────────────────────────────┐
│ Header (h-16): Title + Quick Actions    │
├──────────┬──────────────────────────────┤
│          │                              │
│ Controls │   Main Canvas Area           │
│ Panel    │   (Visualization)            │
│ (w-80)   │                              │
│          │                              │
├──────────┴──────────────────────────────┤
│ Metrics Dashboard / Comparison Panel    │
└─────────────────────────────────────────┘
```

**Responsive Breakpoints**:
- Desktop (lg:): Three-column layout (controls | canvas | metrics)
- Tablet (md:): Two-column (controls | canvas), metrics below
- Mobile: Single column stack with collapsible panels

## Component Library

### Navigation & Header
- Fixed header with shadow, h-16
- Logo/title on left, algorithm selector dropdown center, action buttons right
- Include: Upload Problem, Download Problem, Settings icons

### Control Panel (Left Sidebar)
- **Algorithm Selection**: Radio button group with clear labels
  - Core: BFS, DFS, UCS, Greedy, A*
  - Optional: Hill Climbing, Beam Search, IDA* (disabled state if not active)
- **Playback Controls**: 
  - Large Play/Pause button (primary action)
  - Reset, Step Forward, Step Backward buttons
  - Speed slider with labels (Slow → Fast)
- **Problem Construction**:
  - Tabs: Grid Mode | Graph Mode | Upload File
  - Tool palette: Add Node, Add Edge, Set Start, Set Goal, Add Obstacle
- **Statistics Display**: 
  - Current step counter
  - Live metrics in compact cards (nodes visited, path cost)

### Canvas Visualization Area
- **Primary workspace**: Central focus, minimum 60% viewport width on desktop
- **Grid/Graph Renderer**: 
  - Clean white/light background for canvas
  - Clear grid lines (subtle, 1px)
  - Node visualization: Circles for graphs, squares for grids
  - Size: Responsive based on problem size, maintain aspect ratio
- **Visual States**:
  - Start node: Distinctive marker (green)
  - Goal node: Distinctive marker (red/target icon)
  - Frontier nodes: Highlighted border (blue)
  - Visited nodes: Filled semi-transparent
  - Current node: Pulsing animation (subtle)
  - Final path: Bold highlighted route (green/yellow)
  - Obstacles: Solid fill (dark)
- **Overlay Information**:
  - On hover: Show node details (g, h, f values in tooltip)
  - Edge weights displayed on paths
  - Legend in corner explaining color coding

### Metrics Dashboard (Bottom/Right Panel)
- **Real-time Stats Cards**: Grid layout (grid-cols-4 on desktop)
  - Execution Time (ms)
  - Nodes Visited
  - Path Cost
  - Memory Usage
  - Each card: Icon + large number + label
- **Comparison Section**:
  - Table view: Rows for each algorithm, columns for metrics
  - Visual charts: Bar chart comparing key metrics
  - Export comparison button

### Interactive Elements
- **Buttons**:
  - Primary: Solid fill, rounded-lg, px-6 py-2
  - Secondary: Outline style
  - Icon buttons: p-2, rounded-md
- **Dropdowns**: Clean Material-style with subtle shadow
- **Sliders**: Custom track with clear thumb indicator
- **File Upload**: Drag-drop zone with dashed border, hover state
- **Tooltips**: Small, positioned near cursor, text-xs

### Data Visualization
- **Charts**: Use Chart.js or Recharts
  - Bar charts for algorithm comparison
  - Line graphs for performance over problem size
  - Clean grid, clear axis labels
- **Tables**: 
  - Striped rows for readability
  - Sortable headers
  - Monospace font for numerical columns

## Animations & Interactions

**Animation Principles**: Functional only, no decorative animations
- **Step Animation**: Smooth transitions (300ms) when highlighting nodes
- **Path Drawing**: Animate final path reveal (500ms sequential)
- **Panel Transitions**: Slide/fade when showing/hiding (200ms)
- **Hover States**: Subtle scale (1.02) for interactive elements
- **Loading States**: Simple spinner or progress bar

**Avoid**: Excessive motion, parallax, decorative transitions

## Accessibility
- Clear focus indicators on all interactive elements (ring-2 ring-offset-2)
- Keyboard navigation support (Tab, Arrow keys for canvas)
- ARIA labels for icon buttons
- Sufficient contrast ratios (WCAG AA minimum)
- Alt text for visual states explanation

## Icons
**Library**: Heroicons (via CDN)
- Play/Pause/Stop: Solid icons
- Settings, Upload, Download: Outline icons
- Algorithm types: Custom or generic shape icons
- Directional arrows for step controls

## Images
**No hero images needed** - this is a functional application, not a marketing site. Any images would be:
- Placeholder graphs/visualizations for empty states
- Tutorial screenshots in help documentation
- Algorithm comparison diagrams in info panels

---

**Key Design Principle**: Clarity over creativity. Every element serves the primary function of algorithm education and visualization. The interface should feel professional, technical, and distraction-free.