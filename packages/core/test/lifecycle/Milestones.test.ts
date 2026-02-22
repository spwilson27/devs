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
import { MilestoneService } from "../../src/lifecycle/MilestoneService.js";

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(tmpdir(), `devs-milestone-test-${unique}`, ".devs", "state.sqlite");
}

describe("MilestoneService progress calculations", () => {
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

  it("returns 50% for M1 when Phase 1 tasks are all completed and Phase 2 tasks are all pending", () => {
    const projectId = repo.upsertProject({ name: "Milestone Progress" });

    // Create two epics representing Phase 1 and Phase 2
    repo.saveEpics([
      { project_id: projectId, name: "Phase 1", order_index: 1, status: "pending" },
      { project_id: projectId, name: "Phase 2", order_index: 2, status: "pending" },
    ]);

    // Retrieve epics with DB-assigned ids
    const stateAfterEpics = repo.getProjectState(projectId)!;
    const [ep1, ep2] = stateAfterEpics.epics;

    // Two completed tasks in Phase 1, two pending tasks in Phase 2
    repo.saveTasks([
      { epic_id: ep1.id!, title: "p1-t1", status: "completed" },
      { epic_id: ep1.id!, title: "p1-t2", status: "completed" },
      { epic_id: ep2.id!, title: "p2-t1", status: "pending" },
      { epic_id: ep2.id!, title: "p2-t2", status: "pending" },
    ]);

    const svc = new MilestoneService(repo, projectId);
    const progress = svc.calculateProgress("M1");
    expect(progress).toBe(50);
    expect(svc.isMilestoneComplete("M1")).toBe(false);

    // Mark Phase 2 tasks completed and verify progress and completion
    const afterTasks = repo.getProjectState(projectId)!;
    for (const t of afterTasks.tasks) {
      repo.updateTaskStatus(t.id!, "completed");
    }

    expect(svc.calculateProgress("M1")).toBe(100);
    expect(svc.isMilestoneComplete("M1")).toBe(true);
  });
});
