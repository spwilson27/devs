# Task: Log Visualization & Tail Rendering (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-112], [7_UI_UX_DESIGN-REQ-124], [7_UI_UX_DESIGN-REQ-125], [7_UI_UX_DESIGN-REQ-136], [7_UI_UX_DESIGN-REQ-137], [7_UI_UX_DESIGN-REQ-138], [7_UI_UX_DESIGN-REQ-139], [7_UI_UX_DESIGN-REQ-171], [7_UI_UX_DESIGN-REQ-180], [7_UI_UX_DESIGN-REQ-181], [7_UI_UX_DESIGN-REQ-182], [7_UI_UX_DESIGN-REQ-183], [7_UI_UX_DESIGN-REQ-184], [7_UI_UX_DESIGN-REQ-235]

## Dependencies
- depends_on: ["04_ansi_stripping_and_log_buffer.md", "02_theme_and_color_mode_system.md"]
- shared_components: [devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/widgets/log_tail.rs` and `crates/devs-tui/src/tabs/logs_tab.rs` (empty). Create `crates/devs-tui/tests/log_viz_tests.rs`.
- [ ] Write `test_log_tail_renders_last_n_lines` — LogTail widget renders the last `visible_rows` lines from LogBuffer (REQ-124, REQ-235).
- [ ] Write `test_log_tail_stream_prefix` — each line prefixed with `[OUT]` or `[ERR]` sharing style with content (REQ-058, REQ-125).
- [ ] Write `test_log_tail_truncation_notice` — when `LogBuffer::truncated == true`, first visible line shows `"..logs truncated.."` (REQ-059, REQ-136).
- [ ] Write `test_log_tail_auto_scroll_on_new_line` — after `TuiEvent::LogLine`, tail scrolls to show newest entry (REQ-171).
- [ ] Write `test_logs_tab_full_stream` — Logs tab renders full scrollable log view for selected stage/run (REQ-137, REQ-180).
- [ ] Write `test_logs_tab_scroll_up_down` — arrow keys scroll through log history (REQ-138).
- [ ] Write `test_logs_tab_page_scroll` — PgUp/PgDn scroll by `max(1, visible_rows - 1)` lines (REQ-139).
- [ ] Write snapshot test `test_log_tail_snapshot_color` — render LogTail with test data using `ratatui::backend::TestBackend`, compare against golden snapshot (REQ-180, REQ-181).
- [ ] Write snapshot test `test_log_tail_snapshot_monochrome` — same with Monochrome theme (REQ-182).
- [ ] Write `test_logs_tab_snapshot` — snapshot of full Logs tab layout (REQ-183, REQ-184).
- [ ] Write `test_visible_rows_definition` — `visible_rows` is the pane height minus any header/border rows (REQ-235).
- [ ] Write `test_log_output_raw_content` — `devs logs` CLI output writes raw log line content to stdout (REQ-112).

## 2. Task Implementation
- [ ] Implement `LogTailWidget` in `widgets/log_tail.rs`:
  - Accepts `&LogBuffer`, `&Theme`, `visible_rows: u16`.
  - Renders last `visible_rows` lines with `[OUT]`/`[ERR]` prefix (REQ-124, REQ-125).
  - Shows `"..logs truncated.."` notice when buffer truncated (REQ-136).
  - Stream prefix shares style with line content (REQ-058).
  - Auto-scrolls to bottom on new content (REQ-171). No animation (REQ-234 from task 04).
- [ ] Implement `LogsTab` in `tabs/logs_tab.rs`:
  - Full scrollable log view (REQ-137, REQ-180).
  - Keyboard scroll: arrows for line-by-line, PgUp/PgDn for page scroll (REQ-138, REQ-139).
  - `visible_rows` = pane height minus header rows (REQ-235).
- [ ] Widget `render()` accepts `&self` (immutable) and `&Theme` reference.

## 3. Code Review
- [ ] Verify LogTailWidget does no I/O or blocking in render().
- [ ] Verify stream prefix style matches content style (not independently styled).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib widgets::log_tail --lib tabs::logs_tab` and `cargo test -p devs-tui --test log_viz_tests`.

## 5. Update Documentation
- [ ] Document LogTail and LogsTab widget APIs.

## 6. Automated Verification
- [ ] Run `./do test` and confirm snapshot tests match golden files.
