import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { problemSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/problems", async (req, res) => {
    try {
      const { name, problem } = req.body;
      
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Name is required" });
      }
      
      const validatedProblem = problemSchema.parse(problem);
      const savedProblem = await storage.saveProblem(name, validatedProblem);
      res.json(savedProblem);
    } catch (error) {
      res.status(400).json({ error: "Invalid problem data" });
    }
  });

  app.get("/api/problems", async (req, res) => {
    const problems = await storage.getAllProblems();
    res.json(problems);
  });

  app.get("/api/problems/:id", async (req, res) => {
    const problem = await storage.getProblem(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    res.json(problem);
  });

  app.delete("/api/problems/:id", async (req, res) => {
    const deleted = await storage.deleteProblem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Problem not found" });
    }
    res.json({ success: true });
  });

  app.post("/api/comparison-runs", async (req, res) => {
    try {
      const { problemName, results } = req.body;
      
      if (!problemName || !Array.isArray(results)) {
        return res.status(400).json({ error: "Invalid comparison data" });
      }
      
      const run = await storage.saveComparisonRun(problemName, results);
      res.json(run);
    } catch (error) {
      res.status(400).json({ error: "Failed to save comparison run" });
    }
  });

  app.get("/api/comparison-runs", async (req, res) => {
    const runs = await storage.getComparisonRuns();
    res.json(runs);
  });

  return httpServer;
}
