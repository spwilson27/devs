# Task: Platform-Specific Test Audit (Sub-Epic: 35_Risk 012 Verification)

## Covered Requirements
- [RISK-012-BR-004]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python script `.tools/audit_platform_tests.py` that parses all `.rs` files for `#[cfg(windows)]` and `#[cfg(unix)]` blocks and verifies that each block is followed by or contains an annotation like `// Covers: RISK-012`.
- [ ] Ensure the script identifies any platform-specific code path that is not explicitly marked for cross-platform verification.

## 2. Task Implementation
- [ ] Perform a comprehensive audit of the entire codebase for `#[cfg(...)]` attributes.
- [ ] For each platform-specific block, identify the corresponding test in `tests/` or the library's `mod tests`.
- [ ] Ensure that for every Windows-specific code path, there is a test that runs in the `presubmit-windows` CI job.
- [ ] Add `// Covers: RISK-012` annotations to all relevant platform-specific code blocks and their covering tests.
- [ ] Integrate the audit script into the `./do lint` or `./do test` phase to ensure no future platform-specific code is added without traceability.

## 3. Code Review
- [ ] Verify that the `presubmit-windows` and `presubmit-macos` CI jobs in `gitlab-ci.yml` are correctly configured to execute these tests.
- [ ] Ensure that no code path is unreachable due to missing platform-specific mocks in tests.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 .tools/audit_platform_tests.py` and ensure it passes.
- [ ] Run `./do test` and verify that `RISK-012-BR-004` is marked as covered in `target/traceability.json`.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to note that all platform-specific code paths are now audited and verified in their respective CI jobs.

## 6. Automated Verification
- [ ] Verify that `target/traceability.json` reports 100% coverage for requirement `RISK-012-BR-004`.
