# Task: DAG Cycle Detection Validation (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-003]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/ac_p2_003_cycle_detection.rs` with two tests:
  1. **`test_submit_run_rejects_cycle`**: Define a workflow where stage `A` depends on `B` and stage `B` depends on `A`. Call `submit_run` and assert the error is `INVALID_ARGUMENT` status containing `"cycle"` and the array `["A", "B", "A"]` in the error message/details.
  2. **`test_write_workflow_definition_rejects_cycle`**: Call `write_workflow_definition` with the same cyclic workflow. Assert the same `INVALID_ARGUMENT` error with `"cycle": ["A", "B", "A"]`.
- [ ] Add a third test with a longer cycle (`A → B → C → A`) to verify the cycle path is fully reported, not just the first two nodes.
- [ ] Add `// Covers: AC-ROAD-P2-003` annotation to all test functions.

## 2. Task Implementation
- [ ] Verify that the Kahn's algorithm implementation in the scheduler returns the full cycle path (not just a boolean "has cycle") when a cycle is detected.
- [ ] Ensure the error message format matches `{ "error": "cycle detected", "cycle": ["A", "B", "A"] }` — the cycle array must start and end with the same node to show the loop.
- [ ] Ensure both `submit_run` and `write_workflow_definition` invoke the same cycle detection function so behavior is consistent.

## 3. Code Review
- [ ] Verify Kahn's algorithm correctly identifies the cycle participants (the nodes remaining after topological sort fails) and reconstructs the cycle path.
- [ ] Confirm the error is returned as gRPC `INVALID_ARGUMENT` status code, not `INTERNAL` or `UNKNOWN`.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-scheduler --test ac_p2_003_cycle_detection -- --nocapture`

## 5. Update Documentation
- [ ] Add `// Covers: AC-ROAD-P2-003` to all cycle detection test functions.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes `AC-ROAD-P2-003`.
