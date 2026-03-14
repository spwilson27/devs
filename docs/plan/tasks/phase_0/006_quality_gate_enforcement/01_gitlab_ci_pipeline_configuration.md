# Task: GitLab CI Pipeline with Three Parallel Platform Jobs (Sub-Epic: 006_Quality Gate Enforcement)

## Covered Requirements
- [2_TAS-REQ-010]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer — the `./do` script must exist before CI can invoke it)]

## 1. Initial Test Written
- [ ] Create `tests/test_ci_config.sh` (POSIX sh) that parses `.gitlab-ci.yml` using a lightweight YAML tool (e.g., `python3 -c "import yaml; ..."` or `yq`) and asserts:
  - Exactly three jobs exist: `presubmit-linux`, `presubmit-macos`, `presubmit-windows`
  - All three jobs are in the `presubmit` stage
  - Each job's `timeout` is `25m`
  - Each job's `script` section calls `./do setup` then `./do presubmit`
  - Global variables include `CARGO_HOME: "$CI_PROJECT_DIR/.cargo-cache"`, `RUST_BACKTRACE: "1"`, `RUST_LOG: "info"`
  - `artifacts.paths` includes `target/coverage/report.json`, `target/presubmit_timings.jsonl`, `target/traceability.json`
  - `artifacts.when` is `always`
  - `cache.key` uses `$CI_JOB_NAME-$CI_COMMIT_REF_SLUG`
  - `cache.paths` includes `.cargo-cache/registry` and `target/`
  - Runner tags for linux job include `linux`, macos job includes `macos`, windows job includes `windows`
- [ ] The test script must exit non-zero if `.gitlab-ci.yml` does not exist
- [ ] Add `# Covers: 2_TAS-REQ-010` comment at the top of the test file

## 2. Task Implementation
- [ ] Create `.gitlab-ci.yml` at repository root matching the authoritative structure from [2_TAS-REQ-010]:
  ```yaml
  stages:
    - presubmit
  variables:
    CARGO_HOME: "$CI_PROJECT_DIR/.cargo-cache"
    RUST_BACKTRACE: "1"
    RUST_LOG: "info"
  ```
- [ ] Define `.presubmit_template` YAML anchor with `stage: presubmit`, `timeout: 25m`, `script: [./do setup, ./do presubmit]`
- [ ] Configure `artifacts` with `paths` listing the three required files, `when: always`
- [ ] Configure `cache` with `key: $CI_JOB_NAME-$CI_COMMIT_REF_SLUG` and `paths: [.cargo-cache/registry, target/]`
- [ ] Define `presubmit-linux` extending the template with `tags: [linux]`
- [ ] Define `presubmit-macos` extending the template with `tags: [macos]`
- [ ] Define `presubmit-windows` extending the template with `tags: [windows]`

## 3. Code Review
- [ ] Verify YAML is valid (no tabs, correct indentation)
- [ ] Verify the template anchor/alias pattern is correct YAML (`&presubmit_template` / `<<: *presubmit_template`)
- [ ] Confirm `timeout: 25m` allows 10-minute buffer over the 15-minute `./do presubmit` budget
- [ ] Confirm no secrets or credentials are hardcoded in the CI config

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/test_ci_config.sh` and confirm exit code 0
- [ ] Run `python3 -c "import yaml; yaml.safe_load(open('.gitlab-ci.yml'))"` to validate YAML syntax

## 5. Update Documentation
- [ ] Add a brief note in `docs/plan/tasks/phase_0/006_quality_gate_enforcement/` confirming CI pipeline is configured

## 6. Automated Verification
- [ ] Run `yamllint --strict .gitlab-ci.yml` (if yamllint is available) to verify strict YAML compliance
- [ ] Run `sh tests/test_ci_config.sh` a second time to confirm idempotency
