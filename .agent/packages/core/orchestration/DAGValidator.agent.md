---
module: packages/core/src/orchestration/DAGValidator.ts
description: DAG cycle detection and refinement flow validation for the devs orchestration engine.
exports:
  types:
    - TaskNode
    - PhaseTaskNode
    - RefinementPhase
    - CycleDetectionResult
    - FlowViolation
  constants:
    - PHASE_ORDER
  classes:
    - DAGValidator
    - RefinementFlowValidator
  errors:
    - DAGCycleError
    - RefinementFlowViolationError
requirements:
  - "[9_ROADMAP-REQ-031]"
  - "[TAS-083]"
---

# DAGValidator — Module Documentation

## Purpose

Provides two complementary validators to ensure the generated task graph is safe to persist and execute:

1. **`DAGValidator`** — Detects cycles in the task dependency graph (DAG). A cyclic task graph would cause the orchestrator to deadlock, so every generated task graph must be validated before being persisted to SQLite.

2. **`RefinementFlowValidator`** — Validates that tasks only depend on tasks in equal or earlier pipeline phases. Enforces the mandatory forward-only phase ordering: `expansion → compression → decomposition → execution → verification`.

## DAGValidator

### Algorithm

Iterative DFS with three-color node marking (WHITE/GRAY/BLACK). A GRAY→GRAY back-edge indicates a cycle. Complexity: **O(V+E)**.

- WHITE (0) — unvisited
- GRAY  (1) — on the current DFS stack
- BLACK (2) — fully explored

The `_reconstructCycle` helper traces the cycle path from the DFS stack for descriptive error messages.

### Static API

| Method | Signature | Description |
|--------|-----------|-------------|
| `detectCycles` | `(tasks: TaskNode[]) → CycleDetectionResult` | DFS cycle detection from a task array |
| `detectCyclesInAdjacencyList` | `(graph: Map<string, string[]>) → CycleDetectionResult` | DFS cycle detection from a raw adjacency list |
| `validate` | `(tasks: TaskNode[]) → void` | Throws `DAGCycleError` if cycle detected |
| `validateAdjacencyList` | `(graph: Map<string, string[]>) → void` | Throws `DAGCycleError` if cycle detected |

### DAGCycleError

```ts
class DAGCycleError extends Error {
  readonly cycleNodes: readonly string[];
}
```

The `cycleNodes` property holds the full cycle path (e.g., `["A", "B", "C", "A"]`). The message includes the human-readable path and the involved task IDs.

## RefinementFlowValidator

### Phase Order

```ts
export const PHASE_ORDER = [
  "expansion",     // Research / discovery (researchNode)
  "compression",   // Design / specification (designNode)
  "decomposition", // Planning / distillation (distillNode)
  "execution",     // TDD implementation (implementNode)
  "verification",  // Testing / validation (verifyNode)
];
```

A task at phase index N may depend on tasks at phases with index ≤ N. Depending on a later-phase task (index > N) is a **flow violation**.

### Static API

| Method | Signature | Description |
|--------|-----------|-------------|
| `check` | `(tasks: PhaseTaskNode[]) → FlowViolation[]` | Returns violations without throwing |
| `validate` | `(tasks: PhaseTaskNode[]) → void` | Throws `RefinementFlowViolationError` if violations found |

### RefinementFlowViolationError

```ts
class RefinementFlowViolationError extends Error {
  readonly violations: readonly FlowViolation[];
}
```

Each `FlowViolation` entry contains: `taskId`, `taskPhase`, `dependencyId`, `dependencyPhase`.

## Integration

Both validators are called in the `distillNode` (or DistillerAgent) **before** tasks are written to SQLite:

```ts
// 1. Validate no cycles
DAGValidator.validate(tasks);

// 2. Validate forward-only phase flow (if phase info is available)
RefinementFlowValidator.validate(phaseTasks);

// 3. Safe to persist
await stateRepository.saveTasks(tasks);
```

Callers must catch `DAGCycleError` / `RefinementFlowViolationError` and route to the error-recovery node so the violation is logged to `agent_logs`.

## Tests

31 unit tests in `packages/core/test/orchestration/dag_validator.test.ts`:

- 11 × DAGValidator.detectCycles (simple acyclic, diamond, direct cycle A→B→A, complex cycle A→B→C→A, disconnected acyclic, cycle in one component, self-loop, empty, single node, long chain, 4-node cycle)
- 4 × DAGValidator.validate (no throw, throws DAGCycleError, cycle nodes in message, cycleNodes on error object)
- 3 × DAGValidator.validateAdjacencyList
- 2 × DAGValidator.detectCyclesInAdjacencyList
- 10 × RefinementFlowValidator (forward flow, full pipeline, empty list, backward violations, all violations collected, error details, check() API)
- 1 × PHASE_ORDER constant export
