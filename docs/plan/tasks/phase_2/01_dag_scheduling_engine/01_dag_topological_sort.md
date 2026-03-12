# Task: DAG Engine - Core Topological Sort & Cycle Detection (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [1_PRD-REQ-004]: Workflow DAG Scheduling (Workflows are modeled as DAGs of stages).
- [2_TAS-REQ-100]: Dependency Graph Acyclic Constraint.
- [2_TAS-REQ-030A]: Workflow Validation Order (Cycle detection is check #4).

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-scheduler]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-scheduler/src/dag.rs` (or equivalent) for `TopologicalSorter`.
- [ ] Test 1: A simple linear graph (A -> B -> C) returns the correct order.
- [ ] Test 2: A parallel graph (A -> B, A -> C, B -> D, C -> D) returns a valid topological order.
- [ ] Test 3: A graph with a direct cycle (A -> A) returns a `ValidationError::CycleDetected`.
- [ ] Test 4: A graph with a multi-stage cycle (A -> B -> C -> A) returns a `ValidationError::CycleDetected`.
- [ ] Test 5: A graph with multiple disconnected components is handled correctly.

## 2. Task Implementation
- [ ] Implement `TopologicalSorter` in `devs-scheduler`.
- [ ] Implement cycle detection using Kahn's algorithm or DFS with recursion-stack tracking.
- [ ] Ensure the sorter operates on `StageID` types from `devs-core`.
- [ ] Map `WorkflowDefinition`'s `depends_on` lists to the internal graph representation.
- [ ] Expose a `validate_acyclic()` method that returns all detected cycles in a `Vec<ValidationError>`.

## 3. Code Review
- [ ] Verify that `devs-scheduler` does NOT depend on `devs-proto` (2_TAS-REQ-001G).
- [ ] Ensure cycle detection is efficient (O(V+E)) and handles large graphs (up to 1000 nodes).
- [ ] Check that `ValidationError` from `devs-core` is used for reporting.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler` and ensure all DAG logic tests pass.

## 5. Update Documentation
- [ ] Update `devs-scheduler` README.md to describe the DAG implementation details.

## 6. Automated Verification
- [ ] Run `./do test` to verify 100% requirement-to-test traceability for [1_PRD-REQ-004] and [2_TAS-REQ-100].
