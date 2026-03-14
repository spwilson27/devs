# Task: Multi-Platform GitLab CI Pipeline Configuration (Sub-Epic: 005_Verification Infrastructure)

## Covered Requirements
- [1_PRD-REQ-046], [1_PRD-REQ-047]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer — the `./do` script must exist before this task can validate end-to-end)]

## 1. Initial Test Written
- [ ] Create `tests/ci/validate_gitlab_ci.sh` (POSIX sh) that performs the following structural assertions against `.gitlab-ci.yml`:
    1. File exists at repository root.
    2. `yamllint --strict .gitlab-ci.yml` passes (install yamllint in `./do setup` if not present).
    3. The file defines exactly three jobs whose names contain `linux`, `macos`, and `windows` respectively (grep/yq check). This validates [1_PRD-REQ-047] — "validated on Windows, macOS, and Linux."
    4. Each of the three jobs invokes `./do presubmit` in its `script` section.
    5. No job sets `allow_failure: true` — all three must be required for the pipeline to pass ([1_PRD-REQ-046] — presubmit gates all commits).
    6. Each job defines an `artifacts` section that includes paths for `target/coverage/report.json`, `target/presubmit_timings.jsonl`, and `target/traceability.json`.
    7. Each job sets a `timeout` value of `25m` or less (must be ≥ 15 minutes to allow `./do presubmit` to complete).
- [ ] The test script must exit non-zero if any assertion fails, printing the specific assertion that failed.

## 2. Task Implementation
- [ ] Create `.gitlab-ci.yml` at the repository root with:
    - A single `stages: [presubmit]` declaration.
    - Global `variables` block setting `CARGO_HOME: "${CI_PROJECT_DIR}/.cargo-cache"`, `RUST_BACKTRACE: "1"`, `RUST_LOG: "info"`.
    - A hidden `.presubmit_template` job (YAML anchor) containing:
        - `stage: presubmit`
        - `timeout: 25m` ([2_TAS-REQ-010A])
        - `script`: `["./do setup", "./do presubmit"]`
        - `artifacts.paths`: `["target/coverage/report.json", "target/presubmit_timings.jsonl", "target/traceability.json"]` with `when: always` ([2_TAS-REQ-010B])
        - `cache` with key `${CI_JOB_NAME}` and paths `[".cargo-cache/registry", "target/"]` ([2_TAS-REQ-010C])
    - `presubmit-linux` job extending `.presubmit_template`, using `image: rust:1.80-slim-bookworm`, `tags: [linux, docker]`.
    - `presubmit-macos` job extending `.presubmit_template`, `tags: [macos, shell]`.
    - `presubmit-windows` job extending `.presubmit_template`, `tags: [windows, shell]`, with `before_script` to set `CARGO_HOME` using Windows-compatible path.
- [ ] Ensure no job uses `allow_failure: true` — pipeline fails if any platform job fails ([1_PRD-REQ-046]).
- [ ] Add `DEVS_DISCOVERY_FILE` variable per job set to a unique temp path for E2E test isolation ([2_TAS-REQ-010E]).

## 3. Code Review
- [ ] Verify `.gitlab-ci.yml` matches the structure defined by [2_TAS-REQ-010] (three parallel jobs, same `./do presubmit` script).
- [ ] Confirm no `allow_failure` is set on any presubmit job.
- [ ] Confirm the 25-minute CI timeout provides sufficient margin over the 15-minute (900s) `./do presubmit` hard timeout.
- [ ] Confirm the Windows job handles `sh`-compatible script invocation (Git Bash or equivalent).
- [ ] Verify YAML uses consistent 2-space indentation and passes `yamllint --strict`.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/ci/validate_gitlab_ci.sh` and confirm exit code 0.
- [ ] Run `yamllint --strict .gitlab-ci.yml` independently and confirm exit code 0.

## 5. Update Documentation
- [ ] Add a brief section to the project README or CLAUDE.md noting that all commits require a green three-platform CI pipeline.

## 6. Automated Verification
- [ ] Run `bash tests/ci/validate_gitlab_ci.sh && echo "PASS" || echo "FAIL"` — must print "PASS".
- [ ] Run `grep -c 'allow_failure' .gitlab-ci.yml` — must return 0 (no matches).
- [ ] Run `grep -c 'presubmit' .gitlab-ci.yml` — must return ≥ 3 (at least the three job definitions).
