---
package: "@devs/core"
module: "orchestration/ImplementationNode"
type: module-doc
status: active
created: 2026-02-21
requirements: ["TAS-054", "TAS-055"]
dependencies:
  - "./types"
  - "../git/SnapshotManager"
---

# orchestration/ImplementationNode.ts — Task Snapshot LangGraph Node

## Purpose

Provides a LangGraph node factory (`createImplementationNode`) that triggers the
"Snapshot-at-Commit" strategy (TAS-054) after a task completes. The node:

1. Calls `SnapshotManager.initialize()` (idempotent) to ensure the project git
   repository and `.gitignore` exclusions are in place.
2. Calls `SnapshotManager.createTaskSnapshot(taskId, context)` to stage all
   project files and create a commit tagged with the task ID.
3. Updates the matching `TaskRecord.gitHash` field in the `OrchestratorState`.

## Exports

### `ImplementationNodeConfig`

```typescript
interface ImplementationNodeConfig {
  projectPath: string;          // Absolute path to the generated project root
  snapshotManager?: SnapshotManager; // Optional injection for testing
}
```

### `createImplementationNode`

```typescript
function createImplementationNode(
  config: ImplementationNodeConfig
): (state: GraphState) => Promise<Partial<GraphState>>
```

Returns a LangGraph node function compatible with `StateGraph.addNode()`.

## Behavior Table

| Condition                         | Action                                 | Return                        |
|-----------------------------------|----------------------------------------|-------------------------------|
| `activeTaskId === null`           | No-op                                  | `{}`                          |
| Workspace clean (no changes)       | Skip snapshot                          | `{}`                          |
| Workspace dirty, git succeeds     | Commit, update `TaskRecord.gitHash`   | `{ tasks: updatedTasks }`    |
| Git operation fails               | Propagate error                        | throws                        |

## Integration Pattern

```ts
import { StateGraph, START, END } from "@langchain/langgraph";
import { OrchestratorAnnotation } from "@devs/core";
import { createImplementationNode } from "@devs/core";

const implementationNode = createImplementationNode({
  projectPath: "/path/to/generated/project",
});

const graph = new StateGraph(OrchestratorAnnotation)
  .addNode("implementation", implementationNode)
  .addEdge(START, "implementation")
  .addEdge("implementation", END)
  .compile();
```

## Snapshot-at-Commit Strategy (TAS-054)

- `.devs/` is always excluded via `.gitignore` (enforced by `SnapshotManager.initialize()`).
- Commit message is always `task: complete task {taskId}`.
- If no files changed, the snapshot is silently skipped (`null` return from
  `createTaskSnapshot` is treated as a no-op).

## Dependency Injection

`snapshotManager` can be injected in tests to avoid real git operations:

```ts
const mockSnapshot = {
  initialize: vi.fn(),
  createTaskSnapshot: vi.fn().mockResolvedValue("abc1234"),
};

const node = createImplementationNode({
  projectPath: "/test/project",
  snapshotManager: mockSnapshot as unknown as SnapshotManager,
});
```

## Testing

`ImplementationNode.test.ts` (11 tests) covers:
- No-op when `activeTaskId` is null
- `initialize()` called before `createTaskSnapshot()` (ordering guarantee)
- `createTaskSnapshot` called with the correct task ID
- `TaskRecord.gitHash` updated correctly in returned state
- Non-matching tasks left untouched
- `taskName` passed in context
- No-op when workspace is clean (null return)
- Error propagation from `initialize()` and `createTaskSnapshot()`
