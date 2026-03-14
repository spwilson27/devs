# Task: DAG Data Structure, Topological Sort & Cycle Detection (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [1_PRD-REQ-004]: Workflows are modeled as directed acyclic graphs (DAGs) of stages. Each stage declares a `depends_on` list of other stage names. A stage becomes eligible to run as soon as all declared dependencies have successfully completed.

## Dependencies
- depends_on: ["05_phase_1_completion_gate.md"]
- shared_components: [devs-core (consumer — uses `BoundedString`, state machine enums), devs-proto (consumer — uses wire types at boundaries)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/src/dag.rs` (module) and `crates/devs-scheduler/tests/dag_tests.rs`.
- [ ] Write unit test `test_empty_graph_returns_empty_order`: construct a `DagGraph` with zero stages, call `topological_sort()`, assert it returns an empty `Vec<StageId>`.
- [ ] Write unit test `test_single_stage_no_deps`: one stage with empty `depends_on`, assert `topological_sort()` returns `vec!["only_stage"]`.
- [ ] Write unit test `test_linear_chain`: stages A→B→C (B depends_on A, C depends_on B). Assert topological order is `[A, B, C]`.
- [ ] Write unit test `test_diamond_dag`: A→{B,C}→D. Assert topological sort produces a valid topological order (A before B and C, B and C before D). Use a validation function `is_valid_topological_order()` rather than asserting exact order.
- [ ] Write unit test `test_cycle_detected_two_nodes`: A depends_on B, B depends_on A. Assert `topological_sort()` returns `Err(DagError::CycleDetected { cycle: vec!["A", "B", "A"] })`.
- [ ] Write unit test `test_cycle_detected_three_nodes`: A→B→C→A. Assert error contains the full cycle path.
- [ ] Write unit test `test_self_cycle`: A depends_on A. Assert `CycleDetected` error.
- [ ] Write unit test `test_unknown_dependency_rejected`: stage B depends_on "nonexistent". Assert `Err(DagError::UnknownDependency { stage: "B", dependency: "nonexistent" })`.
- [ ] Write unit test `test_eligibility_initial`: given DAG A→{B,C}→D, call `eligible_stages(&completed_set)` with empty completed set. Assert returns `vec!["A"]` (only stages with zero unmet deps).
- [ ] Write unit test `test_eligibility_after_a_completes`: same DAG, completed = {A}. Assert `eligible_stages` returns `["B", "C"]` (order-independent).
- [ ] Write unit test `test_eligibility_partial_completion`: completed = {A, B}. Assert eligible = `["C"]` (D still blocked by C).
- [ ] Write unit test `test_eligibility_all_deps_met`: completed = {A, B, C}. Assert eligible = `["D"]`.

## 2. Task Implementation
- [ ] Add `dag` module to `crates/devs-scheduler/src/lib.rs`.
- [ ] Define `DagGraph` struct containing `stages: HashMap<String, Vec<String>>` mapping stage name to its `depends_on` list.
- [ ] Implement `DagGraph::new(stages: Vec<(String, Vec<String>)>) -> Result<Self, DagError>` that validates all dependency references exist (no unknown dependencies).
- [ ] Implement `DagGraph::topological_sort(&self) -> Result<Vec<String>, DagError>` using Kahn's algorithm:
  - Compute in-degree for each node.
  - Initialize queue with all nodes having in-degree 0.
  - Process queue: dequeue node, append to result, decrement in-degree of successors, enqueue successors that reach in-degree 0.
  - If result length < total nodes, a cycle exists — extract cycle path by walking remaining non-zero in-degree nodes and return `DagError::CycleDetected { cycle }`.
- [ ] Implement `DagGraph::eligible_stages(&self, completed: &HashSet<String>) -> Vec<String>`:
  - For each stage not in `completed`, check if all entries in its `depends_on` are in `completed`.
  - Return those stages sorted alphabetically for determinism.
- [ ] Define `DagError` enum with variants: `CycleDetected { cycle: Vec<String> }`, `UnknownDependency { stage: String, dependency: String }`, `EmptyWorkflow`.
- [ ] Ensure `DagError` implements `std::fmt::Display` and `std::error::Error`.
- [ ] Add `// Covers: 1_PRD-REQ-004` annotation to all test functions.

## 3. Code Review
- [ ] Verify `DagGraph` does not use any async runtime or IO — it is a pure data structure.
- [ ] Verify Kahn's algorithm runs in O(V+E) and does not allocate excessively.
- [ ] Verify no `devs-proto` wire types leak into the `DagGraph` public API (only domain strings).
- [ ] Verify cycle path extraction produces a minimal cycle (not the entire graph).
- [ ] Verify `eligible_stages` is deterministic (sorted output).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- dag` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `DagGraph`, `topological_sort`, `eligible_stages`, and `DagError`.
- [ ] Ensure `cargo doc -p devs-scheduler --no-deps` builds without warnings.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- dag --format=json 2>&1 | grep '"passed"'` and confirm all test cases appear as passed.
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- dag` and verify line coverage ≥ 90% for `dag.rs`.
