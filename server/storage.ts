import type { Problem, SearchResult, SavedProblem, ComparisonRun } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  saveProblem(name: string, problem: Problem): Promise<SavedProblem>;
  getProblem(id: string): Promise<SavedProblem | undefined>;
  getAllProblems(): Promise<SavedProblem[]>;
  deleteProblem(id: string): Promise<boolean>;
  saveComparisonRun(problemName: string, results: SearchResult[]): Promise<ComparisonRun>;
  getComparisonRuns(): Promise<ComparisonRun[]>;
}

export class MemStorage implements IStorage {
  private problems: Map<string, SavedProblem>;
  private comparisonRuns: Map<string, ComparisonRun>;

  constructor() {
    this.problems = new Map();
    this.comparisonRuns = new Map();
  }

  async saveProblem(name: string, problem: Problem): Promise<SavedProblem> {
    const id = randomUUID();
    const savedProblem: SavedProblem = {
      id,
      name,
      problem,
      createdAt: new Date().toISOString(),
    };
    this.problems.set(id, savedProblem);
    return savedProblem;
  }

  async getProblem(id: string): Promise<SavedProblem | undefined> {
    return this.problems.get(id);
  }

  async getAllProblems(): Promise<SavedProblem[]> {
    return Array.from(this.problems.values());
  }

  async deleteProblem(id: string): Promise<boolean> {
    return this.problems.delete(id);
  }

  async saveComparisonRun(problemName: string, results: SearchResult[]): Promise<ComparisonRun> {
    const id = randomUUID();
    const run: ComparisonRun = {
      id,
      problemName,
      results,
      timestamp: new Date().toISOString(),
    };
    this.comparisonRuns.set(id, run);
    return run;
  }

  async getComparisonRuns(): Promise<ComparisonRun[]> {
    return Array.from(this.comparisonRuns.values());
  }
}

export const storage = new MemStorage();
