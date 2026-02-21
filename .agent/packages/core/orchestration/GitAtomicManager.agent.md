---
module: packages/core/src/orchestration/GitAtomicManager.ts
type: implementation
status: complete
requirements:
  - 8_RISKS-REQ-041
  - 8_RISKS-REQ-094
tests: packages/core/test/orchestration/GitAtomicManager.test.ts
---

# GitAtomicManager

Coordinates a git commit with a SQLite task-status update in a single atomic
unit. Prevents the `tasks` table from ever showing `status = 'completed'`
without a matching `git_commit_hash`, and prevents a hash from being stored
when the git commit did not actually succeed.

## Exports

### `GitAtomicManager` (class)

The primary export. Constructed with a `StateRepository` and a `GitClient`.

```typescript
import { GitAtomicManager } from "@devs/core";

const manager = new GitAtomicManager(stateRepo, gitClient);
const commitHash = await manager.commitTaskChange(taskId, "task: complete task-42");
```

#### Constructor

```typescript
new GitAtomicManager(stateRepo: StateRepository, gitClient: GitClient)
```

#### `commitTaskChange(taskId: number, commitMessage: string): Promise<string>`

Marks a task as `completed` in the database and creates a git commit in one
atomic operation. Returns the SHA-1 commit hash.

**Execution order inside a single `transactionAsync()` SAVEPOINT:**

1. `stateRepo.updateTaskStatus(taskId, 'completed')` — synchronous DB write.
2. `gitClient.commit(commitMessage)` — async git operation.
3. If git throws → SAVEPOINT is rolled back; DB status reverts. Error re-thrown.
4. `stateRepo.updateTaskGitCommitHash(taskId, hash)` — synchronous DB write.
5. SAVEPOINT released → both DB writes become permanent.

## Supporting changes to `StateRepository`

Two new methods were added to `StateRepository` to support `GitAtomicManager`:

### `transactionAsync<T>(cb: () => Promise<T>): Promise<T>`

Async-safe transaction primitive using explicit SQLite `SAVEPOINT` commands.
Allows async operations (e.g., git commits) to participate in a single atomic
SQLite unit alongside synchronous writes.

**Key invariant**: rolling back the outer SAVEPOINT also undoes any inner
changes from nested `db.transaction(cb)()` calls that have already been
RELEASEd (SQLite SAVEPOINT semantics guarantee this). This means all writes
inside the callback — including those from `updateTaskStatus` and
`updateTaskGitCommitHash` — are atomically undone when git fails.

### `updateTaskGitCommitHash(taskId: number, hash: string): void`

Sets `tasks.git_commit_hash` for a given task. Called after a successful git
commit, inside the same `transactionAsync()` unit as `updateTaskStatus`.

## Git-Atomic Strategy Summary

The Git-Atomic pattern solves the cross-system atomicity problem between an
RDBMS (SQLite) and a VCS (git):

- SQLite provides ACID semantics via SAVEPOINTs.
- Git does NOT support rollback — a `git commit` is permanent once made.
- The strategy is: "DB first, git second; rollback the DB if git fails."

This achieves the **devs rewind** capability: every task's DB record has an
exact git commit SHA, so any task can be precisely identified in the project
git history and the system can reconstruct the state at that point.

## Test Coverage (10 tests)

### Unit tests (mock-based)
- `updates task status to 'completed' and stores the commit hash on success`
- `does NOT execute git commit when StateRepository.updateTaskStatus fails`
- `aborts the transaction and does NOT store git_commit_hash when git commit fails`
- `wraps the operation inside a single transactionAsync call`
- `preserves the original error type thrown by the git client`
- `returns the commit hash returned by the git client`

### Integration tests (real SQLite, mock git)
- `writes status='completed' and git_commit_hash to DB on success`
- `rolls back status update when git commit fails — DB remains at 'pending'`
- `ensures git_commit_hash in DB matches the git HEAD returned by commit()`
- `does not modify DB when updateTaskGitCommitHash would fail (status rolled back)`

## Simulation Script

`scripts/simulate_git_failure.ts` (13 checks) verifies three end-to-end scenarios:

1. **Git failure** → DB remains at `pending` (SAVEPOINT rollback confirmed).
2. **Success** → `status = 'completed'` and `git_commit_hash = <SHA>` written atomically.
3. **DB failure** → git commit never invoked, DB state unchanged.

Run with: `pnpm exec tsx scripts/simulate_git_failure.ts`
