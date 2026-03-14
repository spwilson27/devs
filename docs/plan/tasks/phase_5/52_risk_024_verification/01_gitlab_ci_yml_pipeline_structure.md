# Task: Define and Validate `.gitlab-ci.yml` Pipeline Structure with Artifact Configuration (Sub-Epic: 52_Risk 024 Verification)

## Covered Requirements
- [RISK-024], [RISK-024-BR-004]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written

- [ ] In `.tools/tests/test_gitlab_ci_yml.py` (or equivalent test module under `.tools/tests/`), write the following tests **before** touching `.gitlab-ci.yml`:

  **Test: `test_gitlab_ci_yml_exists`**
  Assert that `.gitlab-ci.yml` exists at the repository root. Use `pathlib.Path('.gitlab-ci.yml').exists()` inside an `assert` or `pytest` assertion. Tag the test with `# [RISK-024]`.

  **Test: `test_required_jobs_present`**
  Parse `.gitlab-ci.yml` with `pyyaml` (`import yaml`). Assert that the parsed dict contains keys `presubmit-linux`, `presubmit-macos`, and `presubmit-windows`. Tag with `# [RISK-024]`.

  **Test: `test_artifact_paths_per_job`**
  For each of `presubmit-linux`, `presubmit-macos`, `presubmit-windows`, assert that `job['artifacts']['paths']` contains exactly:
  - `target/coverage/report.json`
  - `target/presubmit_timings.jsonl`
  - `target/traceability.json`
  Tag with `# [RISK-024-BR-004]`.

  **Test: `test_artifact_expire_in`**
  For each of the three presubmit jobs, assert that `job['artifacts']['expire_in'] == '7 days'`. Tag with `# [RISK-024-BR-004]`.

  **Test: `test_artifact_when_always`**
  For each of the three presubmit jobs, assert that `job['artifacts']['when'] == 'always'`. Tag with `# [RISK-024-BR-004]`.

  **Test: `test_cargo_audit_job_present`**
  Assert that a `cargo-audit` job exists in `.gitlab-ci.yml` and that `allow_failure` is `false`. Tag with `# [RISK-024]`.

  **Test: `test_stages_defined`**
  Assert that `stages` in `.gitlab-ci.yml` contains at least `presubmit` and `audit`. Tag with `# [RISK-024]`.

  **Test: `test_presubmit_job_timeout`**
  For each of the three presubmit jobs, assert that `job['timeout']` is `'25 minutes'` (or equivalent). Tag with `# [RISK-024]`.

  Confirm all tests **fail** before the implementation step (red phase).

## 2. Task Implementation

- [ ] Create `.gitlab-ci.yml` at the repository root with the following normative structure. This is the authoritative configuration that all tests verify against:

  ```yaml
  stages:
    - presubmit
    - audit

  presubmit-linux:
    stage: presubmit
    image: rust:1.80-slim-bookworm
    script:
      - ./do setup
      - ./do presubmit
    timeout: 25 minutes
    artifacts:
      paths:
        - target/coverage/report.json
        - target/presubmit_timings.jsonl
        - target/traceability.json
      expire_in: 7 days
      when: always

  presubmit-macos:
    stage: presubmit
    tags: [macos]
    script:
      - ./do setup
      - ./do presubmit
    timeout: 25 minutes
    artifacts:
      paths:
        - target/coverage/report.json
        - target/presubmit_timings.jsonl
        - target/traceability.json
      expire_in: 7 days
      when: always

  presubmit-windows:
    stage: presubmit
    tags: [windows]
    script:
      - sh ./do setup
      - sh ./do presubmit
    timeout: 25 minutes
    artifacts:
      paths:
        - target/coverage/report.json
        - target/presubmit_timings.jsonl
        - target/traceability.json
      expire_in: 7 days
      when: always

  cargo-audit:
    stage: audit
    image: rust:1.80-slim-bookworm
    script:
      - cargo audit --deny warnings
    allow_failure: false
  ```

- [ ] Verify that the file is valid YAML by running `python3 -c "import yaml, pathlib; yaml.safe_load(pathlib.Path('.gitlab-ci.yml').read_text())"` — must exit 0.

- [ ] Add a `pyyaml` (or `ruamel-yaml`) dependency to `.tools/requirements.txt` (if not already present) so the test suite can parse YAML files.

## 3. Code Review

- [ ] Confirm that **all three** presubmit jobs (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`) have identical `artifacts` blocks — no job has a different `expire_in` or missing `when: always`.
- [ ] Confirm the `cargo-audit` job uses `allow_failure: false` (not the default, which would allow failure on YAML omission).
- [ ] Confirm that each presubmit job's `script` section ends with `./do presubmit` (or `sh ./do presubmit` for Windows), ensuring the same entry point as local development.
- [ ] Confirm `stages` ordering — `presubmit` before `audit` — so artifact collection completes before the audit stage.
- [ ] Confirm traceability annotations `# [RISK-024]` and `# [RISK-024-BR-004]` are present on every test function.

## 4. Run Automated Tests to Verify

- [ ] Run the test file directly: `python3 -m pytest .tools/tests/test_gitlab_ci_yml.py -v`
- [ ] All 8 tests must pass (green).
- [ ] Run `./do lint` and confirm it exits 0 (the yamllint step added in task 02 should not yet be present, but the file should be valid YAML regardless).
- [ ] Run `./do test` to confirm no regressions in any other test module.

## 5. Update Documentation

- [ ] Add a doc comment at the top of `.gitlab-ci.yml` referencing requirement IDs:
  ```yaml
  # CI pipeline definition.
  # Requirements: [RISK-024] [RISK-024-BR-004]
  # Artifact retention: expire_in 7 days, when: always for all presubmit jobs.
  ```
- [ ] In `requirements.md`, confirm that `RISK-024` and `RISK-024-BR-004` are listed with test file references pointing to `.tools/tests/test_gitlab_ci_yml.py`.

## 6. Automated Verification

- [ ] Run: `python3 -m pytest .tools/tests/test_gitlab_ci_yml.py -v --tb=short 2>&1 | tee /tmp/task01_results.txt && grep -E "PASSED|FAILED|ERROR" /tmp/task01_results.txt`
- [ ] Confirm output shows 8 `PASSED` lines and 0 `FAILED` or `ERROR` lines.
- [ ] Run: `python3 .tools/verify_requirements.py 2>&1 | grep -E "RISK-024|stale"` — confirm `RISK-024` and `RISK-024-BR-004` are listed as traced and not stale.
