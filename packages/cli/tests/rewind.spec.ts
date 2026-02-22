import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import Database from "better-sqlite3";
import { execSync } from "node:child_process";
import { init, rewind } from "../src/index.js";
import { StateRepository } from "../../core/src/persistence/state_repository.js";

function makeTempProject(): string {
  const dir = mkdtempSync(resolve(tmpdir(), "devs-cli-test-"));
  writeFileSync(resolve(dir, "package.json"), JSON.stringify({ name: "cli-rewind-project", private: true }));
  return dir;
}

describe("devs rewind CLI (index.rewind)", () => {
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

  it("resets git HEAD to target commit and marks subsequent tasks pending", async () => {
    const rc = await init({ projectDir: tmp, force: true });
    expect(rc).toBe(0);

    // Initialize git repo and create two commits representing two tasks
    execSync("git init", { cwd: tmp });
    execSync("git config user.email \"test@example.com\"", { cwd: tmp });
    execSync("git config user.name \"Test User\"", { cwd: tmp });

    writeFileSync(resolve(tmp, "a.txt"), "a");
    execSync("git add a.txt", { cwd: tmp });
    execSync("git commit -m \"commit1\"", { cwd: tmp });
    const commit1 = execSync("git rev-parse HEAD", { cwd: tmp }).toString().trim();

    writeFileSync(resolve(tmp, "b.txt"), "b");
    execSync("git add b.txt", { cwd: tmp });
    execSync("git commit -m \"commit2\"", { cwd: tmp });
    const commit2 = execSync("git rev-parse HEAD", { cwd: tmp }).toString().trim();

    const dbPath = resolve(tmp, ".devs/state.sqlite");
    expect(existsSync(dbPath)).toBe(true);

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

      const task1Row = db.prepare("SELECT id FROM tasks WHERE epic_id = ? ORDER BY id LIMIT 1").get(epicId);
      const task1Id = task1Row.id;
      const task2Row = db.prepare("SELECT id FROM tasks WHERE epic_id = ? ORDER BY id LIMIT 1 OFFSET 1").get(epicId);
      const task2Id = task2Row.id;

      repo.updateTaskStatus(task1Id, "completed");
      repo.updateTaskGitCommitHash(task1Id, commit1);

      repo.updateTaskStatus(task2Id, "completed");
      repo.updateTaskGitCommitHash(task2Id, commit2);

      // Now rewind to task1
      const rc2 = await rewind({ projectDir: tmp, taskId: task1Id });
      expect(rc2).toBe(0);

      const head = execSync("git rev-parse HEAD", { cwd: tmp }).toString().trim();
      expect(head).toBe(commit1);

      const t2 = db.prepare("SELECT status FROM tasks WHERE id = ?").get(task2Id);
      expect(t2.status).toBe("pending");

      const projMetaRow = db.prepare("SELECT metadata FROM projects ORDER BY id LIMIT 1").get();
      const meta = projMetaRow.metadata ? JSON.parse(projMetaRow.metadata) : {};
      expect(meta.current_task).toBe(task1Id);
    } finally {
      db.close();
    }
  });
});
