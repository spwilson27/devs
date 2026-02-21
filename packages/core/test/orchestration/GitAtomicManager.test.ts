/**
 * packages/core/test/orchestration/GitAtomicManager.test.ts
 *
 * Tests for the GitAtomicManager — the coordinator that atomically binds
 * a SQLite task-status update to a git commit operation.
 *
 * Test strategy:
 *  - Unit tests (mock-based): verify call ordering, error propagation, and
 *    that git is never invoked when the DB update fails.
 *  - Integration tests (real SQLite + mock git): verify that the DB ends up
 *    in the correct state after a successful or failed atomic operation.
 *
 * Requirements: [8_RISKS-REQ-041], [8_RISKS-REQ-094]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GitAtomicManager } from "../../src/orchestration/GitAtomicManager.js";
import { StateRepository } from "../../src/persistence/state_repository.js";
import { GitClient, GitError } from "../../src/git/GitClient.js";
import { createDatabase, closeDatabase } from "../../src/persistence/database.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import type Database from "better-sqlite3";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTestDbPath(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "devs-git-atomic-test-"));
  return path.join(dir, "test.sqlite");
}

function setupRealDb(): { db: Database.Database; repo: StateRepository } {
  const dbPath = makeTestDbPath();
  const db = createDatabase({ dbPath });
  initializeSchema(db);
  const repo = new StateRepository(db);
  return { db, repo };
}

// ---------------------------------------------------------------------------
// Unit tests — mock-based behaviour verification
// ---------------------------------------------------------------------------

describe("GitAtomicManager (unit — mocked dependencies)", () => {
  /**
   * Helper: creates a mock StateRepository where transactionAsync simply
   * executes the callback (no real SQLite involved).
   */
  function makeMockRepo(overrides: Partial<{
    updateTaskStatus: ReturnType<typeof vi.fn>;
    updateTaskGitCommitHash: ReturnType<typeof vi.fn>;
    transactionAsyncImpl: (cb: () => Promise<unknown>) => Promise<unknown>;
  }> = {}) {
    const updateTaskStatus = overrides.updateTaskStatus ?? vi.fn();
    const updateTaskGitCommitHash = overrides.updateTaskGitCommitHash ?? vi.fn();
    const transactionAsync = vi.fn().mockImplementation(
      overrides.transactionAsyncImpl ?? ((cb: () => Promise<unknown>) => cb())
    );
    return { updateTaskStatus, updateTaskGitCommitHash, transactionAsync };
  }

  describe("commitTaskChange", () => {
    it("updates task status to 'completed' and stores the commit hash on success", async () => {
      const commitHash = "deadbeef1234567890abcdef";
      const mockRepo = makeMockRepo();
      const mockGit = { commit: vi.fn().mockResolvedValue(commitHash) };

      const manager = new GitAtomicManager(
        mockRepo as unknown as StateRepository,
        mockGit as unknown as GitClient
      );

      const result = await manager.commitTaskChange(42, "feat: complete task 42");

      expect(result).toBe(commitHash);
      expect(mockRepo.updateTaskStatus).toHaveBeenCalledOnce();
      expect(mockRepo.updateTaskStatus).toHaveBeenCalledWith(42, "completed");
      expect(mockGit.commit).toHaveBeenCalledOnce();
      expect(mockGit.commit).toHaveBeenCalledWith("feat: complete task 42");
      expect(mockRepo.updateTaskGitCommitHash).toHaveBeenCalledOnce();
      expect(mockRepo.updateTaskGitCommitHash).toHaveBeenCalledWith(42, commitHash);
    });

    it("does NOT execute git commit when StateRepository.updateTaskStatus fails", async () => {
      const dbError = new Error("UNIQUE constraint failed");
      const mockRepo = makeMockRepo({
        updateTaskStatus: vi.fn().mockImplementation(() => {
          throw dbError;
        }),
      });
      const commit = vi.fn();
      const mockGit = { commit };

      const manager = new GitAtomicManager(
        mockRepo as unknown as StateRepository,
        mockGit as unknown as GitClient
      );

      await expect(
        manager.commitTaskChange(7, "chore: complete task 7")
      ).rejects.toThrow("UNIQUE constraint failed");

      // Git must never be invoked if the DB update fails first.
      expect(commit).not.toHaveBeenCalled();
      expect(mockRepo.updateTaskGitCommitHash).not.toHaveBeenCalled();
    });

    it("aborts the transaction and does NOT store git_commit_hash when git commit fails", async () => {
      const gitError = new GitError("fatal: cannot lock ref 'HEAD'");
      const mockRepo = makeMockRepo();
      const mockGit = {
        commit: vi.fn().mockRejectedValue(gitError),
      };

      const manager = new GitAtomicManager(
        mockRepo as unknown as StateRepository,
        mockGit as unknown as GitClient
      );

      await expect(
        manager.commitTaskChange(3, "refactor: complete task 3")
      ).rejects.toThrow("fatal: cannot lock ref 'HEAD'");

      // Status update was attempted before git (expected call ordering).
      expect(mockRepo.updateTaskStatus).toHaveBeenCalledOnce();
      expect(mockRepo.updateTaskStatus).toHaveBeenCalledWith(3, "completed");

      // git_commit_hash must NEVER be stored when git fails.
      expect(mockRepo.updateTaskGitCommitHash).not.toHaveBeenCalled();
    });

    it("wraps the operation inside a single transactionAsync call", async () => {
      const commitHash = "abc123";
      const mockRepo = makeMockRepo();
      const mockGit = { commit: vi.fn().mockResolvedValue(commitHash) };

      const manager = new GitAtomicManager(
        mockRepo as unknown as StateRepository,
        mockGit as unknown as GitClient
      );

      await manager.commitTaskChange(10, "test commit");

      // All work happens inside exactly one transactionAsync call.
      expect(mockRepo.transactionAsync).toHaveBeenCalledOnce();
    });

    it("preserves the original error type thrown by the git client", async () => {
      const gitError = new GitError("detached HEAD state");
      const mockRepo = makeMockRepo();
      const mockGit = { commit: vi.fn().mockRejectedValue(gitError) };

      const manager = new GitAtomicManager(
        mockRepo as unknown as StateRepository,
        mockGit as unknown as GitClient
      );

      const caughtError = await manager
        .commitTaskChange(99, "test")
        .catch((e: unknown) => e);

      expect(caughtError).toBeInstanceOf(GitError);
    });

    it("returns the commit hash returned by the git client", async () => {
      const hash = "f00d1234cafebabe";
      const mockRepo = makeMockRepo();
      const mockGit = { commit: vi.fn().mockResolvedValue(hash) };

      const manager = new GitAtomicManager(
        mockRepo as unknown as StateRepository,
        mockGit as unknown as GitClient
      );

      const result = await manager.commitTaskChange(5, "msg");

      expect(result).toBe(hash);
    });
  });
});

// ---------------------------------------------------------------------------
// Integration tests — real SQLite + mock git
// ---------------------------------------------------------------------------

describe("GitAtomicManager (integration — real SQLite, mock git)", () => {
  let db: Database.Database;
  let repo: StateRepository;
  let taskId: number;

  beforeEach(() => {
    ({ db, repo } = setupRealDb());

    // Insert fixture: project → epic → task
    const projectId = repo.upsertProject({ name: "test-project" });
    repo.saveEpics([{ project_id: projectId, name: "epic-1" }]);
    const state = repo.getProjectState(projectId)!;
    const epicId = state.epics[0].id!;
    repo.saveTasks([{ epic_id: epicId, title: "atomic-task" }]);

    const updatedState = repo.getProjectState(projectId)!;
    taskId = updatedState.tasks[0].id!;
  });

  afterEach(() => {
    closeDatabase();
  });

  it("writes status='completed' and git_commit_hash to DB on success", async () => {
    const commitHash = "1a2b3c4d5e6f";
    const mockGit = { commit: vi.fn().mockResolvedValue(commitHash) };

    const manager = new GitAtomicManager(
      repo,
      mockGit as unknown as GitClient
    );

    const result = await manager.commitTaskChange(taskId, "task complete");

    expect(result).toBe(commitHash);

    // Verify DB state: the task record must show the exact commit hash.
    const row = db
      .prepare("SELECT status, git_commit_hash FROM tasks WHERE id = ?")
      .get(taskId) as { status: string; git_commit_hash: string | null };

    expect(row.status).toBe("completed");
    expect(row.git_commit_hash).toBe(commitHash);
  });

  it("rolls back status update when git commit fails — DB remains at 'pending'", async () => {
    const gitError = new GitError("simulated git failure");
    const mockGit = { commit: vi.fn().mockRejectedValue(gitError) };

    const manager = new GitAtomicManager(
      repo,
      mockGit as unknown as GitClient
    );

    await expect(
      manager.commitTaskChange(taskId, "should rollback")
    ).rejects.toThrow("simulated git failure");

    // After rollback, the task must remain in its original 'pending' state.
    const row = db
      .prepare("SELECT status, git_commit_hash FROM tasks WHERE id = ?")
      .get(taskId) as { status: string; git_commit_hash: string | null };

    expect(row.status).toBe("pending");
    expect(row.git_commit_hash).toBeNull();
  });

  it("ensures git_commit_hash in DB matches the git HEAD returned by commit()", async () => {
    const gitHead = "cafebabe00112233aabbccdd";
    const mockGit = { commit: vi.fn().mockResolvedValue(gitHead) };

    const manager = new GitAtomicManager(
      repo,
      mockGit as unknown as GitClient
    );

    await manager.commitTaskChange(taskId, "verify hash correlation");

    const row = db
      .prepare("SELECT git_commit_hash FROM tasks WHERE id = ?")
      .get(taskId) as { git_commit_hash: string };

    // The stored hash must EXACTLY match what git reported as HEAD.
    expect(row.git_commit_hash).toBe(gitHead);
  });

  it("does not modify DB when updateTaskGitCommitHash would fail (status rolled back)", async () => {
    const commitHash = "abc";

    // Simulate a scenario where the git commit hash update itself fails by
    // corrupting the prepared statement (we test via mock for this edge case).
    const updateTaskGitCommitHashSpy = vi
      .spyOn(repo, "updateTaskGitCommitHash")
      .mockImplementation(() => {
        throw new Error("disk full");
      });

    const mockGit = { commit: vi.fn().mockResolvedValue(commitHash) };

    const manager = new GitAtomicManager(
      repo,
      mockGit as unknown as GitClient
    );

    await expect(
      manager.commitTaskChange(taskId, "hash update fails")
    ).rejects.toThrow("disk full");

    updateTaskGitCommitHashSpy.mockRestore();

    // The status update should have been rolled back too.
    const row = db
      .prepare("SELECT status, git_commit_hash FROM tasks WHERE id = ?")
      .get(taskId) as { status: string; git_commit_hash: string | null };

    expect(row.status).toBe("pending");
    expect(row.git_commit_hash).toBeNull();
  });
});
