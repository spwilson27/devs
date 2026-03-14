# Task: GitLab CI Pipeline Parallel Jobs and Artifact Configuration (Sub-Epic: 096_Acceptance Criteria & Roadmap (Part 7))

## Covered Requirements
- [AC-ROAD-P0-008]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create `.tools/verify_ci_config.py` (Python 3, no third-party deps beyond `pyyaml` or stdlib) annotated `# Covers: AC-ROAD-P0-008`:
    1. Load `.gitlab-ci.yml` from the repository root. Fail with a clear error if the file does not exist.
    2. Parse as YAML.
    3. Assert that exactly three job names exist matching `presubmit-linux`, `presubmit-macos`, `presubmit-windows`.
    4. For each of these three jobs, verify:
        - They share the same `stage` value (ensuring they run in parallel).
        - The `artifacts.paths` list includes all three:
            - `target/coverage/report.json`
            - `target/traceability.json`
            - `target/presubmit_timings.jsonl`
        - The `artifacts.expire_in` value is exactly `7 days`.
    5. Exit 0 if all checks pass; exit 1 with detailed error messages otherwise.
- [ ] Create a Rust integration test in `tests/ci_config_validation.rs`:
    - `// Covers: AC-ROAD-P0-008`
    - Invoke `python3 .tools/verify_ci_config.py` as a `std::process::Command`.
    - Assert exit code 0.

## 2. Task Implementation
- [ ] Create or update `.gitlab-ci.yml` at the repository root with the following structure:
    - Define a `stages` list including at least a `presubmit` stage.
    - Define a `.presubmit_template` hidden job (YAML anchor) containing:
        - `stage: presubmit`
        - `script`: `./do presubmit`
        - `artifacts`:
            - `paths`: `[target/coverage/report.json, target/traceability.json, target/presubmit_timings.jsonl]`
            - `expire_in: 7 days`
            - `when: always` (artifacts are uploaded even on failure for debugging)
        - `cache`:
            - `key: $CI_JOB_NAME-$CI_COMMIT_REF_SLUG`
            - `paths: [target/]`
    - Define `presubmit-linux`:
        - `extends: .presubmit_template`
        - `image: rust:1.80-slim-bookworm` (or the pinned Rust toolchain image)
        - `tags: [linux]`
    - Define `presubmit-macos`:
        - `extends: .presubmit_template`
        - `tags: [macos]`
    - Define `presubmit-windows`:
        - `extends: .presubmit_template`
        - `tags: [windows]`
- [ ] Ensure `./do presubmit` produces all three artifact files:
    - `target/coverage/report.json` — from `./do coverage`
    - `target/traceability.json` — from `./do test`
    - `target/presubmit_timings.jsonl` — timing data written by `./do presubmit` itself

## 3. Code Review
- [ ] Validate `.gitlab-ci.yml` with `yamllint` (or `python3 -c "import yaml; yaml.safe_load(open('.gitlab-ci.yml'))"`) to ensure valid YAML.
- [ ] Verify all three jobs share the same `stage` so they execute in parallel.
- [ ] Verify `expire_in` is the string `7 days` (not `7d`, not `1 week`).
- [ ] Verify `cache.key` includes `$CI_JOB_NAME` to avoid cache collisions across platforms.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 .tools/verify_ci_config.py` — exits 0.
- [ ] Run `cargo test --test ci_config_validation` — passes.

## 5. Update Documentation
- [ ] Add a comment block at the top of `.gitlab-ci.yml` summarizing the pipeline structure: three parallel presubmit jobs producing coverage, traceability, and timing artifacts.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` includes `AC-ROAD-P0-008` in covered requirements.
- [ ] Run `./do lint` to confirm no new lint violations.
