# Task: GitLab CI Pipeline Configuration (Sub-Epic: 006_Quality Gate Enforcement)

## Covered Requirements
- [2_TAS-REQ-010], [2_TAS-REQ-010A], [2_TAS-REQ-010B], [2_TAS-REQ-010C]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python-based CI test in `.tools/tests/test_ci_config.py` that parses `.gitlab-ci.yml` and verifies:
    - Presence of three jobs: `presubmit-linux`, `presubmit-macos`, `presubmit-windows`.
    - Timeout is set to `25m` per job.
    - Caching is correctly configured for `.cargo-cache/registry` and `target/`.
    - Correct runner tags (`linux`, `docker`, `macos`, `shell`, `windows`, `shell`).
    - Artifacts are uploaded even on failure (`when: always`).

## 2. Task Implementation
- [ ] Create `.gitlab-ci.yml` at the repository root utilizing the authoritative structure from [2_TAS-REQ-010].
- [ ] Define the `presubmit` stage.
- [ ] Configure global variables: `CARGO_HOME`, `RUST_BACKTRACE`, `RUST_LOG`.
- [ ] Implement the `.presubmit_template` as specified, including the 25-minute timeout [2_TAS-REQ-010A].
- [ ] Ensure `artifacts` includes `target/coverage/report.json`, `target/presubmit_timings.jsonl`, and `target/traceability.json` [2_TAS-REQ-010B].
- [ ] Configure `cache` to use `$CI_JOB_NAME-$CI_COMMIT_REF_SLUG` as the key [2_TAS-REQ-010C].
- [ ] Define the three OS-specific jobs inheriting from the template.

## 3. Code Review
- [ ] Verify that the `timeout` in YAML is `25m` (allowing a 10-minute buffer for the 15-minute presubmit script).
- [ ] Verify that the `cache` paths include both the cargo registry and the target directory.
- [ ] Ensure the shebang in `./do` (which CI calls) is `#!/bin/sh` as per [2_TAS-REQ-010D].

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_ci_config.py`.
- [ ] (Optional/Manual) If possible, trigger a test pipeline on a GitLab runner to confirm connectivity and environment setup.

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect the completion of the GitLab CI foundation.

## 6. Automated Verification
- [ ] Run `./do lint` (once implemented in the next task) to ensure the CI configuration doesn't violate any workspace standards.
