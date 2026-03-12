# Task: TUI Log Visualization (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-124], [7_UI_UX_DESIGN-REQ-125], [7_UI_UX_DESIGN-REQ-136], [7_UI_UX_DESIGN-REQ-137], [7_UI_UX_DESIGN-REQ-138], [7_UI_UX_DESIGN-REQ-139], [7_UI_UX_DESIGN-REQ-180], [7_UI_UX_DESIGN-REQ-181], [7_UI_UX_DESIGN-REQ-182], [7_UI_UX_DESIGN-REQ-183], [7_UI_UX_DESIGN-REQ-184]

## Dependencies
- depends_on: [03_tui_log_management.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create TUI integration tests using `TestBackend` to verify:
    - `LogTail` widget (Dashboard) renders the last N visible lines from `LogBuffer`.
    - `LogPane` widget (Logs tab) renders the full-height log buffer starting at the scroll offset.
    - `LogPane` shows the "truncated" notice when `LogBuffer::is_truncated()` is true.
    - Vertical scrolling of `LogPane` with `Up/Down` and `PageUp/PageDown` keys.
    - Log line styles (yellow for stderr, default for stdout).

## 2. Task Implementation
- [ ] Implement `LogTail` widget (used in the bottom pane of the Dashboard).
- [ ] Implement `LogPane` widget (used in the Logs tab).
- [ ] Implement scroll state management in `AppState::log_scroll_offset`.
- [ ] Implement key handlers for log scrolling when the Logs tab is active.
- [ ] Ensure `LogTail` always displays the *end* of the buffer (live tailing), while `LogPane` maintains its scroll position.

## 3. Code Review
- [ ] Verify that `LogTail` correctly handles cases where the buffer has fewer lines than the available space.
- [ ] Confirm the scrolling is bounded: `log_scroll_offset` cannot go past the end or start of the buffer.
- [ ] Verify that the `truncated` notice uses the correct theme style.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-tui -- widgets::log`

## 5. Update Documentation
- [ ] Update the TUI interaction guide with log scrolling shortcuts.

## 6. Automated Verification
- [ ] Render a mock log buffer with 50 lines into a 10-row `TestBackend` and verify that `LogTail` shows lines 41-50.
