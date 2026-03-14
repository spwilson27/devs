# Task: CI Multi-Platform Presubmit Timeout and All-Green Enforcement (Sub-Epic: 037_Detailed Domain Specifications (Part 2))

## Covered Requirements
- [1_PRD-KPI-BR-007], [1_PRD-KPI-BR-008]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] In `tests/ci/` (or an appropriate test harness location), write a test `test_ci_pipeline_job_matrix_exists` that parses `.gitlab-ci.yml` and asserts exactly three presubmit jobs are defined: `presubmit-linux` (tag `linux`, platform `x86-64`), `presubmit-macos` (tag `macos`, platform `arm64`), and `presubmit-windows` (tag `windows`, platform `x86-64`).
- [ ] Write a test `test_ci_pipeline_all_jobs_parallel` that parses `.gitlab-ci.yml` and asserts all three presubmit jobs belong to the same pipeline stage (i.e., they run in parallel, not sequentially).
- [ ] Write a test `test_ci_pipeline_fails_on_any_single_job_failure` that asserts the pipeline-level `allow_failure` is NOT set on any of the three jobs, ensuring a failure on any one platform causes the entire pipeline to fail.
- [ ] Write a test `test_ci_job_timeout_is_900_seconds` that parses `.gitlab-ci.yml` and asserts each of the three presubmit jobs has a `timeout` value of `15 minutes` (or 900 seconds), enforcing the wall-clock cap per [1_PRD-KPI-BR-007].
- [ ] Write a test `test_ci_jobs_invoke_do_presubmit` that parses `.gitlab-ci.yml` and asserts each job's `script` section invokes `./do presubmit` (the canonical entrypoint).

## 2. Task Implementation
- [ ] In `.gitlab-ci.yml`, define a pipeline stage `presubmit` containing three parallel jobs:
  - `presubmit-linux`: `tags: [linux]`, `timeout: 15 minutes`, `script: ["./do presubmit"]`
  - `presubmit-macos`: `tags: [macos]`, `timeout: 15 minutes`, `script: ["./do presubmit"]`
  - `presubmit-windows`: `tags: [windows]`, `timeout: 15 minutes`, `script: ["./do presubmit"]`
- [ ] Ensure no job has `allow_failure: true`. The default GitLab behavior (pipeline fails if any job fails) satisfies [1_PRD-KPI-BR-008].
- [ ] Ensure the `timeout` on each job is set to `15 minutes` to enforce the wall-clock cap on the CI runner side (complementing `./do presubmit`'s internal 900-second timeout) per [1_PRD-KPI-BR-007].
- [ ] Add a `cache` key for each job pointing to `target/` with a platform-specific cache key to speed up builds without sharing incompatible artifacts across platforms.

## 3. Code Review
- [ ] Verify that the timeout is applied at the GitLab job level (wall-clock, not CPU time) — GitLab CI `timeout` is wall-clock by definition.
- [ ] Verify that no `allow_failure`, `when: manual`, or `rules` clause on any job could cause a platform failure to be silently ignored.
- [ ] Verify that all three jobs execute the identical `./do presubmit` command with no platform-specific flag overrides that could skip checks.

## 4. Run Automated Tests to Verify
- [ ] Run the CI config validation tests: `cargo test --test ci` (or the appropriate test target).
- [ ] Optionally validate the `.gitlab-ci.yml` syntax using `gitlab-ci-lint` or `python -c "import yaml; yaml.safe_load(open('.gitlab-ci.yml'))"`.

## 5. Update Documentation
- [ ] Add a comment block at the top of `.gitlab-ci.yml` referencing [1_PRD-KPI-BR-007] and [1_PRD-KPI-BR-008] so future maintainers understand the all-green and timeout requirements.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to confirm no regressions.
- [ ] Parse `.gitlab-ci.yml` programmatically and assert: exactly 3 jobs with correct tags, all have `timeout: 15 minutes`, none have `allow_failure: true`.
