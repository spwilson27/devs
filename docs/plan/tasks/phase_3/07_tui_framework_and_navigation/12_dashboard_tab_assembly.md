# Task: Dashboard Tab Assembly with Split Panes (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-181], [6_UI_UX_ARCHITECTURE-REQ-182], [6_UI_UX_ARCHITECTURE-REQ-183], [6_UI_UX_ARCHITECTURE-REQ-184], [6_UI_UX_ARCHITECTURE-REQ-185], [6_UI_UX_ARCHITECTURE-REQ-186], [6_UI_UX_ARCHITECTURE-REQ-187], [6_UI_UX_ARCHITECTURE-REQ-188], [6_UI_UX_ARCHITECTURE-REQ-189], [6_UI_UX_ARCHITECTURE-REQ-190], [6_UI_UX_ARCHITECTURE-REQ-191], [6_UI_UX_ARCHITECTURE-REQ-192], [6_UI_UX_ARCHITECTURE-REQ-193], [6_UI_UX_ARCHITECTURE-REQ-194], [6_UI_UX_ARCHITECTURE-REQ-195], [6_UI_UX_ARCHITECTURE-REQ-371], [6_UI_UX_ARCHITECTURE-REQ-372], [6_UI_UX_ARCHITECTURE-REQ-373], [6_UI_UX_ARCHITECTURE-REQ-374], [6_UI_UX_ARCHITECTURE-REQ-375], [6_UI_UX_ARCHITECTURE-REQ-432]

## Dependencies
- depends_on: [06_layout_system_and_terminal_constraints.md, 08_run_list_widget.md, 09_dag_view_widget.md, 10_stage_list_widget.md, 11_log_pane_and_ansi_stripping.md]
- shared_components: [devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write snapshot test for DashboardTab with no run selected: left pane shows RunList, right pane shows "Select a run" placeholder (REQ-181)
- [ ] Write snapshot test for DashboardTab with run selected: left pane shows RunList with highlight, right pane shows RunDetail with DagView, StageList, and LogTail (REQ-182)
- [ ] Write test that selecting a run populates the right pane with stage graph, per-stage status, elapsed time (REQ-183)
- [ ] Write test that LogTail in RunDetail shows last N lines of selected stage's log (REQ-054, REQ-184)
- [ ] Write test for re-render within 50ms of receiving a `GrpcRunEvent` (REQ-432)
- [ ] Write snapshot test for DashboardTab at minimum width (80 cols): detail pane may be hidden (REQ-315)
- [ ] Write test that run selection via `Enter` key in RunList triggers detail pane population (REQ-185)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/tabs/dashboard.rs` implementing `DashboardTab` as a `ratatui::widgets::Widget`
- [ ] Implement split pane rendering: RunList (left, 42 cols) | RunDetail (right, remaining) (REQ-181)
- [ ] Implement RunDetail section: DagView at top, StageList in middle, LogTail at bottom (REQ-182)
- [ ] Wire run selection from RunList to populate `selected_run_id` in AppState (REQ-185)
- [ ] Implement LogTail: render last N visible lines from the selected stage's LogBuffer (REQ-184)
- [ ] Handle `GrpcRunEvent` in handle_event(): update `runs`, `run_details`, `log_buffers` in AppState (REQ-432)
- [ ] Implement placeholder rendering when no run is selected (REQ-181)
- [ ] Respect detail pane hiding when terminal too narrow (REQ-315)
- [ ] Ensure re-render timing: event → state update → render within 50ms budget (REQ-432)

## 3. Code Review
- [ ] Verify DashboardTab composes child widgets without duplicating their logic
- [ ] Verify 50ms render budget is achievable with test data (REQ-432)
- [ ] Verify split pane widths match spec (42 cols left) (REQ-305)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- dashboard`

## 5. Update Documentation
- [ ] Add doc comments to DashboardTab

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
