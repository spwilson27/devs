# Task: Logs Tab with Stage Selector and Full Log View (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-196], [6_UI_UX_ARCHITECTURE-REQ-197], [6_UI_UX_ARCHITECTURE-REQ-198], [6_UI_UX_ARCHITECTURE-REQ-199], [6_UI_UX_ARCHITECTURE-REQ-200], [6_UI_UX_ARCHITECTURE-REQ-201], [6_UI_UX_ARCHITECTURE-REQ-202], [6_UI_UX_ARCHITECTURE-REQ-203], [6_UI_UX_ARCHITECTURE-REQ-204], [6_UI_UX_ARCHITECTURE-REQ-205], [6_UI_UX_ARCHITECTURE-REQ-376], [6_UI_UX_ARCHITECTURE-REQ-377], [6_UI_UX_ARCHITECTURE-REQ-378], [6_UI_UX_ARCHITECTURE-REQ-379], [6_UI_UX_ARCHITECTURE-REQ-380]

## Dependencies
- depends_on: [06_layout_system_and_terminal_constraints.md, 11_log_pane_and_ansi_stripping.md]
- shared_components: [devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write snapshot test for LogsTab layout: StageSelector (top, 3 rows) over LogPane (bottom fill) (REQ-196, REQ-306)
- [ ] Write test that StageSelector shows list of stages for the selected run, navigable with arrow keys (REQ-197)
- [ ] Write test that selecting a stage in StageSelector switches LogPane to that stage's log buffer (REQ-198)
- [ ] Write test for full log stream display with scrolling (REQ-199)
- [ ] Write snapshot test for LogsTab with no run selected: shows "Select a run first" message (REQ-200)
- [ ] Write test that switching stages preserves scroll position per-stage via `log_scroll_offset` HashMap (REQ-201)
- [ ] Write test for live log streaming: new lines appear at bottom when auto-scroll is active (REQ-202)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/tabs/logs.rs` implementing `LogsTab` as a Widget
- [ ] Implement StageSelector: horizontal or vertical list of stage names for the selected run (REQ-197)
- [ ] Wire stage selection to switch LogPane's backing buffer (REQ-198)
- [ ] Implement per-stage scroll offset persistence in `AppState.log_scroll_offset` (REQ-201)
- [ ] Implement live streaming integration: new `GrpcRunEvent` log chunks appended to LogBuffer, auto-scroll if at bottom (REQ-202)
- [ ] Render placeholder when no run selected (REQ-200)
- [ ] Layout: StageSelector 3 rows top, LogPane fills remaining (REQ-306)

## 3. Code Review
- [ ] Verify per-stage scroll offsets are independent (REQ-201)
- [ ] Verify LogPane reuses the shared widget, not a copy (REQ-088)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- logs_tab`

## 5. Update Documentation
- [ ] Add doc comments to LogsTab and StageSelector

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
