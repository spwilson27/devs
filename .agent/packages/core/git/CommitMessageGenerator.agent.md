---
package: "@devs/core"
module: "git/CommitMessageGenerator"
type: module-doc
status: active
created: 2026-02-21
requirements: ["8_RISKS-REQ-085"]
dependencies: []
---

# git/CommitMessageGenerator.ts — Commit Message Generator

## Purpose

Generates git commit messages in the devs conventional commit format. Every
task-completion commit produced by `SnapshotManager.createTaskSnapshot()` is
formatted by this generator, embedding a structured state-snapshot footer that
satisfies the audit-trail requirement (8_RISKS-REQ-085).

## Exports

### `StateSnapshotData`

Compact state snapshot embedded in the commit footer. Use `hash` for a
pre-computed SQLite state hash, or supply compact fields (projects, requirements)
for JSON serialization.

```typescript
interface StateSnapshotData {
  hash?: string;          // Pre-computed hash — used verbatim if present
  projects?: number;      // Number of active projects (compact summary)
  requirements?: number;  // Number of requirements (compact summary)
  [key: string]: unknown; // Any additional compact state fields
}
```

### `CommitMessageGenerator`

```typescript
class CommitMessageGenerator {
  static generate(taskId: string, metadata: StateSnapshotData): string
}
```

## Generated Message Format

```
task: complete {taskId}

TASK-ID: {taskId}
devs-state-snapshot: {hash_or_compact_json}
```

Example with hash:
```
task: complete phase_1.task-042

TASK-ID: phase_1.task-042
devs-state-snapshot: sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
```

Example with compact JSON:
```
task: complete task-007

TASK-ID: task-007
devs-state-snapshot: {"projects":3,"requirements":42}
```

## Key Behaviours

| Behaviour               | Details                                                                                         |
|-------------------------|-------------------------------------------------------------------------------------------------|
| Conventional commit     | Subject always `task: complete {taskId}` — type is `task`, no scope.                          |
| Hash takes precedence   | `metadata.hash` is used verbatim; all other fields are ignored when hash is set.               |
| Compact JSON fallback   | When no hash: all non-`hash` fields serialized with `JSON.stringify()`.                        |
| Empty metadata          | Produces `devs-state-snapshot: {}` — always valid.                                             |
| Size cap                | Snapshot value capped at 900 characters; truncated with `...` suffix if exceeded.              |
| Under 1KB               | Total commit message stays under 1024 bytes for typical taskIds and state payloads.            |
| TASK-ID line            | `TASK-ID: {taskId}` footer line enables machine-readable grep across git history.              |
| Separator               | Subject and footer block are separated by exactly one blank line (`\n\n`).                     |

## Size Constraint

The `devs-state-snapshot` value is capped at `MAX_SNAPSHOT_CHARS = 900` characters.
This ensures the complete commit message (title + separator + footer) stays well
under the 1 KB guideline. If the snapshot is truncated, a `...` suffix is appended.

## Integration with SnapshotManager

`SnapshotManager.createTaskSnapshot(taskId, context)` calls
`CommitMessageGenerator.generate(taskId, context.stateSnapshot ?? {})` to build
the commit message. Callers supply `context.stateSnapshot` when a SQLite state
hash or compact field summary is available at the call site.

## Testing

`CommitMessageGenerator.test.ts` (26 tests) covers:
- Title format and conventional commit compliance (5 tests)
- Footer structure: TASK-ID and devs-state-snapshot lines (6 tests)
- Hash-based snapshot value (3 tests)
- Compact JSON snapshot value (4 tests)
- Size constraint: under 1KB, truncation, `...` suffix (4 tests)
- Conventional commit format validation (4 tests)
- Additional SnapshotManager integration tests added to `SnapshotManager.test.ts`

## Related Modules

- `git/SnapshotManager.ts` — integrates `CommitMessageGenerator` in `createTaskSnapshot`
- `git/GitClient.ts` — receives the formatted commit message via `commit(message)`
- `orchestration/ImplementationNode.ts` — calls `SnapshotManager.createTaskSnapshot`
