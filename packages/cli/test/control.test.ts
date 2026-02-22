import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import Database from "better-sqlite3";
import { init, pause, resume, skip } from "../src/index.js";
import { StateRepository } from "../../core/src/persistence/state_repository.js";

function makeTempProject(): string {
  const dir = mkdtempSync(resolve(tmpdir(), "devs-cli-test-"));
  writeFileSync(resolve(dir, "package.json"), JSON.stringify({ name: "cli-control-project", private: true }));
  return dir;
}

describe("devs control CLI", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = makeTempProject();
  });

  afterEach(() => {
    try {
      if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
    } catch (err) {
      // ignore
    }
  });

  it("pauses and resumes the project (projects.status changes)", async () => {
    const rc = await init({ projectDir: tmp, force: true });
    expect(rc).toBe(0);

    const dbPath = resolve(tmp, ".devs/state.sqlite");
    expect(existsSync(dbPath)).toBe(true);

    const db = new Database(dbPath);
    try {
      await pause({ projectDir: tmp });
      const row = db.prepare("SELECT status FROM projects ORDER BY id LIMIT 1").get();
      expect(row.status).toBe("PAUSED");

      await resume({ projectDir: tmp });
      const row2 = db.prepare("SELECT status FROM projects ORDER BY id LIMIT 1").get();
      expect(row2.status).toBe("ACTIVE");
    } finally {
      db.close();
    }
  });

  it("skip marks current task as SKIPPED in tasks table", async () => {
    const rc = await init({ projectDir: tmp, force: true });
    expect(rc).toBe(0);

    const dbPath = resolve(tmp, ".devs/state.sqlite");
    const db = new Database(dbPath);
    try {
      const repo = new StateRepository(db);
      const projectRow = db.prepare("SELECT id FROM projects ORDER BY id LIMIT 1").get();
      expect(projectRow).toBeDefined();
      const projectId = projectRow.id;

      repo.saveEpics([{ project_id: projectId, name: "E1", order_index: 0 }]);
      const epicRow = db.prepare("SELECT id FROM epics WHERE project_id = ? ORDER BY order_index LIMIT 1").get(projectId);
      expect(epicRow).toBeDefined();
      const epicId = epicRow.id;

      repo.saveTasks([
        { epic_id: epicId, title: "Task 1" },
        { epic_id: epicId, title: "Task 2" },
      ]);

      const taskRow = db.prepare("SELECT id FROM tasks WHERE epic_id = ? ORDER BY id LIMIT 1").get(epicId);
      expect(taskRow).toBeDefined();
      const taskId = taskRow.id;

      repo.updateTaskStatus(taskId, "in_progress");

      await skip({ projectDir: tmp });

      const updated = db.prepare("SELECT status FROM tasks WHERE id = ?").get(taskId);
      expect(updated.status).toBe("SKIPPED");
    } finally {
      db.close();
    }
  });
});
