#!/usr/bin/env tsx
/**
 * scripts/simulate_git_failure.ts
 *
 * Simulation script that validates the Git-Atomic rollback invariant:
 *   "When a git commit fails, the task's DB state must remain unchanged."
 *
 * This script:
 *  1. Creates an in-memory SQLite database and inserts a test task.
 *  2. Constructs a `GitAtomicManager` with a mock git client that will throw
 *     a `GitError` when `commit()` is called.
 *  3. Calls `commitTaskChange()` and asserts that it throws.
 *  4. Queries the database directly to confirm that the task's `status` and
 *     `git_commit_hash` columns are UNCHANGED (i.e., the SAVEPOINT rollback
 *     worked correctly).
 *  5. Runs a success scenario and confirms that after a successful commit
 *     the DB fields are correctly updated.
 *
 * Exit code 0 = all checks passed.
 * Exit code 1 = one or more checks failed.
 *
 * Usage:
 *   pnpm exec tsx scripts/simulate_git_failure.ts
 *
 * Requirements: [8_RISKS-REQ-041], [8_RISKS-REQ-094]
 */

import { createDatabase } from "../packages/core/src/persistence/database.js";
import { initializeSchema } from "../packages/core/src/persistence/schema.js";
import { StateRepository } from "../packages/core/src/persistence/state_repository.js";
import { GitAtomicManager } from "../packages/core/src/orchestration/GitAtomicManager.js";
import { GitError } from "../packages/core/src/git/GitClient.js";
import type { GitClient } from "../packages/core/src/git/GitClient.js";
import type Database from "better-sqlite3";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}`);
    failed++;
  }
}

function header(title: string): void {
  console.log(`\n── ${title} ──`);
}

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

interface Fixture {
  db: Database.Database;
  repo: StateRepository;
  taskId: number;
}

function createFixture(): Fixture {
  // Use an in-memory SQLite database so no temp files are created.
  const db = createDatabase({ dbPath: ":memory:" });
  initializeSchema(db);
  const repo = new StateRepository(db);

  const projectId = repo.upsertProject({ name: "sim-project" });
  repo.saveEpics([{ project_id: projectId, name: "sim-epic" }]);

  const state = repo.getProjectState(projectId)!;
  const epicId = state.epics[0].id!;

  repo.saveTasks([{ epic_id: epicId, title: "sim-task", status: "pending" }]);

  const updatedState = repo.getProjectState(projectId)!;
  const taskId = updatedState.tasks[0].id!;

  return { db, repo, taskId };
}

function getTaskRow(
  db: Database.Database,
  taskId: number
): { status: string; git_commit_hash: string | null } {
  return db
    .prepare("SELECT status, git_commit_hash FROM tasks WHERE id = ?")
    .get(taskId) as { status: string; git_commit_hash: string | null };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // ── Scenario 1: Git failure → DB rolled back ─────────────────────────────

  header("Scenario 1: Git commit failure → SAVEPOINT rollback");

  {
    const { db, repo, taskId } = createFixture();

    // Mock git client that always fails.
    const failingGit: Pick<GitClient, "commit"> = {
      commit: async (_message: string): Promise<string> => {
        throw new GitError("fatal: not a git repository");
      },
    };

    // Verify initial DB state.
    const rowBefore = getTaskRow(db, taskId);
    check("initial task status is 'pending'", rowBefore.status === "pending");
    check("initial git_commit_hash is null", rowBefore.git_commit_hash === null);

    let threw = false;
    try {
      await new GitAtomicManager(
        repo,
        failingGit as unknown as GitClient
      ).commitTaskChange(taskId, "should not persist");
    } catch {
      threw = true;
    }

    check("commitTaskChange throws when git fails", threw);

    // Verify DB rolled back.
    const rowAfter = getTaskRow(db, taskId);
    check(
      "task status remains 'pending' after git failure (SAVEPOINT rolled back)",
      rowAfter.status === "pending"
    );
    check(
      "git_commit_hash remains null after git failure (not partially persisted)",
      rowAfter.git_commit_hash === null
    );
  }

  // ── Scenario 2: Successful commit → DB updated atomically ────────────────

  header("Scenario 2: Successful commit → DB updated with correct hash");

  {
    const { db, repo, taskId } = createFixture();

    const expectedHash = "abc123def456789012345678901234567890abcd";

    const successGit: Pick<GitClient, "commit"> = {
      commit: async (_message: string): Promise<string> => expectedHash,
    };

    let returnedHash: string | undefined;
    let threw = false;
    try {
      returnedHash = await new GitAtomicManager(
        repo,
        successGit as unknown as GitClient
      ).commitTaskChange(taskId, "feat: sim-task complete");
    } catch {
      threw = true;
    }

    check("commitTaskChange does NOT throw on success", !threw);
    check("returned hash matches the git commit hash", returnedHash === expectedHash);

    const row = getTaskRow(db, taskId);
    check(
      "task status is 'completed' after successful commit",
      row.status === "completed"
    );
    check(
      "git_commit_hash in DB matches the git HEAD returned by commit()",
      row.git_commit_hash === expectedHash
    );
  }

  // ── Scenario 3: DB update fails before git → git never called ────────────

  header("Scenario 3: DB update fails → git commit never attempted");

  {
    const { db, repo, taskId } = createFixture();

    let gitCommitCalled = false;
    const trackingGit: Pick<GitClient, "commit"> = {
      commit: async (_message: string): Promise<string> => {
        gitCommitCalled = true;
        return "should-never-reach-here";
      },
    };

    // Use a Proxy to make updateTaskStatus throw synchronously.
    const brokenRepo = new Proxy(repo, {
      get(target, prop) {
        if (prop === "updateTaskStatus") {
          return () => {
            throw new Error("simulated DB constraint violation");
          };
        }
        return (target as unknown as Record<string | symbol, unknown>)[prop];
      },
    });

    let threw = false;
    try {
      await new GitAtomicManager(
        brokenRepo,
        trackingGit as unknown as GitClient
      ).commitTaskChange(taskId, "should not commit");
    } catch {
      threw = true;
    }

    check("commitTaskChange throws when DB update fails", threw);
    check("git commit was NOT called when DB update failed", !gitCommitCalled);

    // The DB task should still be in its original state.
    const row = getTaskRow(db, taskId);
    check(
      "task status unchanged in DB after failed DB update",
      row.status === "pending"
    );
    check(
      "git_commit_hash still null in DB after failed DB update",
      row.git_commit_hash === null
    );
  }

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log(`\n${"─".repeat(60)}`);
  console.log(
    `simulate_git_failure: ${passed} passed, ${failed} failed (${passed + failed} total)`
  );

  if (failed > 0) {
    console.error("\nSome checks FAILED. The Git-Atomic invariant may be broken.");
    process.exit(1);
  }

  console.log("\nAll checks passed. Git-Atomic rollback invariant is intact.");
}

main().catch((err: unknown) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
