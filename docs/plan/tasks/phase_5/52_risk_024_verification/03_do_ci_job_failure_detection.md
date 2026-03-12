# Task: Implement `./do ci` Job Failure Detection, Non-Zero Exit, and Temp Branch Cleanup (Sub-Epic: 52_Risk 024 Verification)

## Covered Requirements
- [RISK-024], [RISK-024-BR-001]

## Dependencies
- depends_on: [01_gitlab_ci_yml_pipeline_structure.md, 02_do_lint_yamllint_validation.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written

- [ ] In `.tools/tests/test_do_ci_job_failure.py`, write the following tests using a **mock GitLab API server** (e.g., a `pytest` fixture using `http.server` or `pytest-httpserver`) **before** implementing `./do ci`:

  **Test: `test_ci_exits_nonzero_on_single_job_failure`** (`# [RISK-024-BR-001]`)
  Arrange: mock GitLab API to report `presubmit-linux=success`, `presubmit-macos=success`, `presubmit-windows=failed`. Invoke `./do ci` with `GITLAB_API` pointed at the mock server. Assert exit code is non-zero.

  **Test: `test_ci_exits_nonzero_on_all_jobs_failed`** (`# [RISK-024-BR-001]`)
  Arrange: mock API to return all three jobs as `failed`. Assert exit code non-zero.

  **Test: `test_ci_exits_zero_when_all_jobs_pass`** (`# [RISK-024-BR-001]`)
  Arrange: mock API where all three jobs return `success`. Assert exit code is 0.

  **Test: `test_ci_deletes_temp_branch_on_job_failure`** (`# [RISK-024]`)
  Arrange: mock API returning one failed job. After `./do ci` returns (non-zero), run `git ls-remote origin 'refs/heads/devs-ci-*'` and assert no `devs-ci-*` branches exist. (Use a local bare git repo as the "origin" for isolation.)

  **Test: `test_ci_deletes_temp_branch_on_success`** (`# [RISK-024]`)
  Arrange: mock API with all passing. After exit 0, assert no `devs-ci-*` branches remain on origin.

  **Test: `test_ci_downloads_artifacts_on_failure`** (`# [RISK-024]`)
  Arrange: mock API returns one failed job but serves a mock artifact endpoint. Assert that `./do ci` attempts to download artifacts (verify HTTP GET to the mock artifact URL was received by the mock server).

  **Test: `test_ci_checks_gitlab_api_reachability_before_push`** (`# [RISK-024]`)
  Arrange: mock API that returns a 500 error on `GET /version`. Assert that `./do ci` exits non-zero with `ci_error: gitlab_unreachable` in stderr and does **not** push any branch.

  **Test: `test_ci_validates_yaml_before_push`** (`# [RISK-024-BR-001]`)
  Arrange: temporarily corrupt `.gitlab-ci.yml`. Run `./do ci` and assert it exits non-zero before any API calls are made (verify mock server receives 0 requests). Restore the file.

  Confirm all tests **fail** before the implementation step.

## 2. Task Implementation

- [ ] In `./do` (the entrypoint shell script), implement the `ci` command handler. The implementation must follow the state machine defined in `docs/plan/specs/8_risks_mitigation.md` section RISK-024 exactly:

  ```sh
  ci)
    # [RISK-024] [RISK-024-BR-001]
    # Step 1: Validate .gitlab-ci.yml before touching anything remote.
    yamllint .gitlab-ci.yml || { echo "ci_error: invalid_gitlab_ci_yml" >&2; exit 1; }

    # Step 2: Check GitLab API reachability (10s timeout).
    GITLAB_API="${GITLAB_API:-https://gitlab.com/api/v4/projects/${CI_PROJECT_ID}}"
    curl --silent --max-time 10 "${GITLAB_API}/version" > /dev/null 2>&1 || {
        echo "ci_error: gitlab_unreachable" >&2; exit 1
    }

    # Step 3: Create temp branch from HEAD.
    TEMP_BRANCH="devs-ci-$(date +%Y%m%d%H%M%S)-$(git rev-parse --short HEAD)"
    git push origin "HEAD:${TEMP_BRANCH}" || { echo "ci_error: push_failed" >&2; exit 1; }

    FAILED=0

    # Step 4: Trigger pipeline via API and get pipeline ID.
    PIPELINE_ID=$(curl --silent --fail \
        --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
        --data "ref=${TEMP_BRANCH}" \
        "${GITLAB_API}/pipeline" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
    if [ -z "$PIPELINE_ID" ]; then
        echo "ci_error: pipeline_trigger_failed" >&2
        FAILED=1
    fi

    if [ "$FAILED" -eq 0 ]; then
        # Step 5: Poll every 30s; enforce 30-minute deadline.
        DEADLINE=$(( $(date +%s) + 1800 ))
        while [ "$(date +%s)" -lt "$DEADLINE" ]; do
            PIPELINE_STATUS=$(curl --silent --fail \
                --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
                "${GITLAB_API}/pipelines/${PIPELINE_ID}" \
                | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")

            # Check individual job statuses for RISK-024-BR-001.
            JOB_STATUSES=$(curl --silent --fail \
                --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
                "${GITLAB_API}/pipelines/${PIPELINE_ID}/jobs" \
                | python3 -c "
import sys, json
jobs = json.load(sys.stdin)
required = {'presubmit-linux', 'presubmit-macos', 'presubmit-windows'}
for j in jobs:
    if j['name'] in required and j['status'] == 'failed':
        print('FAILED:' + j['name'])
")
            if echo "$JOB_STATUSES" | grep -q "^FAILED:"; then
                echo "ci_error: job_failed: $(echo "$JOB_STATUSES" | grep '^FAILED:' | tr '\n' ' ')" >&2
                FAILED=1
                break
            fi

            case "$PIPELINE_STATUS" in
                success)  break ;;
                failed|canceled)  FAILED=1; break ;;
                *)  sleep 30 ;;
            esac
        done

        if [ "$(date +%s)" -ge "$DEADLINE" ] && [ "$FAILED" -eq 0 ]; then
            echo "ci_timeout: pipeline did not complete within 30 minutes" >&2
            FAILED=1
        fi

        # Step 6: Download artifacts regardless of outcome.
        for JOB_NAME in presubmit-linux presubmit-macos presubmit-windows; do
            JOB_ID=$(curl --silent --fail \
                --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
                "${GITLAB_API}/pipelines/${PIPELINE_ID}/jobs" \
                | python3 -c "
import sys, json
jobs = json.load(sys.stdin)
for j in jobs:
    if j['name'] == '${JOB_NAME}':
        print(j['id']); break
")
            [ -n "$JOB_ID" ] && curl --silent \
                --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
                --output "target/${JOB_NAME}-artifacts.zip" \
                "${GITLAB_API}/jobs/${JOB_ID}/artifacts" || true
        done
    fi

    # Step 7: Delete temp branch (always, even on failure or timeout).
    git push origin --delete "${TEMP_BRANCH}" 2>/dev/null || \
        echo "WARNING: failed to delete temp branch ${TEMP_BRANCH}" >&2

    # Step 8: Exit.
    [ "$FAILED" -ne 0 ] && exit 1 || exit 0
    ;;
  ```

- [ ] Ensure `GITLAB_TOKEN` is documented as a required environment variable in `./do setup` output and in `README` / relevant docs.
- [ ] Ensure `CI_PROJECT_ID` or an equivalent project path variable is documented as required.

## 3. Code Review

- [ ] Confirm that individual job status is checked (per RISK-024-BR-001) — not just pipeline-level status. A pipeline can show `running` while an individual job has already failed; the implementation must check each of the three required job names explicitly.
- [ ] Confirm the temp branch delete (`git push origin --delete`) runs unconditionally — in the success path, failure path, AND before the timeout exit (verified in task 04).
- [ ] Confirm error messages match exactly: `"ci_error: gitlab_unreachable"`, `"ci_timeout: pipeline did not complete within 30 minutes"`.
- [ ] Confirm no sensitive tokens are logged to stdout (only pipeline/job IDs should appear in normal output).
- [ ] Confirm traceability annotations `# [RISK-024]` and `# [RISK-024-BR-001]` appear in `./do` at every relevant block.

## 4. Run Automated Tests to Verify

- [ ] Run: `python3 -m pytest .tools/tests/test_do_ci_job_failure.py -v`
- [ ] All 8 tests must pass.
- [ ] Run `./do test` to confirm no regressions.
- [ ] Manually verify the mock-server-based failure test by inspecting its output to confirm the temp branch delete was called.

## 5. Update Documentation

- [ ] In `requirements.md`, confirm `RISK-024` and `RISK-024-BR-001` reference `.tools/tests/test_do_ci_job_failure.py`.
- [ ] Add comments to the `ci` command in `./do` explaining the state machine steps, with numbered references matching the pseudocode in `docs/plan/specs/8_risks_mitigation.md`.
- [ ] Document required environment variables (`GITLAB_TOKEN`, `CI_PROJECT_ID` or `GITLAB_API`) in the `./do setup` output or a `docs/adr/` entry.

## 6. Automated Verification

- [ ] Run: `python3 -m pytest .tools/tests/test_do_ci_job_failure.py -v --tb=short 2>&1 | tee /tmp/task03_results.txt && grep -c "PASSED" /tmp/task03_results.txt`
- [ ] Confirm output shows `8` (all 8 tests passed).
- [ ] Run: `python3 .tools/verify_requirements.py 2>&1 | grep "RISK-024-BR-001"` — must appear as traced.
- [ ] Run: `grep -n "RISK-024-BR-001" ./do` — must return at least one matching line confirming the annotation is present.
