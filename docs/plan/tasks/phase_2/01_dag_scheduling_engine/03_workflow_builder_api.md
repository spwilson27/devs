# Task: Workflow Authoring - Rust Builder API (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [1_PRD-REQ-006]: Dual Workflow Authoring Formats (Rust Builder API).

## Dependencies
- depends_on: [01_dag_topological_sort.md]
- shared_components: [devs-core, devs-scheduler]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core/src/workflow/builder.rs` (or equivalent) for `WorkflowBuilder`.
- [ ] Test 1: Define a 3-stage workflow with dependencies and verify the generated `WorkflowDefinition`.
- [ ] Test 2: Ensure a builder sequence with a cycle fails with `ValidationError` at build time.
- [ ] Test 3: Test adding branching closures to the builder.
- [ ] Test 4: Verify typed inputs can be defined in the builder.

## 2. Task Implementation
- [ ] Implement `WorkflowBuilder` struct with a fluent API (e.g., `.stage(...)`, `.depends_on(...)`).
- [ ] Implement `StageBuilder` for configuring individual stages.
- [ ] Support `branch(|ctx| ...)` method that accepts a Rust closure (builder API exclusive).
- [ ] Ensure `build()` returns a `Result<WorkflowDefinition, Vec<ValidationError>>`.
- [ ] Integrate with the `TopologicalSorter` from `devs-scheduler` to validate the DAG at build time.

## 3. Code Review
- [ ] Check that the API is ergonomic and type-safe (no `unsafe`, strictly stable Rust).
- [ ] Verify that the `WorkflowDefinition` produced is compatible with the declarative parser output.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all builder tests pass.

## 5. Update Documentation
- [ ] Add examples of using the Rust Builder API to the project README.md.

## 6. Automated Verification
- [ ] Run `./do test` to verify 100% requirement-to-test traceability for [1_PRD-REQ-006] (Builder API portion).
