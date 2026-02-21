---
module: packages/core/src/orchestration/robustness.ts
package: "@devs/core"
layer: orchestration
status: implemented
test_file: packages/core/test/orchestration/robustness.test.ts
test_count: 75
requirements:
  - 8_RISKS-REQ-001
  - TAS-078
  - 9_ROADMAP-PHASE-001
  - 1_PRD-REQ-REL-002
  - 9_ROADMAP-REQ-012
---

# orchestration/robustness.ts

State machine robustness and error recovery for the devs orchestration engine.

## Purpose

Prevents unhandled exceptions from crashing the orchestration process. Provides
turn budget enforcement, loop detection integration, chaos recovery for stale
states, and a strategy pivot stub for when agents get stuck.

## Exports

### Constants

| Name | Value | Purpose |
|------|-------|---------|
| `MAX_IMPLEMENTATION_TURNS` | `10` | Turn budget limit per task [1_PRD-REQ-REL-002] |
| `CONSECUTIVE_ERROR_PIVOT_THRESHOLD` | `3` | Trigger pivot after N identical errors [9_ROADMAP-REQ-012] |
| `ENTROPY_LOOP_THRESHOLD` | `3` | Trigger pivot after N identical output hashes |

### Error utilities

| Function | Signature | Purpose |
|----------|-----------|---------|
| `maskSensitiveData(text)` | `(string) → string` | Redacts Bearer tokens, API keys, AWS IDs, passwords, basic-auth URLs |
| `classifyError(error)` | `(unknown) → ErrorKind` | Classifies as `"transient"` / `"logic"` / `"unknown"` |
| `buildErrorRecord(error, sourceNode, taskId, consecutiveCount)` | `→ ErrorRecord` | Constructs a masked `ErrorRecord` from a caught exception |
| `countConsecutiveErrors(history, message, taskId)` | `→ number` | Walks history backwards counting consecutive same-message errors |

### LangGraph nodes

| Node | Signature | Purpose |
|------|-----------|---------|
| `errorNode(state)` | `(GraphState) → Partial<GraphState>` | Global error handler: appends `ErrorRecord`, marks task "failed", sets status "error" |
| `pivotAgentNode(state)` | `(GraphState) → Partial<GraphState>` | Strategy pivot stub: status → "strategy_pivot", resets turn budget |

### Turn budget

| Function | Signature | Purpose |
|----------|-----------|---------|
| `checkTurnBudget(state)` | `(GraphState) → Partial<GraphState> \| null` | Returns pivot update if budget exceeded, null if fine |
| `incrementTurnBudget(state)` | `(GraphState) → Partial<GraphState>` | Increments `implementationTurns` by 1 |
| `resetTurnBudget()` | `() → Partial<GraphState>` | Resets `implementationTurns` to 0 |

### Routing

| Function | Signature | Purpose |
|----------|-----------|---------|
| `routeAfterError(state)` | `(GraphState) → ErrorRoute` | Routes to "pivot_agent" if ≥3 consecutive errors, else "implement" |

### Entropy detection

| Function | Signature | Purpose |
|----------|-----------|---------|
| `detectEntropy(state)` | `(GraphState) → boolean` | Returns true when active task has loopCount ≥ ENTROPY_LOOP_THRESHOLD |

### Chaos recovery

| Function | Signature | Purpose |
|----------|-----------|---------|
| `findStaleOrDirtyStates(state)` | `(GraphState) → StaleTaskInfo[]` | Finds in_progress tasks (interrupted mid-execution) for resume/rewind decisions |

### Types

| Type | Shape | Purpose |
|------|-------|---------|
| `ErrorRoute` | `"pivot_agent" \| "implement"` | Return type of `routeAfterError` — routing destinations from the error node |
| `StaleTaskInfo` | `{ taskId, name, status, epicId }` | Descriptor returned by `findStaleOrDirtyStates` for chaos recovery decisions |

## State fields introduced

Three new fields added to `OrchestratorState` and `OrchestratorAnnotation`:

| Field | Type | Initial | Purpose |
|-------|------|---------|---------|
| `errorHistory` | `readonly ErrorRecord[]` | `[]` | All captured error events |
| `implementationTurns` | `number` | `0` | Turn count for current task |
| `pendingRecoveryNode` | `string \| null` | `null` | Recovery routing signal |

## Graph topology additions

Two new nodes added to `OrchestrationGraph`:
- **`error`** — wired with `addConditionalEdges("error", routeAfterError)`.
- **`pivot_agent`** — wired with `addEdge("pivot_agent", END)` (stub).

The existing `implementNode` was updated to call `checkTurnBudget` and `detectEntropy`
before executing, enabling proactive pivot before consuming implementation turns.

`routeAfterVerify` was updated to route to `"pivot_agent"` when `pendingRecoveryNode === "pivot_agent"` (priority 1, above task-failed retry).

## ErrorRecord format

```ts
interface ErrorRecord {
  errorId: string;         // "err-{timestamp}-{random}" unique ID
  capturedAt: string;      // ISO 8601 UTC
  sourceNode: string;      // node that was executing (from pendingRecoveryNode)
  message: string;         // masked — no secrets
  stackTrace: string;      // masked — no secrets
  kind: ErrorKind;         // "transient" | "logic" | "unknown"
  consecutiveCount: number;
  taskId: string | null;
}
```

## Secret masking patterns

Applied in order by `maskSensitiveData`:
1. `Bearer <token>` → `Bearer [REDACTED]`
2. `api_key=<value>` → `[API_KEY=REDACTED]`
3. `AKIA...` (AWS keys) → `[AWS_KEY=REDACTED]`
4. `password=<value>`, `secret=<value>` → `[SECRET=REDACTED]`
5. `https://user:pass@host` → `https://[CREDENTIALS_REDACTED]@host`

## Limitations / Deferred

- `pivotAgentNode` is a stub. Full implementation (querying an AI agent for a new strategy) is deferred to a later phase.
- `findStaleOrDirtyStates` returns data for the caller to act on; the `rewind`/`resume` UX is not yet implemented.
- `errorNode` synthesizes the error message from `pendingRecoveryNode` (the source node name). A richer error passing mechanism (storing full error details in state before routing to "error") should be implemented when real agent nodes are added.
- The `error` node is registered in the graph topology but real pipeline nodes do not yet route to it automatically — they would need try/catch wrappers in their implementations.
