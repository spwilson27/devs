# Task: Define Orchestration State and Types (Sub-Epic: 04_LangGraph Core Orchestration Engine)

## Covered Requirements
- [TAS-097], [2_TAS-REQ-016], [9_ROADMAP-PHASE-001]

## 1. Initial Test Written
- [ ] Create a test suite in `packages/core/src/orchestration/__tests__/state.test.ts` to verify the `OrchestratorState` type definitions.
- [ ] Define tests that validate the initial state of the graph, ensuring all mandatory fields (e.g., `projectId`, `activeEpicId`, `activeTaskId`, `status`) are present and typed correctly.
- [ ] Write a test to verify the `TurnEnvelope` schema validation logic (if applicable here) or at least the TypeScript interfaces for agent interactions.

## 2. Task Implementation
- [ ] Define the `OrchestratorState` interface in `packages/core/src/orchestration/types.ts`.
- [ ] Include fields for:
    - `projectConfig`: High-level project metadata.
    - `documents`: List of current working documents.
    - `requirements`: Requirement DAG state.
    - `epics`: List of epics and their statuses.
    - `tasks`: Active task list and execution status.
    - `agentLogs`: In-memory buffer for the current turn's logs.
    - `entropy`: State for loop detection (hashes of last outputs).
- [ ] Define the `GraphState` using LangGraph's `StateGraph` definition.
- [ ] Ensure all types are exported and follow the strict TypeScript guidelines (TAS-005).

## 3. Code Review
- [ ] Verify that the state is "stateless" in nature—meaning it contains enough information to be serialized and resumed without relying on in-process memory.
- [ ] Ensure the schema aligns with the SQLite table definitions (projects, documents, requirements, etc.).
- [ ] Check for strict typing and avoid the use of `any`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core` and ensure the state validation tests pass.

## 5. Update Documentation
- [ ] Update the `@devs/core` README or internal AOD (`.agent.md`) to document the orchestration state schema.

## 6. Automated Verification
- [ ] Run a script `scripts/verify-schemas.ts` (if exists) or use `tsc` to ensure no type regressions in the core package.
