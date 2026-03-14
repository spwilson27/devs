# Task: CI Artifact Upload Configuration (Sub-Epic: 024_Foundational Technical Requirements (Part 15))

## Covered Requirements
- [2_TAS-REQ-010B]

## Dependencies
- depends_on: ["01_gitlab_ci_job_timeout_configuration.md"]
- shared_components: ["./do Entrypoint Script & CI Pipeline", "Traceability & Coverage Infrastructure"]

## 1. Initial Test Written
- [ ] Write a test that parses `.gitlab-ci.yml` and asserts that the `artifacts:` block for presubmit jobs includes all three required paths: `target/coverage/report.json`, `target/presubmit_timings.jsonl`, and `target/traceability.json`.
- [ ] Write a test that asserts the `artifacts:` block specifies `expire_in: 7 days`.
- [ ] Write a test that asserts the `artifacts:` block specifies `when: always` so artifacts are uploaded even on job failure.

## 2. Task Implementation
- [ ] In `.gitlab-ci.yml`, add an `artifacts:` block to each presubmit/CI job (or the shared template) with the following configuration:
  ```yaml
  artifacts:
    when: always
    expire_in: 7 days
    paths:
      - target/coverage/report.json
      - target/presubmit_timings.jsonl
      - target/traceability.json
  ```
- [ ] Ensure `./do presubmit` and `./do coverage` produce these artifact files at the expected paths. If the commands already produce them, no changes needed; otherwise add the necessary output generation steps.

## 3. Code Review
- [ ] Verify `when: always` is set so artifacts upload on failure.
- [ ] Verify `expire_in` is exactly `7 days`.
- [ ] Verify all three artifact paths are listed and match exactly the paths produced by `./do` subcommands.

## 4. Run Automated Tests to Verify
- [ ] Run the CI config validation tests and confirm they pass.

## 5. Update Documentation
- [ ] Add inline comments in `.gitlab-ci.yml` explaining what each artifact file contains and why `when: always` is used.

## 6. Automated Verification
- [ ] Run the CI config parser test suite: `cargo test ci_artifact` or equivalent shell test.
- [ ] Validate `.gitlab-ci.yml` syntax with `gitlab-ci-lint` or `python -c "import yaml; yaml.safe_load(open('.gitlab-ci.yml'))"`.
