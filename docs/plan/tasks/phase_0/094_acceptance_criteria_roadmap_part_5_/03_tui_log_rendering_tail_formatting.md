# Task: TUI LogTail Rendering and Stream Source Prefixes (Sub-Epic: 094_Acceptance Criteria & Roadmap (Part 5))

## Covered Requirements
- [AC-LOG-006], [AC-LOG-007]

## Dependencies
- depends_on: ["02_tui_log_processing_ansi_stripping.md"]
- shared_components: [devs-tui (owner of LogPane, LogTail, LogLine)]

## 1. Initial Test Written
- [ ] In `crates/devs-tui/tests/log_pane.rs` (or `src/logs.rs` test module), write an `insta` snapshot test `test_log_tail_shows_last_n_lines` that:
  1. Creates a `ratatui::backend::TestBackend` with dimensions 200×50.
  2. Creates a `LogBuffer` containing 100 `LogLine` entries (more than 50 visible lines), each with content `"line {i}"` and alternating `LogSource::Stdout` / `LogSource::Stderr`.
  3. Renders `LogPane` into the `TestBackend`.
  4. Calls `insta::assert_snapshot!("logs__buffered", buffer_to_string(&backend))`.
  5. Asserts that the rendered output contains lines 51–100 (the last 50) and does NOT contain lines 1–50.
- [ ] In the same snapshot, verify [AC-LOG-007]: each rendered line is prefixed with `[stdout] ` or `[stderr] ` matching the `LogSource` of the corresponding `LogLine`.
- [ ] Write a test `test_log_tail_empty_buffer` that:
  1. Renders `LogPane` with an empty `LogBuffer` into a 200×50 `TestBackend`.
  2. Asserts the pane renders without panic and shows no log lines.
- [ ] Write a test `test_log_tail_fewer_lines_than_height` that:
  1. Inserts 10 `LogLine` entries into a buffer.
  2. Renders into a 200×50 `TestBackend`.
  3. Asserts all 10 lines are visible and positioned at the bottom (tail behavior) or top, per spec.
- [ ] Write a test `test_log_pane_stdout_prefix` that:
  1. Inserts a single `LogLine` with `source: LogSource::Stdout` and `content: "hello"`.
  2. Renders and asserts the output contains `[stdout] hello`.
- [ ] Write a test `test_log_pane_stderr_prefix` that:
  1. Inserts a single `LogLine` with `source: LogSource::Stderr` and `content: "error msg"`.
  2. Renders and asserts the output contains `[stderr] error msg`.
- [ ] Add `// Covers: AC-LOG-006` to tail-behavior tests and `// Covers: AC-LOG-007` to prefix tests.

## 2. Task Implementation
- [ ] Implement `LogBuffer` as a `VecDeque<LogLine>` (or `Vec<LogLine>`) with an `append(&mut self, line: LogLine)` method.
- [ ] Implement `LogTail` logic: given a `LogBuffer` and a visible height `h`, return a slice of the last `h` lines. If the buffer has fewer than `h` lines, return all of them.
- [ ] Implement `LogPane` as a `ratatui::widgets::StatefulWidget` (or a render function) that:
  1. Computes the visible pane height from the `Rect` area.
  2. Calls `LogTail` to get the visible slice.
  3. For each `LogLine` in the slice, renders the line as `[{source}] {content}` where `{source}` is `stdout` or `stderr`.
  4. The prefix `[stdout] ` and `[stderr] ` are literal strings — 9 and 9 characters respectively (including trailing space).
- [ ] Ensure the tail follows the bottom of the buffer by default (auto-scroll). If the user has scrolled up (via `↑`/`k`), the tail position is frozen until the user scrolls back to the bottom.

## 3. Code Review
- [ ] Verify `LogTail` correctly handles edge cases: empty buffer, buffer length == height, buffer length == height - 1.
- [ ] Verify `[stdout] ` / `[stderr] ` prefixes do not interact with ANSI stripping (they are added after stripping, at render time).
- [ ] Verify the snapshot name is exactly `logs__buffered` as specified in [AC-LOG-006] and [AC-LOG-007].
- [ ] Confirm no off-by-one in visible line count (pane height may need to subtract border/header rows if the pane has a border).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- log_pane` and confirm all tests pass.
- [ ] Run `cargo insta review` and approve the `logs__buffered` snapshot after visual inspection.

## 5. Update Documentation
- [ ] Add doc comments to `LogPane`, `LogTail`, and `LogBuffer` describing the tail and prefix behavior.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-LOG-006] and [AC-LOG-007] as covered.
- [ ] Run `./do lint` and confirm zero warnings.
