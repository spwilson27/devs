---
module: packages/core/src/orchestration/types.ts
phase: 1
task: "04_langgraph_core_orchestration_engine/01_define_orchestration_state"
requirements: ["TAS-097", "2_TAS-REQ-016", "9_ROADMAP-PHASE-001"]
exports:
  types:
    - ProjectStatus
    - DocumentStatus
    - RequirementStatus
    - EpicStatus
    - TaskStatus
    - AgentId
    - ProjectConfig
    - DocumentRecord
    - RequirementRecord
    - EpicRecord
    - TaskRecord
    - AgentLogRecord
    - EntropyRecord
    - OrchestratorState
    - GraphState
  values:
    - OrchestratorAnnotation
  functions:
    - createInitialState
dependencies:
  internal:
    - packages/core/src/schemas/turn_envelope.ts
  external:
    - "@langchain/langgraph"
---

# `packages/core/src/orchestration/types.ts`

Defines the complete type system for the devs orchestration engine. All types
in this module are JSON-serializable and correspond directly to SQLite table
rows in the Flight Recorder database.

## Purpose

This module establishes the single source of truth for:

1. **Entity status enumerations** — typed string unions for lifecycle states.
2. **Data record interfaces** — one per SQLite table, carrying all serializable fields.
3. **`OrchestratorState`** — the complete snapshot passed between LangGraph graph nodes.
4. **`OrchestratorAnnotation`** — the LangGraph channel definition used to construct a `StateGraph`.
5. **`GraphState`** — the TypeScript type alias derived from `OrchestratorAnnotation.State`.
6. **`createInitialState`** — factory that produces a blank starting state for a new project.

## SQLite Table Alignment

| Interface        | SQLite Table      |
|------------------|-------------------|
| `ProjectConfig`  | `projects`        |
| `DocumentRecord` | `documents`       |
| `RequirementRecord` | `requirements` |
| `EpicRecord`     | `epics`           |
| `TaskRecord`     | `tasks`           |
| `AgentLogRecord` | `agent_logs`      |
| `EntropyRecord`  | `entropy_events`  |

## Design Invariants

- **Serializable**: All fields are JSON-serializable (no `Date`, functions, or class instances).
- **Stateless**: The state contains enough information to resume after a process restart.
- **No `any`**: Strict TypeScript mode enforced throughout (TAS-005).
- **`readonly` collections**: All array fields use `readonly T[]` to signal that nodes
  must return new arrays rather than mutating in-place.
- **Replace semantics**: `OrchestratorAnnotation` channels use the default LangGraph
  replace reducer (last-write-wins). The orchestrator owns explicit state mutations
  backed by SQLite; LangGraph handles routing and control flow.

## LangGraph Integration

```ts
import { StateGraph, START, END } from "@langchain/langgraph";
import { OrchestratorAnnotation, type GraphState } from "@devs/core";

// A node function receives the full GraphState and returns partial updates:
const researcherNode = (state: GraphState): Partial<GraphState> => {
  return { status: "researching" };
};

const graph = new StateGraph(OrchestratorAnnotation)
  .addNode("researcher", researcherNode)
  .addEdge(START, "researcher")
  .addEdge("researcher", END)
  .compile();
```

## `AgentLogRecord` Integration with SAOP Schemas

`AgentLogRecord` directly embeds `TurnContent` and `TurnMetadata` from
`packages/core/src/schemas/turn_envelope.ts`. This keeps the in-memory
representation in sync with the SQLite-persisted and event-bus representations.

## `EntropyRecord` and Loop Detection

Each turn, the orchestrator hashes the agent's output (SHA-256) and compares
it against recent `EntropyRecord` entries. If `loopCount` exceeds a configured
threshold, the orchestrator triggers an intervention to break the loop.
This mechanism fulfills the anti-loop requirement in TAS-097.

## Usage

```ts
import { createInitialState, type ProjectConfig } from "@devs/core";

const config: ProjectConfig = {
  projectId: crypto.randomUUID(),
  name: "My Project",
  description: "...",
  status: "initializing",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const initialState = createInitialState(config);
```
