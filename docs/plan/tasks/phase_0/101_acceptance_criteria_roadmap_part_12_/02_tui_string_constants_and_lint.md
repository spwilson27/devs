# Task: TUI String Management (Sub-Epic: 101_Acceptance Criteria & Roadmap (Part 12))

## Covered Requirements
- [AC-TYP-020], [AC-TYP-021]

## Dependencies
- depends_on: [01_tui_status_logic_and_labels.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Add a compile-time assertion in `devs-tui/src/strings.rs` using `const_assert_eq!` (or similar) to ensure `STATUS_RUN_.len() == 4`.
- [ ] Create a lint test `strings_no_inline_errors` in `devs-tui/tests/lint_strings.rs`. The test should read all `.rs` files in the `devs-tui/src/widgets/` directory and check for any string literals that start with `"not_found:"`.

## 2. Task Implementation
- [ ] In `devs-tui/src/strings.rs`, export a constant `STATUS_RUN_` with the value `"RUN "`.
- [ ] Implement the `strings_no_inline_errors` test logic. The test should iterate through widget files, read their content, and fail (exit non-zero) if any line contains a string literal beginning with `"not_found:"`. This is to prevent un-localized fallback strings from being inlined.

## 3. Code Review
- [ ] Ensure `STATUS_RUN_` has the trailing space as specified (`"RUN "`).
- [ ] Verify that the `strings_no_inline_errors` lint correctly detects violations even in multiline strings or different quoting styles if used.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-tui` and ensure the constants and lint tests pass.
- [ ] Temporarily add a `"not_found:test"` string to a widget file and verify that `cargo test` fails as expected.

## 5. Update Documentation
- [ ] Add comments in `strings.rs` explaining the purpose of the length assertion and the `"not_found:"` prefix convention.

## 6. Automated Verification
- [ ] Run `./do test` and check for the `strings_no_inline_errors` test execution.
