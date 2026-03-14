# Task: Layout System and Terminal Size Constraints (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-039], [6_UI_UX_ARCHITECTURE-REQ-040], [6_UI_UX_ARCHITECTURE-REQ-041], [6_UI_UX_ARCHITECTURE-REQ-302], [6_UI_UX_ARCHITECTURE-REQ-303], [6_UI_UX_ARCHITECTURE-REQ-304], [6_UI_UX_ARCHITECTURE-REQ-305], [6_UI_UX_ARCHITECTURE-REQ-306], [6_UI_UX_ARCHITECTURE-REQ-307], [6_UI_UX_ARCHITECTURE-REQ-308], [6_UI_UX_ARCHITECTURE-REQ-309], [6_UI_UX_ARCHITECTURE-REQ-310], [6_UI_UX_ARCHITECTURE-REQ-311], [6_UI_UX_ARCHITECTURE-REQ-312], [6_UI_UX_ARCHITECTURE-REQ-313], [6_UI_UX_ARCHITECTURE-REQ-314], [6_UI_UX_ARCHITECTURE-REQ-315], [6_UI_UX_ARCHITECTURE-REQ-340], [6_UI_UX_ARCHITECTURE-REQ-341], [6_UI_UX_ARCHITECTURE-REQ-342], [6_UI_UX_ARCHITECTURE-REQ-343], [6_UI_UX_ARCHITECTURE-REQ-344], [6_UI_UX_ARCHITECTURE-REQ-345], [6_UI_UX_ARCHITECTURE-REQ-346], [6_UI_UX_ARCHITECTURE-REQ-347], [6_UI_UX_ARCHITECTURE-REQ-348], [6_UI_UX_ARCHITECTURE-REQ-349], [6_UI_UX_ARCHITECTURE-REQ-350]

## Dependencies
- depends_on: [01_tui_crate_scaffold_and_event_loop.md, 05_tab_navigation_and_status_bar.md]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Write snapshot test for minimum terminal size check: render at 79×23 and verify the centered message `"Terminal too small: 80x24 minimum required (current: 79x23)"` (REQ-041, REQ-303)
- [ ] Write snapshot test for exactly 80×24: verify normal layout renders without error message (REQ-303)
- [ ] Write test that `TuiEvent::Resize(w, h)` updates `AppState.terminal_size` immediately, no deferred layout (REQ-304)
- [ ] Write snapshot test for top-level layout: StatusBar (1 row bottom) + ActiveTab (center fill) (REQ-302)
- [ ] Write snapshot test for DashboardTab layout: RunList left pane (42 columns) | RunDetail right pane (remaining) (REQ-305)
- [ ] Write snapshot test for LogsTab layout: StageSelector (top, 3 rows) over LogPane (bottom fill) (REQ-306)
- [ ] Write snapshot test for PoolsTab layout: single scrollable list filling the tab area (REQ-308)
- [ ] Write test that when terminal width < 42 + 24 + 1 columns, the detail pane is hidden on DashboardTab (REQ-315)
- [ ] Write test for DAG tier gutter width: 5 characters ` ──► ` between tier columns (REQ-312)
- [ ] Write test for DAG stage box width: exactly 41 characters (REQ-310)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/layout.rs` with layout computation functions
- [ ] Implement `check_minimum_size(w: u16, h: u16) -> bool` returning false if below 80×24 (REQ-041, REQ-303)
- [ ] Implement `render_too_small_message(frame: &mut Frame, w: u16, h: u16)` rendering centered error text (REQ-303)
- [ ] Implement top-level layout in `render()`: split vertical into ActiveTab (fill) and StatusBar (1 row at bottom) (REQ-302)
- [ ] Implement DashboardTab layout: horizontal split — left pane 42 columns for RunList, right pane remaining width for RunDetail (REQ-305)
- [ ] Implement LogsTab layout: vertical split — top 3 rows for StageSelector, bottom fill for LogPane (REQ-306)
- [ ] Implement DebugTab layout: three vertical sections (REQ-307)
- [ ] Implement PoolsTab layout: single scrollable list (REQ-308)
- [ ] Implement detail pane hiding: when terminal width < 67 columns (42 + 24 + 1), DashboardTab shows only RunList (REQ-315)
- [ ] Handle resize events: update `terminal_size` immediately and trigger re-render (REQ-304)
- [ ] Define DAG layout constants: stage box width = 41, tier gutter = 5 chars (REQ-310, REQ-312)

## 3. Code Review
- [ ] Verify minimum size check is performed every render cycle (REQ-303)
- [ ] Verify layout constants match spec exactly (REQ-310, REQ-312)
- [ ] Verify resize is immediate, not deferred (REQ-304)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- layout`

## 5. Update Documentation
- [ ] Add doc comments to layout module and all constants

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
