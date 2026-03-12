# Task: Create and Validate `.gitlab-ci.yml` Pipeline Definition (Sub-Epic: 53_MIT-024)

## Covered Requirements
- [MIT-024], [AC-RISK-024-03], [AC-RISK-024-04]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] In `.tools/tests/test_gitlab_ci_yml.py` (Python `pytest`), write a test `test_gitlab_ci_yml_has_required_jobs` that:
  - Loads `.gitlab-ci.yml` from the repo root using `yaml.safe_load`.
  - Asserts that all three keys `presubmit-linux`, `presubmit-macos`, and `presubmit-windows` exist as top-level job definitions (i.e., are dicts with a `script` key).
  - Asserts that each job has an `artifacts` block where `when == "always"` and `expire_in == "7 days"`.
  - Asserts that each job's `artifacts.paths` list includes exactly these three items: `target/coverage/report.json`, `target/presubmit_timings.jsonl`, `target/traceability.json`.
- [ ] Write a second test `test_gitlab_ci_yml_is_valid_yaml` that:
  - Runs `yamllint -d relaxed .gitlab-ci.yml` via `subprocess.run` with `check=False`.
  - Asserts exit code is `0` (this test will fail until `.gitlab-ci.yml` exists and is valid YAML).
- [ ] Write a third test `test_gitlab_ci_yml_jobs_run_do_presubmit` that:
  - Loads `.gitlab-ci.yml`.
  - For each of the three required jobs, asserts that the `script` list contains the string `"./do presubmit"` (or a line beginning with `./do presubmit`).
- [ ] Place `# [AC-RISK-024-03] [AC-RISK-024-04]` traceability annotations as comments directly above each assertion group.
- [ ] Confirm all three tests fail (red) before any implementation exists.

## 2. Task Implementation
- [ ] Create `.gitlab-ci.yml` at the repo root with the following structure:

  ```yaml
  # [MIT-024] [RISK-024-BR-004]
  stages:
    - presubmit

  .presubmit_common: &presubmit_common
    stage: presubmit
    script:
      - ./do setup
      - ./do presubmit
    artifacts:
      when: always
      expire_in: 7 days
      paths:
        - target/coverage/report.json
        - target/presubmit_timings.jsonl
        - target/traceability.json

  # [AC-RISK-024-03]
  presubmit-linux:
    <<: *presubmit_common
    tags:
      - linux

  presubmit-macos:
    <<: *presubmit_common
    tags:
      - macos

  presubmit-windows:
    <<: *presubmit_common
    tags:
      - windows
  ```

- [ ] Verify `yamllint` is available in `./do setup`. If not, add `pip install yamllint` (or the OS-equivalent) to the setup step in `./do`.
- [ ] Verify that the YAML anchor/alias (`&presubmit_common` / `<<: *presubmit_common`) expands correctly by loading the file with `yaml.safe_load` in a quick local sanity check — note that `yaml.safe_load` does NOT support `<<` merge keys; if the test runner is strict, flatten the three job definitions explicitly instead of using anchors to keep the test assertions straightforward.
- [ ] If anchors cause issues with `yaml.safe_load`, rewrite `.gitlab-ci.yml` with the three jobs fully expanded (no YAML anchors) so that the Python test can load and inspect the file without a custom YAML loader.
- [ ] Add the `# [MIT-024]` traceability annotation as the first comment in `.gitlab-ci.yml`.

## 3. Code Review
- [ ] Confirm all three job names are spelled exactly `presubmit-linux`, `presubmit-macos`, `presubmit-windows` — no deviations (these exact strings are checked in AC-RISK-024-03).
- [ ] Confirm `when: always` is set under `artifacts` for ALL three jobs (not just one), satisfying AC-RISK-024-04.
- [ ] Confirm `expire_in: 7 days` is set under `artifacts` for all three jobs (RISK-024-BR-004).
- [ ] Confirm all three artifact paths (`target/coverage/report.json`, `target/presubmit_timings.jsonl`, `target/traceability.json`) are present in every job's `artifacts.paths` list.
- [ ] Confirm the file does not contain any Windows-style line endings (`\r\n`) — use `file .gitlab-ci.yml` to check.
- [ ] Confirm `yamllint .gitlab-ci.yml` exits 0 locally.
- [ ] Confirm traceability annotations `# [MIT-024]`, `# [AC-RISK-024-03]`, `# [AC-RISK-024-04]` (or inline equivalents) appear in the file so the traceability tool can link them.

## 4. Run Automated Tests to Verify
- [ ] Run `cd /home/mrwilson/software/devs && python -m pytest .tools/tests/test_gitlab_ci_yml.py -v` and confirm all three tests pass (green).
- [ ] Run `yamllint .gitlab-ci.yml` standalone and confirm exit code 0.
- [ ] Run `./do lint` (once Task 02 is complete this will include the `yamllint` step; at this stage, run it to confirm no regressions in existing lint checks).

## 5. Update Documentation
- [ ] In `docs/adr/`, if an ADR for the CI pipeline structure does not yet exist, note in the relevant risk doc (`docs/plan/specs/8_risks_mitigation.md` or `docs/plan/requirements/8_risks_mitigation.md`) that `.gitlab-ci.yml` has been created and satisfies RISK-024-BR-004.
- [ ] Update `requirements.md` traceability entry for `AC-RISK-024-03` and `AC-RISK-024-04` to reference the test file `.tools/tests/test_gitlab_ci_yml.py`.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm `AC-RISK-024-03` and `AC-RISK-024-04` appear in the traceability report with `status: covered`.
- [ ] Run `python -m pytest .tools/tests/test_gitlab_ci_yml.py --tb=short 2>&1 | tail -5` and confirm output ends with `3 passed`.
- [ ] Run `yamllint .gitlab-ci.yml; echo "exit:$?"` and confirm `exit:0`.
