# Task: Implement `./do ci` with GitLab API Polling and Job-Failure Detection (Sub-Epic: 53_MIT-024)

## Covered Requirements
- [MIT-024], [AC-RISK-024-01]

## Dependencies
- depends_on: [01_gitlab_ci_yml_definition.md, 02_do_lint_yamllint_integration.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] In `.tools/tests/test_do_ci.py`, write tests against `.tools/ci.py` (the Python module that implements `./do ci` logic). Use `unittest.mock.patch` to mock the `requests` library so no real GitLab API calls are made.

- [ ] Write `test_ci_exits_nonzero_if_one_job_fails` (covers AC-RISK-024-01):
  - Mock `requests.post` (pipeline creation) to return `{"id": 42, "status": "created"}`.
  - Mock `requests.get` (pipeline status poll) to return a pipeline whose `status` is `"failed"` on the first poll.
  - Mock `requests.get` for job listing to return three jobs:
    - `{"name": "presubmit-linux", "status": "success"}`
    - `{"name": "presubmit-macos", "status": "success"}`
    - `{"name": "presubmit-windows", "status": "failed"}`
  - Call `ci.run(token="fake", project_id="1", branch="main")` (or the actual entry-point function signature).
  - Assert the function returns a non-zero exit code (or raises a `SystemExit` with non-zero code).
  - Add traceability annotation `# [AC-RISK-024-01] [RISK-024-BR-001]` above the assertion.

- [ ] Write `test_ci_exits_nonzero_if_all_jobs_fail`:
  - All three jobs return `status: "failed"`.
  - Assert non-zero exit.
  - Annotation: `# [AC-RISK-024-01] [RISK-024-BR-001]`.

- [ ] Write `test_ci_exits_zero_if_all_jobs_pass`:
  - All three jobs return `status: "success"`, pipeline `status: "success"`.
  - Assert exit code 0.
  - Annotation: `# [AC-RISK-024-01]`.

- [ ] Write `test_ci_exits_nonzero_on_timeout` (covers RISK-024-BR-002):
  - Mock the pipeline status to always return `status: "running"` (never reaches terminal state).
  - Set a very short timeout (e.g., 1 second) via a parameter or monkeypatch of the timeout constant.
  - Assert non-zero exit and that the exit message contains `"ci_timeout"`.
  - Annotation: `# [RISK-024-BR-002]`.

- [ ] Write `test_ci_exits_nonzero_on_authentication_failure`:
  - Mock `requests.get` for the pre-push GitLab CI lint check to return HTTP 401.
  - Assert non-zero exit and message contains `"ci_error: authentication_failed"`.
  - Annotation: `# [MIT-024]`.

- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] Create `.tools/ci.py` as a standalone Python module. This module is invoked by `./do ci` as `python3 .tools/ci.py`.

- [ ] Implement the following public function signature:
  ```python
  def run(
      token: str,
      project_id: str,
      branch: str,
      temp_branch_prefix: str = "devs-ci-",
      timeout_seconds: int = 1800,  # 30 minutes per RISK-024-BR-002
  ) -> int:
      """
      # [MIT-024] [AC-RISK-024-01] [RISK-024-BR-001] [RISK-024-BR-002]
      Pushes a temp branch, triggers a GitLab pipeline, polls until completion
      or timeout, and returns 0 (all jobs passed) or 1 (any job failed/timed out).
      The temp branch is always deleted before return.
      """
  ```

- [ ] Implement the following steps inside `run()`:
  1. **Validate credentials**: `GET /api/v4/user` with `Authorization: Bearer {token}`. If HTTP 401, print `"ci_error: authentication_failed"` and return 1. **Do not push any branch if authentication fails.**
  2. **Validate pipeline YAML** (GitLab CI lint API): `POST /api/v4/projects/{project_id}/ci/lint` with the content of `.gitlab-ci.yml`. If response `{"valid": false}`, print error and return 1. **Do not push any branch if pipeline YAML is invalid.**
  3. **Create temp branch**: `git push origin HEAD:refs/heads/{temp_branch_prefix}{uuid4_hex[:8]}` via `subprocess.run`. Store the branch name.
  4. **Create pipeline**: `POST /api/v4/projects/{project_id}/pipeline` with `{"ref": temp_branch_name}`. Extract `pipeline_id`.
  5. **Poll loop**: every 15 seconds, `GET /api/v4/projects/{project_id}/pipelines/{pipeline_id}`. Check `status` field:
     - Terminal statuses: `"success"`, `"failed"`, `"canceled"`, `"skipped"`.
     - If `time.monotonic() - start > timeout_seconds`: print `"ci_timeout: pipeline did not complete within 30 minutes"`, delete temp branch, return 1.
  6. **Fetch job statuses**: `GET /api/v4/projects/{project_id}/pipelines/{pipeline_id}/jobs`. Verify all three required jobs (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`) have `status: "success"`. If any job is missing or has a non-success status, set `failed = True`.
  7. **Download artifacts**: attempt artifact download regardless of success/failure (best effort; log warnings on error).
  8. **Delete temp branch**: `DELETE /api/v4/projects/{project_id}/repository/branches/{temp_branch_name}` (always, even on failure or timeout — wrap in `finally` block).
  9. Return `1` if `failed`, `0` otherwise.

- [ ] Add a `if __name__ == "__main__":` block that:
  - Reads `GITLAB_TOKEN` from `os.environ` (exit non-zero with `"ci_error: GITLAB_TOKEN not set"` if missing).
  - Reads `GITLAB_PROJECT_ID` from `os.environ` (exit non-zero with `"ci_error: GITLAB_PROJECT_ID not set"` if missing).
  - Reads the current branch name via `git rev-parse --abbrev-ref HEAD`.
  - Calls `run(...)` and exits with its return code.

- [ ] In `./do`, add a `ci)` case (or update an existing stub) that invokes:
  ```bash
  # [MIT-024] [AC-RISK-024-01] [RISK-024-BR-001] [RISK-024-BR-002]
  python3 .tools/ci.py
  ```

- [ ] In `./do setup`, ensure `pip3 install requests` (or equivalent) is added if not already present.

## 3. Code Review
- [ ] Confirm the `finally` block that deletes the temp branch is unconditional — it must execute on timeout, authentication failure after branch push (if the push succeeded), and normal failure.
- [ ] Confirm the job name check is an exact string match against `presubmit-linux`, `presubmit-macos`, `presubmit-windows` — no partial matching.
- [ ] Confirm `timeout_seconds` defaults to `1800` (30 minutes per RISK-024-BR-002) and is not hardcoded at the call site.
- [ ] Confirm traceability annotations `# [MIT-024]`, `# [AC-RISK-024-01]`, `# [RISK-024-BR-001]`, `# [RISK-024-BR-002]` appear in `.tools/ci.py` at the relevant code locations.
- [ ] Confirm that `GITLAB_TOKEN` is never logged or printed — the module must not leak credentials into stdout/stderr.
- [ ] Confirm all error messages follow the format established in other `./do` error messages (lowercase, underscore-separated prefix, e.g., `"ci_error: ..."`, `"ci_timeout: ..."`).

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest .tools/tests/test_do_ci.py -v` and confirm all five tests pass (green).
- [ ] Run `./do ci --help` (or `./do ci` without env vars) and confirm a helpful error message is printed and exit code is non-zero.
- [ ] If a real GitLab token is available in the environment, run a full end-to-end smoke test on a scratch branch — this is optional and must not be required for CI gate passage.

## 5. Update Documentation
- [ ] Update `requirements.md` traceability entries for `MIT-024` and `AC-RISK-024-01` to reference `.tools/tests/test_do_ci.py`.
- [ ] Add a brief comment at the top of `.tools/ci.py` documenting the environment variables required (`GITLAB_TOKEN`, `GITLAB_PROJECT_ID`) so the file is self-documenting.
- [ ] In `./do`, add a usage comment above the `ci)` case explaining what `./do ci` does and which environment variables it requires.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm `MIT-024` and `AC-RISK-024-01` both show `status: covered`.
- [ ] Run `python -m pytest .tools/tests/test_do_ci.py --tb=short 2>&1 | tail -5` and confirm `5 passed`.
- [ ] Run `grep -n "ci_timeout\|ci_error\|authentication_failed" .tools/ci.py` and confirm all three error string literals appear in the source.
