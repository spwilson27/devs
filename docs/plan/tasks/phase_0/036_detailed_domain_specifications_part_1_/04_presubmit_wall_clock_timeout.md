# Task: Presubmit 900-Second Wall-Clock Timeout Enforcement (Sub-Epic: 036_Detailed Domain Specifications (Part 1))

## Covered Requirements
- [1_PRD-KPI-BR-005], [1_PRD-KPI-BR-006]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a test script at `tests/do_script/test_presubmit_timeout.sh` with the following test cases:
- [ ] **Timeout triggers test**: Override the timeout constant to a short value (e.g., 3 seconds) via a test-only mechanism (e.g., `DEVS_PRESUBMIT_TIMEOUT_OVERRIDE=3` env var used ONLY in tests, with a comment explaining this is a test-only escape hatch not violating [1_PRD-KPI-BR-004]). Create a mock step that sleeps for 10 seconds. Run `./do presubmit` and assert:
  - Exit code is 1.
  - The timing record appended to `target/presubmit_timings.jsonl` has `"timed_out": true`.
  - The timing record has `"completed_at": null`.
  - The timing record has `"exit_code": 1`.
  - Stderr contains a message indicating timeout (e.g., `"presubmit timed out after 3 seconds"`).
- [ ] **Child processes killed test**: In the same timeout scenario, verify that the long-running child process is actually killed (not left running). After `./do presubmit` exits, check that no process with the mock command's signature is still running (e.g., via `pgrep` or checking `/proc`).
- [ ] **Wall-clock measurement test**: Create a step that consumes high CPU time but low wall-clock time (e.g., a short parallel computation). Verify that the timeout is NOT triggered even though CPU time may exceed the threshold. This confirms [1_PRD-KPI-BR-006] — wall clock, not CPU time.
- [ ] **Normal completion test**: Run `./do presubmit` with a mock that completes in 1 second. Assert exit code is 0, `"timed_out": false`, and `"completed_at"` is a valid ISO-8601 timestamp (not null).
- [ ] **Timing record schema test**: After any run, parse the last line of `target/presubmit_timings.jsonl` and validate it contains all required fields: `run_id` (UUID v4 format), `started_at` (ISO-8601), `completed_at` (ISO-8601 or null), `elapsed_seconds` (integer), `timed_out` (boolean), `exit_code` (integer), and `step_timings` (object with per-step entries each having `elapsed_seconds` and `exit_code`).

## 2. Task Implementation
- [ ] In the `./do` script's `presubmit` subcommand, define `PRESUBMIT_TIMEOUT=900` as a constant at the top.
- [ ] Record `started_at` as an ISO-8601 timestamp and `start_epoch` as seconds-since-epoch (using `date +%s`) at the beginning of the presubmit run.
- [ ] Generate a `run_id` using `uuidgen` (or fallback: `cat /proc/sys/kernel/random/uuid` on Linux, `python3 -c "import uuid; print(uuid.uuid4())"` as portable fallback).
- [ ] Run the presubmit in a subshell or with a process group (`set -m` or `setsid`) so that all child processes share a process group ID (PGID).
- [ ] Implement a background watchdog: start a background process that sleeps for `$PRESUBMIT_TIMEOUT` seconds, then sends `SIGTERM` followed by `SIGKILL` (after a 5-second grace period) to the entire process group (`kill -- -$$` or `kill -TERM -$pgid`).
- [ ] After each step (setup, format, lint, test, coverage, ci), record per-step timing in shell variables: `step_<name>_elapsed` and `step_<name>_exit`.
- [ ] On timeout: the watchdog kills the process group, the trap handler catches the signal, sets `timed_out=true`, sets `completed_at=null`, writes the timing record to `target/presubmit_timings.jsonl`, and exits with code 1.
- [ ] On normal completion: set `completed_at` to current ISO-8601 timestamp, `timed_out=false`, compute `elapsed_seconds` as `$(date +%s) - $start_epoch`, write the timing record, and exit with the appropriate code.
- [ ] The timing record MUST be valid JSONL. Use `printf` or a heredoc to construct the JSON — do NOT depend on `jq` being installed.
- [ ] Partial test results from a timed-out run MUST NOT be interpreted as pass: ensure the exit code is 1 regardless of which steps completed successfully before timeout.

## 3. Code Review
- [ ] Verify that the timeout uses wall-clock time (`date +%s` delta), NOT CPU time, confirming [1_PRD-KPI-BR-006].
- [ ] Verify that child process killing is atomic (process group kill), not just killing the immediate child, confirming [1_PRD-KPI-BR-005].
- [ ] Verify the timing record JSON schema matches the spec in §4.3.1 exactly (field names, types, nesting).
- [ ] Verify POSIX sh compatibility for the watchdog and signal handling (no bashisms).
- [ ] Verify that the `target/` directory is created if it doesn't exist before writing `presubmit_timings.jsonl`.
- [ ] Verify cross-platform considerations: `setsid` availability on macOS vs Linux (may need `perl -e 'use POSIX; setsid(); exec @ARGV'` fallback), `uuidgen` availability.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/do_script/test_presubmit_timeout.sh` and verify all test cases pass.
- [ ] Run `./do presubmit` on the real codebase (if feasible in CI) and verify the timing record is correctly appended to `target/presubmit_timings.jsonl`.

## 5. Update Documentation
- [ ] Add `# Covers: 1_PRD-KPI-BR-005` and `# Covers: 1_PRD-KPI-BR-006` comments in the test script and in the `./do` script next to the timeout logic.

## 6. Automated Verification
- [ ] Run the test script in CI: `bash tests/do_script/test_presubmit_timeout.sh && echo PASS || echo FAIL`
- [ ] After a real `./do presubmit` run, validate the last line of `target/presubmit_timings.jsonl` is valid JSON with all required fields: `python3 -c "import json,sys; d=json.loads(sys.stdin.readline()); assert all(k in d for k in ['run_id','started_at','completed_at','elapsed_seconds','timed_out','exit_code','step_timings'])" < <(tail -1 target/presubmit_timings.jsonl)`
