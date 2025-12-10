import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Table as TableIcon, Download, Trash2 } from "lucide-react";
import type { SearchResult } from "@shared/schema";
import { algorithmNames } from "@shared/schema";

interface ComparisonChartProps {
  results: SearchResult[];
  onClear: () => void;
}

export function ComparisonChart({ results, onClear }: ComparisonChartProps) {
  if (results.length === 0) {
    return (
      <Card className="border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Algorithm Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Run multiple algorithms to compare their performance
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = results.map((result) => ({
    name: algorithmNames[result.algorithm].split(" ").slice(0, 2).join(" "),
    algorithm: result.algorithm,
    "Execution Time (ms)": parseFloat(result.executionTimeMs.toFixed(2)),
    "Nodes Visited": result.nodesVisited,
    "Path Cost": result.pathCost ?? 0,
  }));

  const handleExport = () => {
    const data = results.map((r) => ({
      Algorithm: algorithmNames[r.algorithm],
      "Execution Time (ms)": r.executionTimeMs.toFixed(2),
      "Nodes Visited": r.nodesVisited,
      "Path Cost": r.pathCost?.toFixed(2) ?? "N/A",
      "Memory (KB)": r.memoryUsageKb ?? "N/A",
      Success: r.success ? "Yes" : "No",
    }));

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "algorithm-comparison.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Algorithm Comparison
            <Badge variant="secondary" className="ml-2">{results.length} runs</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={onClear} data-testid="button-clear-comparison">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="chart" className="flex items-center gap-2" data-testid="tab-chart">
              <BarChart3 className="h-4 w-4" />
              Chart
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2" data-testid="tab-table">
              <TableIcon className="h-4 w-4" />
              Table
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Execution Time (ms)" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Nodes Visited" fill="hsl(262 83% 58%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Path Cost" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="table">
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Algorithm</TableHead>
                    <TableHead className="font-semibold text-right">Time (ms)</TableHead>
                    <TableHead className="font-semibold text-right">Nodes</TableHead>
                    <TableHead className="font-semibold text-right">Path Cost</TableHead>
                    <TableHead className="font-semibold text-right">Memory (KB)</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {algorithmNames[result.algorithm]}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {result.executionTimeMs.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {result.nodesVisited}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {result.pathCost?.toFixed(2) ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {result.memoryUsageKb ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.success ? (
                          <Badge className="bg-node-start text-xs">Found</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Failed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
