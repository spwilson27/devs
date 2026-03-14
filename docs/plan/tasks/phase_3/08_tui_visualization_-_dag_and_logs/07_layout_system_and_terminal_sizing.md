# Task: Layout System & Terminal Sizing (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-004], [7_UI_UX_DESIGN-REQ-006], [7_UI_UX_DESIGN-REQ-007], [7_UI_UX_DESIGN-REQ-008], [7_UI_UX_DESIGN-REQ-009], [7_UI_UX_DESIGN-REQ-018], [7_UI_UX_DESIGN-REQ-113], [7_UI_UX_DESIGN-REQ-114], [7_UI_UX_DESIGN-REQ-115], [7_UI_UX_DESIGN-REQ-116], [7_UI_UX_DESIGN-REQ-173], [7_UI_UX_DESIGN-REQ-174], [7_UI_UX_DESIGN-REQ-175], [7_UI_UX_DESIGN-REQ-176], [7_UI_UX_DESIGN-REQ-185], [7_UI_UX_DESIGN-REQ-186], [7_UI_UX_DESIGN-REQ-187], [7_UI_UX_DESIGN-REQ-188], [7_UI_UX_DESIGN-REQ-189], [7_UI_UX_DESIGN-REQ-190], [7_UI_UX_DESIGN-REQ-470]

## Dependencies
- depends_on: [06_event_loop_and_widget_architecture.md]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/layout.rs` (empty). Create `crates/devs-tui/tests/layout_tests.rs`.
- [ ] Write `test_minimum_terminal_80x24` — terminals below 80 cols or 24 rows trigger `LayoutMode::TooSmall` (REQ-008).
- [ ] Write `test_too_small_shows_warning_only` — in TooSmall mode, render only shows size warning message; no tab bar, DAG, or logs (REQ-018, REQ-114).
- [ ] Write `test_too_small_to_normal_transition` — resizing from <80x24 to >=80x24 restores Normal layout with preserved AppState (REQ-187).
- [ ] Write `test_fixed_layout_non_configurable` — layout dimensions are deterministic and not user-configurable (REQ-004).
- [ ] Write `test_consistent_temporal_representation` — elapsed times as M:SS; timestamps as RFC 3339 with milliseconds (REQ-006).
- [ ] Write `test_minimal_cognitive_load` — Dashboard prioritizes live status, log tail, failure signals at top level (REQ-007).
- [ ] Write `test_three_delivery_surfaces` — verify TUI, CLI, MCP bridge are distinct binaries/crates (REQ-009).
- [ ] Write `test_base_grid_unit` — grid unit size definition matches spec (REQ-113).
- [ ] Write `test_dashboard_tab_layout` — Dashboard has split pane: RunList on left, RunDetail on right (REQ-115).
- [ ] Write `test_run_detail_layout` — RunDetail shows stage graph, per-stage status, elapsed, log tail (REQ-116).
- [ ] Write `test_layout_types_in_layout_rs` — all layout types (`PaneDimensions`, `LayoutMode`) defined in `layout.rs` (REQ-173).
- [ ] Write `test_appstate_stores_layout_mode` — `AppState.layout_mode: LayoutMode` field exists (REQ-174).
- [ ] Write `test_per_tab_layout_functions` — `dashboard_layout(rect) -> DashboardPanes`, `logs_layout(rect) -> LogsPanes`, etc. are free functions (REQ-175).
- [ ] Write `test_pane_dimensions_no_zero` — `PaneDimensions::new()` rejects width=0 or height=0 (REQ-176).
- [ ] Write `test_agent_status_grid_collapse` — when terminal width < 68, AgentStatusGrid collapses columns (REQ-185).
- [ ] Write `test_querying_state_startup_only` — Querying layout state only during startup/reconnect (REQ-186).
- [ ] Write `test_disconnected_terminal_state` — verify disconnected state is reachable and renders correctly (REQ-188).
- [ ] Write `test_layout_no_non_core_imports` — `layout.rs` does not import from scheduler, executor, adapter crates (REQ-189).
- [ ] Write `test_widgets_accept_rect` — widgets accept `ratatui::layout::Rect` via `PaneDimensions` (REQ-190).
- [ ] Write `test_resize_event_handling` — TuiEvent::Resize triggers layout recalculation (REQ-470).

## 2. Task Implementation
- [ ] Implement `layout.rs`:
  - `LayoutMode` enum: `Normal`, `TooSmall` (REQ-114, REQ-174).
  - `PaneDimensions` struct wrapping `Rect` with validation (no zero dimensions) (REQ-176, REQ-190).
  - Free functions: `dashboard_layout(terminal_rect: Rect) -> DashboardPanes` (REQ-115, REQ-175), `logs_layout(rect) -> LogsPanes`, `debug_layout(rect)`, `pools_layout(rect)`.
  - Dashboard split pane: RunList left, RunDetail right (REQ-115, REQ-116).
  - TooSmall check: `cols < 80 || rows < 24` (REQ-008).
- [ ] Fixed, deterministic layout — no configurable split ratios (REQ-004).
- [ ] Handle resize events: recalculate layout, transition TooSmall ↔ Normal preserving AppState (REQ-187, REQ-470).
- [ ] AgentStatusGrid column collapse at width < 68 (REQ-185).
- [ ] `layout.rs` must not import non-core crates (REQ-189).

## 3. Code Review
- [ ] Verify all layout computation is in `layout.rs`, not scattered in widgets.
- [ ] Verify no configurable parameters for layout dimensions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib layout` and `cargo test -p devs-tui --test layout_tests`.

## 5. Update Documentation
- [ ] Document the minimum terminal size requirement and layout mode transitions.

## 6. Automated Verification
- [ ] Run `./do test`. Verify `grep -rn "use devs_scheduler\|use devs_executor" crates/devs-tui/src/layout.rs` returns zero matches.
