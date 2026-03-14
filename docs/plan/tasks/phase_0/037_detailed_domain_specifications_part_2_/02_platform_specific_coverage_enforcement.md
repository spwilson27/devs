# Task: Platform-Specific Code Coverage Enforcement (Sub-Epic: 037_Detailed Domain Specifications (Part 2))

## Covered Requirements
- [1_PRD-KPI-BR-009]

## Dependencies
- depends_on: [01_ci_multi_platform_quality_gates.md]
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Write a test `test_platform_cfg_code_has_platform_test` that scans all `.rs` source files in the workspace for `#[cfg(target_os = "...")]` blocks, extracts the target OS, and asserts that for each such block there exists at least one test function also gated by the same `#[cfg(target_os = "...")]` attribute. This enforces [1_PRD-KPI-BR-009]: platform-specific code paths MUST be exercised by tests on that platform.
- [ ] Write a test `test_coverage_report_includes_platform_specific_lines` that, given a mock `target/coverage/report.json`, verifies platform-specific source lines (those inside `#[cfg(target_os)]` blocks) are included in the line coverage count and not excluded or filtered out.
- [ ] Write a test `test_do_coverage_does_not_exclude_cfg_code` that checks the `./do coverage` invocation does not pass `--exclude` or `--ignore` flags that would skip platform-gated modules.

## 2. Task Implementation
- [ ] Implement a lint check (invoked by `./do lint`) that scans all `*.rs` files for `#[cfg(target_os = "<platform>")]` annotated items (functions, impls, modules). For each discovered platform-specific item, verify that at least one `#[test]` function with a matching `#[cfg(target_os = "<platform>")]` gate exists in the test files of that crate.
- [ ] If any platform-specific code block has no corresponding platform-gated test, emit a lint error listing the file, line number, target OS, and the item name.
- [ ] Ensure `./do coverage` configuration (e.g., `cargo-llvm-cov` or `cargo-tarpaulin` flags) does NOT filter out `cfg`-gated code. Coverage must count platform-specific lines toward the per-crate and aggregate coverage gates (QG-001 through QG-005) on the platform where they compile.
- [ ] In `./do lint`, integrate this new check so it runs alongside existing lint steps. Exit non-zero if any platform-specific code lacks a platform-gated test.

## 3. Code Review
- [ ] Verify the scanner correctly handles nested `cfg` attributes (e.g., `#[cfg(all(target_os = "linux", feature = "pty"))]`).
- [ ] Verify the scanner does not produce false positives for `#[cfg(test)]` or `#[cfg(debug_assertions)]` — only `target_os` and `target_family` are relevant.
- [ ] Verify coverage tool configuration matches across all three CI platform jobs.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` to execute the new lint/scanner tests.
- [ ] Run `./do lint` and confirm it passes (or correctly flags any existing platform-specific code without tests).
- [ ] Run `./do coverage` and confirm platform-specific code is included in the coverage report.

## 5. Update Documentation
- [ ] Add a `// Covers: 1_PRD-KPI-BR-009` annotation to each test function implementing this check.

## 6. Automated Verification
- [ ] Run `./do presubmit` end-to-end and confirm zero lint failures related to platform-specific coverage.
- [ ] Introduce a deliberate `#[cfg(target_os = "linux")]` function with no corresponding test and verify `./do lint` catches it and exits non-zero. Then revert the change.
