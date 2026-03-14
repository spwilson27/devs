# Task: E2E Verification of Server Crash Recovery via CLI (Sub-Epic: 02_State Recovery and Lifecycle)

## Covered Requirements
- [1_PRD-REQ-031], [2_TAS-REQ-026]

## Dependencies
- depends_on: [docs/plan/tasks/phase_3/02_state_recovery_and_lifecycle/03_server_startup_recovery_integration.md]
- shared_components: [devs-server (consumer), devs-cli (consumer — submit/status/list commands), devs-checkpoint (consumer — checkpoint persistence verification)]

## 1. Initial Test Written
- [ ] Create `tests/e2e/crash_recovery.rs` (workspace-level E2E test).
- [ ] Write E2E test `test_crash_recovery_run_survives_server_restart`:
  1. Start a `devs-server` process with `DEVS_DISCOVERY_FILE` set to a unique temp path (E2E isolation).
  2. Register a test project (temp git repo) with a simple two-stage workflow where the first stage uses a mock agent that sleeps for 30 seconds.
  3. Submit a run via `devs submit <workflow>`.
  4. Poll `devs status <run>` until at least one stage reaches `Running` state.
  5. Send `SIGKILL` to the server process (simulating a crash — not `SIGTERM`, which would trigger graceful shutdown).
  6. Verify the discovery file has NOT been cleaned up (since the server was killed, not shut down gracefully).
  7. Verify that `.devs/runs/<run-id>/checkpoint.json` exists in the project repo's state branch (checkpoint was persisted before crash).
  8. Start a NEW `devs-server` process using the same config and `DEVS_DISCOVERY_FILE`.
  9. Poll `devs status <run>` and assert the run is present, the formerly `Running` stage is now `Eligible` or has been re-dispatched to `Running`.
  10. Cancel the run (to avoid waiting for the full mock agent timeout) and verify it reaches `Cancelled` state.
- [ ] Write E2E test `test_crash_recovery_definition_snapshot_preserved`:
  1. Same setup as above — submit a run, wait for `Running`, `SIGKILL` the server.
  2. After restarting the server, use `devs status <run> --json` (or equivalent) to verify the workflow definition snapshot is still associated with the recovered run.
  3. This verifies the reproducibility guarantee from [1_PRD-REQ-031].
- [ ] Write E2E test `test_crash_recovery_state_inspectable_via_git`:
  1. Submit a run, let it reach `Running`, `SIGKILL` the server.
  2. WITHOUT restarting the server, directly inspect the project repo's state branch using `git show <branch>:.devs/runs/<run-id>/checkpoint.json`.
  3. Assert the checkpoint JSON is valid and contains the expected run and stage state data.
  4. This verifies the version-controlled inspectability guarantee from [1_PRD-REQ-031].
- [ ] Add `// Covers: 1_PRD-REQ-031` and `// Covers: 2_TAS-REQ-026` annotations to all tests.

## 2. Task Implementation
- [ ] Implement test helper utilities:
  - `start_server(config_path, discovery_file) -> ServerProcess` — starts the server as a child process and waits for the discovery file to appear.
  - `kill_server(process: &mut ServerProcess)` — sends `SIGKILL` (Unix) or `TerminateProcess` (Windows).
  - `wait_for_stage_state(run_id, stage, expected_state, timeout)` — polls `devs status` until the stage reaches the expected state or timeout.
- [ ] Use a mock agent script (a simple shell script that sleeps) registered in the test pool config.
- [ ] Ensure each test creates its own isolated temp directory for the project repo, server config, and discovery file.
- [ ] Clean up all server processes and temp directories in test teardown (use `Drop` impls or `scopeguard`).

## 3. Code Review
- [ ] Verify tests use polling with reasonable timeouts (e.g., 10s for stage state transitions) rather than fixed `sleep` calls.
- [ ] Verify tests are platform-aware: `SIGKILL` on Unix, `TerminateProcess` on Windows (use `cfg` attributes).
- [ ] Confirm all three guarantees from [1_PRD-REQ-031] are exercised: crash survival (test 1), reproducibility (test 2), inspectability (test 3).

## 4. Run Automated Tests to Verify
- [ ] `./do test` (includes E2E tests)

## 5. Update Documentation
- [ ] Add doc comments to the test helper utilities explaining their usage pattern for future E2E tests.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify these E2E tests contribute to the coverage gates (QG-002 aggregate 80% E2E, QG-003 50% CLI E2E).
- [ ] Verify `target/traceability.json` includes coverage entries for `1_PRD-REQ-031` and `2_TAS-REQ-026`.
