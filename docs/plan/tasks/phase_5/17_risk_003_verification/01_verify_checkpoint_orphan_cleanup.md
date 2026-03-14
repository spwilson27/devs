# Task: Verify Checkpoint Orphan Cleanup and Mid-Write Crash Recovery (Sub-Epic: 17_Risk 003 Verification)

## Covered Requirements
- [AC-RISK-003-03], [AC-RISK-003-04]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an integration test file `crates/devs-checkpoint/tests/orphan_cleanup_tests.rs` with two test functions.
- [ ] **Test 1 (`test_orphaned_tmp_cleanup`)** `[AC-RISK-003-03]`:
  - Create a temporary test directory structure mimicking a project's `.devs/` folder.
  - Create a valid `checkpoint.json` file with a known workflow run state.
  - Create an orphaned `checkpoint.json.tmp` file with different/corrupted content (simulating a crash mid-write from a previous session).
  - Call `CheckpointStore::load_all_runs()` on this directory.
  - Assert that the `.tmp` file is deleted after loading.
  - Assert that a `WARN` level log is emitted with structured fields: `event_type: "checkpoint.orphan_cleanup"`, `orphaned_file: "checkpoint.json.tmp"`.
  - Assert that the valid `checkpoint.json` run is loaded correctly and the orphaned tmp content is ignored.
- [ ] **Test 2 (`test_mid_write_crash_recovery`)** `[AC-RISK-003-04]`:
  - Create a temporary test directory with multiple valid runs in separate subdirectories.
  - For one run, simulate a mid-write crash scenario:
    - **Scenario A**: `checkpoint.json.tmp` exists but no `checkpoint.json` (crash on first write).
    - **Scenario B**: `checkpoint.json.tmp` exists with newer content than `checkpoint.json` (crash between tmp-write and rename).
  - Call `CheckpointStore::load_all_runs()`.
  - Assert that for Scenario A, the run is marked with `RunStatus::Unrecoverable` but other runs load successfully.
  - Assert that for Scenario B, the old `checkpoint.json` content is used (tmp is discarded) OR the run is marked `Unrecoverable` — but at most ONE run is affected.
  - Assert that all other valid runs in the directory are loaded correctly without errors.

## 2. Task Implementation
- [ ] Implement `CheckpointStore::load_all_runs()` in `crates/devs-checkpoint/src/store.rs`:
  - Before loading any `checkpoint.json` files, scan for `*.tmp` files in each run directory.
  - For each orphaned `.tmp` file found:
    - Log a `WARN` with structured fields: `event_type: "checkpoint.orphan_cleanup"`, `orphaned_file`, `run_id` (if extractable).
    - Delete the `.tmp` file using `tokio::fs::remove_file()`.
  - Continue loading all `checkpoint.json` files.
- [ ] Implement error handling for JSON parsing failures:
  - Wrap JSON deserialization in a `catch_unwind` or use `Result` handling.
  - On parse error, mark the specific run as `RunStatus::Unrecoverable` instead of returning a global `Err`.
  - Ensure other runs continue to load successfully.
- [ ] Verify the atomic write sequence uses `fsync` + `rename` as per `[RISK-003-BR-001]` (implemented in Phase 1, but verify here):
  - Check that `write_checkpoint` writes to `.tmp`, calls `sync_all()`, then `rename()`s to final path.
  - This ensures that a crash during write leaves the old `checkpoint.json` intact.

## 3. Code Review
- [ ] Verify that `load_all_runs` uses `tokio::fs` for all file operations to avoid blocking the async runtime.
- [ ] Confirm that `WARN` logs use the structured logging format consistent with the rest of `devs` (JSON or key-value pairs).
- [ ] Check that `RunStatus::Unrecoverable` is a distinct variant that prevents stage dispatch but allows the run to be listed and inspected.
- [ ] Ensure that orphan cleanup does not accidentally delete `.tmp` files that are actively being written (check for file age or lock if necessary, though atomic rename should make this unnecessary).
- [ ] Verify that the test isolation uses unique temporary directories per test to avoid cross-test pollution.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test orphan_cleanup_tests -- --nocapture`.
- [ ] Verify both tests pass on the first run (no flakiness).
- [ ] Run `cargo test -p devs-checkpoint` to ensure no regressions in existing checkpoint tests.

## 5. Update Documentation
- [ ] Update `crates/devs-checkpoint/README.md` to document the orphan cleanup behavior and the atomic write protocol.
- [ ] Add a section to `docs/plan/specs/8_risks_mitigation.md` (or verify existing section) describing the mid-write crash recovery mechanism.
- [ ] Update the agent memory in `.agent/MEMORY.md` to record that RISK-003 orphan cleanup is verified.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows:
  - `AC-RISK-003-03` covered by `test_orphaned_tmp_cleanup`.
  - `AC-RISK-003-04` covered by `test_mid_write_crash_recovery`.
  - Both requirements have `status: "covered"` with passing tests.
- [ ] Run `./do lint` to ensure no clippy warnings or formatting issues in the new test code.
- [ ] Verify that `target/coverage/report.json` shows `devs-checkpoint` maintaining ≥90% line coverage after adding these tests.
