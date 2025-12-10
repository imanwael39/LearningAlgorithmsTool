import { useState } from "react";
import { Grid3X3, GitBranch, Upload, Download, Shuffle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { ProblemType, GridProblem, GraphProblem, Problem } from "@shared/schema";
import { createEmptyGrid, createEmptyGraph } from "@shared/schema";

interface ProblemSettingsProps {
  problemType: ProblemType;
  problem: Problem;
  onProblemTypeChange: (type: ProblemType) => void;
  onProblemChange: (problem: Problem) => void;
  onRandomize: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export function ProblemSettings({
  problemType,
  problem,
  onProblemTypeChange,
  onProblemChange,
  onRandomize,
  onClear,
  disabled,
}: ProblemSettingsProps) {
  const { toast } = useToast();
  const [gridRows, setGridRows] = useState(problem.type === "grid" ? problem.rows : 15);
  const [gridCols, setGridCols] = useState(problem.type === "grid" ? problem.cols : 20);

  const handleTabChange = (value: string) => {
    const newType = value as ProblemType;
    onProblemTypeChange(newType);
    if (newType === "grid") {
      onProblemChange(createEmptyGrid(gridRows, gridCols));
    } else {
      onProblemChange(createEmptyGraph());
    }
  };

  const handleGridSizeChange = () => {
    if (gridRows >= 3 && gridRows <= 50 && gridCols >= 3 && gridCols <= 50) {
      onProblemChange(createEmptyGrid(gridRows, gridCols));
    }
  };

  const handleDiagonalToggle = (checked: boolean) => {
    if (problem.type === "grid") {
      onProblemChange({ ...problem, allowDiagonal: checked });
    }
  };

  const handleDirectedToggle = (checked: boolean) => {
    if (problem.type === "graph") {
      onProblemChange({ ...problem, isDirected: checked });
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(problem, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-problem-${problemType}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Problem exported",
      description: "The problem has been saved as a JSON file.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.type === "grid" || data.type === "graph") {
          onProblemTypeChange(data.type);
          onProblemChange(data);
          toast({
            title: "Problem imported",
            description: "The problem has been loaded successfully.",
          });
        } else {
          throw new Error("Invalid problem format");
        }
      } catch (err) {
        toast({
          title: "Import failed",
          description: "The file format is invalid. Please use a valid JSON file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-primary" />
          Problem Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={problemType} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="grid" disabled={disabled} data-testid="tab-grid">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="graph" disabled={disabled} data-testid="tab-graph">
              <GitBranch className="h-4 w-4 mr-2" />
              Graph
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Rows</Label>
                <Input
                  type="number"
                  min={3}
                  max={50}
                  value={gridRows}
                  onChange={(e) => setGridRows(parseInt(e.target.value) || 15)}
                  onBlur={handleGridSizeChange}
                  disabled={disabled}
                  className="h-9"
                  data-testid="input-rows"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Columns</Label>
                <Input
                  type="number"
                  min={3}
                  max={50}
                  value={gridCols}
                  onChange={(e) => setGridCols(parseInt(e.target.value) || 20)}
                  onBlur={handleGridSizeChange}
                  disabled={disabled}
                  className="h-9"
                  data-testid="input-cols"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="diagonal" className="text-sm">Allow Diagonal Movement</Label>
              <Switch
                id="diagonal"
                checked={(problem as GridProblem).allowDiagonal ?? false}
                onCheckedChange={handleDiagonalToggle}
                disabled={disabled}
                data-testid="switch-diagonal"
              />
            </div>
          </TabsContent>

          <TabsContent value="graph" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="directed" className="text-sm">Directed Graph</Label>
              <Switch
                id="directed"
                checked={(problem as GraphProblem).isDirected ?? false}
                onCheckedChange={handleDirectedToggle}
                disabled={disabled}
                data-testid="switch-directed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use the "Add Node" tool to add nodes by clicking on the canvas. 
              Use "Add Edge" to connect two nodes by clicking them sequentially.
            </p>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRandomize}
            disabled={disabled}
            className="w-full"
            data-testid="button-randomize"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Randomize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={disabled}
            className="w-full"
            data-testid="button-clear"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">File Operations</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={disabled}
              className="w-full"
              data-testid="button-download"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <label>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                className="w-full cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={disabled}
                className="hidden"
                data-testid="input-upload"
              />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
