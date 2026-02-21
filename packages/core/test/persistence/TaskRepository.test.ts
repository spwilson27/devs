/**
 * packages/core/test/persistence/TaskRepository.test.ts
 *
 * Integration tests for TaskRepository.
 *
 * Verifies:
 *   - `updateGitHash` persists the SHA to the `git_commit_hash` column.
 *   - `updateGitHash` throws `TaskNotFoundError` for non-existent tasks.
 *   - Full round-trip: create task → mark complete → store hash → retrieve.
 *   - `getTask` retrieves a task by numeric id (or returns null for missing).
 *   - `getTaskByGitHash` enables "Time-Travel" lookup by commit SHA.
 *
 * Requirements: [TAS-095], [TAS-114], [9_ROADMAP-REQ-015]
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import type Database from "better-sqlite3";
import {
  createDatabase,
  closeDatabase,
} from "../../src/persistence/database.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import { StateRepository } from "../../src/persistence/state_repository.js";
import {
  TaskRepository,
  TaskNotFoundError,
  type TaskRow,
} from "../../src/persistence/TaskRepository.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(
    tmpdir(),
    `devs-task-repo-test-${unique}`,
    ".devs",
    "state.sqlite"
  );
}

/**
 * Creates a minimal project → epic → task hierarchy in the DB and returns
 * the numeric task id.
 */
function seedTask(
  stateRepo: StateRepository,
  opts: { title?: string; status?: string } = {}
): number {
  const projectId = stateRepo.upsertProject({ name: "Test Project" });
  stateRepo.saveEpics([{ project_id: projectId, name: "Test Epic" }]);

  // `saveEpics` returns void — query the inserted epic id directly.
  const db = (stateRepo as unknown as { db: Database.Database }).db;
  const epicRow = db
    .prepare("SELECT id FROM epics WHERE project_id = ? ORDER BY id DESC LIMIT 1")
    .get(projectId) as { id: number };

  const taskTitle = opts.title ?? "Test Task";
  const taskStatus = opts.status ?? "pending";

  db.prepare(
    "INSERT INTO tasks (epic_id, title, status) VALUES (?, ?, ?)"
  ).run(epicRow.id, taskTitle, taskStatus);

  const taskRow = db
    .prepare("SELECT id FROM tasks WHERE epic_id = ? ORDER BY id DESC LIMIT 1")
    .get(epicRow.id) as { id: number };

  return taskRow.id;
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe("TaskRepository", () => {
  let db: Database.Database;
  let stateRepo: StateRepository;
  let taskRepo: TaskRepository;

  beforeEach(() => {
    db = createDatabase({ dbPath: makeTestDbPath() });
    initializeSchema(db);
    stateRepo = new StateRepository(db);
    taskRepo = new TaskRepository(db);
  });

  afterEach(() => {
    closeDatabase();
  });

  // ── updateGitHash ──────────────────────────────────────────────────────────

  describe("updateGitHash", () => {
    it("stores the 40-character SHA in git_commit_hash", () => {
      const taskId = seedTask(stateRepo);
      const sha = "a".repeat(40);

      taskRepo.updateGitHash(taskId, sha);

      const row = db
        .prepare("SELECT git_commit_hash FROM tasks WHERE id = ?")
        .get(taskId) as { git_commit_hash: string };
      expect(row.git_commit_hash).toBe(sha);
    });

    it("can overwrite a previously stored hash", () => {
      const taskId = seedTask(stateRepo);
      const sha1 = "a".repeat(40);
      const sha2 = "b".repeat(40);

      taskRepo.updateGitHash(taskId, sha1);
      taskRepo.updateGitHash(taskId, sha2);

      const row = db
        .prepare("SELECT git_commit_hash FROM tasks WHERE id = ?")
        .get(taskId) as { git_commit_hash: string };
      expect(row.git_commit_hash).toBe(sha2);
    });

    it("throws TaskNotFoundError for a non-existent task id", () => {
      expect(() => taskRepo.updateGitHash(99999, "a".repeat(40))).toThrow(
        TaskNotFoundError
      );
    });

    it("throws TaskNotFoundError with a message containing the task id", () => {
      expect(() => taskRepo.updateGitHash(42, "a".repeat(40))).toThrow(
        /42/
      );
    });

    it("does not affect other tasks in the same table", () => {
      const taskId1 = seedTask(stateRepo, { title: "Task 1" });
      const taskId2 = seedTask(stateRepo, { title: "Task 2" });
      const sha = "c".repeat(40);

      taskRepo.updateGitHash(taskId1, sha);

      const row2 = db
        .prepare("SELECT git_commit_hash FROM tasks WHERE id = ?")
        .get(taskId2) as { git_commit_hash: string | null };
      expect(row2.git_commit_hash).toBeNull();
    });
  });

  // ── getTask ────────────────────────────────────────────────────────────────

  describe("getTask", () => {
    it("returns the task row for an existing task id", () => {
      const taskId = seedTask(stateRepo, { title: "My Task", status: "pending" });

      const task = taskRepo.getTask(taskId);

      expect(task).not.toBeNull();
      expect(task!.id).toBe(taskId);
      expect(task!.title).toBe("My Task");
      expect(task!.status).toBe("pending");
    });

    it("returns null for a non-existent task id", () => {
      expect(taskRepo.getTask(99999)).toBeNull();
    });

    it("returns git_commit_hash after updateGitHash is called", () => {
      const taskId = seedTask(stateRepo);
      const sha = "d".repeat(40);

      taskRepo.updateGitHash(taskId, sha);
      const task = taskRepo.getTask(taskId);

      expect(task!.git_commit_hash).toBe(sha);
    });

    it("returns git_commit_hash as null before any hash is stored", () => {
      const taskId = seedTask(stateRepo);
      const task = taskRepo.getTask(taskId);

      expect(task!.git_commit_hash).toBeNull();
    });
  });

  // ── getTaskByGitHash ───────────────────────────────────────────────────────

  describe("getTaskByGitHash", () => {
    it("returns the task associated with the given git hash", () => {
      const taskId = seedTask(stateRepo, { title: "Committed Task" });
      const sha = "e".repeat(40);

      taskRepo.updateGitHash(taskId, sha);
      const task = taskRepo.getTaskByGitHash(sha);

      expect(task).not.toBeNull();
      expect(task!.id).toBe(taskId);
      expect(task!.title).toBe("Committed Task");
      expect(task!.git_commit_hash).toBe(sha);
    });

    it("returns null when no task has the given hash", () => {
      expect(taskRepo.getTaskByGitHash("f".repeat(40))).toBeNull();
    });

    it("enables time-travel rewind by locating the task for a commit SHA", () => {
      // Simulate two tasks with different commit SHAs.
      const taskId1 = seedTask(stateRepo, { title: "First Task" });
      const taskId2 = seedTask(stateRepo, { title: "Second Task" });
      const sha1 = "1".repeat(40);
      const sha2 = "2".repeat(40);

      taskRepo.updateGitHash(taskId1, sha1);
      taskRepo.updateGitHash(taskId2, sha2);

      // Look up by hash — simulates `devs rewind <sha>`.
      const foundTask1 = taskRepo.getTaskByGitHash(sha1);
      const foundTask2 = taskRepo.getTaskByGitHash(sha2);

      expect(foundTask1!.id).toBe(taskId1);
      expect(foundTask2!.id).toBe(taskId2);
    });
  });

  // ── full round-trip ────────────────────────────────────────────────────────

  describe("full round-trip", () => {
    it("creates a task, marks it complete, stores the git hash, and retrieves it", () => {
      // 1. Create a task in pending state.
      const taskId = seedTask(stateRepo, { status: "pending" });

      // 2. Verify initial state — no hash, status is pending.
      let task = taskRepo.getTask(taskId);
      expect(task!.status).toBe("pending");
      expect(task!.git_commit_hash).toBeNull();

      // 3. Mark the task as completed (simulating task implementation).
      stateRepo.updateTaskStatus(taskId, "completed");

      // 4. Store the git commit hash (simulating a successful git snapshot).
      const commitSha = "abcdef1234567890abcdef1234567890abcdef12";
      taskRepo.updateGitHash(taskId, commitSha);

      // 5. Retrieve via getTask and verify both status and hash are persisted.
      task = taskRepo.getTask(taskId);
      expect(task!.status).toBe("completed");
      expect(task!.git_commit_hash).toBe(commitSha);

      // 6. Confirm the hash is also queryable via getTaskByGitHash (rewind path).
      const rewindTask = taskRepo.getTaskByGitHash(commitSha);
      expect(rewindTask!.id).toBe(taskId);
    });

    it("TaskNotFoundError is thrown before any DB change on missing task", () => {
      const sha = "a".repeat(40);
      // No tasks seeded — table is empty.
      expect(() => taskRepo.updateGitHash(1, sha)).toThrow(TaskNotFoundError);

      // Verify DB state is clean — no rows mutated.
      const count = (
        db.prepare("SELECT COUNT(*) AS n FROM tasks").get() as { n: number }
      ).n;
      expect(count).toBe(0);
    });
  });
});
