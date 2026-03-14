# Task: Keyboard Input Handling and Focus Management (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [2_TAS-REQ-058], [6_UI_UX_ARCHITECTURE-REQ-281], [6_UI_UX_ARCHITECTURE-REQ-282], [6_UI_UX_ARCHITECTURE-REQ-283], [6_UI_UX_ARCHITECTURE-REQ-284], [6_UI_UX_ARCHITECTURE-REQ-285], [6_UI_UX_ARCHITECTURE-REQ-286], [6_UI_UX_ARCHITECTURE-REQ-287], [6_UI_UX_ARCHITECTURE-REQ-288], [6_UI_UX_ARCHITECTURE-REQ-289], [6_UI_UX_ARCHITECTURE-REQ-290], [6_UI_UX_ARCHITECTURE-REQ-291], [6_UI_UX_ARCHITECTURE-REQ-292], [6_UI_UX_ARCHITECTURE-REQ-293], [6_UI_UX_ARCHITECTURE-REQ-294], [6_UI_UX_ARCHITECTURE-REQ-295], [6_UI_UX_ARCHITECTURE-REQ-296], [6_UI_UX_ARCHITECTURE-REQ-297], [6_UI_UX_ARCHITECTURE-REQ-298], [6_UI_UX_ARCHITECTURE-REQ-299], [6_UI_UX_ARCHITECTURE-REQ-391], [6_UI_UX_ARCHITECTURE-REQ-392], [6_UI_UX_ARCHITECTURE-REQ-393], [6_UI_UX_ARCHITECTURE-REQ-394], [6_UI_UX_ARCHITECTURE-REQ-395]

## Dependencies
- depends_on: [05_tab_navigation_and_status_bar.md, 12_dashboard_tab_assembly.md, 13_logs_tab.md, 14_debug_tab.md, 15_pools_tab.md]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Write test for global keybindings active on all tabs: `q` quit, `?` help, `1-4` tab switch, `Tab` cycle (REQ-281)
- [ ] Write test for list navigation keys: `j`/`Down` move down, `k`/`Up` move up, `Enter` select, `Esc` deselect (REQ-282)
- [ ] Write test for log scroll keys: `PageUp`, `PageDown`, `Home`, `End` (REQ-283)
- [ ] Write test for DAG scroll keys: `←`/`→` horizontal scroll (REQ-284)
- [ ] Write test for run control keys: `c` cancel, `p` pause, `r` resume — only on Dashboard/Debug tabs (REQ-285, REQ-218)
- [ ] Write test that unknown keys are silently ignored (no error, no state change) (REQ-286)
- [ ] Write test that key events during HelpOverlay are consumed to dismiss overlay only (REQ-287)
- [ ] Write test for focus routing: key events dispatched to correct widget based on active tab and focus state (REQ-288)
- [ ] Write test that all keybindings are documented in HelpOverlay (REQ-289)
- [ ] Write headless snapshot test exercising full handle_event → render cycle (2_TAS-REQ-058)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/input.rs` with centralized key event dispatcher
- [ ] Implement `handle_key_event(state: &mut AppState, key: KeyEvent)` routing logic (REQ-288):
  - If `help_visible`: any key → dismiss help, consume event
  - Global keys (`q`, `?`, `1-4`, `Tab`): always processed
  - Tab-specific keys: dispatched to active tab's handler
- [ ] Implement list navigation handler: `j`/`Down`, `k`/`Up`, `Enter`, `Esc` for RunList/StageList (REQ-282)
- [ ] Implement log scroll handler: `PageUp`, `PageDown`, `Home`, `End` for LogPane (REQ-283)
- [ ] Implement DAG scroll handler: `←`, `→` for DagView horizontal scrolling (REQ-284)
- [ ] Implement run control handler with tab guard: `c`, `p`, `r` only on Dashboard/Debug (REQ-285)
- [ ] Silently ignore unrecognized keys (REQ-286)
- [ ] Ensure HelpOverlay documents all keybindings (REQ-289)
- [ ] Wire all handlers into `App::handle_event()` (REQ-134)

## 3. Code Review
- [ ] Verify all keybindings match the spec exactly
- [ ] Verify unknown keys produce no side effects (REQ-286)
- [ ] Verify focus routing is correct per tab (REQ-288)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- input` and `cargo test -p devs-tui -- keyboard`

## 5. Update Documentation
- [ ] Add doc comments to input module and key handler functions

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
