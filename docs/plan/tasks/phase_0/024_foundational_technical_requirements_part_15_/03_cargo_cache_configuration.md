# Task: Cargo Registry and Target Caching in CI (Sub-Epic: 024_Foundational Technical Requirements (Part 15))

## Covered Requirements
- [2_TAS-REQ-010C]

## Dependencies
- depends_on: ["01_gitlab_ci_job_timeout_configuration.md"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write a test that parses `.gitlab-ci.yml` and asserts that the `cache:` block for presubmit jobs includes both `$CARGO_HOME/registry` and `target/` in its `paths:` list.
- [ ] Write a test that asserts the cache key includes both `$CI_JOB_NAME` and `$CI_COMMIT_REF_SLUG` (e.g., key pattern `${CI_JOB_NAME}-${CI_COMMIT_REF_SLUG}`).
- [ ] Write a test that asserts the cache policy does not set `policy: pull` only (must allow push to populate the cache).
- [ ] Write a test that verifies `./do setup` succeeds even when the cache is empty (i.e., cache restoration failure does not block the build). This can be a shell test that runs `./do setup` with an empty `$CARGO_HOME` and asserts exit code 0.

## 2. Task Implementation
- [ ] In `.gitlab-ci.yml`, add a `cache:` block to each presubmit job (or shared template):
  ```yaml
  cache:
    key: "${CI_JOB_NAME}-${CI_COMMIT_REF_SLUG}"
    paths:
      - $CARGO_HOME/registry
      - target/
  ```
- [ ] Ensure `CARGO_HOME` is explicitly set in the CI `variables:` block (e.g., `CARGO_HOME: "${CI_PROJECT_DIR}/.cargo"`) so the cache path is deterministic and within the project directory.
- [ ] Verify that `./do setup` does not fail if `$CARGO_HOME/registry` is missing or corrupted — it should re-fetch crates via `cargo fetch` or equivalent.

## 3. Code Review
- [ ] Verify the cache key uses per-job per-branch segmentation to avoid cross-contamination.
- [ ] Verify `CARGO_HOME` is set to a path inside the project directory so GitLab can cache it.
- [ ] Verify no `allow_failure` or error suppression is needed for cache misses — GitLab handles cache restore failures gracefully by default.

## 4. Run Automated Tests to Verify
- [ ] Run the CI config validation tests and confirm they pass.

## 5. Update Documentation
- [ ] Add inline comments in `.gitlab-ci.yml` explaining the cache key strategy and why `CARGO_HOME` is overridden.

## 6. Automated Verification
- [ ] Run `grep -q 'CI_JOB_NAME' .gitlab-ci.yml && grep -q 'CARGO_HOME' .gitlab-ci.yml && echo "PASS" || echo "FAIL"`.
