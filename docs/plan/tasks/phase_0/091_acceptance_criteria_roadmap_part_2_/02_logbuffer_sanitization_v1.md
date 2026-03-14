# Task: LogBuffer CRLF and NUL Byte Sanitization (Sub-Epic: 091_Acceptance Criteria & Roadmap (Part 2))

## Covered Requirements
- [AC-ASCII-021], [AC-ASCII-022]

## Dependencies
- depends_on: []
- shared_components: [devs-core (Domain Types & Invariants)]

## 1. Initial Test Written
- [ ] Create or extend the test module in the crate where `LogBuffer` will live (e.g., `crates/devs-tui/src/log_buffer.rs` or `crates/devs-tui/src/log_buffer/tests.rs`). If the `LogBuffer` struct does not yet exist, create a stub struct with a `push(&mut self, line: &str)` method that stores lines in a `Vec<String>` — just enough to compile the tests.
- [ ] Write test `test_push_strips_carriage_return_from_crlf`:
  ```rust
  // Covers: AC-ASCII-021
  #[test]
  fn test_push_strips_carriage_return_from_crlf() {
      let mut buf = LogBuffer::new(100);
      buf.push("text\r\n");
      assert_eq!(buf.lines().last().unwrap().content(), "text");
  }
  ```
- [ ] Write test `test_push_replaces_nul_with_replacement_char`:
  ```rust
  // Covers: AC-ASCII-022
  #[test]
  fn test_push_replaces_nul_with_replacement_char() {
      let mut buf = LogBuffer::new(100);
      buf.push("ab\0cd");
      assert_eq!(buf.lines().last().unwrap().content(), "ab\u{FFFD}cd");
  }
  ```
- [ ] Write edge-case tests to ensure robustness:
  - `test_push_strips_lone_cr`: push `"hello\rworld"` — assert stored as `"helloworld"` (strip all `\r`, not just `\r\n` pairs).
  - `test_push_multiple_nuls`: push `"\0\0\0"` — assert stored as `"\u{FFFD}\u{FFFD}\u{FFFD}"`.
  - `test_push_combined_cr_and_nul`: push `"a\r\n\0b"` — assert stored as `"a\u{FFFD}b"`.
  - `test_push_empty_string`: push `""` — assert stored line content is `""`.
- [ ] Annotate each test with `// Covers: AC-ASCII-021` or `// Covers: AC-ASCII-022` as appropriate.

## 2. Task Implementation
- [ ] Define `LogBuffer` struct (if not already present) with:
  - `lines: VecDeque<LogLine>` — ring buffer of stored lines.
  - `capacity: usize` — maximum number of lines before oldest is evicted.
- [ ] Define `LogLine` struct with at minimum a `content: String` field and a `content(&self) -> &str` accessor.
- [ ] Implement `LogBuffer::new(capacity: usize) -> Self`.
- [ ] Implement `LogBuffer::push(&mut self, line: &str)`:
  1. Strip all `\r` characters from the input: `let sanitized = line.replace('\r', "");` — this handles both `\r\n` (AC-ASCII-021) and lone `\r`.
  2. Strip trailing `\n` if present (the push boundary is one logical line).
  3. Replace all NUL bytes: `let sanitized = sanitized.replace('\0', "\u{FFFD}");` — satisfies AC-ASCII-022.
  4. Wrap in `LogLine` and append to `lines`. If `lines.len() > capacity`, pop front.
- [ ] Implement `LogBuffer::lines(&self) -> &VecDeque<LogLine>` accessor for test assertions.
- [ ] Ensure `LogBuffer` does NOT depend on any `devs-proto` types.

## 3. Code Review
- [ ] Verify sanitization handles `\r` at start, middle, and end of string.
- [ ] Verify NUL replacement uses exactly U+FFFD (Unicode replacement character), not some other placeholder.
- [ ] Confirm `LogBuffer` has no dependency on `devs-proto` or wire types (architectural boundary).
- [ ] Confirm the ring-buffer eviction logic is correct: oldest line is dropped when capacity is exceeded.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- log_buffer` (or the appropriate test filter) and confirm all tests pass.
- [ ] Run `cargo test -p devs-tui` to ensure no regressions in the broader crate.

## 5. Update Documentation
- [ ] Add doc comments to `LogBuffer::push()` explaining the sanitization contract: `\r` is stripped, `\0` is replaced with `\u{FFFD}`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui -- log_buffer 2>&1 | grep -c 'test result: ok'` and confirm output is `1` (all tests in the module passed).
- [ ] Run `grep -c 'AC-ASCII-021\|AC-ASCII-022' crates/devs-tui/src/log_buffer.rs` (or the actual file path) and confirm count >= 2, proving requirement traceability annotations exist.
