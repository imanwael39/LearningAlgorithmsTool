import { Clock, Route, Hash, HardDrive, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@shared/schema";
import { algorithmNames } from "@shared/schema";

interface MetricsDashboardProps {
  result: SearchResult | null;
  isRunning: boolean;
}

interface MetricCardProps {
  icon: typeof Clock;
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

function MetricCard({ icon: Icon, label, value, unit, highlight }: MetricCardProps) {
  return (
    <Card className={`border-card-border ${highlight ? "border-primary/50 bg-primary/5" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${highlight ? "bg-primary/10" : "bg-muted"}`}>
            <Icon className={`h-4 w-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-semibold font-mono truncate">
              {value}
              {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricsDashboard({ result, isRunning }: MetricsDashboardProps) {
  if (!result && !isRunning) {
    return (
      <Card className="border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Hash className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Run an algorithm to see performance metrics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isRunning) {
    return (
      <Card className="border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Performance Metrics
            <Badge variant="secondary" className="animate-pulse">Running...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard icon={Clock} label="Execution Time" value="--" unit="ms" />
            <MetricCard icon={Hash} label="Nodes Visited" value="--" />
            <MetricCard icon={Route} label="Path Cost" value="--" />
            <MetricCard icon={HardDrive} label="Memory Used" value="--" unit="KB" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-semibold">Performance Metrics</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium">
              {algorithmNames[result!.algorithm]}
            </Badge>
            {result!.success ? (
              <Badge className="bg-node-start">
                <CheckCircle className="h-3 w-3 mr-1" />
                Path Found
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                No Path
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={Clock}
            label="Execution Time"
            value={result!.executionTimeMs.toFixed(2)}
            unit="ms"
            highlight
          />
          <MetricCard
            icon={Hash}
            label="Nodes Visited"
            value={result!.nodesVisited}
          />
          <MetricCard
            icon={Route}
            label="Path Cost"
            value={result!.pathCost !== undefined ? result!.pathCost.toFixed(2) : "N/A"}
            highlight={result!.success}
          />
          <MetricCard
            icon={HardDrive}
            label="Memory Used"
            value={result!.memoryUsageKb ?? "--"}
            unit="KB"
          />
        </div>

        {result!.finalPath && result!.finalPath.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground mb-2">Final Path ({result!.finalPath.length} nodes)</p>
            <div className="flex flex-wrap gap-1">
              {result!.finalPath.map((nodeId, index) => (
                <div key={index} className="flex items-center">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {nodeId}
                  </Badge>
                  {index < result!.finalPath!.length - 1 && (
                    <span className="mx-1 text-muted-foreground">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
