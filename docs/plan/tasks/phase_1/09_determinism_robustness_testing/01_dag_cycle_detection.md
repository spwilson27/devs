# Task: Implement DAG Cycle Detection and Refinement Validation (Sub-Epic: 09_Determinism & Robustness Testing)

## Covered Requirements
- [9_ROADMAP-REQ-031], [TAS-083]

## 1. Initial Test Written
- [ ] Write unit tests for a `DAGValidator` utility that takes a task graph (adjacency list or nodes/edges) and detects cycles using Depth-First Search (DFS) or Kahn's algorithm.
- [ ] Include test cases for:
    - A simple acyclic graph (PASS).
    - A graph with a direct cycle (A -> B -> A) (FAIL).
    - A graph with a complex cycle (A -> B -> C -> A) (FAIL).
    - A disconnected but acyclic graph (PASS).
- [ ] Write a test to verify that the task graph respects the cyclical refinement pattern (Expansion -> Compression -> Decomposition -> Execution -> Verification) by asserting that dependencies only flow in the defined milestone order.

## 2. Task Implementation
- [ ] Implement the `DAGValidator` class in `@devs/core/orchestration`.
- [ ] Integrate the `DAGValidator` into the `DistillerAgent` or the roadmap generation logic to ensure that every generated task graph is validated before being persisted to SQLite.
- [ ] Throw a descriptive error if a cycle is detected, identifying the specific tasks involved in the cycle.
- [ ] Implement a `RefinementFlowValidator` to ensure that tasks in a later phase do not have dependencies on tasks in an earlier phase in a way that violates the project roadmap (unless explicitly allowed by cyclical loops in LangGraph).

## 3. Code Review
- [ ] Verify that the cycle detection algorithm is efficient (O(V+E)).
- [ ] Ensure that validation errors are logged to the `agent_logs` table for debugging.
- [ ] Confirm that the validation logic is decoupled from the persistence layer.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test --workspace=@devs/core` to ensure the `DAGValidator` tests pass.
- [ ] Manually trigger a task generation with a mock cycle to verify the orchestrator catches it and pauses.

## 5. Update Documentation
- [ ] Update the internal `TAS` documentation section on Roadmap Generation to reflect mandatory DAG validation.
- [ ] Document the `DAGValidator` API in the `@devs/core` README.

## 6. Automated Verification
- [ ] Execute a script `scripts/verify_dag_determinism.ts` that attempts to insert a cyclic task dependency into a test database and verifies that the `DAGValidator` throws an exception.
