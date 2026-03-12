# Task: Define Agent Context Domain Types and Dependency Logic (Sub-Epic: 030_Foundational Technical Requirements (Part 21))

## Covered Requirements
- [2_TAS-REQ-023A], [2_TAS-REQ-023D]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core/src/context.rs` (or similar) that verifies the structure of `AgentContext` can represent metadata, inputs, and stage outputs.
- [ ] Create a test that verifies a function/method can filter a list of stage runs to only those in the transitive `depends_on` closure of a given stage.

## 2. Task Implementation
- [ ] Define the `AgentContext` struct in `devs-core`.
- [ ] Ensure it has fields for:
    - Run metadata (run ID, workflow name, etc.)
    - Global workflow inputs
    - A map or list of dependency stage outputs
- [ ] Define `StageOutputSnapshot` struct containing `name`, `exit_code`, `stdout`, `stderr`, and any structured JSON output.
- [ ] Implement logic to calculate the transitive dependency closure for a given stage within a `WorkflowRun`.
- [ ] Ensure only **terminal-state** stages are included (Completed, Failed, TimedOut, Cancelled).

## 3. Code Review
- [ ] Verify that `AgentContext` is correctly structured and serializable via `serde`.
- [ ] Ensure that non-transitive dependencies are correctly excluded.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to ensure the context types and dependency logic are correct.

## 5. Update Documentation
- [ ] Ensure `missing_docs` are provided for the new public structs and methods.

## 6. Automated Verification
- [ ] Run `./do test` and verify that [2_TAS-REQ-023A] and [2_TAS-REQ-023D] are mapped correctly in `traceability.json`.
