// Minimal ambient declarations for untyped third-party modules used in this repo.

// Provide a minimal module declaration for better-sqlite3 that exports a default
// constructor and a Statement type used across the codebase.
declare module 'better-sqlite3' {
  export type Statement = any;
  export type DB = any;
  const Database: {
    new (path: string, options?: any): DB;
  } & ((path: string, options?: any) => DB);
  export default Database;
  export { Statement };
}

// Also declare pidusage as an any-typed default export.
declare module 'pidusage' {
  const pidusage: any;
  export default pidusage;
}

// Provide a global Database namespace alias used in some files (Database.Database)
declare namespace Database {
  type Database = any;
  type Statement = any;
}

// Provide wildcard module declarations for in-repo deep imports used by tests
declare module "*src/persistence/database.js" {
  export function createDatabase(opts?: any): any;
  export function closeDatabase(): void;
}
declare module "*src/persistence/schema.js" {
  export function initializeSchema(db: any): void;
}
declare module "*src/persistence/state_repository.js" {
  export class StateRepository { constructor(db: any); upsertProject(...args: any[]): any; saveEpics(...args: any[]): any; }
}
declare module "*src/InputIngestor.js" {
  export class InputIngestor { constructor(repo: any); ingest(opts: any): any; }
}
declare module "*src/LocalityGuard.js" {
  export class LocalityGuard { constructor(repo: any, projectId?: number); runTurn(agent: any, fn: any): Promise<any>; }
}
declare module "*src/errors" {
  export class RegistryUnavailableError extends Error {}
  export class DigestMismatchError extends Error {}
}
declare module "*src/*" {
  const x: any;
  export default x;
}

declare module "@devs/core/persistence" {
  const m: any;
  export = m;
}

