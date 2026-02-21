---
package: "@devs/core"
module: "git/GitIntegrityChecker"
type: module-doc
status: active
created: 2026-02-21
requirements: ["8_RISKS-REQ-127"]
dependencies: ["simple-git", "upath"]
---

# git/GitIntegrityChecker.ts — Git Integrity and Recovery Checker

## Purpose

Implements pre-snapshot git integrity verification for the devs orchestration
engine (requirement 8_RISKS-REQ-127). Provides two layers of protection:

1. **Workspace verification** (`verifyWorkspace`) — detects dirty state (uncommitted
   changes that would pollute the next snapshot) and validates HEAD reachability
   (detached HEAD, missing HEAD).
2. **Object-store integrity** (`checkObjectStoreIntegrity`) — lightweight git fsck
   (`--connectivity-only --no-dangling`) that confirms object graph connectivity
   without an expensive full bit-level scan.
3. **Retry utility** (`withRetry`) — static helper that retries transient git
   lock-file errors with exponential backoff, discarding non-transient errors
   immediately.

## Exports

### `ViolationKind`

```typescript
type ViolationKind =
  | "dirty_workspace"          // uncommitted changes found
  | "detached_head"            // HEAD is not on a branch
  | "missing_head"             // HEAD cannot be resolved (no commits yet)
  | "object_store_corruption"; // git fsck detected broken/missing objects
```

### `IntegrityViolation`

```typescript
interface IntegrityViolation {
  kind: ViolationKind;
  message: string;    // human-readable description
  details?: string;   // raw git command output
}
```

### `IntegrityCheckResult`

```typescript
interface IntegrityCheckResult {
  passed: boolean;
  isDirty: boolean;
  isDetachedHead: boolean;
  headReachable: boolean;
  violations: IntegrityViolation[];
}
```

### `ObjectStoreCheckResult`

```typescript
interface ObjectStoreCheckResult {
  passed: boolean;
  violations: IntegrityViolation[];
}
```

### `GitIntegrityViolationError`

```typescript
class GitIntegrityViolationError extends Error {
  name: "GitIntegrityViolationError";
  violations: IntegrityViolation[];
}
```

### `GitIntegrityChecker`

```typescript
class GitIntegrityChecker {
  verifyWorkspace(path: string): Promise<IntegrityCheckResult>
  checkObjectStoreIntegrity(path: string): Promise<ObjectStoreCheckResult>
  static withRetry<T>(
    operation: () => Promise<T>,
    options?: { maxAttempts?: number; backoffMs?: number }
  ): Promise<T>
}
```

## Key Behaviours

| Method                       | Notes                                                                                         |
|------------------------------|-----------------------------------------------------------------------------------------------|
| `verifyWorkspace`            | Runs all three checks (dirty, HEAD reachable, HEAD on branch) in a single pass; returns all violations. Never throws. |
| `checkObjectStoreIntegrity`  | Uses `git fsck --connectivity-only --no-dangling --quiet`. Never throws. Exit 0 = clean (stdout may contain info messages). Non-zero = corruption. |
| `withRetry`                  | Detects lock-file errors via regex on the error message. Non-transient errors are re-thrown immediately. Default: 3 attempts, 100 ms base backoff (doubles per retry). |

## Dirty Workspace Detection

`verifyWorkspace` uses `simple-git`'s `status()` (equivalent to `git status`)
which does **NOT** include gitignored files unless explicitly requested with
`--ignored`. This ensures ignored files (`.devs/state.sqlite`, `node_modules/`,
`dist/`, `.env`) never trigger a false-positive dirty-workspace violation.

## HEAD State Checks

1. `git rev-parse --verify HEAD` — confirms HEAD resolves to a commit object.
   Fails on a freshly initialised repo with no commits.
2. `git symbolic-ref --quiet HEAD` — confirms HEAD points to a branch ref.
   Fails on detached HEAD (e.g., after `git checkout <sha>`).

The two checks are independent. Missing HEAD also suppresses detached-HEAD
reporting to avoid duplicate violations.

## Integration with ImplementationNode

`ImplementationNode` accepts an optional `integrityChecker: GitIntegrityChecker`
in its factory config. When provided:

- **Pre-snapshot**: `verifyWorkspace()` + `checkObjectStoreIntegrity()` run
  after `initialize()` but before `createTaskSnapshot()`.
- If either fails, the node returns `{ project: { ...project, status: "security_pause" } }`
  and NO snapshot is created.
- When `integrityChecker` is omitted (legacy/test mode), all integrity checks
  are skipped — `ImplementationNode` behaves exactly as before this task.

## Error Codes

| Status              | Description                                        | User Action Required                     |
|---------------------|----------------------------------------------------|------------------------------------------|
| `"security_pause"`  | Set on `project.status` in orchestrator state.     | Resolve workspace/object-store issues, then resume the orchestrator. |
| `dirty_workspace`   | Uncommitted changes in the working directory.      | `git add && git commit` or `git stash`.  |
| `detached_head`     | HEAD is not on a branch.                           | `git checkout <branch>`.                 |
| `missing_head`      | Repository has no commits.                         | Create an initial commit.                |
| `object_store_corruption` | `git fsck` detected broken objects.        | `git clone` from a remote backup or use `git repair`. |

## Testing

`GitIntegrityChecker.test.ts` (40 tests) mocks `simple-git` via `vi.mock('simple-git')`.
Tests cover:
- All clean-state paths (`passed: true`, empty violations).
- Dirty workspace (modified files, untracked files, not triggered by ignored files).
- Detached HEAD detection.
- Missing HEAD detection.
- Multiple simultaneous violations.
- Object-store pass/fail paths, fsck flags, error propagation.
- `GitIntegrityViolationError` construction and field access.
- `withRetry`: success, lock-file retry, max-attempt exhaustion, non-transient no-retry.

`ImplementationNode.test.ts` (22 tests, 11 new) covers the orchestration
integration: security_pause triggering, snapshot suppression on violations,
ordering guarantee (integrity checks before snapshot), and no-op when
`integrityChecker` is omitted.
