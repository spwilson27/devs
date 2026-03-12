# Task: Advanced ANSI Stripping (Sub-Epic: 100_Acceptance Criteria & Roadmap (Part 11))

## Covered Requirements
- [AC-TYP-013], [AC-TYP-014]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/099_acceptance_criteria_roadmap_part_10_/02_strip_ansi_acceptance_cases.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Add the following unit tests to `crates/devs-core/src/utils/strings.rs` (or where `strip_ansi` is defined):
  - `test_strip_ansi_truncated_csi`: [AC-TYP-013] Verify that `strip_ansi("text\x1b[")` returns `"text"` without panicking.
  - `test_strip_ansi_complex_sgr`: [AC-TYP-014] Verify that `strip_ansi("\x1b[1;31;42mcolored\x1b[0m")` returns `"colored"`.
- [ ] Ensure tests are annotated with `// Covers: AC-TYP-013` and `// Covers: AC-TYP-014`.

## 2. Task Implementation
- [ ] Update the `strip_ansi` implementation in `crates/devs-core/src/utils/strings.rs` to handle these cases.
- [ ] If using the regex-based approach from Part 10, ensure the regex correctly matches complex SGR sequences and handles partial escapes at the end of the string.
  - The regex `\x1B\[[0-9;]*[mK]` should handle `\x1b[1;31;42m`.
  - For truncated CSI like `\x1b[`, a more robust regex or a state-machine parser may be needed:
  ```rust
  // Example robust regex that handles truncated CSI:
  // \x1B\[[0-?]*[ -/]*[@-~]
  // Note: For MVP, a simple regex might suffice if it doesn't panic on partial matches.
  ```
- [ ] Ensure the implementation does not panic on any input string, including those ending with a partial escape sequence.

## 3. Code Review
- [ ] Confirm that `AC-TYP-013` is met: truncated sequences are stripped or ignored without error.
- [ ] Confirm that `AC-TYP-014` is met: multi-parameter SGR codes (like `1;31;42m`) are correctly removed.
- [ ] Verify that no new dependencies (like `vte` or `strip-ansi` crates) are added to `devs-core` to keep it minimal.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib utils::strings::tests` and ensure all tests (including Part 10 tests) pass.

## 5. Update Documentation
- [ ] Update doc comments for `strip_ansi` to mention handling of complex and truncated sequences.

## 6. Automated Verification
- [ ] Run `./do lint` and verify code quality.
- [ ] Verify requirement-to-test traceability using `.tools/verify_requirements.py`.
