# Task: LogBuffer Tab Expansion (Sub-Epic: 092_Acceptance Criteria & Roadmap (Part 3))

## Covered Requirements
- [AC-ASCII-023]

## Dependencies
- depends_on: []
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] In `crates/devs-tui/src/log_tests.rs` (or `crates/devs-tui/src/log.rs` unit tests), implement `test_log_buffer_push_tab_expansion()`:
    - Create a `LogBuffer` instance.
    - Push `"ab\tcd"` and assert that the stored line content is exactly `"ab      cd"` (6 spaces). [AC-ASCII-023]
    - Note: The test assumes a tab width of 8, so `ab` (2 chars) + `\t` (6 spaces) = column 8.
- [ ] Add requirement annotation `// Verifies [AC-ASCII-023]` to this test.

## 2. Task Implementation
- [ ] Update the `LogBuffer::push()` method in `crates/devs-tui/src/log.rs` (or `state.rs`).
- [ ] Implement tab character (`\t`) expansion to spaces before storing the line.
- [ ] The expansion MUST use standard terminal tab-stop calculation (e.g., to the next multiple of 8 columns).
- [ ] Ensure that existing sanitization (removing `\r`, replacing `\0` with `\u{FFFD}`) remains intact and is applied correctly with tab expansion.

## 3. Code Review
- [ ] Verify that the tab expansion logic correctly calculates the number of spaces based on the current column position in the string (handling multiple tabs or tabs after other characters).
- [ ] Confirm that `devs_proto` types are not referenced in the `log.rs` module.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` to execute the unit tests.
- [ ] Ensure `test_log_buffer_push_tab_expansion` and existing normalization tests pass.

## 5. Update Documentation
- [ ] Record the implementation of tab expansion in `devs-tui` in `.agent/MEMORY.md`.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to confirm that [AC-ASCII-023] is correctly traced to the unit tests.
