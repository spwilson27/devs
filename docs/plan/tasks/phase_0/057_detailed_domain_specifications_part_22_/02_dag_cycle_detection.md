# Task: DAG Cycle Detection and Workflow Validation (Sub-Epic: 057_Detailed Domain Specifications (Part 22))

## Covered Requirements
- [2_TAS-REQ-159]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (consumer — validation logic lives in devs-core domain types)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/workflow/validation.rs` with a `#[cfg(test)] mod tests` block.
- [ ] Define a minimal `StageDefinition` struct for testing: `{ name: String, depends_on: Vec<String>, pool: String }` and a `WorkflowDefinition` struct: `{ name: String, stages: Vec<StageDefinition> }`.
- [ ] **Test: `test_cycle_detected_simple`** — Stages: A depends_on B, B depends_on A. Assert `validate_workflow` returns an error containing the cycle path `["A", "B", "A"]` (or `["B", "A", "B"]` — either rotation is acceptable).
- [ ] **Test: `test_cycle_detected_three_node`** — Stages: A->B->C->A. Assert the error contains the full cycle path `["A", "B", "C", "A"]`.
- [ ] **Test: `test_no_cycle_linear`** — Stages: A->B->C (no cycle). Assert `validate_workflow` returns `Ok(())`.
- [ ] **Test: `test_no_cycle_diamond`** — Stages: A, B depends_on A, C depends_on A, D depends_on [B, C]. Assert `Ok(())`.
- [ ] **Test: `test_zero_stages_rejected`** — Empty stages list. Assert error contains a message like "workflow must have at least one stage".
- [ ] **Test: `test_unknown_pool_rejected`** — Stage references pool "nonexistent" but known pools are ["primary", "secondary"]. Assert error reports the unknown pool name and which stage references it.
- [ ] **Test: `test_all_errors_collected`** — Workflow has zero stages AND an unknown pool reference in a hypothetical stage definition passed alongside. Assert the returned error contains BOTH validation failures, not just the first one. (Note: if zero stages short-circuits before pool checks, design the test so that a workflow with one stage referencing an unknown pool AND a cycle in a separate part of the graph triggers both errors.)
- [ ] **Test: `test_self_referencing_stage`** — Stage A depends_on ["A"]. Assert cycle detected with path `["A", "A"]`.
- [ ] **Test: `test_unknown_dependency_rejected`** — Stage B depends_on ["nonexistent_stage"]. Assert error reports the unknown dependency.

## 2. Task Implementation
- [ ] Implement `validate_workflow(workflow: &WorkflowDefinition, known_pools: &[&str]) -> Result<(), Vec<ValidationError>>` in `devs-core`.
- [ ] Define `ValidationError` enum with variants:
  - `CycleDetected { path: Vec<String> }` — full cycle path as specified in [2_TAS-REQ-159].
  - `ZeroStages` — workflow has no stages.
  - `UnknownPool { stage: String, pool: String }` — stage references a pool not in `known_pools`.
  - `UnknownDependency { stage: String, dependency: String }` — stage references a non-existent stage in `depends_on`.
- [ ] Implement Kahn's algorithm for cycle detection:
  1. Build adjacency list and in-degree map from `depends_on` edges.
  2. Initialize queue with all nodes having in-degree 0.
  3. Process queue: for each node, decrement in-degree of its dependents; enqueue any that reach 0.
  4. If processed count < total stages, a cycle exists among the remaining nodes.
  5. To extract the cycle path: from the remaining nodes (in-degree > 0), perform DFS starting from any remaining node, tracking the recursion stack. When a back-edge is found, extract the cycle from the stack.
- [ ] Collect ALL validation errors into a `Vec<ValidationError>` — run all checks (zero stages, unknown pools, unknown dependencies, cycle detection) and aggregate before returning.
- [ ] Return `Ok(())` only if the error vec is empty; otherwise return `Err(errors)`.

## 3. Code Review
- [ ] Verify Kahn's algorithm correctly identifies all nodes participating in cycles, not just the first one found.
- [ ] Confirm the cycle path extraction produces a human-readable path like `["a", "b", "c", "a"]` with the first element repeated at the end.
- [ ] Ensure no early returns — all validation checks must run regardless of prior failures.
- [ ] Verify `ValidationError` implements `std::fmt::Display` with clear, actionable error messages.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- workflow::validation` and ensure all 9 tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings`.

## 5. Update Documentation
- [ ] Add doc comments to `validate_workflow` explaining the validation order and error collection semantics.
- [ ] Add `// Covers: 2_TAS-REQ-159` annotations to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- workflow::validation --nocapture 2>&1 | grep "test result"` and assert `0 failed`.
- [ ] Run `grep -c "Covers: 2_TAS-REQ-159" crates/devs-core/src/workflow/validation.rs` and assert the count is >= 5.
