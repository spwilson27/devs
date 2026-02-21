---
package: "@devs/core"
module: "git/SnapshotManager"
type: module-doc
status: active
created: 2026-02-21
requirements: ["UNKNOWN-601", "UNKNOWN-602", "TAS-054", "TAS-055"]
dependencies: ["./GitClient", "./GitIgnoreManager"]
---

# git/SnapshotManager.ts — Project Evolution Snapshot Manager

## Purpose

Manages the "Project Evolution" git trail for generated projects. Wraps
`GitClient` and enforces the devs git exclusion policy by ensuring
`GitIgnoreManager.ensureStandardIgnores()` is called before any `git add .`
operation. This guarantees that `.devs/` (Flight Recorder state) never appears
in a generated project's git history.

## Exports

### `SnapshotOptions`

```typescript
interface SnapshotOptions {
  projectPath: string;  // Absolute path to the generated project root
}
```

### `SnapshotContext`

```typescript
interface SnapshotContext {
  taskName?: string;  // Optional human-readable task name (diagnostic only)
}
```

### `SnapshotManager`

```typescript
class SnapshotManager {
  constructor(options: SnapshotOptions)

  initialize(): Promise<void>
  takeSnapshot(message: string): Promise<string>           // returns commit SHA
  createTaskSnapshot(taskId: string, context: SnapshotContext): Promise<string | null>
  getStatus(): Promise<WorkspaceStatus>
}
```

## Key Behaviours

| Method                | Notes                                                                                                         |
|-----------------------|---------------------------------------------------------------------------------------------------------------|
| `initialize`          | Calls `GitClient.initRepository` then `GitIgnoreManager.ensureStandardIgnores`. Idempotent.                  |
| `takeSnapshot`        | Calls `git add .` then `git commit`. `.devs/` excluded via `.gitignore`.                                      |
| `createTaskSnapshot`  | Checks status; skips if clean. Otherwise calls `add('.')` + `commit('task: complete task {taskId}')`.        |
| `getStatus`           | Delegates directly to `GitClient.status()`.                                                                  |

## Snapshot-at-Commit Strategy (TAS-054, TAS-055)

`createTaskSnapshot(taskId, context)` implements the "Snapshot-at-Commit" strategy:

1. Calls `GitClient.status()` to check for changes.
2. If workspace is clean (`isClean === true`), returns `null` (no-op).
3. Otherwise calls `git add .` then creates a commit with message
   `task: complete task {taskId}`.
4. Returns the resulting commit SHA hash.

This method is intended to be called by `ImplementationNode` after successful
task completion. `initialize()` MUST be called first to set up the git repo and
`.gitignore` exclusions.

## Exclusion Strategy (UNKNOWN-601)

The `.devs/` exclusion is guaranteed by the ordering in `initialize()`:
1. `GitClient.initRepository()` creates the git repo.
2. `GitIgnoreManager.ensureStandardIgnores()` writes `.devs/` into `.gitignore`.
3. All subsequent `git add .` calls (in both `takeSnapshot` and
   `createTaskSnapshot`) respect the `.gitignore` — `.devs/` is never staged.

## State-file Git Strategy

`.devs/state.sqlite` is excluded from the project git repository via the
`.gitignore` entry for `.devs/`. No "Shadow Git" or separate versioning
of the SQLite database is used at this stage. Future phases may introduce
rollback/replay semantics if needed.

## Hidden Files Policy (UNKNOWN-602)

| Directory | Handling | Reason                                                   |
|-----------|----------|----------------------------------------------------------|
| `.agent/` | Tracked  | AOD documentation — excluded from STANDARD_IGNORES      |
| `.devs/`  | Ignored  | Flight Recorder state — included in STANDARD_IGNORES     |

## Testing

`SnapshotManager.test.ts` (23 tests) mocks `simple-git` (same pattern as
`GitClient.test.ts`). Covers `initialize`, `takeSnapshot`, `createTaskSnapshot`,
and `getStatus` in isolated describe blocks.

`packages/core/test/git/exclusion_integration.test.ts` (6 integration tests)
uses real git in a temp directory to verify end-to-end exclusion behavior.
