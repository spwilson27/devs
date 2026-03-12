# Task: Checkpoint Resilience Tests (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [AC-ROAD-P1-001], [AC-ROAD-P1-005]

## Dependencies
- depends_on: [01_phase_0_dependency_verification.md]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint` that simulates `ENOSPC` (Disk Full) during a `CheckpointStore::save_run` call.
- [ ] Use a mock or a small loopback filesystem (on Linux) or a controlled failure point (e.g., using `fail-rs`) to trigger the error.
- [ ] Create a unit test in `devs-checkpoint` that attempts to load a `checkpoint.json` with malformed or invalid JSON.
- [ ] The test should assert that the affected run is correctly marked as `RecoveryStatus::Unrecoverable`.

## 2. Task Implementation
- [ ] Implement the `ENOSPC` simulation in the test suite.
- [ ] In `save_run`, ensure that if `ENOSPC` occurs, the error is caught, logged with `event_type: "checkpoint.write_failed"`, and the server does not panic or crash.
- [ ] In `load_all_runs`, implement the logic to catch JSON parsing errors.
- [ ] Ensure the parser returns `Unrecoverable { error }` when JSON is malformed.
- [ ] Verify that other valid runs are still loaded correctly despite one corrupt file.

## 3. Code Review
- [ ] Verify that `ENOSPC` is handled gracefully and the error message contains the `run_id`.
- [ ] Confirm that `load_all_runs` is robust against schema version mismatches (not just malformed JSON).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint`.
- [ ] Verify that both new tests pass on Linux, macOS, and Windows.

## 5. Update Documentation
- [ ] Update `devs-checkpoint` README.md with details on resilience and error handling.
- [ ] Add comments to the `CheckpointStore` trait reflecting these requirements.

## 6. Automated Verification
- [ ] Check `target/traceability.json` for the mapping of `AC-ROAD-P1-001` and `AC-ROAD-P1-005` to these tests.
- [ ] Confirm that `cargo llvm-cov --package devs-checkpoint` shows coverage of the error handling paths.
