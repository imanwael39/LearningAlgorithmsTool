import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Play, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlgorithmSelector } from "@/components/algorithm-selector";
import { PlaybackControls } from "@/components/playback-controls";
import { ToolPalette } from "@/components/tool-palette";
import { GridCanvas } from "@/components/grid-canvas";
import { GraphCanvas } from "@/components/graph-canvas";
import { MetricsDashboard } from "@/components/metrics-dashboard";
import { ComparisonChart } from "@/components/comparison-chart";
import { ProblemSettings } from "@/components/problem-settings";
import { runAlgorithm } from "@/lib/algorithms";
import type {
  AlgorithmType,
  ProblemType,
  Problem,
  GridProblem,
  GraphProblem,
  SearchStep,
  SearchResult,
  ToolMode,
} from "@shared/schema";
import { createEmptyGrid, createEmptyGraph } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  
  const [problemType, setProblemType] = useState<ProblemType>("grid");
  const [problem, setProblem] = useState<Problem>(() => createEmptyGrid(15, 20));
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("bfs");
  const [selectedTool, setSelectedTool] = useState<ToolMode>("addObstacle");
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showCosts, setShowCosts] = useState(true);
  
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [comparisonResults, setComparisonResults] = useState<SearchResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const animationRef = useRef<number | null>(null);
  const lastStepTimeRef = useRef<number>(0);

  const currentSearchStep: SearchStep | null = useMemo(() => {
    return searchResult?.steps[currentStep] ?? null;
  }, [searchResult, currentStep]);

  const cellMap = useMemo(() => {
    if (problem.type !== "grid") return new Map();
    const map = new Map<string, number>();
    (problem as GridProblem).cells.forEach((cell, index) => {
      map.set(`${cell.row}-${cell.col}`, index);
    });
    return map;
  }, [problem]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    lastStepTimeRef.current = 0;
  }, []);

  const runSearch = useCallback(() => {
    stopAnimation();
    
    if (problem.type === "grid") {
      const gridProblem = problem as GridProblem;
      const hasStart = gridProblem.cells.some((c) => c.isStart);
      const hasGoal = gridProblem.cells.some((c) => c.isGoal);
      
      if (!hasStart || !hasGoal) {
        toast({
          title: "Invalid problem",
          description: "Please set both a start and goal position.",
          variant: "destructive",
        });
        return;
      }
    } else {
      const graphProblem = problem as GraphProblem;
      if (!graphProblem.startNodeId || !graphProblem.goalNodeId) {
        toast({
          title: "Invalid problem",
          description: "Please set both a start and goal node.",
          variant: "destructive",
        });
        return;
      }
      if (graphProblem.nodes.length < 2) {
        toast({
          title: "Invalid problem",
          description: "Please add at least 2 nodes to the graph.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsRunning(true);
    setSearchResult(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsPaused(false);

    requestAnimationFrame(() => {
      try {
        const result = runAlgorithm(selectedAlgorithm, problem);
        setSearchResult(result);
        setIsRunning(false);
        
        if (result.success) {
          toast({
            title: "Path found!",
            description: `${result.nodesVisited} nodes visited, path cost: ${result.pathCost?.toFixed(2)}`,
          });
        } else {
          toast({
            title: "No path found",
            description: "The goal is unreachable from the start position.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setIsRunning(false);
        toast({
          title: "Algorithm error",
          description: "An error occurred while running the algorithm.",
          variant: "destructive",
        });
        console.error(error);
      }
    });
  }, [problem, selectedAlgorithm, toast, stopAnimation]);

  const addToComparison = useCallback(() => {
    if (searchResult) {
      setComparisonResults((prev) => {
        const existing = prev.findIndex((r) => r.algorithm === searchResult.algorithm);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = searchResult;
          return updated;
        }
        return [...prev, searchResult];
      });
      toast({
        title: "Added to comparison",
        description: `${searchResult.algorithm.toUpperCase()} results added to comparison chart.`,
      });
    }
  }, [searchResult, toast]);

  useEffect(() => {
    if (!isPlaying || isPaused || !searchResult) {
      return;
    }
    
    const stepDuration = 500 / speed;
    
    const animate = (timestamp: number) => {
      if (lastStepTimeRef.current === 0) {
        lastStepTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - lastStepTimeRef.current;
      
      if (elapsed >= stepDuration) {
        setCurrentStep((prev) => {
          const nextStep = prev + 1;
          if (nextStep >= searchResult.steps.length) {
            setIsPlaying(false);
            stopAnimation();
            return prev;
          }
          return nextStep;
        });
        lastStepTimeRef.current = timestamp;
      }
      
      if (animationRef.current !== null) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      stopAnimation();
    };
  }, [isPlaying, isPaused, searchResult, speed, stopAnimation]);

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  const handlePlay = useCallback(() => {
    if (!searchResult) {
      runSearch();
      return;
    }
    lastStepTimeRef.current = 0;
    setIsPlaying(true);
    setIsPaused(false);
  }, [searchResult, runSearch]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    stopAnimation();
  }, [stopAnimation]);

  const handleReset = useCallback(() => {
    stopAnimation();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    setSearchResult(null);
  }, [stopAnimation]);

  const handleStepForward = useCallback(() => {
    if (searchResult && currentStep < searchResult.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [searchResult, currentStep]);

  const handleStepBackward = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSeek = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleGridCellClick = useCallback((row: number, col: number) => {
    if (problem.type !== "grid") return;
    
    setProblem((prevProblem) => {
      const gridProblem = prevProblem as GridProblem;
      const cellKey = `${row}-${col}`;
      const cellIndex = cellMap.get(cellKey);
      
      if (cellIndex === undefined) return prevProblem;
      
      const cell = gridProblem.cells[cellIndex];
      const updatedCells = [...gridProblem.cells];
      
      switch (selectedTool) {
        case "addObstacle":
          if (!cell.isStart && !cell.isGoal) {
            updatedCells[cellIndex] = { ...cell, isObstacle: true };
          }
          break;
        case "removeObstacle":
          updatedCells[cellIndex] = { ...cell, isObstacle: false };
          break;
        case "setStart": {
          const prevStartIndex = updatedCells.findIndex((c) => c.isStart);
          if (prevStartIndex !== -1) {
            updatedCells[prevStartIndex] = { ...updatedCells[prevStartIndex], isStart: false };
          }
          updatedCells[cellIndex] = { ...cell, isStart: true, isObstacle: false, isGoal: false };
          return { ...gridProblem, cells: updatedCells, start: { row, col } };
        }
        case "setGoal": {
          const prevGoalIndex = updatedCells.findIndex((c) => c.isGoal);
          if (prevGoalIndex !== -1) {
            updatedCells[prevGoalIndex] = { ...updatedCells[prevGoalIndex], isGoal: false };
          }
          updatedCells[cellIndex] = { ...cell, isGoal: true, isObstacle: false, isStart: false };
          return { ...gridProblem, cells: updatedCells, goal: { row, col } };
        }
        default:
          return prevProblem;
      }
      
      return { ...gridProblem, cells: updatedCells };
    });
  }, [problem.type, selectedTool, cellMap]);

  const handleGridCellDrag = useCallback((row: number, col: number) => {
    if (selectedTool === "addObstacle" || selectedTool === "removeObstacle") {
      handleGridCellClick(row, col);
    }
  }, [selectedTool, handleGridCellClick]);

  const [edgeStartNode, setEdgeStartNode] = useState<string | null>(null);

  const handleGraphNodeClick = useCallback((nodeId: string) => {
    if (problem.type !== "graph") return;
    
    setProblem((prevProblem) => {
      const graphProblem = prevProblem as GraphProblem;
      
      switch (selectedTool) {
        case "setStart": {
          const updatedNodes = graphProblem.nodes.map((n) => ({
            ...n,
            isStart: n.id === nodeId,
            isGoal: n.id === nodeId ? false : n.isGoal,
          }));
          return { ...graphProblem, nodes: updatedNodes, startNodeId: nodeId };
        }
        case "setGoal": {
          const updatedNodes = graphProblem.nodes.map((n) => ({
            ...n,
            isGoal: n.id === nodeId,
            isStart: n.id === nodeId ? false : n.isStart,
          }));
          return { ...graphProblem, nodes: updatedNodes, goalNodeId: nodeId };
        }
        default:
          return prevProblem;
      }
    });
  }, [problem.type, selectedTool]);

  const handleGraphCanvasClick = useCallback((x: number, y: number) => {
    if (problem.type !== "graph" || selectedTool !== "addNode") return;
    
    setProblem((prevProblem) => {
      const graphProblem = prevProblem as GraphProblem;
      const newNodeId = `N${graphProblem.nodes.length + 1}`;
      const newNode = {
        id: newNodeId,
        x,
        y,
        label: newNodeId,
        isStart: graphProblem.nodes.length === 0,
        isGoal: false,
      };
      
      return {
        ...graphProblem,
        nodes: [...graphProblem.nodes, newNode],
        startNodeId: graphProblem.nodes.length === 0 ? newNodeId : graphProblem.startNodeId,
      };
    });
  }, [problem.type, selectedTool]);

  const handleGraphNodeDrag = useCallback((nodeId: string, x: number, y: number) => {
    if (problem.type !== "graph") return;
    
    setProblem((prevProblem) => {
      const graphProblem = prevProblem as GraphProblem;
      const updatedNodes = graphProblem.nodes.map((n) =>
        n.id === nodeId ? { ...n, x, y } : n
      );
      return { ...graphProblem, nodes: updatedNodes };
    });
  }, [problem.type]);

  const handleEdgeCreate = useCallback((fromId: string, toId: string) => {
    if (problem.type !== "graph") return;
    
    setProblem((prevProblem) => {
      const graphProblem = prevProblem as GraphProblem;
      const existingEdge = graphProblem.edges.find(
        (e) => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
      );
      if (existingEdge || fromId === toId) return prevProblem;
      
      return {
        ...graphProblem,
        edges: [...graphProblem.edges, { from: fromId, to: toId, weight: 1 }],
      };
    });
  }, [problem.type]);

  const randomizeProblem = useCallback(() => {
    handleReset();
    
    if (problemType === "grid") {
      setProblem((prevProblem) => {
        const gridProblem = prevProblem as GridProblem;
        const obstacleRate = 0.25;
        
        const updatedCells = gridProblem.cells.map((cell) => {
          if (cell.isStart || cell.isGoal) return cell;
          return {
            ...cell,
            isObstacle: Math.random() < obstacleRate,
          };
        });
        
        return { ...gridProblem, cells: updatedCells };
      });
    } else {
      const nodeCount = 8;
      const width = 700;
      const height = 500;
      const padding = 50;
      
      const nodes = Array.from({ length: nodeCount }, (_, i) => ({
        id: `N${i + 1}`,
        x: padding + Math.random() * (width - 2 * padding),
        y: padding + Math.random() * (height - 2 * padding),
        label: `N${i + 1}`,
        isStart: i === 0,
        isGoal: i === nodeCount - 1,
      }));
      
      const edges: { from: string; to: string; weight: number }[] = [];
      for (let i = 0; i < nodeCount - 1; i++) {
        edges.push({ from: nodes[i].id, to: nodes[i + 1].id, weight: Math.ceil(Math.random() * 5) });
      }
      for (let i = 0; i < Math.floor(nodeCount * 0.5); i++) {
        const from = Math.floor(Math.random() * nodeCount);
        const to = Math.floor(Math.random() * nodeCount);
        if (from !== to && !edges.some((e) => (e.from === nodes[from].id && e.to === nodes[to].id))) {
          edges.push({ from: nodes[from].id, to: nodes[to].id, weight: Math.ceil(Math.random() * 5) });
        }
      }
      
      setProblem({
        type: "graph",
        nodes,
        edges,
        startNodeId: nodes[0].id,
        goalNodeId: nodes[nodeCount - 1].id,
        isDirected: false,
      });
    }
  }, [problemType, handleReset]);

  const clearProblem = useCallback(() => {
    handleReset();
    
    if (problemType === "grid") {
      setProblem((prevProblem) => {
        const gridProblem = prevProblem as GridProblem;
        const updatedCells = gridProblem.cells.map((cell) => ({
          ...cell,
          isObstacle: false,
        }));
        return { ...gridProblem, cells: updatedCells };
      });
    } else {
      setProblem(createEmptyGraph());
    }
  }, [problemType, handleReset]);

  const handleProblemTypeChange = useCallback((type: ProblemType) => {
    handleReset();
    setProblemType(type);
  }, [handleReset]);

  const handleProblemChange = useCallback((newProblem: Problem) => {
    handleReset();
    setProblem(newProblem);
  }, [handleReset]);

  const isDisabled = isPlaying && !isPaused;

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-4 overflow-hidden" data-testid="home-page">
      <aside className="w-full lg:w-80 flex-shrink-0 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            <AlgorithmSelector
              selectedAlgorithm={selectedAlgorithm}
              onSelect={setSelectedAlgorithm}
              disabled={isDisabled}
            />
            
            <ProblemSettings
              problemType={problemType}
              problem={problem}
              onProblemTypeChange={handleProblemTypeChange}
              onProblemChange={handleProblemChange}
              onRandomize={randomizeProblem}
              onClear={clearProblem}
              disabled={isDisabled}
            />
            
            <ToolPalette
              problemType={problemType}
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
              disabled={isDisabled}
            />
            
            <PlaybackControls
              isPlaying={isPlaying}
              isPaused={isPaused}
              currentStep={currentStep}
              totalSteps={searchResult?.steps.length ?? 0}
              speed={speed}
              onPlay={handlePlay}
              onPause={handlePause}
              onReset={handleReset}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onSpeedChange={setSpeed}
              onSeek={handleSeek}
              disabled={isRunning}
            />
            
            <Card className="border-card-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-costs" className="text-sm flex items-center gap-2">
                    {showCosts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    Show Costs
                  </Label>
                  <Switch
                    id="show-costs"
                    checked={showCosts}
                    onCheckedChange={setShowCosts}
                    data-testid="switch-show-costs"
                  />
                </div>
                
                <Separator />
                
                <Button
                  onClick={runSearch}
                  disabled={isDisabled || isRunning}
                  className="w-full"
                  data-testid="button-run-algorithm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Algorithm
                </Button>
                
                {searchResult && (
                  <Button
                    variant="outline"
                    onClick={addToComparison}
                    className="w-full"
                    data-testid="button-add-comparison"
                  >
                    Add to Comparison
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
        <Card className="flex-1 border-card-border overflow-hidden min-h-[300px]">
          <CardContent className="p-0 h-full">
            {problemType === "grid" ? (
              <GridCanvas
                problem={problem as GridProblem}
                currentStep={currentSearchStep}
                selectedTool={selectedTool}
                showCosts={showCosts}
                onCellClick={handleGridCellClick}
                onCellDrag={handleGridCellDrag}
              />
            ) : (
              <GraphCanvas
                problem={problem as GraphProblem}
                currentStep={currentSearchStep}
                selectedTool={selectedTool}
                showCosts={showCosts}
                onNodeClick={handleGraphNodeClick}
                onCanvasClick={handleGraphCanvasClick}
                onNodeDrag={handleGraphNodeDrag}
                onEdgeCreate={handleEdgeCreate}
                selectedEdgeStart={edgeStartNode}
                onEdgeStartSelect={setEdgeStartNode}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex-shrink-0 space-y-4 overflow-auto pb-4">
          <MetricsDashboard result={searchResult} isRunning={isRunning} />
          <ComparisonChart results={comparisonResults} onClear={() => setComparisonResults([])} />
        </div>
      </main>
    </div>
  );
}
