# Task: LogPane Widget with Ring Buffer and ANSI Stripping (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-054], [6_UI_UX_ARCHITECTURE-REQ-066], [6_UI_UX_ARCHITECTURE-REQ-067], [6_UI_UX_ARCHITECTURE-REQ-171], [6_UI_UX_ARCHITECTURE-REQ-172], [6_UI_UX_ARCHITECTURE-REQ-173], [6_UI_UX_ARCHITECTURE-REQ-174], [6_UI_UX_ARCHITECTURE-REQ-175], [6_UI_UX_ARCHITECTURE-REQ-176], [6_UI_UX_ARCHITECTURE-REQ-177], [6_UI_UX_ARCHITECTURE-REQ-178], [6_UI_UX_ARCHITECTURE-REQ-179], [6_UI_UX_ARCHITECTURE-REQ-180], [6_UI_UX_ARCHITECTURE-REQ-337], [6_UI_UX_ARCHITECTURE-REQ-366], [6_UI_UX_ARCHITECTURE-REQ-367], [6_UI_UX_ARCHITECTURE-REQ-368], [6_UI_UX_ARCHITECTURE-REQ-369], [6_UI_UX_ARCHITECTURE-REQ-370]

## Dependencies
- depends_on: [02_app_state_and_state_management.md, 07_string_constants_and_styling.md]
- shared_components: [devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write test for ANSI stripping 3-state machine: `Normal → Escape (on ESC) → CSI (on [)` removing `ESC[...m` sequences and all CSI codes (REQ-066)
- [ ] Write test: input `"\x1b[31mhello\x1b[0m world"` strips to `"hello world"` (REQ-066)
- [ ] Write test: input with nested/malformed ANSI codes is handled gracefully without panic (REQ-067)
- [ ] Write test for `LogLine.raw_content` preserving original unstripped content (REQ-067)
- [ ] Write test for LogPane ring buffer: max 10,000 lines, FIFO eviction (REQ-054)
- [ ] Write snapshot test for LogPane rendering with 20 lines of log content (REQ-171)
- [ ] Write test for log scroll: `PageUp`/`PageDown` scroll by page, `Home`/`End` jump to top/bottom (REQ-172)
- [ ] Write test for auto-scroll: when at bottom, new lines auto-scroll; when scrolled up, auto-scroll is disabled (REQ-173)
- [ ] Write test for `\r\n` → `\n` line ending normalization (REQ-337)
- [ ] Write test for empty LogPane showing placeholder message (REQ-174)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/widgets/log_pane.rs` implementing `ratatui::widgets::Widget`
- [ ] Implement `AnsiStripper` as a 3-state machine: `Normal`, `Escape`, `Csi` — strips `ESC[...m` and all CSI sequences (REQ-066)
- [ ] Implement `LogLine` struct with `stripped_content: String` and `raw_content: String` fields (REQ-067)
- [ ] Implement LogPane with ring buffer backing (delegates to `LogBuffer` from state module) (REQ-054)
- [ ] Implement scroll state: `scroll_offset`, auto-scroll tracking (at_bottom flag) (REQ-173)
- [ ] Implement keyboard handlers: `PageUp`/`PageDown` scroll by visible height, `Home` → offset 0, `End` → offset max (REQ-172)
- [ ] Implement `\r\n` → `\n` normalization on incoming log lines (REQ-337)
- [ ] Render visible window of log lines based on scroll offset and pane height (REQ-171)
- [ ] Show line numbers in left gutter (optional, configurable)
- [ ] Render placeholder for empty state (REQ-174)

## 3. Code Review
- [ ] Verify ANSI stripper handles all CSI codes, not just color codes (REQ-066)
- [ ] Verify raw_content is preserved separately from stripped (REQ-067)
- [ ] Verify ring buffer capacity is 10,000 (REQ-054)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- log_pane` and `cargo test -p devs-tui -- ansi`

## 5. Update Documentation
- [ ] Add doc comments to LogPane, AnsiStripper, LogLine

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
