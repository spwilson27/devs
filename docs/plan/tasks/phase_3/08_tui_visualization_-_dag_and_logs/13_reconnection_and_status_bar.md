# Task: Reconnection State Machine & Status Bar (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-060], [7_UI_UX_DESIGN-REQ-061], [7_UI_UX_DESIGN-REQ-062], [7_UI_UX_DESIGN-REQ-222], [7_UI_UX_DESIGN-REQ-223], [7_UI_UX_DESIGN-REQ-224], [7_UI_UX_DESIGN-REQ-225], [7_UI_UX_DESIGN-REQ-226], [7_UI_UX_DESIGN-REQ-227], [7_UI_UX_DESIGN-REQ-229], [7_UI_UX_DESIGN-REQ-230], [7_UI_UX_DESIGN-REQ-231], [7_UI_UX_DESIGN-REQ-232], [7_UI_UX_DESIGN-REQ-260], [7_UI_UX_DESIGN-REQ-261]

## Dependencies
- depends_on: [06_event_loop_and_widget_architecture.md, 02_theme_and_color_mode_system.md]
- shared_components: [devs-proto (consumer), devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/widgets/status_bar.rs` and `crates/devs-tui/src/connection.rs` (empty). Create `crates/devs-tui/tests/reconnection_tests.rs`.
- [ ] Write `test_status_bar_connected_label_bold` — connected label uses BOLD modifier (REQ-060).
- [ ] Write `test_status_bar_disconnected_label_bold` — disconnected label uses BOLD (REQ-060).
- [ ] Write `test_status_bar_bottom_row` — status bar always occupies bottom row (REQ-061).
- [ ] Write `test_reconnecting_shows_attempt_and_countdown` — "Reconnecting (attempt N, retry in Xs)" format; no spinner (REQ-062, REQ-222).
- [ ] Write `test_reconnect_backoff_schedule` — backoff delays displayed correctly (REQ-223).
- [ ] Write `test_post_reconnect_status_connected` — after successful reconnect, status transitions to CONNECTED (REQ-224).
- [ ] Write `test_reconnect_elapsed_ms_format` — elapsed shown in ms format (REQ-225).
- [ ] Write `test_reconnect_initiated_on_stream_error` — first StreamError triggers reconnect flow (REQ-226).
- [ ] Write `test_reconnect_success_snapshot` — Connected event received with fresh snapshot (REQ-227).
- [ ] Write `test_reconnect_elapsed_reset` — `reconnect_elapsed_ms` reset on Connected event (REQ-229).
- [ ] Write `test_backoff_uses_tokio_sleep` — delays use `tokio::time::sleep`, not `std::thread::sleep` (REQ-230).
- [ ] Write `test_appstate_runs_preserved_during_reconnect` — `AppState::runs` NOT cleared during reconnect (REQ-231).
- [ ] Write `test_reconnect_budget_exceeded_once` — `ReconnectBudgetExceeded` event sent only once (REQ-232).
- [ ] Write `test_run_summary_from_stream` — `RunSummary` populated from `StreamRunEvents` gRPC (REQ-260).
- [ ] Write `test_run_detail_populated_on_selection` — `RunDetail` populated when run selected, updated by `RunDelta` (REQ-261).

## 2. Task Implementation
- [ ] Implement `StatusBarWidget` in `widgets/status_bar.rs`:
  - Always bottom row, full width (REQ-061).
  - Connection label: Connected/Disconnected with BOLD (REQ-060).
  - Reconnecting state: shows attempt number and retry countdown (REQ-062, REQ-222). No spinner.
  - Rest of status bar uses `Style::new()` (REQ-061).
- [ ] Implement `ConnectionManager` in `connection.rs`:
  - States: Connected, Disconnected, Reconnecting { attempt, next_retry }.
  - On first StreamError: initiate reconnect (REQ-226).
  - Backoff delays via `tokio::time::sleep` (REQ-230). Schedule displayed (REQ-223).
  - On success: Connected event + fresh state snapshot (REQ-227). Reset `reconnect_elapsed_ms` (REQ-229). Transition to Connected (REQ-224).
  - `ReconnectBudgetExceeded` emitted at most once (REQ-232).
  - Elapsed displayed in ms format (REQ-225).
- [ ] During reconnect, do NOT clear `AppState::runs` (REQ-231).
- [ ] `RunSummary` populated from `StreamRunEvents` gRPC stream (REQ-260).
- [ ] `RunDetail` populated on selection, updated incrementally by `RunDelta` events (REQ-261).

## 3. Code Review
- [ ] Verify no spinner or cursor movement in reconnecting display.
- [ ] Verify runs are preserved during reconnect.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib widgets::status_bar --lib connection` and `cargo test -p devs-tui --test reconnection_tests`.

## 5. Update Documentation
- [ ] Document the reconnection state machine and backoff schedule.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all reconnection tests pass.
