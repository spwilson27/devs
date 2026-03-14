# Task: Implement `format_elapsed` Utility (Sub-Epic: 098_Acceptance Criteria & Roadmap (Part 9))

## Covered Requirements
- [AC-TYP-003], [AC-TYP-004], [AC-TYP-005], [AC-TYP-006]

## Dependencies
- depends_on: []
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/render_utils.rs` (if it doesn't exist) and add a `#[cfg(test)]` module.
- [ ] Write unit tests for `format_elapsed(elapsed_ms: Option<u64>) -> String` verifying the following cases:
  - `format_elapsed(None)` returns `"--:--"`. [AC-TYP-003]
  - `format_elapsed(Some(0))` returns a string of length 5 where the first 4 characters are `"0:00"` (e.g., `"0:00 "`). [AC-TYP-004]
  - `format_elapsed(Some(600_000))` returns `"10:00"` (exactly 5 characters). [AC-TYP-005]
  - `format_elapsed(Some(599_000))` returns a string of length 5 where the first 4 characters are `"9:59"` (e.g., `"9:59 "`). [AC-TYP-006]
- [ ] Ensure tests are annotated with `// Covers: AC-TYP-003`, etc.

## 2. Task Implementation
- [ ] Implement `format_elapsed` in `crates/devs-tui/src/render_utils.rs` following the specification in §3.4 of `7_UI_UX_DESIGN.md`.
- [ ] Use `Option<u64>` for the input representing milliseconds.
- [ ] Logic:
  - Match `None` -> return `"--:--"`.
  - Match `Some(ms)`:
    - `total_secs = ms / 1000`.
    - `m = total_secs / 60`.
    - `s = total_secs % 60`.
    - Format as `"{m}:{s:02}"`.
    - Right-pad with spaces to reach exactly 5 characters if the result is shorter (e.g., using `format!("{:<5}", ...)` or the specified `format!("{m}:{s:02:<5$}", 5)`).
- [ ] Add necessary imports (none should be required beyond `std` and `ratatui` types if needed, but this is pure string formatting).

## 3. Code Review
- [ ] Verify that the function is pure and never panics.
- [ ] Confirm that `0:00` is right-padded to 5 characters as `"0:00 "`.
- [ ] Ensure that `10:00` is exactly 5 characters and does not get extra padding.
- [ ] Check for `u64` overflow safety (division by 1000 and 60 is safe).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib render_utils::tests` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `format_elapsed` explaining its behavior and the 5-character width invariant (except for durations >= 100 minutes).

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no warnings or errors are introduced.
- [ ] Verify requirement-to-test traceability using `.tools/verify_requirements.py`.
