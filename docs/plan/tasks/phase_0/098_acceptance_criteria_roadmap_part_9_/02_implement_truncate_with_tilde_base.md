# Task: Implement `truncate_with_tilde` Utility Base (Sub-Epic: 098_Acceptance Criteria & Roadmap (Part 9))

## Covered Requirements
- [AC-TYP-007]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Add unit tests for `truncate_with_tilde(s: &str, max_len: usize) -> String` to `crates/devs-tui/src/render_utils.rs`.
- [ ] Write a test for the empty string case:
  - `truncate_with_tilde("", 20)` returns a string of length 20 consisting entirely of spaces. [AC-TYP-007]
- [ ] Ensure the test is annotated with `// Covers: AC-TYP-007`.

## 2. Task Implementation
- [ ] Implement `truncate_with_tilde` in `crates/devs-tui/src/render_utils.rs` according to the specification in §3.5 of `7_UI_UX_DESIGN.md`.
- [ ] Logic:
  - If the character count of `s` (using `.chars().count()`) is less than or equal to `max_len`:
    - Return `s` right-padded with spaces to reach `max_len` (e.g., `format!("{s:<max_len$}")`).
  - Otherwise:
    - Take the first `max_len - 1` characters.
    - Append `~`.
    - Return the resulting string.
- [ ] Add `debug_assert!(max_len > 0, "max_len must be at least 1")`.

## 3. Code Review
- [ ] Verify that `truncate_with_tilde` works with multi-byte characters correctly (using `.chars().count()` and `.chars().take()`).
- [ ] Confirm that the empty string input with `max_len = 20` correctly produces exactly 20 spaces.
- [ ] Ensure that no heap allocation occurs beyond what is required for the new `String`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib render_utils::tests` and ensure the `AC-TYP-007` test case passes.

## 5. Update Documentation
- [ ] Add doc comments to `truncate_with_tilde` explaining its behavior and its role in terminal layout (e.g., for the DAG view and stage boxes).

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no warnings or errors are introduced.
- [ ] Verify requirement-to-test traceability using `.tools/verify_requirements.py`.
