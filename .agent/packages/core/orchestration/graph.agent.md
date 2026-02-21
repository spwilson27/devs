---
module: packages/core/src/orchestration/graph.ts
phase: 1
task: "04_langgraph_core_orchestration_engine/02_implement_cyclical_graph"
requirements: ["9_ROADMAP-TAS-101", "TAS-009", "TAS-103", "2_TAS-REQ-016", "9_ROADMAP-PHASE-001"]
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
  types:
    - VerifyRoute
dependencies:
  internal:
    - packages/core/src/orchestration/types.ts
  external:
    - "@langchain/langgraph"
---

# `packages/core/src/orchestration/graph.ts`

Implements the devs `OrchestrationGraph` — a cyclical LangGraph `StateGraph`
that drives the full pipeline from project discovery through TDD implementation.

## Graph Topology

```
START → researchNode → designNode → distillNode → implementNode → verifyNode
                                         ↑              ↑               │
                                         └──────────────┼─── distill ◄──┤  (task passed, epics remain)
                                                        └──── implement ◄┤  (task failed — retry)
                                                                         │
                                                                        END  (all epics complete)
```

## Nodes

All node implementations are **stubs** in Phase 1. They perform the minimal state
updates needed to advance the pipeline and verify graph topology. Full implementations
will be added in later phases as the agent system is built out.

| Node            | Status Update         | Full Implementation (future)                                         |
|-----------------|-----------------------|----------------------------------------------------------------------|
| `researchNode`  | `"researching"`       | Invoke research agents → market/competitive/tech/user reports        |
| `designNode`    | `"specifying"`        | Invoke architect agent → PRD, TAS, MCP Design, Security, UI/UX docs  |
| `distillNode`   | `"planning"`          | Distill specs → `RequirementRecord[]` + `TaskRecord[]` with DAG      |
| `implementNode` | `"implementing"`      | Execute 6-step TDD cycle for `state.activeTaskId`                    |
| `verifyNode`    | marks task completed  | Run full test suite, validate acceptance criteria, update task status |

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
- Nodes return only the fields they modify — LangGraph merges the partial update.
- State is **not mutated in place**: nodes use object spread to create new values.
- `verifyNode` updates `tasks[]` (maps over existing tasks); all other stubs update
  `status` and `projectConfig.status`.

## TypeScript Type Enforcement

The graph is constructed with `OrchestratorAnnotation` (a typed `Annotation.Root`),
which enforces that all node functions receive `GraphState` and return
`Partial<GraphState>`. This satisfies the "TypedGraph" requirement (TAS-103).

## `OrchestrationGraph` Class

`OrchestrationGraph` is the entry point for graph execution. It compiles the graph
once in the constructor and exposes the compiled graph via `readonly graph`.

```ts
import { OrchestrationGraph, createInitialState } from "@devs/core";

const orchestrator = new OrchestrationGraph();
const result = await orchestrator.graph.invoke(createInitialState(projectConfig));
```

## Cyclical Design (TAS-103)

The graph is cyclical via the `verify → implement` edge:
- `verifyNode` → (conditional) → `implementNode` creates a retry loop for failed tasks.
- `verifyNode` → (conditional) → `distillNode` creates an advancement loop for new tasks.
- The loop terminates when `routeAfterVerify` returns `END` (all epics complete).

## Notes

- `VerifyRoute` is exported as a string union type for use in tests and future tooling.
- The `graph` property type is intentionally left as the inferred `compile()` return type
  so callers benefit from full LangGraph type inference without importing `CompiledGraph<...>`.
- Node functions are exported individually to allow unit testing without graph compilation.
