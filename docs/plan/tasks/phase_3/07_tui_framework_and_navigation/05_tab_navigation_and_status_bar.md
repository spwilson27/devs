# Task: Tab Navigation and StatusBar Widget (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [2_TAS-REQ-056], [6_UI_UX_ARCHITECTURE-REQ-055], [6_UI_UX_ARCHITECTURE-REQ-056], [6_UI_UX_ARCHITECTURE-REQ-210], [6_UI_UX_ARCHITECTURE-REQ-211], [6_UI_UX_ARCHITECTURE-REQ-212], [6_UI_UX_ARCHITECTURE-REQ-213], [6_UI_UX_ARCHITECTURE-REQ-214], [6_UI_UX_ARCHITECTURE-REQ-215], [6_UI_UX_ARCHITECTURE-REQ-216], [6_UI_UX_ARCHITECTURE-REQ-217], [6_UI_UX_ARCHITECTURE-REQ-218], [6_UI_UX_ARCHITECTURE-REQ-219], [6_UI_UX_ARCHITECTURE-REQ-220], [6_UI_UX_ARCHITECTURE-REQ-244], [6_UI_UX_ARCHITECTURE-REQ-245], [6_UI_UX_ARCHITECTURE-REQ-250], [6_UI_UX_ARCHITECTURE-REQ-251], [6_UI_UX_ARCHITECTURE-REQ-252], [6_UI_UX_ARCHITECTURE-REQ-253], [6_UI_UX_ARCHITECTURE-REQ-254], [6_UI_UX_ARCHITECTURE-REQ-255], [6_UI_UX_ARCHITECTURE-REQ-301]

## Dependencies
- depends_on: [01_tui_crate_scaffold_and_event_loop.md, 02_app_state_and_state_management.md]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Write test that four tabs exist: Dashboard, Logs, Debug, Pools (REQ-210, 2_TAS-REQ-056)
- [ ] Write test that keys `1`, `2`, `3`, `4` switch to Dashboard, Logs, Debug, Pools respectively (REQ-211)
- [ ] Write test that `Tab` key cycles through tabs in order (REQ-211)
- [ ] Write test that `?` toggles HelpOverlay visibility, and any subsequent key dismisses it (REQ-055, REQ-220)
- [ ] Write test that `q` triggers `TuiEvent::Quit` (REQ-219)
- [ ] Write test that `Esc` deselects current run and returns to RunList (REQ-245)
- [ ] Write snapshot test for StatusBar rendering: shows connection status, server address, active run count (REQ-056, REQ-250)
- [ ] Write test that StatusBar truncates error messages from right with trailing `~` if they exceed available width (REQ-301)
- [ ] Write test that run control keys (`c`/`p`/`r`) are only active on Dashboard or Debug tabs (REQ-218)
- [ ] Write snapshot test for HelpOverlay showing all keybinding descriptions

## 2. Task Implementation
- [ ] Implement tab switching in `handle_event()`: `Key('1')` → Dashboard, `Key('2')` → Logs, `Key('3')` → Debug, `Key('4')` → Pools, `Key(Tab)` → next tab wrapping (REQ-211)
- [ ] Implement `StatusBar` widget in `crates/devs-tui/src/widgets/status_bar.rs` implementing `ratatui::widgets::Widget`. Renders: connection status (`CONNECTED`/`RECONNECTING`/`DISCONNECTED`), server address, active run count in bottom row (REQ-056, REQ-250)
- [ ] Implement StatusBar truncation: if content exceeds width, truncate from right with `~` suffix (REQ-301)
- [ ] Implement `HelpOverlay` widget in `crates/devs-tui/src/widgets/help_overlay.rs`: modal overlay showing keybinding table, triggered by `?`, dismissed by any keypress (REQ-055, REQ-220)
- [ ] Implement `q` key handler emitting Quit event (REQ-219)
- [ ] Implement `Esc` handler: clear `selected_run_id` and `selected_stage_name`, return focus to RunList (REQ-245)
- [ ] Implement run control key guard: `c` (cancel), `p` (pause), `r` (resume) only processed when `active_tab` is Dashboard or Debug (REQ-218)
- [ ] Wire tab indicator rendering in the top area showing active tab highlighted

## 3. Code Review
- [ ] Verify all four tabs are reachable via both direct key and Tab cycling (REQ-211)
- [ ] Verify HelpOverlay dismisses on any keypress, not just specific keys (REQ-220)
- [ ] Verify run control keys are guarded by tab check (REQ-218)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- tab` and `cargo test -p devs-tui -- status_bar` and `cargo test -p devs-tui -- help`

## 5. Update Documentation
- [ ] Add doc comments to StatusBar, HelpOverlay widgets

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
