---
module: packages/core/src/orchestration/graph.ts
phase: 1
task: "04_langgraph_core_orchestration_engine/04_implement_hitl_gates"
requirements: ["9_ROADMAP-TAS-101", "TAS-009", "TAS-103", "TAS-078", "2_TAS-REQ-016", "9_ROADMAP-PHASE-001"]
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
  types:
    - VerifyRoute
dependencies:
  internal:
    - packages/core/src/orchestration/types.ts
    - packages/core/src/orchestration/hitl.ts
  external:
    - "@langchain/langgraph"
---

# `packages/core/src/orchestration/graph.ts`

Implements the devs `OrchestrationGraph` — a cyclical LangGraph `StateGraph`
that drives the full pipeline from project discovery through TDD implementation,
with mandatory HITL approval gates.

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

## Checkpointer

`OrchestrationGraph` accepts an optional `BaseCheckpointSaver` parameter.
Default: `new MemorySaver()`. Always supply a `thread_id` in the invocation config:

```ts
const og = new OrchestrationGraph(new MemorySaver());
const config = { configurable: { thread_id: "project-123" } };
const result = await og.graph.invoke(state, config);
```

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

## `OrchestrationGraph` Class

```ts
import { OrchestrationGraph, createInitialState } from "@devs/core";
import { MemorySaver, Command, isInterrupted } from "@langchain/langgraph";

const og = new OrchestrationGraph(new MemorySaver());
const config = { configurable: { thread_id: "project-id" } };

// Run to first gate
const r1 = await og.graph.invoke(createInitialState(config_obj), config);

// Approve design
const approval = { approved: true, approvedAt: new Date().toISOString() };
const r2 = await og.graph.invoke(new Command({ resume: approval }), config);

// Approve DAG
const r3 = await og.graph.invoke(new Command({ resume: approval }), config);
console.log(r3.status); // "implementing"
```

## Notes

- `VerifyRoute` is exported as a string union type for use in tests and tooling.
- `approveDesignNode` and `approveTaskDagNode` are re-exported from `graph.ts`
  for convenience; they are also exported from `hitl.ts` (canonical location).
- Node functions are exported individually to allow unit testing without graph compilation.
- `og.graph.nodes` (internal LangGraph API) used in tests to verify node registration.
  Monitor on LangGraph upgrades.
