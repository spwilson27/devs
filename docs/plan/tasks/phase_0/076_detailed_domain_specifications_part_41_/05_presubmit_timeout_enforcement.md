# Task: Implement Presubmit 15-Minute Wall-Clock Timeout with Process Cleanup (Sub-Epic: 076_Detailed Domain Specifications (Part 41))

## Covered Requirements
- [2_TAS-REQ-459]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] **Test case 1 — timeout kills stuck process**: Create a test script that overrides `DEVS_PRESUBMIT_TIMEOUT` to a short value (e.g., 5 seconds) and replaces `./do test` with a command that sleeps indefinitely (e.g., `sleep 9999`). Run `./do presubmit`. Assert:
  - `./do presubmit` exits with a non-zero exit code.
  - The total wall-clock time is within a reasonable margin of the timeout (e.g., 5–8 seconds, not 9999).
  - The sleeping child process is no longer running after `./do presubmit` exits (check via `ps` or process group).
- [ ] **Test case 2 — normal completion within timeout**: Run `./do presubmit` with a short-running mock (e.g., all subcommands are no-ops that exit 0) and a generous timeout. Assert it exits 0 and completes well before the timeout.
- [ ] **Test case 3 — stderr message on timeout**: When timeout fires, assert stderr contains a message like `TIMEOUT: presubmit exceeded 900s wall-clock limit`.

## 2. Task Implementation
- [ ] In `./do`, define `PRESUBMIT_TIMEOUT_SECONDS=900` (15 minutes) as a constant at the top of the script. Allow override via `DEVS_PRESUBMIT_TIMEOUT` environment variable for testing.
- [ ] In `cmd_presubmit`, implement the timeout using POSIX-compatible mechanisms:
  1. Record the start time at the beginning of `cmd_presubmit`.
  2. Run all subcommands (setup, format, lint, test, coverage, ci) as child processes.
  3. Use a background watchdog approach: spawn a background subshell that sleeps for `$PRESUBMIT_TIMEOUT_SECONDS` then kills the process group:
     ```sh
     ( sleep "$PRESUBMIT_TIMEOUT_SECONDS" && echo "TIMEOUT: presubmit exceeded ${PRESUBMIT_TIMEOUT_SECONDS}s wall-clock limit" >&2 && kill -TERM -$$ ) &
     WATCHDOG_PID=$!
     ```
  4. On normal completion, kill the watchdog: `kill $WATCHDOG_PID 2>/dev/null`.
  5. On timeout, the `kill -TERM -$$` sends SIGTERM to the entire process group, ensuring all child processes (cargo, test runners, etc.) are terminated.
- [ ] Ensure the exit code on timeout is non-zero (e.g., 124, matching the `timeout` command convention).
- [ ] Add a `trap` handler to clean up the watchdog PID on early exit (e.g., if a subcommand fails before timeout).

## 3. Code Review
- [ ] Verify POSIX sh compatibility — no bashisms (no `[[ ]]`, no `$SECONDS`, no arrays).
- [ ] Verify the process group kill works on Linux and macOS. Note: `kill -TERM -$$` sends to the process group; confirm `./do` runs as a process group leader (which it typically does when invoked from a terminal).
- [ ] Verify the watchdog is always cleaned up, even if `cmd_presubmit` exits early due to a subcommand failure.
- [ ] Confirm the 900-second default matches the project spec (15 minutes).

## 4. Run Automated Tests to Verify
- [ ] Run the timeout tests with `DEVS_PRESUBMIT_TIMEOUT=5` and confirm the stuck-process test passes.
- [ ] Run `./do presubmit` normally and confirm it completes without timeout interference.

## 5. Update Documentation
- [ ] Add a comment in `./do` near `PRESUBMIT_TIMEOUT_SECONDS` explaining the 15-minute limit and the `DEVS_PRESUBMIT_TIMEOUT` override for testing.

## 6. Automated Verification
- [ ] Run: `DEVS_PRESUBMIT_TIMEOUT=3 DO_TEST_CMD="sleep 9999" ./do presubmit; echo "exit=$?"` (or equivalent mechanism to inject a slow command). Confirm exit is non-zero and completes within ~5 seconds.
- [ ] After the above, run `ps aux | grep "sleep 9999"` and confirm no orphaned sleep processes remain.
