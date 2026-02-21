---
package: "@devs/core"
module: "git/GitIgnoreManager"
type: module-doc
status: active
created: 2026-02-21
requirements: ["UNKNOWN-601", "UNKNOWN-602"]
dependencies: ["node:fs", "node:path"]
---

# git/GitIgnoreManager.ts — Git Ignore Policy Enforcer

## Purpose

Manages the `.gitignore` of **generated projects** to enforce the devs git
exclusion policy. Ensures that the Flight Recorder state (`.devs/`) is never
accidentally committed into the "Project Evolution" git trail, while ensuring
that AOD documentation (`.agent/`) is always tracked.

This module operates on the **generated project's** `.gitignore` — not on the
devs repo itself. (The devs repo uses a separate `.devs/.gitignore` strategy.)

## Exports

### `STANDARD_IGNORES`

```typescript
const STANDARD_IGNORES: readonly string[] = [
  ".devs/",        // Flight Recorder runtime state — must never be committed
  "node_modules/", // Node.js/pnpm dependency tree
  "dist/",         // TypeScript/bundler output
  ".env",          // Environment secrets
  ".env.local",    // Local environment overrides
]
```

### `TRACKED_DEVS_ARTIFACTS`

```typescript
const TRACKED_DEVS_ARTIFACTS: readonly string[] = [
  ".agent/",  // AOD documentation — must always be tracked (density requirement)
]
```

### `GitIgnoreManagerError`

Custom error thrown on I/O failure. Wraps the OS error as `cause`.

### `GitIgnoreManager`

```typescript
class GitIgnoreManager {
  static ensureStandardIgnores(projectPath: string): void
  static isDevsIgnored(relativePath: string): boolean
  static isTrackedDevsArtifact(relativePath: string): boolean
}
```

## Key Behaviours

| Method                    | Notes                                                                                  |
|---------------------------|----------------------------------------------------------------------------------------|
| `ensureStandardIgnores`   | Idempotent. Creates `.gitignore` if absent. Appends only missing entries. Never removes. |
| `isDevsIgnored`           | Returns `true` for `.devs/` and any path inside it (prefix match).                    |
| `isTrackedDevsArtifact`   | Returns `true` for `.agent/` and any path inside it. Used to verify no over-ignoring. |

## State-file Git Strategy (UNKNOWN-601)

`.devs/state.sqlite` is excluded from the standard project git repository by
being inside `.devs/`, which is listed in `STANDARD_IGNORES`. No "Shadow Git"
is used at this stage — `.gitignore` exclusion is sufficient.

## Hidden Files Policy (UNKNOWN-602)

| Path        | Status          | Reason                                              |
|-------------|-----------------|-----------------------------------------------------|
| `.devs/`    | Ignored         | Flight Recorder runtime state, never project source |
| `.agent/`   | Tracked         | AOD density requirement — agents must query it      |
| `.env`      | Ignored         | Contains secrets — must never be committed          |
| `.env.example` | Tracked      | Safe template for onboarding                        |

## Error Handling

`ensureStandardIgnores` throws `GitIgnoreManagerError` (wrapping the OS error)
if the `.gitignore` cannot be read or written.

## Testing

`GitIgnoreManager.test.ts` (32 tests) covers: creation of new `.gitignore`,
appending to existing files, idempotency, no-duplication, preservation of
existing entries, error case (non-existent directory), and all `isDevsIgnored`
/ `isTrackedDevsArtifact` predicates.

`packages/core/test/git/exclusion_integration.test.ts` (6 integration tests)
uses real git to verify that `.devs/state.sqlite` is NOT staged, `.agent/`
files ARE staged, and `.env` is ignored but `.env.example` is not.
