# Task: String Truncation Utility (Sub-Epic: 103_Acceptance Criteria & Roadmap (Part 14))

## Covered Requirements
- [AC-TYP-028]

## Dependencies
- depends_on: []
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a parameterized unit test in `crates/devs-core/src/utils/string.rs`. If the directory or file does not exist, create it.
- [ ] The test must verify `truncate_with_tilde(s, 20)` for the following inputs:
  - Empty string (length 0): Expect 20 spaces ("                    ").
  - String of length 19: Expect the original string + 1 space ("... 19 chars ... ").
  - String of length 20: Expect exactly the original string.
  - String of length 25: Expect the first 19 chars followed by a tilde ("~").
- [ ] Assert that in all cases, the resulting string's `chars().count()` is exactly 20.
- [ ] Include a test case with a multi-byte UTF-8 character (e.g., "🦀") to ensure char-based truncation rather than byte-based.

## 2. Task Implementation
- [ ] Implement `pub fn truncate_with_tilde(s: &str, size: usize) -> String` in `crates/devs-core/src/utils/string.rs`.
- [ ] The implementation should:
  - Use `.chars().count()` to determine the character length of the input.
  - If length > `size`: take the first `size.saturating_sub(1)` characters and append a `~`.
  - If length == `size`: return `s.to_string()`.
  - If length < `size`: append `size - length` spaces to the end of the string.
- [ ] Ensure special handling for `size == 0` (return empty string) and `size == 1` when truncation occurs (return "~").

## 3. Code Review
- [ ] Verify the function is public and documented with a doc comment.
- [ ] Ensure the requirement tag `/// Covers: [AC-TYP-028]` is present in the doc comment or test.
- [ ] Verify that no external dependencies (like `unicode-segmentation`) are used unless already present in the workspace, as char-based count is sufficient for this specific requirement.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib utils::string` and ensure all cases pass.

## 5. Update Documentation
- [ ] Ensure `crates/devs-core/src/lib.rs` exports the `utils` module and the `string` submodule.

## 6. Automated Verification
- [ ] Run `./do test` and confirm that `AC-TYP-028` is listed as covered in `target/traceability.json`.
