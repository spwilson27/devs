# Task: CI Multi-Platform Quality Gates (Sub-Epic: 037_Detailed Domain Specifications (Part 2))

## Covered Requirements
- [1_PRD-KPI-BR-007], [1_PRD-KPI-BR-008]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a simulation of the CI pipeline reporting in `tests/test_ci_quality_gates.py` that:
    - Verifies that a failing job on any platform (Windows, macOS, or Linux) causes the overall pipeline to be marked as failed.
    - Verifies that any job exceeding the 15-minute wall-clock cap results in a failure.
    - Verifies that a successful pipeline requires all three platform jobs to be green.

## 2. Task Implementation
- [ ] Configure `.gitlab-ci.yml` (or equivalent CI configuration file) to execute the presubmit suite on Linux, macOS, and Windows runners.
- [ ] Ensure each platform's job correctly inherits the 15-minute timeout as defined in the `./do` script and enforced by the CI runner configuration.
- [ ] Implement a final aggregation step or use native CI features to ensure the "all-green" rule for the pipeline status.
- [ ] Update `.tools/ci.py` to correctly report status and timing for each platform to the centralized dashboard or logs.

## 3. Code Review
- [ ] Verify that the 15-minute cap is applied to the wall-clock time, not just CPU time, on each platform.
- [ ] Ensure that a failure on one platform doesn't prevent other platforms from running (parallel execution).

## 4. Run Automated Tests to Verify
- [ ] Run the CI pipeline in a test branch or simulated environment.
- [ ] Verify that the pipeline correctly fails if a simulated platform failure occurs.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/1_prd.md` or a dedicated CI guide to explicitly document the all-green requirement across platforms.

## 6. Automated Verification
- [ ] Verify the existence of the multi-platform configuration in the CI YAML.
- [ ] Check that the CI jobs have the correct timeout labels or settings.
