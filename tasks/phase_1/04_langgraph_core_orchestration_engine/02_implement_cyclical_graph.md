# Task: Implement Cyclical LangGraph Skeleton (Sub-Epic: 04_LangGraph Core Orchestration Engine)

## Covered Requirements
- [9_ROADMAP-TAS-101], [TAS-009], [TAS-103], [2_TAS-REQ-016], [9_ROADMAP-PHASE-001]

## 1. Initial Test Written
- [ ] Create an integration test in `packages/core/src/orchestration/__tests__/graph.test.ts` that initializes the `StateGraph`.
- [ ] Write tests to verify the flow between nodes: `research` -> `design` -> `distill` -> `implement` -> `verify`.
- [ ] Verify that the graph can loop back from `verify` to `implement` on failure, and from `verify` to `distill` (or `research`) for the next requirement/epic.

## 2. Task Implementation
- [ ] Implement the `OrchestrationGraph` class using `langgraph.js`.
- [ ] Define the following nodes (stubs for now):
    - `researchNode`: Handles discovery and report generation.
    - `designNode`: Handles PRD/TAS blueprinting.
    - `distillNode`: Handles requirement extraction and task DAG generation.
    - `implementNode`: Handles the TDD implementation loop for a single task.
    - `verifyNode`: Handles final task verification and regression testing.
- [ ] Configure the edges:
    - START -> `researchNode`
    - `researchNode` -> `designNode`
    - `designNode` -> `distillNode`
    - `distillNode` -> `implementNode`
    - `implementNode` -> `verifyNode`
    - `verifyNode` -> `implementNode` (Conditional: if task fails)
    - `verifyNode` -> `distillNode` (Conditional: if task passes and more tasks remain)
    - `verifyNode` -> END (Conditional: if all epics complete)
- [ ] Use `TypedGraph` to enforce state types during transitions.

## 3. Code Review
- [ ] Ensure the graph is truly cyclical as per TAS-103.
- [ ] Verify that node transitions are clean and do not leak state outside of the `GraphState` object.
- [ ] Check that the graph handles the "Foundation", "Intelligence", and "Autonomy" milestone paths if applicable.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core` and ensure the graph topology tests pass.

## 5. Update Documentation
- [ ] Generate a Mermaid diagram of the implemented graph and save it to `docs/architecture/orchestration_graph.md`.

## 6. Automated Verification
- [ ] Execute a "dry-run" of the graph using a mock state and verify the node execution sequence via logs.
