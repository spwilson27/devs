# Task: LogBuffer Sanitization (Part 1) (Sub-Epic: 091_Acceptance Criteria & Roadmap (Part 2))

## Covered Requirements
- [AC-ASCII-021], [AC-ASCII-022]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a new unit test file `crates/devs-tui/src/log_tests.rs` (or similar).
- [ ] Implement a test function `test_log_buffer_push_normalization()`:
    - Create a `LogBuffer` instance.
    - Push `"line1\r\n"` and assert that the stored line content is `"line1"` (no `\r`). [AC-ASCII-021]
- [ ] Implement a test function `test_log_buffer_push_nul_replacement()`:
    - Create a `LogBuffer` instance.
    - Push `"ab\0cd"` and assert that the stored line content is `"ab\u{FFFD}cd"`. [AC-ASCII-022]
- [ ] Add requirement annotations `// Verifies [AC-ASCII-021]` and `// Verifies [AC-ASCII-022]` to these tests.

## 2. Task Implementation
- [ ] Define the `LogBuffer` struct in `crates/devs-tui/src/log.rs` (or `state.rs`) if it doesn't already exist.
- [ ] Implement the `push()` method for `LogBuffer`.
- [ ] Inside `push()`:
    - Normalize the incoming string by removing or replacing `\r` (carriage return) characters when they are part of a `\r\n` sequence. For [AC-ASCII-021], simply stripping `\r` before storage is required.
    - Replace any NUL bytes (`\0`) in the incoming string with the Unicode replacement character `\u{FFFD}`. [AC-ASCII-022]
- [ ] Ensure that the sanitized string is then stored in the internal line buffer.

## 3. Code Review
- [ ] Verify that the sanitization logic is efficient and correctly handles cases where `\r` or `\0` appear at the beginning, middle, or end of a string.
- [ ] Ensure that the `LogBuffer` follows the ring-buffer logic if already defined (evicting oldest lines when at capacity).
- [ ] Check that `devs_proto` types are NOT referenced in this module as per `6_UI_UX_ARCHITECTURE-REQ-093`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` to execute the new unit tests.
- [ ] Ensure all tests pass.

## 5. Update Documentation
- [ ] Update `crates/devs-tui/README.md` (if it exists) to note the `LogBuffer` sanitization behavior.
- [ ] Update `.agent/MEMORY.md` to record the completion of `LogBuffer` sanitization logic.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to confirm that [AC-ASCII-021] and [AC-ASCII-022] are correctly traced to the unit tests.
