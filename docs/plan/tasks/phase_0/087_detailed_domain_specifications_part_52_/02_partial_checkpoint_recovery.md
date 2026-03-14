# Task: Partial Checkpoint Recovery Acceptance Logic (Sub-Epic: 087_Detailed Domain Specifications (Part 52))

## Covered Requirements
- [2_TAS-REQ-511]

## Dependencies
- depends_on: none
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/src/` (or the crate owning checkpoint restore), create a test module `tests::partial_checkpoint_recovery` with:
  - `test_corrupt_checkpoint_alongside_valid`: set up a project directory with two run checkpoint files under `.devs/checkpoints/`: run A with invalid/corrupt JSON (`checkpoint.json` contains `{invalid`), run B with valid JSON. Call `restore_checkpoints(project)`. Assert: the result contains two entries — run B is fully restored with its original state, run A is present but marked with state `Unrecoverable`.
  - `test_all_corrupt_checkpoints_still_starts`: set up a project where all checkpoint files are corrupt. Call `restore_checkpoints(project)`. Assert: returns Ok with all runs marked `Unrecoverable`; no panic or startup failure.
  - `test_no_checkpoints_returns_empty`: set up a project with no `.devs/checkpoints/` directory. Assert `restore_checkpoints` returns `Ok(vec![])`.
  - `test_unrecoverable_run_visible_in_list`: after restoring with one corrupt and one valid run, call `list_runs`. Assert both runs appear — the corrupt one with state `Unrecoverable` and the valid one with its restored state.
- [ ] Add `// Covers: 2_TAS-REQ-511` annotation to all test functions.

## 2. Task Implementation
- [ ] In the `restore_checkpoints` function, wrap each individual checkpoint deserialization in error handling:
  - On success: add the restored `WorkflowRun` to the results vector.
  - On failure (serde error, IO error, schema mismatch): log a `WARN` with the run directory path and error message, create a `WorkflowRun` stub with the run ID extracted from the directory name and state set to `Unrecoverable`, and add it to the results vector.
- [ ] Add an `Unrecoverable` variant to the `WorkflowRunState` enum in `devs-core` if not already present. This state must be terminal (no transitions out).
- [ ] Ensure the server startup path calls `restore_checkpoints` and does NOT abort on partial failures — it proceeds with whatever runs could be recovered.

## 3. Code Review
- [ ] Verify that corrupt checkpoint handling never panics — all deserialization is wrapped in `Result`.
- [ ] Confirm `Unrecoverable` is a terminal state with no valid transitions in the state machine.
- [ ] Ensure the warn log includes enough context (project name, run ID, error) for debugging.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- partial_checkpoint_recovery` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `restore_checkpoints` explaining partial recovery semantics and the `Unrecoverable` state.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint -- partial_checkpoint_recovery --no-fail-fast 2>&1 | tail -20` and verify exit code 0.
