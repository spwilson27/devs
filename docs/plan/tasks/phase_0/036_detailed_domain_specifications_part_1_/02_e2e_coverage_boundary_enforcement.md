# Task: E2E Test Internal Import Boundary Enforcement (Sub-Epic: 036_Detailed Domain Specifications (Part 1))

## Covered Requirements
- [1_PRD-KPI-BR-003]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a test script at `tests/do_script/test_e2e_boundary.sh` that validates the boundary enforcement scanner.
- [ ] **Violation test case**: Create a temporary Rust file in a temp `tests/e2e/` directory containing `use devs_core::SomeInternalType;` (an internal crate import). Run `./do coverage` (or the boundary scanner directly) and assert:
  - Exit code is non-zero (1).
  - Stderr contains "boundary violation" (or equivalent).
  - Stderr identifies the offending file path (e.g., `tests/e2e/bad_test.rs`).
  - Stderr identifies the offending import line (e.g., `use devs_core::SomeInternalType`).
- [ ] **Allowed import test case**: Create a temporary Rust file in `tests/e2e/` containing only `use devs::SomePublicType;` (the public surface of the `devs` library crate re-exported for testing). Run the boundary scanner and assert it passes (exit code 0, no errors).
- [ ] **Mixed test case**: Create a file with both a valid `use devs::...` import and an invalid `use devs_pool::...` import. Assert that the scanner catches the violation and reports the specific offending line.
- [ ] **No E2E files test case**: When `tests/e2e/` is empty or absent, the scanner should pass without error (no files to check = no violations).

## 2. Task Implementation
- [ ] In the `./do` script's `coverage` subcommand, add a boundary enforcement step that runs BEFORE E2E coverage measurement.
- [ ] Implement a scanner that searches all `*.rs` files under the E2E test directories for `use devs_*` import patterns (i.e., direct imports of internal workspace crates like `devs_core`, `devs_proto`, `devs_pool`, `devs_scheduler`, etc.).
- [ ] Define the allowlist: only `use devs::` (the top-level library crate's public re-exports) is permitted in E2E tests. All other `use devs_*::` imports are violations.
- [ ] The scanner should use `grep -rn 'use devs_' tests/e2e/` (or equivalent POSIX-compatible command) to find violations.
- [ ] For each violation found, print to stderr: `"ERROR: boundary violation in <filepath>:<line_number>: <import_line>"`.
- [ ] If any violations are found, skip E2E coverage measurement entirely and exit `./do coverage` with code 1.
- [ ] The scanner must handle `use devs_` appearing in comments — only scan non-comment lines. Use a simple heuristic: skip lines starting with `//` or lines between `/*` and `*/` (or accept minor false positives on comments as a known limitation documented in a code comment).

## 3. Code Review
- [ ] Verify that the allowlist is correct: only `use devs::` is permitted; all `use devs_<crate>::` patterns are forbidden.
- [ ] Verify the error message includes both the file path and the offending import line as required by [1_PRD-KPI-BR-003].
- [ ] Verify POSIX sh compatibility (no bashisms in the scanner logic).
- [ ] Verify that the scanner runs before coverage measurement so that invalid E2E tests never contribute to coverage numbers.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/do_script/test_e2e_boundary.sh` and verify all four test cases pass.
- [ ] Run `./do coverage` on the real codebase and verify no false positives are triggered.

## 5. Update Documentation
- [ ] Add `# Covers: 1_PRD-KPI-BR-003` comments in the test script next to each relevant assertion.

## 6. Automated Verification
- [ ] Run the test script in CI: `bash tests/do_script/test_e2e_boundary.sh && echo PASS || echo FAIL`
- [ ] Run `./do lint` to verify no script issues are introduced.
