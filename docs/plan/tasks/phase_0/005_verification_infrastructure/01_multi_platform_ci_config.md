# Task: Multi-Platform GitLab CI Configuration (Sub-Epic: 005_Verification Infrastructure)

## Covered Requirements
- [1_PRD-REQ-046], [1_PRD-REQ-047]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a mock GitLab CI runner environment (e.g., a local Docker container for Linux, and manual verification steps for macOS/Windows if available, or simply validating the `.gitlab-ci.yml` schema).
- [ ] Add a script `tests/verify_ci_config.sh` that:
    - Uses a YAML linter (e.g., `yamllint`) to verify the syntax of `.gitlab-ci.yml`.
    - Verifies that all three platform jobs (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`) are defined.
    - Verifies that each job invokes `./do setup` and `./do presubmit` as required by [2_TAS-REQ-010].
    - Verifies that artifacts are configured to be saved on failure or success.

## 2. Task Implementation
- [ ] Create `.gitlab-ci.yml` at the repository root with the authoritative structure defined in [2_TAS-REQ-010].
- [ ] Define the `presubmit` stage.
- [ ] Configure global variables: `CARGO_HOME`, `RUST_BACKTRACE`, `RUST_LOG`.
- [ ] Implement the `.presubmit_template` with:
    - `timeout: 25m` (to allow buffer for the 15-minute `./do presubmit` timeout).
    - `script` sequence: `./do setup` followed by `./do presubmit`.
    - `artifacts` paths: `target/coverage/report.json`, `target/presubmit_timings.jsonl`, `target/traceability.json`.
    - `cache` configuration for `.cargo-cache/registry` and `target/`.
- [ ] Define `presubmit-linux` job using `image: rust:1.80-slim-bookworm` and `tags: [linux, docker]`.
- [ ] Define `presubmit-macos` job with `tags: [macos, shell]`.
- [ ] Define `presubmit-windows` job with `tags: [windows, shell]`.
- [ ] Ensure that the pipeline is configured to fail if any of the three platform jobs fail ([1_PRD-REQ-047]).

## 3. Code Review
- [ ] Verify that the `.gitlab-ci.yml` exactly matches the architectural requirement [2_TAS-REQ-010].
- [ ] Ensure that no job is allowed to fail (`allow_failure: true` is prohibited for these core jobs).
- [ ] Verify that the 15-minute timeout policy is supported by the 25-minute CI job timeout.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/verify_ci_config.sh`.
- [ ] If possible, trigger a pipeline run on a GitLab instance and verify that it correctly spawns jobs for all three platforms.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that the CI pipeline is now active and mandatory for all PRs.
- [ ] Note the requirement for all three platforms to be green for mergeability.

## 6. Automated Verification
- [ ] Verify that `git add .gitlab-ci.yml` is ready for commit.
- [ ] Verify that the `.gitlab-ci.yml` file contains the string `presubmit-windows` to ensure cross-platform coverage is defined.
