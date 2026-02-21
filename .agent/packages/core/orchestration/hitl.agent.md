---
module: packages/core/src/orchestration/hitl.ts
phase: 1
task: "04_langgraph_core_orchestration_engine/04_implement_hitl_gates"
requirements: ["TAS-078", "9_ROADMAP-PHASE-001", "5_SECURITY_DESIGN-REQ-SEC-SD-022"]
exports:
  functions:
    - approveDesignNode
    - approveTaskDagNode
    - routeAfterApproveDesign
    - routeAfterApproveTaskDag
  types:
    - HitlGate
    - HitlApprovalSignal
    - HitlDecisionRecord
    - HitlInterruptValue
    - DesignApprovalRoute
    - DagApprovalRoute
dependencies:
  internal:
    - packages/core/src/orchestration/types.ts
  external:
    - "@langchain/langgraph"
---

# `packages/core/src/orchestration/hitl.ts`

Implements the HITL (Human-in-the-Loop) approval gate mechanism for the devs
orchestration pipeline. Two mandatory gates prevent the pipeline from advancing
autonomously past critical review checkpoints.

## Gate Positions in the Pipeline

```
design → approveDesign → (approved → distill | rejected → design)
distill → approveTaskDag → (approved → implement | rejected → distill)
```

## Approval Nodes

| Node                | Gate Identifier    | Review Request                                      |
|---------------------|--------------------|-----------------------------------------------------|
| `approveDesignNode` | `"design_approval"` | Review PRD, TAS, and other design documents         |
| `approveTaskDagNode`| `"dag_approval"`    | Review task DAG (phases, atomic tasks, DAG edges)   |

Both nodes use LangGraph's `interrupt()` to pause graph execution and wait for
an explicit human decision. The graph **cannot** proceed without a `Command({ resume: signal })`.

## Interrupt Mechanism

```ts
// First invocation — interrupt() throws GraphInterrupt, graph suspends
const signal = interrupt<HitlInterruptValue>({ gate, message, currentStatus });
// --- Graph is paused here ---
// After resume with Command({ resume: HitlApprovalSignal }):
// interrupt() returns the provided HitlApprovalSignal
```

## Resumption API

```ts
import { Command, isInterrupted, INTERRUPT, MemorySaver } from "@langchain/langgraph";
import { OrchestrationGraph } from "@devs/core";
import type { HitlApprovalSignal } from "@devs/core";

const og = new OrchestrationGraph(new MemorySaver());
const config = { configurable: { thread_id: "project-123" } };

// Run to first HITL gate
const r1 = await og.graph.invoke(state, config);

if (isInterrupted(r1)) {
  const { gate, message } = r1[INTERRUPT][0].value;
  console.log(`Waiting for: ${gate}`);  // "design_approval"

  // Collect human decision...
  const signal: HitlApprovalSignal = {
    approved: true,
    feedback: "Architecture looks correct.",
    approvedBy: "alice",
    approvedAt: new Date().toISOString(),
  };

  // Resume the graph
  const r2 = await og.graph.invoke(new Command({ resume: signal }), config);
  // r2 is suspended at the DAG approval gate now
}
```

## Routing Functions

| Function                  | Input State Field      | Returns                                    |
|---------------------------|------------------------|--------------------------------------------|
| `routeAfterApproveDesign` | `hitlDecisions`        | `"distill"` (approved) or `"design"` (rejected) |
| `routeAfterApproveTaskDag`| `hitlDecisions`        | `"implement"` (approved) or `"distill"` (rejected) |

Both routing functions look at the LAST decision of their respective gate type in
`state.hitlDecisions`. If no matching decision is found (unexpected state), they
default to the "safe" backward route to prevent autonomous pipeline advancement.

## Decision Audit Trail

Every human decision (approved OR rejected) is appended to `state.hitlDecisions`
as a `HitlDecisionRecord`. This provides:
- Full audit trail of all review decisions in the current run.
- Routing signal for the conditional edge after each gate.
- Foundation for persisting decisions to the `agent_logs` / Decision Logs table.

## HitlApprovalSignal Fields

| Field        | Required | Description                                      |
|--------------|----------|--------------------------------------------------|
| `approved`   | ✓        | `true` = approved, `false` = rejected            |
| `approvedAt` | ✓        | ISO 8601 UTC timestamp of the decision           |
| `feedback`   | ✗        | Optional reviewer notes / revision instructions  |
| `approvedBy` | ✗        | Identity of the reviewer (CLI user, VSCode user) |

## Security Properties (5_SECURITY_DESIGN-REQ-SEC-SD-022)

- **No autonomous bypass**: `interrupt()` unconditionally suspends. The only way
  to advance past a gate is an explicit `Command({ resume: signal })` call.
- **Rejection routing**: Rejected designs loop back to `design`; rejected DAGs
  loop back to `distill`. The pipeline cannot skip approval gates.
- **Audit persistence**: All decisions are recorded in `hitlDecisions` for
  later persistence to the Decision Logs table.

## EventBus Integration (Future — Phase 2)

The approval nodes have comment placeholders for EventBus emission:
```ts
// eventBus.emit("HITL_APPROVAL_REQUIRED", interruptValue);
```
This call should be added before `interrupt()` when the EventBus is available,
so that CLI and VSCode consumers can prompt users without polling the graph state.

## Checkpointer Requirement

LangGraph's `interrupt()` resume mechanism requires the graph to be compiled with
a checkpointer. `OrchestrationGraph` defaults to `MemorySaver`. For production,
inject an SQLite-backed checkpointer that persists state across process restarts.
