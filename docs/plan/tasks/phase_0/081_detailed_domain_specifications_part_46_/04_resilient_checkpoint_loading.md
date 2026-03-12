# Task: Resilient Checkpoint Loading (Sub-Epic: 081_Detailed Domain Specifications (Part 46))

## Covered Requirements
- [2_TAS-REQ-483]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] In `devs-checkpoint`, create a test suite `checkpoint_resilience_tests.rs`.
- [ ] Write a test that simulates a directory with three project checkpoints:
    - `run_A`: Valid `checkpoint.json`.
    - `run_B`: Malformed `checkpoint.json` (invalid JSON).
    - `run_C`: Missing `checkpoint.json`.
- [ ] Write a test that attempts to load and recover all runs.
- [ ] Assert that `run_A` is correctly recovered.
- [ ] Assert that `run_B` is marked as `Unrecoverable` but does NOT prevent the server from starting or recovering other runs.
- [ ] Assert that the server logs a specific error for `run_B`.
- [ ] Assert that `run_C` is also handled gracefully (e.g., ignored or marked `Unrecoverable`).

## 2. Task Implementation
- [ ] In `devs-checkpoint/src/loader.rs`, implement `recover_runs`.
- [ ] Implement robust error handling during the recovery loop:
    - Use `match` or `if let Err` to catch parsing or filesystem errors for each individual run.
    - If a run's `checkpoint.json` is corrupt or missing:
        - Log the error with the run ID and file path.
        - Transition the run's internal status to `Unrecoverable`.
        - Continue to the next run in the project directory.
- [ ] Ensure the server's startup sequence (to be implemented in Phase 3) calls this recovery logic without failing the whole process if some runs are unrecoverable.

## 3. Code Review
- [ ] Verify that corrupt checkpoints are correctly identified (e.g., malformed JSON, unknown schema version).
- [ ] Confirm that the server still starts successfully even if ALL runs in a project are unrecoverable.
- [ ] Ensure `Unrecoverable` runs are still listed via `list_runs` with their status.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test checkpoint_resilience_tests`.
- [ ] Verify all tests pass, confirming independent recovery of individual runs.

## 5. Update Documentation
- [ ] Document the `Unrecoverable` status and recovery logic in `docs/architecture.md` (or equivalent).

## 6. Automated Verification
- [ ] Run `./do test` and check the traceability report to ensure `2_TAS-REQ-483` is mapped to the passing tests.
