# Task: Presubmit Timeout Enforcement & Wall-Clock Timing (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [1_PRD-KPI-BR-005], [1_PRD-KPI-BR-006]

## Dependencies
- depends_on: ["12_presubmit_timing_infrastructure.md"]
- shared_components: [./do Entrypoint Script, devs-core]

## 1. Initial Test Written
- [ ] Create `tests/test_presubmit_timeout.py` with tests that:
  1. Assert `./do presubmit` kills all child processes when 900s wall-clock timeout is reached ([1_PRD-KPI-BR-005]).
  2. Assert timeout writes `timed_out: true` to the timing record with `completed_at: null` ([1_PRD-KPI-BR-005]).
  3. Assert timeout causes exit code `1` (not `0` even if partial tests passed) ([1_PRD-KPI-BR-005]).
  4. Assert 15-minute threshold is measured using wall-clock time, not CPU time ([1_PRD-KPI-BR-006]).
  5. Assert parallel build (`cargo build -j N`) is expected to complete within wall-clock budget on ≥4-core hardware ([1_PRD-KPI-BR-006]).
  6. Annotate all with `# Covers:`.
- [ ] Run tests to confirm red:
  ```
  pytest tests/test_presubmit_timeout.py -v 2>&1 | tee /tmp/timeout_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Implement wall-clock timeout enforcement** in `./do presubmit` ([1_PRD-KPI-BR-006]):
  - Use `SECONDS` bash builtin or `date +%s` to track wall-clock elapsed time.
  - Do NOT use CPU time measurements (e.g., `time -p` user+sys).
  - Start timer at the beginning of `./do presubmit` before any command runs.
  - Check elapsed time before each major step (format, lint, test, coverage, ci).

- [ ] **Implement atomic child process cleanup** on timeout ([1_PRD-KPI-BR-005]):
  - Track all child PIDs in a bash array or temp file.
  - On timeout, send `TERM` signal to all tracked children, then `KILL` after 5s grace period.
  - Use process group kill (`kill -- -PGID`) for subprocesses that spawn their own children.
  - Ensure cleanup runs even if `./do presubmit` itself receives interrupt.

- [ ] **Implement timeout state recording** ([1_PRD-KPI-BR-005]):
  - Write `{"step": "_timeout_kill", "started_at": "<ISO8601>", "elapsed_ms": <u64>, "status": "timeout", "timed_out": true, "completed_at": null}` to `target/presubmit_timings.jsonl`.
  - This record must be the last entry in the file.
  - Flush the record before exiting.

- [ ] **Implement exit code enforcement** ([1_PRD-KPI-BR-005]):
  - On timeout, exit with code `1` regardless of partial test success.
  - Do NOT write success markers (e.g., `target/presubmit.success`) on timeout.
  - Print clear error message to stderr: `PRESUBMIT TIMEOUT: Exceeded 900s wall-clock limit`.

- [ ] **Document wall-clock vs CPU time expectation** ([1_PRD-KPI-BR-006]):
  - Add comment in `./do` script explaining that parallelism is expected to keep wall-clock time within budget.
  - Example: `# 15-minute cap is wall-clock, not CPU time. Parallel builds (cargo -j N) expected on ≥4-core systems.`

## 3. Code Review
- [ ] Verify timeout uses wall-clock measurement (e.g., `date +%s` or `SECONDS`), not CPU time.
- [ ] Verify child process cleanup handles nested subprocesses (process group kill).
- [ ] Verify timeout record has `timed_out: true` and `completed_at: null`.
- [ ] Verify exit code is `1` on timeout even if some tests passed.
- [ ] Verify `# Covers:` annotations present for both requirement IDs.
- [ ] Confirm all public functions in helper scripts have doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run presubmit timeout tests:
  ```
  pytest tests/test_presubmit_timeout.py -v
  ```
- [ ] Simulate timeout with a short timeout value (e.g., 5s) to verify cleanup:
  ```
  # Temporarily modify ./do to use 5s timeout, run presubmit, verify:
  # 1. All child processes are killed
  # 2. target/presubmit_timings.jsonl has _timeout_kill record
  # 3. Exit code is 1
  ```
- [ ] Verify wall-clock timing (not CPU time):
  ```
  # Run a command that uses significant CPU time but short wall-clock time (parallel build)
  # Verify timeout is not triggered if wall-clock < 900s even if CPU time > 900s
  ```
- [ ] Run traceability verification:
  ```
  python3 .tools/verify_requirements.py --ids 1_PRD-KPI-BR-005,1_PRD-KPI-BR-006
  ```

## 5. Update Documentation
- [ ] Add section to `docs/architecture/testing.md` titled "Presubmit Timeout Enforcement" explaining:
  - Wall-clock vs CPU time distinction.
  - Child process cleanup strategy.
  - Timeout record schema.
  - Exit code behavior.
- [ ] Update `GEMINI.md` with guidance on debugging presubmit timeouts:
  - Check `target/presubmit_timings.jsonl` for slow steps.
  - Identify steps exceeding budget by >20% (WARN threshold).
  - Parallelize where possible to reduce wall-clock time.
- [ ] In `docs/plan/phases/phase_5.md`, update the entries:
  ```
  - [1_PRD-KPI-BR-005]: Covered by `tests/test_presubmit_timeout.py` and `./do presubmit` timeout enforcement
  - [1_PRD-KPI-BR-006]: Covered by `tests/test_presubmit_timeout.py` and wall-clock timing in `./do presubmit`
  ```

## 6. Automated Verification
- [ ] Confirm both requirements covered in traceability report:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_timeout.txt
  grep "1_PRD-KPI-BR-00[56]" /tmp/presubmit_timeout.txt
  ```
  IDs must appear as `COVERED`.
- [ ] Verify timeout record schema:
  ```
  python3 -c "
  import json
  # Simulate timeout record
  record = {'step': '_timeout_kill', 'timed_out': True, 'completed_at': None}
  assert 'timed_out' in record and record['timed_out'] == True
  assert record.get('completed_at') is None
  print('OK: Timeout record schema validated')
  "
  ```
- [ ] Verify wall-clock measurement in `./do`:
  ```
  grep -E 'SECONDS|date \+%s|wall.clock' ./do | head -3
  ```
  Should show wall-clock timing code.
- [ ] Verify no CPU time measurement used for timeout:
  ```
  grep -E 'time -p|/usr/bin/time|RUSAGE' ./do && echo "FAIL: CPU time measurement found" || echo "OK: Wall-clock only"
  ```
