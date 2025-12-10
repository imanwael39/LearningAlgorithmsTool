import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Cpu, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10">
          <Cpu className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Search Algorithms</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Visualization & Comparison Tool</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-info">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                About Search Algorithms Visualization
              </DialogTitle>
              <DialogDescription className="text-left">
                An interactive educational tool for learning and comparing search algorithms.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Supported Algorithms</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">BFS</Badge>
                  <Badge variant="secondary">DFS</Badge>
                  <Badge variant="secondary">UCS</Badge>
                  <Badge variant="secondary">Greedy Best-First</Badge>
                  <Badge variant="secondary">A*</Badge>
                  <Badge variant="outline">Hill Climbing</Badge>
                  <Badge variant="outline">Beam Search</Badge>
                  <Badge variant="outline">IDA*</Badge>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Step-by-step visualization with play/pause controls</li>
                  <li>Grid-based pathfinding and graph search modes</li>
                  <li>Real-time display of g(n), h(n), f(n) costs</li>
                  <li>Performance metrics: time, memory, nodes visited</li>
                  <li>Side-by-side algorithm comparison with charts</li>
                  <li>Import/export problem configurations</li>
                  <li>Drag-and-drop obstacle placement</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How to Use</h3>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Select an algorithm from the left panel</li>
                  <li>Create a problem: add obstacles, set start/goal</li>
                  <li>Click "Run Algorithm" to execute</li>
                  <li>Use playback controls to step through the search</li>
                  <li>Add results to comparison to analyze multiple algorithms</li>
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <ThemeToggle />
        
        <a
          href="https://github.com/imanwael39"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex"
        >
          <Button variant="ghost" size="icon" data-testid="button-github">
            <SiGithub className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </header>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="search-viz-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <div className="flex-1 overflow-hidden">
              <Router />
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
