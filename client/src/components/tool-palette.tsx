import { MousePointer2, Square, Eraser, Flag, Target, Circle, ArrowRight, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import type { ToolMode, ProblemType } from "@shared/schema";

interface ToolPaletteProps {
  problemType: ProblemType;
  selectedTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  disabled?: boolean;
}

const gridTools: { tool: ToolMode; icon: typeof MousePointer2; label: string; description: string }[] = [
  { tool: "select", icon: MousePointer2, label: "Select", description: "Click and drag to navigate" },
  { tool: "addObstacle", icon: Square, label: "Add Wall", description: "Click cells to add obstacles" },
  { tool: "removeObstacle", icon: Eraser, label: "Remove Wall", description: "Click obstacles to remove them" },
  { tool: "setStart", icon: Flag, label: "Set Start", description: "Click to set the start position" },
  { tool: "setGoal", icon: Target, label: "Set Goal", description: "Click to set the goal position" },
];

const graphTools: { tool: ToolMode; icon: typeof MousePointer2; label: string; description: string }[] = [
  { tool: "select", icon: MousePointer2, label: "Select", description: "Click to select nodes" },
  { tool: "addNode", icon: Circle, label: "Add Node", description: "Click to add a new node" },
  { tool: "addEdge", icon: ArrowRight, label: "Add Edge", description: "Click two nodes to connect them" },
  { tool: "setWeight", icon: Weight, label: "Set Weight", description: "Click edges to set weights" },
  { tool: "setStart", icon: Flag, label: "Set Start", description: "Click a node to set as start" },
  { tool: "setGoal", icon: Target, label: "Set Goal", description: "Click a node to set as goal" },
];

export function ToolPalette({ problemType, selectedTool, onSelectTool, disabled }: ToolPaletteProps) {
  const tools = problemType === "grid" ? gridTools : graphTools;

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MousePointer2 className="h-5 w-5 text-primary" />
          Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {tools.map(({ tool, icon: Icon, label, description }) => (
            <Tooltip key={tool}>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedTool === tool ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectTool(tool)}
                  disabled={disabled}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-2"
                  data-testid={`button-tool-${tool}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium">{label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Legend</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-node-start" />
              <span className="text-muted-foreground">Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-node-goal" />
              <span className="text-muted-foreground">Goal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-node-obstacle" />
              <span className="text-muted-foreground">Obstacle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-node-frontier" />
              <span className="text-muted-foreground">Frontier</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-node-visited" />
              <span className="text-muted-foreground">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-node-current" />
              <span className="text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <div className="w-3 h-3 rounded-sm bg-node-path" />
              <span className="text-muted-foreground">Final Path</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
