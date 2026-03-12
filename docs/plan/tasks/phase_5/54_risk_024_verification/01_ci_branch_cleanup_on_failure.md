# Task: CI Branch Cleanup on Pipeline Timeout or Failure (Sub-Epic: 54_Risk 024 Verification)

## Covered Requirements
- [AC-RISK-024-05]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written

- [ ] In `tools/tests/test_do_ci.py` (or equivalent integration test harness for the `./do` script), write a test named `test_ci_branch_deleted_on_pipeline_timeout` that:
  1. Stubs the `glab` / `gitlab` API call so that pipeline status returns `running` indefinitely (simulating a 30-minute timeout condition) — use a mock script placed on `$PATH` that replaces `glab` and returns canned JSON.
  2. Invokes `./do ci` with an environment variable `DEVS_CI_TIMEOUT_SECONDS=5` (a short override used only in tests) so the test runs quickly.
  3. Asserts that `./do ci` exits with a **non-zero** status code.
  4. Asserts that the exit stderr contains the exact string `"ci_timeout: pipeline did not complete within 30 minutes"` (use `DEVS_CI_TIMEOUT_SECONDS` override only for timing but keep the hardcoded message).
  5. Asserts that no branch matching the pattern `devs-ci-*` remains on the remote after `./do ci` returns — inspect the mock git remote's ref list or capture the `git push --delete` calls made to the stub remote.

- [ ] Write a second test `test_ci_branch_deleted_on_pipeline_failure` that:
  1. Stubs the `glab` / `gitlab` API call to return a pipeline status where one job (`presubmit-linux`) is `failed` and the other two are `success`.
  2. Invokes `./do ci`.
  3. Asserts non-zero exit.
  4. Asserts no `devs-ci-*` branches exist on the stub remote.

- [ ] Write a third test `test_ci_branch_deleted_on_pipeline_success` that:
  1. Stubs all three jobs as `success`.
  2. Invokes `./do ci`.
  3. Asserts exit code **0**.
  4. Asserts no `devs-ci-*` branches exist on the stub remote (cleanup happens on success too).

- [ ] Annotate all three test functions with the traceability comment `# REQ: AC-RISK-024-05` so `.tools/verify_requirements.py` can track coverage.

## 2. Task Implementation

- [ ] Open `./do` (the shell script at the repo root). Locate the `ci` subcommand handler.

- [ ] Wrap the branch-push, pipeline-trigger, and poll loop inside a Bash `trap` block:
  ```bash
  _CI_BRANCH=""
  cleanup_ci_branch() {
      if [ -n "$_CI_BRANCH" ]; then
          git push origin --delete "$_CI_BRANCH" 2>/dev/null || true
      fi
  }
  trap cleanup_ci_branch EXIT INT TERM
  ```
  Place this trap **before** the `git push origin "$_CI_BRANCH"` call that pushes the temporary branch.

- [ ] Set `_CI_BRANCH` to the generated `devs-ci-<uuid>` branch name immediately after it is computed, so the trap has the value available at any exit point.

- [ ] Add a configurable timeout variable near the top of the `ci` function:
  ```bash
  CI_POLL_TIMEOUT="${DEVS_CI_TIMEOUT_SECONDS:-1800}"  # default 30 minutes
  ```
  Use `$CI_POLL_TIMEOUT` in the polling loop's deadline arithmetic so tests can inject a short value.

- [ ] In the polling loop, when the deadline is exceeded, print the exact message:
  ```
  ci_timeout: pipeline did not complete within 30 minutes
  ```
  to stderr, then `exit 1`. The `EXIT` trap fires automatically and deletes the branch.

- [ ] Do NOT call `cleanup_ci_branch` explicitly before `exit 1` — let the trap handle it to avoid double-delete races.

- [ ] Verify that the final success path (`exit 0`) also triggers the `EXIT` trap — no special-casing needed because `trap ... EXIT` always fires on normal exit.

## 3. Code Review

- [ ] Confirm the `trap` is set **before** any remote `git push` that creates the `devs-ci-*` branch, so a push failure during branch creation does not leave the trap unset.
- [ ] Confirm `|| true` on the `git push --delete` inside the trap so that a 404 (branch already deleted by a concurrent cleanup) does not cause a non-zero exit from the trap itself, which would mask the original exit code.
- [ ] Confirm `DEVS_CI_TIMEOUT_SECONDS` is documented only as a test/debug override and is not exposed as a supported public interface.
- [ ] Confirm the timeout error message is an exact byte-for-byte match of `"ci_timeout: pipeline did not complete within 30 minutes"` — no trailing period, no extra whitespace — as the test asserts exact string equality.
- [ ] Confirm the traceability annotation `# REQ: AC-RISK-024-05` appears in the `ci` function body of `./do`.

## 4. Run Automated Tests to Verify

- [ ] Run:
  ```bash
  ./do test --filter ac_risk_024_05
  ```
  or the equivalent invocation that runs only the new tests. All three tests must pass.

- [ ] Run the full test suite to confirm no regressions:
  ```bash
  ./do test
  ```

- [ ] Run `./do lint` to confirm `yamllint` and the `./do` shell linter pass.

## 5. Update Documentation

- [ ] Add a one-line entry to `docs/plan/specs/8_risks_mitigation.md` under the **[RISK-024]** section noting that `AC-RISK-024-05` is satisfied by the `EXIT` trap in `./do ci`, referencing the relevant test file.
- [ ] Ensure `./do` has an inline comment above the `trap` block:
  ```bash
  # [AC-RISK-024-05] Delete the temporary CI branch on any exit (success, failure, or timeout).
  ```

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `AC-RISK-024-05` appears in the output with `status: covered` and zero `stale_annotations`.
- [ ] Run `./do presubmit` and confirm it exits 0 within the 15-minute timeout.
- [ ] Inspect `target/traceability.json` and confirm `"AC-RISK-024-05"` is present with a non-empty `test_refs` list.
