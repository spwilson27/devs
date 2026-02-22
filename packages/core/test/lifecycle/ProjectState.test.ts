import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import type Database from "better-sqlite3";
import {
  createDatabase,
  closeDatabase,
} from "../../src/persistence/database.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import { StateRepository } from "../../src/persistence/state_repository.js";
import {
  ProjectStatus,
  ProjectPhase,
  validateTransition,
} from "../../src/types/lifecycle.js";

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(tmpdir(), `devs-lifecycle-test-${unique}`, ".devs", "state.sqlite");
}

describe("Project lifecycle enums and schema", () => {
  describe("validateTransition helper", () => {
    it("allows valid transitions", () => {
      expect(validateTransition(undefined, ProjectStatus.INITIALIZING)).toBe(true);
      expect(validateTransition(ProjectStatus.INITIALIZING, ProjectStatus.ACTIVE)).toBe(true);
      expect(validateTransition(ProjectStatus.ACTIVE, ProjectStatus.PAUSED)).toBe(true);
      expect(validateTransition(ProjectStatus.PAUSED, ProjectStatus.ACTIVE)).toBe(true);
      expect(validateTransition(ProjectStatus.ACTIVE, ProjectStatus.COMPLETED)).toBe(true);
    });

    it("rejects invalid transitions such as COMPLETED -> INITIALIZING", () => {
      expect(validateTransition(ProjectStatus.COMPLETED, ProjectStatus.INITIALIZING)).toBe(false);
      expect(validateTransition(ProjectStatus.COMPLETED, ProjectStatus.ACTIVE)).toBe(false);
    });
  });

  describe("persistence of enum values in projects table", () => {
    let db: Database.Database;
    let repo: StateRepository;
    let testDbPath: string;

    beforeEach(() => {
      testDbPath = makeTestDbPath();
      db = createDatabase({ dbPath: testDbPath });
      initializeSchema(db);
      repo = new StateRepository(db);
    });

    afterEach(() => {
      db.close();
      closeDatabase();
      const testRoot = resolve(dirname(testDbPath), "..");
      if (existsSync(testRoot)) {
        rmSync(testRoot, { recursive: true, force: true });
      }
    });

    it("stores and retrieves ProjectStatus and ProjectPhase strings", () => {
      const projectId = repo.upsertProject({
        name: "Enum Persistence",
        status: ProjectStatus.INITIALIZING,
        current_phase: ProjectPhase.FOUNDATION,
        last_milestone: "ms-1",
      });

      const row = db
        .prepare("SELECT status, current_phase, last_milestone FROM projects WHERE id = ?")
        .get(projectId) as { status: string; current_phase: string; last_milestone: string };

      expect(row.status).toBe(ProjectStatus.INITIALIZING);
      expect(row.current_phase).toBe(ProjectPhase.FOUNDATION);
      expect(row.last_milestone).toBe("ms-1");
    });
  });
});
