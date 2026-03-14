# Task: Implement Presubmit Timeout Enforcement and Timing Telemetry (Sub-Epic: 026_Foundational Technical Requirements (Part 17))

## Covered Requirements
- [2_TAS-REQ-014C], [2_TAS-REQ-014D]

## Dependencies
- depends_on: [02_idempotent_setup_tools.md]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create `tests/do_script/presubmit_timeout_test.sh` with the following test cases:
  1. **Timeout enforcement** ([2_TAS-REQ-014C]): Create a mock `./do` variant where one step is replaced with `sleep 920` (exceeds 900s). Run `./do presubmit` in a subprocess. Assert it terminates within 910 seconds (900s timeout + small grace). Assert exit code is non-zero. Assert stderr contains `"PRESUBMIT TIMEOUT"`. Assert no orphan child processes remain (check process group).
  2. **Normal completion**: Run `./do presubmit` with fast-passing steps (or mock steps that exit immediately). Assert exit code 0. Assert `target/presubmit_timings.jsonl` exists.
  3. **Telemetry format** ([2_TAS-REQ-014D]): After a successful presubmit run, read `target/presubmit_timings.jsonl`. Assert each line is valid JSON. Assert each JSON object contains exactly these keys: `step` (string), `started_at` (ISO 8601 UTC timestamp), `ended_at` (ISO 8601 UTC timestamp), `duration_secs` (integer), `exit_code` (integer). Assert at least one line exists for each step that ran.
  4. **Step failure stops execution**: Mock a step to fail (exit 1). Assert `./do presubmit` exits non-zero. Assert the timing file contains an entry for the failed step with `exit_code: 1`. Assert subsequent steps do NOT have entries (presubmit stops on first failure per the spec).
- [ ] The timeout test may use a reduced `TIMEOUT_SECS` override (e.g., 5 seconds) for practical test execution speed, if the implementation supports an env var override for testing.

## 2. Task Implementation
- [ ] Implement the `presubmit` subcommand in `./do` following the authoritative algorithm from [2_TAS-REQ-014C]:
  1. Set `TIMEOUT_SECS=900` (15 minutes).
  2. Start a background timer process: `(sleep $TIMEOUT_SECS; echo "PRESUBMIT TIMEOUT: exceeded ${TIMEOUT_SECS}s" >&2; kill -TERM $$) &` and capture `TIMER_PID=$!`.
  3. Create `target/` directory if it doesn't exist: `mkdir -p target`.
  4. Define the step sequence: `format --check`, `lint`, `test`, `coverage`.
  5. For each step, implement the timing wrapper per [2_TAS-REQ-014D]:
     - Record `started_at` as UTC ISO 8601 (e.g., `date -u +"%Y-%m-%dT%H:%M:%SZ"`).
     - Execute `./do <step>`.
     - Capture the exit code.
     - Record `ended_at` as UTC ISO 8601.
     - Compute `duration_secs` as the difference between end and start epoch seconds.
     - Append a JSON line to `target/presubmit_timings.jsonl`: `{"step": "<step>", "started_at": "<ts>", "ended_at": "<ts>", "duration_secs": <n>, "exit_code": <n>}`.
     - If exit code is non-zero, kill the timer and exit with that code.
  6. After all steps pass, kill the timer process: `kill $TIMER_PID 2>/dev/null; wait $TIMER_PID 2>/dev/null`.
  7. Exit 0.
- [ ] On timeout, `SIGTERM` is sent to the script's own process group (`$$`), which propagates to all child `cargo` processes. The exit code will be non-zero (128+15 = 143 on most systems).
- [ ] Ensure the timing file is truncated/overwritten at the start of each presubmit run (not appended to from previous runs).

## 3. Code Review
- [ ] Verify timeout is cumulative from the start of `./do presubmit`, NOT per-step.
- [ ] Verify the background timer uses `kill -TERM $$` to signal the script's own PID, matching the spec exactly.
- [ ] Verify the timer is cleaned up on both success and failure paths (no zombie timer processes).
- [ ] Verify `presubmit_timings.jsonl` uses exactly the JSON schema from [2_TAS-REQ-014D]: `step`, `started_at`, `ended_at`, `duration_secs`, `exit_code`.
- [ ] Verify the script is POSIX sh-compatible — `date -u` format string may differ on macOS vs Linux; ensure compatibility or use a portable alternative.
- [ ] Verify process group cleanup works on Linux, macOS, and Windows (Windows may need a different signal mechanism).

## 4. Run Automated Tests to Verify
- [ ] Run `./do presubmit` (or a fast mock variant) and confirm exit code 0.
- [ ] Inspect `target/presubmit_timings.jsonl` — confirm it exists, is valid JSONL, and contains entries for all executed steps.
- [ ] Run the test harness from step 1 and confirm all test cases pass.

## 5. Update Documentation
- [ ] Add inline comments in the `./do` script's `presubmit` function referencing [2_TAS-REQ-014C] for timeout and [2_TAS-REQ-014D] for telemetry.

## 6. Automated Verification
- [ ] Run: `./do presubmit && test -f target/presubmit_timings.jsonl && echo "PASS"` — assert exit 0.
- [ ] Run: `python3 -c "import json; [json.loads(l) for l in open('target/presubmit_timings.jsonl')]" && echo "VALID JSONL"` — assert exit 0.
- [ ] Run: `python3 -c "import json; lines=[json.loads(l) for l in open('target/presubmit_timings.jsonl')]; assert all(set(l.keys())=={'step','started_at','ended_at','duration_secs','exit_code'} for l in lines); print('SCHEMA OK')"` — assert exit 0.
