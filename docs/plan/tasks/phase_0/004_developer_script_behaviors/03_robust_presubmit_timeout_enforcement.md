# Task: Implement `./do presubmit` 900-Second Timeout Enforcement (Sub-Epic: 004_Developer Script Behaviors)

## Covered Requirements
- [2_TAS-REQ-085]

## Dependencies
- depends_on: ["01_implement_subcommand_contract_details.md"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create `tests/do_presubmit_timeout.sh` (POSIX sh, `set -eu`). This test must verify the background-timer timeout mechanism specified in [2_TAS-REQ-085]:
- [ ] **Timeout triggers test**: Create a mock `./do` invocation that overrides the timeout to a short value (e.g., 2 seconds) via an environment variable `DEVS_PRESUBMIT_TIMEOUT_SECS=2`. Replace the `do_setup` function (or inject a `sleep 10` into the pipeline) so the presubmit will exceed the timeout. Run the modified presubmit. Assert:
  - Exit code is non-zero.
  - Stderr contains the exact string `presubmit timeout: exceeded 15 minutes` (note: even with shortened timeout, the message text is the canonical one; OR the test uses the actual 900s value and the message matches — decide on approach: if `DEVS_PRESUBMIT_TIMEOUT_SECS` is used, the message should reflect the actual timeout or be the canonical message regardless).
  - **Recommended approach**: The message is always `"presubmit timeout: exceeded 15 minutes"` regardless of the `DEVS_PRESUBMIT_TIMEOUT_SECS` override (the override is for testing only; the user-facing message is fixed per spec).
- [ ] **Child processes killed test**: After the timeout fires, verify no child processes from the presubmit are still running. Use `ps` to check for any processes spawned by the test that are still alive.
- [ ] **Normal completion test**: With `DEVS_PRESUBMIT_TIMEOUT_SECS=60` and a fast-completing stub workspace, run `./do presubmit` and assert it exits 0 (timeout does NOT fire when presubmit completes in time).
- [ ] Each test case must include a `# Covers: 2_TAS-REQ-085` comment.

## 2. Task Implementation
- [ ] In the `./do` script's `do_presubmit` function, implement the timeout using a **background watchdog process** (NOT the `timeout` command, which does not survive subshells on all platforms):
  ```sh
  TIMEOUT_SECS="${DEVS_PRESUBMIT_TIMEOUT_SECS:-900}"
  PRESUBMIT_PID=$$
  (
    sleep "$TIMEOUT_SECS"
    echo "presubmit timeout: exceeded 15 minutes" >&2
    kill -TERM -- -"$PRESUBMIT_PID" 2>/dev/null || true
    sleep 2
    kill -KILL -- -"$PRESUBMIT_PID" 2>/dev/null || true
  ) &
  WATCHDOG_PID=$!
  ```
- [ ] After all presubmit steps complete successfully, kill the watchdog: `kill "$WATCHDOG_PID" 2>/dev/null || true; wait "$WATCHDOG_PID" 2>/dev/null || true`.
- [ ] Set up a `trap` to clean up the watchdog on early exit (e.g., if a lint step fails before timeout): `trap 'kill "$WATCHDOG_PID" 2>/dev/null || true' EXIT`.
- [ ] The `kill -- -"$PID"` syntax sends the signal to the entire process group, ensuring all child processes (cargo, rustfmt, etc.) are terminated.
- [ ] The timeout value is 900 seconds (hard-coded default), overridable via `DEVS_PRESUBMIT_TIMEOUT_SECS` for testing only.
- [ ] The error message must be exactly: `presubmit timeout: exceeded 15 minutes` written to stderr.

## 3. Code Review
- [ ] Verify the watchdog uses a **background process** (`&`), not the `timeout` command (per phase_0.md technical consideration: "must use a background process, not `timeout` command, to survive subshells").
- [ ] Verify that `kill -- -"$PID"` targets the process group (the leading `-` before the PID).
- [ ] Verify the watchdog is cleaned up on both success and early failure paths (trap + explicit kill).
- [ ] Verify the error message string matches [2_TAS-REQ-085] exactly: `"presubmit timeout: exceeded 15 minutes"`.
- [ ] Verify POSIX sh compatibility — `kill -- -$$` may not work on all shells; test on dash/ash. If not portable, use `kill 0` (sends to current process group) as a fallback.
- [ ] Verify wall-clock semantics: the timer starts at invocation and covers ALL steps including `setup`.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_presubmit_timeout.sh` and confirm all assertions pass (timeout fires, children killed, message correct, normal completion unaffected).
- [ ] Run `./do presubmit` on the stub workspace and verify it completes within 900 seconds with exit 0.

## 5. Update Documentation
- [ ] Add a comment in the `do_presubmit` function explaining the watchdog pattern and the `DEVS_PRESUBMIT_TIMEOUT_SECS` testing override.

## 6. Automated Verification
- [ ] Run the timeout test with a 2-second override and a `sleep 10` injected step:
  ```sh
  DEVS_PRESUBMIT_TIMEOUT_SECS=2 ./do presubmit 2>timeout_err.tmp; rc=$?
  test "$rc" -ne 0 && echo "PASS: non-zero exit" || echo "FAIL"
  grep -q "presubmit timeout: exceeded 15 minutes" timeout_err.tmp && echo "PASS: message" || echo "FAIL"
  ```
- [ ] Verify no orphan processes remain after the timeout by checking `ps aux | grep cargo` shows no stale processes from the test.
