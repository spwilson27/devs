/**
 * @devs/core — GitAtomicManager
 *
 * Coordinates a git commit with a SQLite status update in a single atomic
 * unit. The "Git-Atomic" strategy ensures that the `tasks` table can never
 * show `status = 'completed'` without a corresponding `git_commit_hash`,
 * and that a git commit hash is never stored unless the entire operation
 * — including the git commit itself — succeeds.
 *
 * ## Why This Matters
 *
 * The `devs rewind` capability requires an unbroken chain of (DB state, git
 * commit) pairs. If a process crashes between updating the DB and making the
 * git commit (or vice versa), the state becomes inconsistent and the rewind
 * cannot be performed reliably. The GitAtomicManager prevents this by
 * wrapping both operations in a single `transactionAsync()` unit:
 *
 *  - If the DB update fails    → git commit is never attempted.
 *  - If the git commit fails   → the DB update is rolled back via SAVEPOINT.
 *  - If both succeed           → the SAVEPOINT is released and changes persist.
 *
 * ## Implementation Note on Synchronicity
 *
 * SQLite (via better-sqlite3) is synchronous; git (via simple-git) is async.
 * `StateRepository.transactionAsync()` bridges this gap by using explicit
 * SQLite SAVEPOINT commands that remain open while the async git operation
 * executes. Since Node.js is single-threaded, no other connection operation
 * can interleave during the await.
 *
 * Requirements: [8_RISKS-REQ-041], [8_RISKS-REQ-094]
 */

import type { StateRepository } from "../persistence/state_repository.js";
import type { GitClient } from "../git/GitClient.js";

// ---------------------------------------------------------------------------
// GitAtomicManager
// ---------------------------------------------------------------------------

/**
 * Atomic coordinator between SQLite task state and git commit history.
 *
 * Construct with an open, schema-initialised `StateRepository` and a
 * `GitClient` scoped to the project repository.
 *
 * ```ts
 * import { GitAtomicManager } from "@devs/core";
 *
 * const manager = new GitAtomicManager(stateRepo, gitClient);
 * const commitHash = await manager.commitTaskChange(taskId, "task: complete task-42");
 * ```
 */
export class GitAtomicManager {
  private readonly stateRepo: StateRepository;
  private readonly gitClient: GitClient;

  constructor(stateRepo: StateRepository, gitClient: GitClient) {
    this.stateRepo = stateRepo;
    this.gitClient = gitClient;
  }

  /**
   * Atomically marks a task as completed in the database and creates a git
   * commit, ensuring the two systems remain consistent.
   *
   * Execution order within a single `transactionAsync()` unit:
   *  1. Update task `status` to `'completed'` in SQLite.
   *  2. Call `gitClient.commit(commitMessage)` (async).
   *  3. If git fails → exception propagates, SAVEPOINT is rolled back → DB
   *     status reverts to its previous value (e.g. `'pending'`).
   *  4. If git succeeds → store the returned commit SHA in `git_commit_hash`.
   *  5. SAVEPOINT is released → both writes are persisted atomically.
   *
   * @param taskId        - The numeric primary-key id of the task in the DB.
   * @param commitMessage - The git commit message (passed verbatim to git).
   * @returns The full SHA-1 commit hash recorded against the task.
   *
   * @throws Any error thrown by `updateTaskStatus` or `gitClient.commit`.
   *         When an error is thrown the SAVEPOINT has been rolled back and the
   *         database is in the exact state it was in before this call.
   *
   * Requirements: [8_RISKS-REQ-041], [8_RISKS-REQ-094]
   */
  async commitTaskChange(taskId: number, commitMessage: string): Promise<string> {
    return this.stateRepo.transactionAsync(async () => {
      // Step 1: Update task status — if this throws, the git commit is never
      // attempted and the SAVEPOINT is immediately rolled back.
      this.stateRepo.updateTaskStatus(taskId, "completed");

      // Step 2: Attempt the git commit (async).
      // If this throws, the transactionAsync SAVEPOINT catches it, rolls back
      // the status update from step 1, and re-throws the error.
      const hash = await this.gitClient.commit(commitMessage);

      // Step 3: Record the git commit hash inside the same SAVEPOINT so that
      // the status update and the hash update are always stored together.
      this.stateRepo.updateTaskGitCommitHash(taskId, hash);

      return hash;
    });
  }
}
