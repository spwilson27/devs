# Task: Verify CI Performance Thresholds (Sub-Epic: 21_Risk 005 Verification)

## Covered Requirements
- [AC-RISK-005-03], [AC-RISK-005-04]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test file `tests/test_ci_performance_thresholds.py` with the following test functions:
  - [ ] `test_presubmit_completes_within_15_minutes_clean_checkout()`:
    - **Test Setup**: Create a temporary directory, clone the repo fresh (or simulate via `git worktree`), delete `target/` except for `.gitkeep` files.
    - **Test Execution**: Run `./do presubmit` as a subprocess with `timeout=960` seconds (16 minutes buffer).
    - **Assertion**: Assert subprocess returns exit code 0. Parse `target/presubmit_timings.jsonl` and verify total duration (sum of all `duration_ms` fields) is <= 900,000 ms.
    - **Covers**: [AC-RISK-005-04], [8_RISKS-REQ-142]
  - [ ] `test_presubmit_timings_jsonl_schema()`:
    - **Test Setup**: Run `./do presubmit` in a test workspace.
    - **Test Execution**: Parse each line of `target/presubmit_timings.jsonl` as JSON.
    - **Assertion**: Verify each entry has required fields: `step` (str), `started_at` (ISO8601 str), `duration_ms` (int), `budget_ms` (int), `over_budget` (bool).
    - **Covers**: [AC-RISK-005-01], [8_RISKS-REQ-139]
  - [ ] `test_ci_job_timeout_configuration()`:
    - **Test Setup**: Read `.gitlab-ci.yml`.
    - **Test Execution**: Parse YAML and locate `presubmit-linux`, `presubmit-macos`, `presubmit-windows` job definitions.
    - **Assertion**: Verify each job has `timeout: 25m` or equivalent (1500 seconds).
    - **Covers**: [AC-RISK-005-03], [8_RISKS-REQ-141]

## 2. Task Implementation
- [ ] **Implement presubmit timing tracker in `./do` script**:
  - Add a background timer process that writes to `target/presubmit_timings.jsonl` incrementally.
  - Each step (format, lint, test, coverage, ci) must flush a JSON line immediately upon completion:
    ```python
    import json, time, datetime
    entry = {
        "step": step_name,
        "started_at": datetime.datetime.utcnow().isoformat() + "Z",
        "duration_ms": int((end_time - start_time) * 1000),
        "budget_ms": step_budget_ms,
        "over_budget": duration_ms > step_budget_ms * 1.2
    }
    with open("target/presubmit_timings.jsonl", "a") as f:
        f.write(json.dumps(entry) + "\n")
        f.flush()
    ```
  - Implement a 900-second wall-clock timeout using a background subprocess that:
    - Sleeps for 900 seconds, then sends SIGTERM to all child PIDs.
    - Waits 5 seconds (grace period), then sends SIGKILL if children persist.
    - Ensures timer is killed on successful exit (no leaked timers).
- [ ] **Configure GitLab CI pipeline** (`.gitlab-ci.yml`):
  - Set `timeout: 25m` for each of the three platform jobs:
    ```yaml
    presubmit-linux:
      timeout: 25m
      script:
        - ./do presubmit
    presubmit-macos:
      timeout: 25m
      script:
        - ./do presubmit
    presubmit-windows:
      timeout: 25m
      script:
        - ./do presubmit
    ```
  - Add an `after_script` step to print timing summary:
    ```yaml
    after_script:
      - cat target/presubmit_timings.jsonl 2>/dev/null || echo "No timings found"
    ```
- [ ] **Implement clean checkout simulation** for local testing:
  - Create a helper script `.tools/simulate_clean_checkout.sh`:
    ```bash
    #!/usr/bin/env bash
    set -e
    rm -rf target
    mkdir -p target/.gitkeep
    cargo clean  # if available
    ```
  - This script is used by the test to simulate CI runner conditions.

## 3. Code Review
- [ ] **Verify timeout enforcement**:
  - Manually test by adding a `sleep 905` step in `./do presubmit` and confirm it terminates within 905 seconds with exit code non-zero.
  - Verify `target/presubmit_timings.jsonl` is flushed even after timeout (partial data preserved).
- [ ] **Verify timer cleanup**:
  - Run `./do presubmit` successfully, then check `ps aux | grep presubmit_timer` to ensure no leaked timer processes.
  - Run `./do presubmit` twice in succession; confirm the second run is not terminated by a timer from the first run.
- [ ] **Verify CI configuration**:
  - Run `yamllint .gitlab-ci.yml` to ensure valid YAML syntax.
  - Confirm all three platform jobs have identical timeout settings.

## 4. Run Automated Tests to Verify
- [ ] Run the test suite:
  ```bash
  cd /home/mrwilson/software/devs
  python3 -m pytest tests/test_ci_performance_thresholds.py -v
  ```
- [ ] Run a clean checkout presubmit:
  ```bash
  bash .tools/simulate_clean_checkout.sh
  time ./do presubmit
  # Verify exit code is 0 and total time < 15 minutes
  ```
- [ ] Parse and validate timings:
  ```bash
  python3 -c "
  import json
  total_ms = 0
  with open('target/presubmit_timings.jsonl') as f:
      for line in f:
          entry = json.loads(line)
          total_ms += entry['duration_ms']
          print(f\"{entry['step']}: {entry['duration_ms']/1000:.1f}s\")
  print(f'Total: {total_ms/1000:.1f}s ({total_ms/60000:.1f} min)')
  assert total_ms <= 900000, 'Exceeded 15-minute budget!'
  "
  ```

## 5. Update Documentation
- [ ] **Update `docs/plan/specs/8_risks_mitigation.md`**:
  - Add a note under `[AC-RISK-005-03]` and `[AC-RISK-005-04]` confirming the implementation approach (wall-clock timer, incremental JSONL flush, 25m CI timeout).
  - Document the `target/presubmit_timings.jsonl` schema in the spec if not already present.
- [ ] **Update `.agent/MEMORY.md`** (if it exists):
  - Add a note about the presubmit performance budget and how to debug timeout failures.

## 6. Automated Verification
- [ ] **Run requirement verification script**:
  ```bash
  cd /home/mrwilson/software/devs
  python3 .tools/verify_requirements.py --requirements AC-RISK-005-03 AC-RISK-005-04
  ```
  - Confirm both requirements show as "verified" in the output.
- [ ] **Check traceability report**:
  ```bash
  cat target/traceability.json | python3 -m json.tool | grep -A2 -B2 "AC-RISK-005"
  ```
  - Verify `AC-RISK-005-03` and `AC-RISK-005-04` appear in the covered requirements list.
- [ ] **Verify CI artifact** (after next CI run):
  - Check GitLab CI logs for `presubmit-linux` job duration.
  - Confirm job completed within 25 minutes and printed timing summary in `after_script`.
