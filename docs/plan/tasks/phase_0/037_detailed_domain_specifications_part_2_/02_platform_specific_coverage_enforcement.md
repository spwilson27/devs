# Task: Platform-Specific Coverage Enforcement (Sub-Epic: 037_Detailed Domain Specifications (Part 2))

## Covered Requirements
- [1_PRD-KPI-BR-009]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a test in `tests/test_platform_specific_coverage.py` that:
    - Provides a mock coverage report for each platform (Linux, macOS, Windows).
    - Verifies that any `#[cfg(target_os = "...")]` block that is not covered on its intended platform causes a quality gate failure for that platform.
    - Verifies that a unified coverage score correctly handles these conditional paths.

## 2. Task Implementation
- [ ] Update the coverage aggregation logic (potentially in `.tools/verify_coverage.py` or within the `./do coverage` subcommand).
- [ ] Implement detection of platform-specific code paths (`#[cfg(target_os = ...)]`) and link them to their respective execution platforms.
- [ ] Ensure the coverage reporter fails if a platform-specific path is never exercised on that platform.
- [ ] Configure `cargo-llvm-cov` to correctly identify and report on these platform-specific conditional blocks across multi-platform CI runs.

## 3. Code Review
- [ ] Confirm that platform-specific code paths are not just compiled but actually exercised by unit or E2E tests.
- [ ] Verify that coverage metrics are individually reported per platform to ensure no platform's code is hidden by overall numbers.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 -m pytest tests/test_platform_specific_coverage.py`.
- [ ] Verify that the coverage gate correctly fails if platform-specific code is left uncovered.

## 5. Update Documentation
- [ ] Update documentation to clarify how platform-specific code must be tested on its target platform.

## 6. Automated Verification
- [ ] Inspect a sample coverage report from a multi-platform run and confirm the inclusion of target-specific code blocks.
