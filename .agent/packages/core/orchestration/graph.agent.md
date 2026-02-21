---
module: packages/core/src/orchestration/graph.ts
phase: 1
task: "04_langgraph_core_orchestration_engine/03_integrate_sqlite_persistence"
requirements: ["9_ROADMAP-TAS-101", "TAS-009", "TAS-103", "TAS-078", "2_TAS-REQ-016", "9_ROADMAP-PHASE-001", "4_USER_FEATURES-REQ-013"]
exports:
  classes:
    - OrchestrationGraph
  functions:
    - researchNode
    - designNode
    - distillNode
    - implementNode
    - verifyNode
    - routeAfterVerify
    - approveDesignNode
    - approveTaskDagNode
  static_methods:
    - "OrchestrationGraph.withSqlitePersistence(db)"
    - "OrchestrationGraph.configForProject(projectId)"
  types:
    - VerifyRoute
dependencies:
  internal:
    - packages/core/src/orchestration/types.ts
    - packages/core/src/orchestration/hitl.ts
    - packages/core/src/orchestration/SqliteSaver.ts
  external:
    - "@langchain/langgraph"
    - "@langchain/core/runnables"
    - "better-sqlite3"
---

# `packages/core/src/orchestration/graph.ts`

Implements the devs `OrchestrationGraph` — a cyclical LangGraph `StateGraph`
that drives the full pipeline from project discovery through TDD implementation,
with mandatory HITL approval gates and SQLite-backed crash recovery.

## Graph Topology

```
START → research → design → approveDesign ─────────────────────────────────────┐
                                 │ approved                                      │ rejected
                                 ↓                                              │
                            distill → approveTaskDag ────────────────────────   │
                                 ↑          │ approved                      │ rejected
                                 │          ↓                               │
                                 │     implement → verify                   │
                                 │          ↑         │                     │
                                 └──────────┼── distill ◄─(epics remain)    │
                                            └── implement ◄─(task failed)   │
                                                         │                  │
                                                        END (all complete)  │
                                                                            (loop back)
```

## Nodes

All pipeline node implementations are **stubs** in Phase 1. They perform the minimal
state updates needed to advance the pipeline and verify graph topology.

| Node               | Status Update           | Full Implementation (future)                                         |
|--------------------|-------------------------|----------------------------------------------------------------------|
| `researchNode`     | `"researching"`         | Invoke research agents → market/competitive/tech/user reports        |
| `designNode`       | `"specifying"`          | Invoke architect agent → PRD, TAS, MCP Design, Security, UI/UX docs  |
| `approveDesignNode`| (interrupt — no update) | HITL gate: suspend for design document review                        |
| `distillNode`      | `"planning"`            | Distill specs → `RequirementRecord[]` + `TaskRecord[]` with DAG      |
| `approveTaskDagNode`| (interrupt — no update)| HITL gate: suspend for task DAG review                               |
| `implementNode`    | `"implementing"`        | Execute 6-step TDD cycle for `state.activeTaskId`                    |
| `verifyNode`       | marks task completed    | Run full test suite, validate acceptance criteria, update task status |

## HITL Approval Gates

The graph has two mandatory Human-in-the-Loop gates. The pipeline **cannot** advance
past these gates without an explicit human approval via `Command({ resume: signal })`.

| Gate           | Node              | Position                   | Resume routes to |
|----------------|-------------------|----------------------------|-----------------|
| Design review  | `approveDesign`   | After `design`             | `distill` (approved) or `design` (rejected) |
| DAG review     | `approveTaskDag`  | After `distill`            | `implement` (approved) or `distill` (rejected) |

## SQLite Persistence Integration

`OrchestrationGraph` ships two static helpers for production-grade persistence:

### `OrchestrationGraph.withSqlitePersistence(db: Database.Database)`

Creates an `OrchestrationGraph` backed by `SqliteSaver`. Every node transition
writes an ACID-committed checkpoint to the `checkpoints` table. Enables:
- **Crash recovery**: resume an interrupted run from the last committed checkpoint.
- **Historical analysis**: all node transitions queryable via `SqliteSaver.list()`.

```ts
import { createDatabase, OrchestrationGraph } from "@devs/core";

const db = createDatabase({ dbPath: ".devs/state.sqlite" });
const og = OrchestrationGraph.withSqlitePersistence(db);
```

### `OrchestrationGraph.configForProject(projectId: string): RunnableConfig`

Builds the invocation config with `thread_id = projectId`. Thread isolation ensures
that multiple projects can share the same SQLite file without checkpoint contamination.

**Correlation mapping:**
- `thread_id`     → `projectId` (project-level checkpoint scope in SQLite)
- `checkpoint_id` → auto-generated UUID per checkpoint (managed by LangGraph internally)
- `activeTaskId`  → embedded in the serialized graph state at each checkpoint

```ts
const config = OrchestrationGraph.configForProject("project-abc");
// → { configurable: { thread_id: "project-abc" } }

await og.graph.invoke(state, config);
```

### Crash Recovery Pattern

```ts
import { createDatabase, OrchestrationGraph } from "@devs/core";
import { Command } from "@langchain/langgraph";

// Initial run — graph suspends at HITL gate, checkpoints written
const db1 = createDatabase({ dbPath: ".devs/state.sqlite" });
const og1 = OrchestrationGraph.withSqlitePersistence(db1);
const config = OrchestrationGraph.configForProject("project-123");
await og1.graph.invoke(initialState, config);

// --- Process crash / restart ---

// Recovery — open same DB file with new connection
const db2 = createDatabase({ dbPath: ".devs/state.sqlite" });
const og2 = OrchestrationGraph.withSqlitePersistence(db2);

// Resume from last checkpoint
const approval = { approved: true, approvedAt: new Date().toISOString() };
await og2.graph.invoke(new Command({ resume: approval }), config);
```

## Checkpointer

`OrchestrationGraph` accepts an optional `BaseCheckpointSaver` parameter.
Default: `new MemorySaver()`. For production, use `withSqlitePersistence(db)`.

## Conditional Routing — `routeAfterVerify`

After `verifyNode` runs, the router inspects the state and returns one of:

| Return value  | Condition                                              | Action            |
|---------------|--------------------------------------------------------|-------------------|
| `"implement"` | `activeTask.status === "failed"`                       | Retry TDD loop    |
| `"distill"`   | Any epic has `status !== "completed" && !== "failed"`  | Advance pipeline  |
| `END`         | All epics are in terminal state (completed or failed)  | Terminate         |

Priority: **failed task check first**, then active epics check, then terminate.

## State Mutation Contract

- All node functions receive the **full `GraphState`** and return **`Partial<GraphState>`**.
- HITL nodes (`approveDesignNode`, `approveTaskDagNode`) return state only AFTER resume.
  Before resume, `interrupt()` throws `GraphInterrupt` — no state update is applied.
- Non-HITL nodes: return only the fields they modify.
- State is **not mutated in place**: nodes use object spread.

## TypeScript Type Enforcement

The graph is constructed with `OrchestratorAnnotation` (typed `Annotation.Root`),
enforcing that all node functions receive `GraphState` and return `Partial<GraphState>`.

## Persistence Tests

16 integration tests in `packages/core/src/orchestration/__tests__/persistence.test.ts`:
- WAL mode verification (2 tests)
- Node transition checkpointing — rows written, thread_id isolation (4 tests)
- `withSqlitePersistence` factory and `configForProject` (2 tests)
- Complex state serialization — requirement DAGs round-trip (2 tests)
- Crash recovery — reconnect + resume + zero-data-loss (3 tests)
- ACID guarantees — table existence, `deleteThread` cleanup (3 tests)

## Notes

- `VerifyRoute` is exported as a string union type for use in tests and tooling.
- `approveDesignNode` and `approveTaskDagNode` are re-exported from `graph.ts`
  for convenience; they are also exported from `hitl.ts` (canonical location).
- Node functions are exported individually to allow unit testing without graph compilation.
- `og.graph.nodes` (internal LangGraph API) used in tests to verify node registration.
  Monitor on LangGraph upgrades.
- `withSqlitePersistence` constructs a `SqliteSaver` internally — callers should not
  also wrap the DB in a `SqliteSaver` manually.
