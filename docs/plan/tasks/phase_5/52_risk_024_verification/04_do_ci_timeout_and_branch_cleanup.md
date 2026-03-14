# Task: Implement `./do ci` 30-Minute Timeout, Exact Exit Message, and Guaranteed Temp Branch Cleanup (Sub-Epic: 52_Risk 024 Verification)

## Covered Requirements
- [RISK-024-BR-002]

## Dependencies
- depends_on: ["03_do_ci_job_failure_detection.md"]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written

- [ ] In `.tools/tests/test_do_ci_timeout.py`, write the following tests using a **mock GitLab API server** **before** modifying the timeout path in `./do ci`:

  **Test: `test_ci_exits_nonzero_on_timeout`** (`# [RISK-024-BR-002]`)
  Arrange: mock GitLab API that returns `pipeline.status = "running"` indefinitely. Set the timeout environment variable `DO_CI_TIMEOUT_SECS` to `5` (override the 1800-second default for test speed). Run `./do ci` and assert exit code is non-zero.

  **Test: `test_ci_exit_message_on_timeout`** (`# [RISK-024-BR-002]`)
  Same arrangement as above. Capture stderr and assert it contains exactly the string `"ci_timeout: pipeline did not complete within 30 minutes"`. Note: the message must be this exact string regardless of what override value is used for the timeout duration (the message references the real 30-minute window, not the test override value).

  **Test: `test_ci_deletes_temp_branch_on_timeout`** (`# [RISK-024-BR-002]`)
  Same arrangement. After `./do ci` returns non-zero due to timeout, run `git ls-remote origin 'refs/heads/devs-ci-*'` against a local bare git repo used as "origin". Assert that 0 `devs-ci-*` branches remain — the branch was deleted before exit.

  **Test: `test_ci_deletes_temp_branch_even_if_delete_git_push_fails`** (`# [RISK-024-BR-002]`)
  Arrange: mock that makes the `git push origin --delete` command fail (simulate network error). Assert that `./do ci` still exits without hanging, emits a WARNING to stderr, and exits non-zero (since the pipeline also didn't complete).

  **Test: `test_ci_timeout_is_measured_from_pipeline_creation`** (`# [RISK-024-BR-002]`)
  Arrange: mock API that delays the pipeline creation response by 2 seconds, then returns `running` forever. Set `DO_CI_TIMEOUT_SECS=5`. Assert that the total execution time is between 5–15 seconds (timeout starts from pipeline creation, not script start). Use `time.monotonic()` around the `./do ci` invocation.

  **Test: `test_ci_does_not_timeout_prematurely`** (`# [RISK-024-BR-002]`)
  Arrange: mock that returns `running` for the first 2 polls then returns `success`. Set `DO_CI_TIMEOUT_SECS=60`. Assert exit code 0 and that no timeout message appears in stderr.

  Confirm all tests **fail** before the implementation step.

## 2. Task Implementation

- [ ] In `./do`, modify the `ci` command's poll loop to support an overridable timeout via the `DO_CI_TIMEOUT_SECS` environment variable (default `1800`). This enables test injection without changing production behavior:

  ```sh
  # [RISK-024-BR-002] Timeout is configurable via DO_CI_TIMEOUT_SECS for testing.
  # Production default is 1800 seconds (30 minutes).
  CI_TIMEOUT="${DO_CI_TIMEOUT_SECS:-1800}"
  DEADLINE=$(( $(date +%s) + CI_TIMEOUT ))
  ```

- [ ] After the poll loop exits, add the timeout detection block with the exact required exit message:

  ```sh
  # [RISK-024-BR-002] Check if loop exited due to timeout.
  if [ "$(date +%s)" -ge "$DEADLINE" ] && [ "$FAILED" -eq 0 ]; then
      echo "ci_timeout: pipeline did not complete within 30 minutes" >&2
      FAILED=1
  fi
  ```

- [ ] Move the temp branch delete into a **cleanup function** called via a shell `trap` to guarantee execution even on unexpected exits (e.g., SIGINT, unhandled errors):

  ```sh
  # [RISK-024-BR-002] Register cleanup trap to ensure temp branch deletion on all exit paths.
  cleanup_temp_branch() {
      if [ -n "${TEMP_BRANCH:-}" ]; then
          git push origin --delete "${TEMP_BRANCH}" 2>/dev/null || \
              echo "WARNING: failed to delete temp branch ${TEMP_BRANCH}" >&2
      fi
  }
  trap cleanup_temp_branch EXIT
  ```

  The `trap ... EXIT` fires on normal exit, `exit 1`, and signal termination, covering all cleanup paths required by RISK-024-BR-002.

- [ ] Ensure the `TEMP_BRANCH` variable is set (non-empty) only **after** a successful `git push` of the branch, so the trap does not attempt to delete a branch that was never pushed.

- [ ] Document `DO_CI_TIMEOUT_SECS` in the `./do` script header comment block as a test-only override variable that must not be set in production.

## 3. Code Review

- [ ] Confirm the exact timeout exit message is `"ci_timeout: pipeline did not complete within 30 minutes"` — no trailing space, no newline variation, no substitution of actual elapsed seconds.
- [ ] Confirm `trap cleanup_temp_branch EXIT` is registered **before** `git push origin "HEAD:${TEMP_BRANCH}"` so that even if the push partially completes and the script is killed, cleanup is attempted.
- [ ] Confirm `TEMP_BRANCH` is only set after a successful push (so the trap is a no-op if the push never happened).
- [ ] Confirm `DO_CI_TIMEOUT_SECS` default is `1800` (not `30` or `30m` — it must be numeric seconds for `$(( ))` arithmetic).
- [ ] Confirm traceability annotation `# [RISK-024-BR-002]` appears on the timeout check block, the trap registration, and the cleanup function.
- [ ] Confirm the `WARNING: failed to delete temp branch` message goes to stderr (not stdout) so it doesn't corrupt machine-parseable output.

## 4. Run Automated Tests to Verify

- [ ] Run: `python3 -m pytest .tools/tests/test_do_ci_timeout.py -v`
- [ ] All 6 tests must pass.
- [ ] Run the full test suite: `./do test` — no regressions.
- [ ] Manually verify: set `DO_CI_TIMEOUT_SECS=3` and run `./do ci` against a mock that never completes. Confirm stderr contains the exact string `"ci_timeout: pipeline did not complete within 30 minutes"`.

## 5. Update Documentation

- [ ] In `requirements.md`, confirm `RISK-024-BR-002` references `.tools/tests/test_do_ci_timeout.py`.
- [ ] Add a comment in `./do` near the `DO_CI_TIMEOUT_SECS` usage: `# TEST HOOK: set DO_CI_TIMEOUT_SECS to override 30-minute wall clock for testing. Do not set in production.`
- [ ] Confirm `docs/plan/specs/8_risks_mitigation.md` section RISK-024 is referenced in the `./do ci` command block comment.

## 6. Automated Verification

- [ ] Run: `python3 -m pytest .tools/tests/test_do_ci_timeout.py -v --tb=short 2>&1 | tee /tmp/task04_results.txt && grep -c "PASSED" /tmp/task04_results.txt`
- [ ] Confirm output shows `6`.
- [ ] Run: `python3 .tools/verify_requirements.py 2>&1 | grep "RISK-024-BR-002"` — must appear as traced.
- [ ] Run: `grep -n "RISK-024-BR-002" ./do | wc -l` — must be ≥ 3 (timeout check, trap registration, cleanup function).
- [ ] Run the combined E2E check: `python3 -m pytest .tools/tests/test_do_ci_job_failure.py .tools/tests/test_do_ci_timeout.py -v 2>&1 | tail -5` — must show all tests passing.
