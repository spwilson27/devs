# Task: TUI LogLine ANSI Stripping — raw_content to content (Sub-Epic: 094_Acceptance Criteria & Roadmap (Part 5))

## Covered Requirements
- [AC-LOG-005]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui (owner of LogLine type)]

## 1. Initial Test Written
- [ ] In `crates/devs-tui/src/logs.rs` (or `crates/devs-tui/tests/log_line.rs`), write a unit test `test_log_line_strips_ansi_csi_sequences` that:
  1. Constructs a `LogLine` with `raw_content = "\x1b[32m[INFO]\x1b[0m server started on port 8080"`.
  2. Asserts `log_line.content == "[INFO] server started on port 8080"`.
- [ ] Write a test `test_log_line_strips_bold_and_underline` that:
  1. Constructs a `LogLine` with `raw_content = "\x1b[1mBOLD\x1b[0m \x1b[4mUNDER\x1b[0m plain"`.
  2. Asserts `log_line.content == "BOLD UNDER plain"`.
- [ ] Write a test `test_log_line_strips_256_color_codes` that:
  1. Uses `raw_content = "\x1b[38;5;196mred text\x1b[0m"`.
  2. Asserts `log_line.content == "red text"`.
- [ ] Write a test `test_log_line_handles_no_ansi` that:
  1. Uses `raw_content = "plain text with no escapes"`.
  2. Asserts `log_line.content == "plain text with no escapes"`.
- [ ] Write a test `test_log_line_handles_empty_string` that:
  1. Uses `raw_content = ""`.
  2. Asserts `log_line.content == ""`.
- [ ] Write a test `test_log_line_handles_partial_escape` that:
  1. Uses `raw_content = "\x1b[incomplete"` (malformed CSI).
  2. Asserts the function does not panic and produces a reasonable stripped result.
- [ ] Add `// Covers: AC-LOG-005` to each test.

## 2. Task Implementation
- [ ] Define the `LogLine` struct in `crates/devs-tui/src/logs.rs`:
  ```rust
  pub struct LogLine {
      pub raw_content: String,
      pub content: String,
      pub source: LogSource,
      pub timestamp: Option<DateTime<Utc>>,
  }

  pub enum LogSource {
      Stdout,
      Stderr,
  }
  ```
- [ ] Implement `LogLine::new(raw_content: String, source: LogSource) -> Self` that:
  1. Strips all ANSI CSI sequences (pattern: `\x1b\[[0-9;]*[A-Za-z]`) from `raw_content` to produce `content`.
  2. Use the `strip-ansi-escapes` crate (or a minimal regex via the existing `regex` dependency) — choose whichever is already in the workspace `Cargo.toml` or has fewer transitive deps.
- [ ] Ensure both `raw_content` (for future color-aware rendering) and `content` (for searching, truncation, width calculation) are stored.

## 3. Code Review
- [ ] Verify the stripping regex/function handles all SGR (Select Graphic Rendition) sequences, not just simple color codes.
- [ ] Verify no `unwrap()` or `expect()` in the stripping path — malformed ANSI must not panic.
- [ ] Confirm `LogLine` derives `Debug` and `Clone`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- log_line` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `LogLine` and `LogLine::new` explaining the stripping behavior.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-LOG-005] as covered.
- [ ] Run `./do lint` and confirm zero warnings.
