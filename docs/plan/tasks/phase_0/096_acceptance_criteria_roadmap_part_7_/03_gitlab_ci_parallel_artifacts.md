# Task: GitLab CI Parallelism & Artifacts (Sub-Epic: 096_Acceptance Criteria & Roadmap (Part 7))

## Covered Requirements
- [AC-ROAD-P0-008]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a verification script `.tools/verify_ci_config.py` that:
    - Loads `.gitlab-ci.yml`.
    - Validates that `presubmit-linux`, `presubmit-macos`, and `presubmit-windows` exist.
    - Validates that they are in the same stage (implicitly or explicitly parallel).
    - Validates that `artifacts` includes:
        - `target/coverage/report.json`
        - `target/traceability.json`
        - `target/presubmit_timings.jsonl`
    - Validates that `expire_in` is set to `7 days`.

## 2. Task Implementation
- [ ] Update `.gitlab-ci.yml` at the repository root to match the authoritative structure in [2_TAS-REQ-010].
- [ ] Ensure the `artifacts` section is correctly defined within the `.presubmit_template`.
- [ ] Verify that the `presubmit-linux` job uses the `rust:1.80-slim-bookworm` image.

## 3. Code Review
- [ ] Check for YAML syntax errors.
- [ ] Verify that the cache keys are correctly scoped to `$CI_JOB_NAME-$CI_COMMIT_REF_SLUG`.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 .tools/verify_ci_config.py`.

## 5. Update Documentation
- [ ] Update `README.md` CI/CD section to reflect the parallel job structure and artifact availability.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-ROAD-P0-008] as covered.
