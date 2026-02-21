---
package: "@devs/core"
module: "git/GitClient"
type: module-doc
status: active
created: 2026-02-21
requirements: ["TAS-012"]
dependencies: ["simple-git", "upath"]
---

# git/GitClient.ts — Git Client Wrapper

## Purpose

Thin, typed wrapper over `simple-git` that provides the four git operations
required by the devs snapshot strategy. Keeps all git complexity behind a
stable interface with descriptive error types.

## Exports

### `GitError`

Custom error class thrown by all `GitClient` methods on failure.

```typescript
class GitError extends Error {
  name: "GitError";
  cause?: Error;       // The underlying simple-git / OS error
}
```

### `WorkspaceStatus`

Structured snapshot of the current git state.

```typescript
interface WorkspaceStatus {
  isClean: boolean;     // true when no changes exist
  staged: string[];     // files in the index ready to commit
  unstaged: string[];   // tracked files with modifications not yet staged
  untracked: string[];  // files unknown to git
}
```

### `GitClient`

```typescript
class GitClient {
  constructor(workingDir: string)

  initRepository(path: string): Promise<void>
  status(): Promise<WorkspaceStatus>
  add(files: string | string[]): Promise<void>
  commit(message: string): Promise<string>   // returns commit SHA
}
```

## Key Behaviours

| Method            | Notes                                                                                     |
|-------------------|-------------------------------------------------------------------------------------------|
| `initRepository`  | Idempotent — no-op if `checkIsRepo()` returns true. Throws `GitError` on failure.        |
| `status`          | Filters `modified` against `staged` so `unstaged` never duplicates `staged` entries.     |
| `add`             | Accepts a single path/glob or an array. Normalizes all paths via `upath`.                |
| `commit`          | Injects `user.name=devs-agent` / `user.email=devs@local` as local config if not set.    |

## Path Normalization

Every file path passed into `add` or `initRepository` is run through
`upath.normalize()`, converting Windows-style `\` separators to POSIX `/`.
This ensures git receives consistent paths on all platforms.

## Error Handling

All public methods catch errors from `simple-git` and rethrow as `GitError`
with a descriptive message. The original error is preserved as `cause` for
full stack traces.

## Testing

`GitClient.test.ts` (34 tests) mocks `simple-git` via `vi.mock('simple-git')`
and covers: constructor setup, idempotent init, status mapping, single/array
adds, path normalization, commit hash return, user-identity fallback, and all
`GitError` propagation paths.
