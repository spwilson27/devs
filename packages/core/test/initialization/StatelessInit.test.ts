import { describe, it, expect } from "vitest";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { existsSync, rmSync } from "node:fs";
import type Database from "better-sqlite3";
import {
  createDatabase,
  closeDatabase,
} from "../../src/persistence/database.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import { StateRepository } from "../../src/persistence/state_repository.js";

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(tmpdir(), `devs-stateless-init-${unique}`, ".devs", "state.sqlite");
}

describe("Stateless initialization and reload", () => {
  it("reloads project context from disk after full shutdown and reflects updates", () => {
    const dbPath = makeTestDbPath();

    // Phase 1: Create DB and populate state
    const db1: Database.Database = createDatabase({ dbPath });
    initializeSchema(db1);
    const repo1 = new StateRepository(db1);

    const projectId = repo1.upsertProject({ name: "stateless-project" });

    repo1.saveRequirements([
      { project_id: projectId, description: "REQ-1: something" },
      { project_id: projectId, description: "REQ-2: another" },
    ]);

    repo1.saveEpics([{ project_id: projectId, name: "Phase 1", order_index: 0 }]);

    const epicRow = db1.prepare("SELECT id FROM epics WHERE project_id = ?").get(projectId) as { id: number };
    const epicId = epicRow.id;

    repo1.saveTasks([
      { epic_id: epicId, title: "Task A", status: "pending" },
      { epic_id: epicId, title: "Task B", status: "pending" },
    ]);

    const taskRow = db1.prepare("SELECT id FROM tasks WHERE epic_id = ? LIMIT 1").get(epicId) as { id: number };
    const taskId = taskRow.id;

    // Close the process (simulate shutdown)
    try {
      db1.close();
    } catch {}

    // Phase 2: Re-open DB in a fresh process and reload context
    const db2: Database.Database = createDatabase({ dbPath });
    const repo2 = new StateRepository(db2);

    const state = repo2.reloadProjectContext(projectId);
    expect(state).not.toBeNull();
    expect(state!.requirements.length).toBe(2);
    expect(state!.epics.length).toBe(1);
    expect(state!.tasks.length).toBe(2);

    // Update a task status and ensure it persists across another restart
    repo2.updateTaskStatus(taskId, "in_progress");

    try {
      db2.close();
    } catch {}

    // Phase 3: Re-open again and verify the status change is reflected
    const db3: Database.Database = createDatabase({ dbPath });
    const repo3 = new StateRepository(db3);
    const state3 = repo3.reloadProjectContext(projectId);
    expect(state3).not.toBeNull();

    const taskAfter = state3!.tasks.find((t) => t.id === taskId);
    expect(taskAfter).toBeDefined();
    expect(taskAfter!.status).toBe("in_progress");

    // Cleanup
    try {
      db3.close();
    } catch {}
    try {
      closeDatabase();
    } catch {}

    const testRoot = resolve(dirname(dbPath), "..");
    if (existsSync(testRoot)) {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });
});
