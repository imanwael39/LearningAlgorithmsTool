import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Cpu, GitBranch, Target, Compass, Star, Mountain, Layers, Search } from "lucide-react";
import type { AlgorithmType } from "@shared/schema";
import { algorithmNames, coreAlgorithms, optionalAlgorithms } from "@shared/schema";

interface AlgorithmSelectorProps {
  selectedAlgorithm: AlgorithmType;
  onSelect: (algorithm: AlgorithmType) => void;
  disabled?: boolean;
}

const algorithmDescriptions: Record<AlgorithmType, string> = {
  bfs: "Explores all nodes at current depth before moving deeper. Guarantees shortest path in unweighted graphs.",
  dfs: "Explores as deep as possible before backtracking. Memory efficient but may not find optimal path.",
  ucs: "Expands nodes with lowest path cost first. Guarantees optimal path in weighted graphs.",
  greedy: "Selects nodes closest to goal using heuristic. Fast but may not find optimal path.",
  astar: "Combines path cost and heuristic. Optimal and efficient with admissible heuristic.",
  hillClimbing: "Greedy local search that always moves toward better states. May get stuck in local optima.",
  beamSearch: "Limited-width search keeping only best candidates. Trades optimality for memory efficiency.",
  idaStar: "Iterative deepening A*. Memory efficient version of A* with same optimality guarantees.",
};

const algorithmIcons: Record<AlgorithmType, typeof Cpu> = {
  bfs: GitBranch,
  dfs: Layers,
  ucs: Target,
  greedy: Compass,
  astar: Star,
  hillClimbing: Mountain,
  beamSearch: Search,
  idaStar: Cpu,
};

const algorithmProperties: Record<AlgorithmType, { optimal: boolean; complete: boolean; informed: boolean }> = {
  bfs: { optimal: true, complete: true, informed: false },
  dfs: { optimal: false, complete: false, informed: false },
  ucs: { optimal: true, complete: true, informed: false },
  greedy: { optimal: false, complete: false, informed: true },
  astar: { optimal: true, complete: true, informed: true },
  hillClimbing: { optimal: false, complete: false, informed: true },
  beamSearch: { optimal: false, complete: false, informed: true },
  idaStar: { optimal: true, complete: true, informed: true },
};

export function AlgorithmSelector({ selectedAlgorithm, onSelect, disabled }: AlgorithmSelectorProps) {
  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          Search Algorithm
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAlgorithm}
          onValueChange={(value) => onSelect(value as AlgorithmType)}
          disabled={disabled}
          className="space-y-2"
        >
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Core Algorithms</p>
            {coreAlgorithms.map((algo) => {
              const Icon = algorithmIcons[algo];
              const props = algorithmProperties[algo];
              return (
                <div
                  key={algo}
                  className={`flex items-center space-x-3 rounded-md border p-3 transition-colors hover-elevate cursor-pointer ${
                    selectedAlgorithm === algo
                      ? "border-primary bg-primary/5"
                      : "border-transparent"
                  }`}
                  onClick={() => !disabled && onSelect(algo)}
                  data-testid={`radio-algorithm-${algo}`}
                >
                  <RadioGroupItem value={algo} id={algo} className="sr-only" />
                  <Icon className={`h-4 w-4 ${selectedAlgorithm === algo ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={algo}
                      className={`font-medium cursor-pointer text-sm ${
                        selectedAlgorithm === algo ? "text-foreground" : "text-foreground/80"
                      }`}
                    >
                      {algorithmNames[algo]}
                    </Label>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {props.optimal && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Optimal</Badge>
                      )}
                      {props.complete && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Complete</Badge>
                      )}
                      {props.informed && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">Informed</Badge>
                      )}
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-info-${algo}`}>
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px]">
                      <p className="text-xs">{algorithmDescriptions[algo]}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Advanced Algorithms</p>
            {optionalAlgorithms.map((algo) => {
              const Icon = algorithmIcons[algo];
              const props = algorithmProperties[algo];
              return (
                <div
                  key={algo}
                  className={`flex items-center space-x-3 rounded-md border p-3 transition-colors hover-elevate cursor-pointer ${
                    selectedAlgorithm === algo
                      ? "border-primary bg-primary/5"
                      : "border-transparent"
                  }`}
                  onClick={() => !disabled && onSelect(algo)}
                  data-testid={`radio-algorithm-${algo}`}
                >
                  <RadioGroupItem value={algo} id={algo} className="sr-only" />
                  <Icon className={`h-4 w-4 ${selectedAlgorithm === algo ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={algo}
                      className={`font-medium cursor-pointer text-sm ${
                        selectedAlgorithm === algo ? "text-foreground" : "text-foreground/80"
                      }`}
                    >
                      {algorithmNames[algo]}
                    </Label>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {props.optimal && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Optimal</Badge>
                      )}
                      {props.complete && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Complete</Badge>
                      )}
                      {props.informed && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">Informed</Badge>
                      )}
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-info-${algo}`}>
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px]">
                      <p className="text-xs">{algorithmDescriptions[algo]}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
