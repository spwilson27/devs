declare module "@devs/core/persistence" {
  import type Database from "better-sqlite3";

  export function createDatabase(options?: any): Database.Database;
  export function closeDatabase(): void;
  export function initializeSchema(db: Database.Database): void;

  export class StateRepository {
    constructor(db: any);
    upsertProject(project: { name: string }): number;
    appendAgentLog(...args: any[]): void;
    addDocument(...args: any[]): void;
    saveEpics(...args: any[]): void;
    saveTasks(...args: any[]): void;
    updateTaskStatus(...args: any[]): void;
  }

  export function initializeAuditSchema(db: Database.Database): void;

  export class SpecScanner {
    constructor(opts?: Record<string, unknown>);
    scan(): Promise<Array<Record<string, unknown>>>;
  }

  export class GitLogParser {
    constructor(opts?: Record<string, unknown>);
    parse(): Promise<Array<Record<string, unknown>>>;
  }

  export class RoadmapReconstructor {
    constructor(opts?: { repoRoot?: string });
    reconstruct(options?: { force?: boolean }): Promise<{ statePath: string }>;
  }

  export {};
}
