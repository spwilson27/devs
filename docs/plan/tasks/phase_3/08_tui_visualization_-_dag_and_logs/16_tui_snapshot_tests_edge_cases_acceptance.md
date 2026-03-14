# Task: TUI Snapshot Tests, Edge Cases & Final Acceptance (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-305], [7_UI_UX_DESIGN-REQ-306], [7_UI_UX_DESIGN-REQ-307], [7_UI_UX_DESIGN-REQ-308], [7_UI_UX_DESIGN-REQ-330], [7_UI_UX_DESIGN-REQ-331], [7_UI_UX_DESIGN-REQ-332], [7_UI_UX_DESIGN-REQ-333], [7_UI_UX_DESIGN-REQ-334], [7_UI_UX_DESIGN-REQ-335], [7_UI_UX_DESIGN-REQ-336], [7_UI_UX_DESIGN-REQ-337], [7_UI_UX_DESIGN-REQ-338], [7_UI_UX_DESIGN-REQ-339], [7_UI_UX_DESIGN-REQ-340], [7_UI_UX_DESIGN-REQ-341], [7_UI_UX_DESIGN-REQ-342], [7_UI_UX_DESIGN-REQ-343], [7_UI_UX_DESIGN-REQ-344], [7_UI_UX_DESIGN-REQ-345], [7_UI_UX_DESIGN-REQ-346], [7_UI_UX_DESIGN-REQ-347], [7_UI_UX_DESIGN-REQ-348], [7_UI_UX_DESIGN-REQ-349], [7_UI_UX_DESIGN-REQ-350], [7_UI_UX_DESIGN-REQ-351], [7_UI_UX_DESIGN-REQ-352], [7_UI_UX_DESIGN-REQ-353], [7_UI_UX_DESIGN-REQ-354], [7_UI_UX_DESIGN-REQ-355], [7_UI_UX_DESIGN-REQ-356], [7_UI_UX_DESIGN-REQ-357], [7_UI_UX_DESIGN-REQ-358], [7_UI_UX_DESIGN-REQ-359], [7_UI_UX_DESIGN-REQ-360], [7_UI_UX_DESIGN-REQ-361], [7_UI_UX_DESIGN-REQ-362], [7_UI_UX_DESIGN-REQ-363], [7_UI_UX_DESIGN-REQ-364], [7_UI_UX_DESIGN-REQ-365], [7_UI_UX_DESIGN-REQ-366], [7_UI_UX_DESIGN-REQ-368], [7_UI_UX_DESIGN-REQ-369], [7_UI_UX_DESIGN-REQ-377], [7_UI_UX_DESIGN-REQ-378], [7_UI_UX_DESIGN-REQ-379], [7_UI_UX_DESIGN-REQ-380], [7_UI_UX_DESIGN-REQ-381], [7_UI_UX_DESIGN-REQ-382], [7_UI_UX_DESIGN-REQ-384], [7_UI_UX_DESIGN-REQ-385], [7_UI_UX_DESIGN-REQ-386], [7_UI_UX_DESIGN-REQ-389], [7_UI_UX_DESIGN-REQ-390], [7_UI_UX_DESIGN-REQ-391], [7_UI_UX_DESIGN-REQ-392], [7_UI_UX_DESIGN-REQ-393], [7_UI_UX_DESIGN-REQ-394], [7_UI_UX_DESIGN-REQ-395], [7_UI_UX_DESIGN-REQ-401], [7_UI_UX_DESIGN-REQ-402], [7_UI_UX_DESIGN-REQ-403], [7_UI_UX_DESIGN-REQ-404], [7_UI_UX_DESIGN-REQ-405], [7_UI_UX_DESIGN-REQ-406], [7_UI_UX_DESIGN-REQ-407], [7_UI_UX_DESIGN-REQ-409], [7_UI_UX_DESIGN-REQ-410], [7_UI_UX_DESIGN-REQ-411], [7_UI_UX_DESIGN-REQ-412], [7_UI_UX_DESIGN-REQ-413], [7_UI_UX_DESIGN-REQ-414], [7_UI_UX_DESIGN-REQ-415], [7_UI_UX_DESIGN-REQ-416], [7_UI_UX_DESIGN-REQ-417], [7_UI_UX_DESIGN-REQ-418], [7_UI_UX_DESIGN-REQ-419], [7_UI_UX_DESIGN-REQ-421], [7_UI_UX_DESIGN-REQ-422], [7_UI_UX_DESIGN-REQ-423], [7_UI_UX_DESIGN-REQ-424], [7_UI_UX_DESIGN-REQ-425], [7_UI_UX_DESIGN-REQ-426], [7_UI_UX_DESIGN-REQ-427], [7_UI_UX_DESIGN-REQ-428], [7_UI_UX_DESIGN-REQ-429], [7_UI_UX_DESIGN-REQ-430], [7_UI_UX_DESIGN-REQ-432], [7_UI_UX_DESIGN-REQ-433], [7_UI_UX_DESIGN-REQ-434], [7_UI_UX_DESIGN-REQ-436], [7_UI_UX_DESIGN-REQ-437], [7_UI_UX_DESIGN-REQ-438], [7_UI_UX_DESIGN-REQ-439], [7_UI_UX_DESIGN-REQ-440], [7_UI_UX_DESIGN-REQ-441], [7_UI_UX_DESIGN-REQ-442], [7_UI_UX_DESIGN-REQ-443], [7_UI_UX_DESIGN-REQ-444], [7_UI_UX_DESIGN-REQ-445], [7_UI_UX_DESIGN-REQ-446], [7_UI_UX_DESIGN-REQ-447], [7_UI_UX_DESIGN-REQ-448], [7_UI_UX_DESIGN-REQ-449], [7_UI_UX_DESIGN-REQ-450], [7_UI_UX_DESIGN-REQ-451], [7_UI_UX_DESIGN-REQ-452], [7_UI_UX_DESIGN-REQ-453], [7_UI_UX_DESIGN-REQ-454]

## Dependencies
- depends_on: ["09_dag_box_rendering.md", "10_dag_interaction_and_scrolling.md", "05_log_visualization_and_tail_rendering.md", "12_control_actions_and_confirmation.md", "13_reconnection_and_status_bar.md", "14_help_overlay_and_modal_system.md", "15_cli_and_mcp_bridge_output_formatting.md"]
- shared_components: [devs-proto (consumer), devs-core (consumer), Traceability & Coverage Infrastructure (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/tests/snapshot_tests.rs` and `crates/devs-tui/tests/edge_case_tests.rs`.
- [ ] **Edge case tests (REQ-305 through REQ-308):**
  - [ ] `test_resize_during_reconnect` — resize event while reconnecting preserves state and re-renders correctly (REQ-305).
  - [ ] `test_small_terminal_during_activity` — terminal shrinks below 80x24 during active run; shows TooSmall warning; resizing back restores (REQ-306).
  - [ ] `test_zero_runs_dashboard` — empty RunList shows appropriate empty state message (REQ-307).
  - [ ] `test_missing_run_after_selection` — selected run disappears from server; selection cleared gracefully (REQ-308).
- [ ] **Comprehensive snapshot tests using `ratatui::backend::TestBackend` (REQ-330 through REQ-366, REQ-368-369):**
  - [ ] `test_snapshot_dashboard_empty` — Dashboard with zero runs, Color mode (REQ-330).
  - [ ] `test_snapshot_dashboard_empty_mono` — same, Monochrome (REQ-331).
  - [ ] `test_snapshot_dashboard_single_run` — one running workflow (REQ-332).
  - [ ] `test_snapshot_dashboard_multiple_runs` — several runs in various states (REQ-333).
  - [ ] `test_snapshot_dashboard_selected_run` — with a run selected (highlighted) (REQ-334).
  - [ ] `test_snapshot_run_detail_running` — RunDetail pane with running stages (REQ-335).
  - [ ] `test_snapshot_run_detail_completed` — all stages completed (REQ-336).
  - [ ] `test_snapshot_run_detail_failed` — some stages failed (REQ-337).
  - [ ] `test_snapshot_dag_linear` — linear DAG (REQ-338).
  - [ ] `test_snapshot_dag_parallel` — parallel stages (REQ-339).
  - [ ] `test_snapshot_dag_diamond` — diamond dependency pattern (REQ-340).
  - [ ] `test_snapshot_dag_fanout` — fan-out stage with (xN) indicator (REQ-341).
  - [ ] `test_snapshot_dag_scrolled` — DAG with scroll offset applied (REQ-342).
  - [ ] `test_snapshot_dag_stage_selected` — stage selected with REVERSED highlight (REQ-343).
  - [ ] `test_snapshot_logs_tab` — Logs tab with content (REQ-344).
  - [ ] `test_snapshot_logs_tab_stderr` — Logs showing stderr entries (REQ-345).
  - [ ] `test_snapshot_logs_truncated` — truncation notice visible (REQ-346).
  - [ ] `test_snapshot_debug_tab` — Debug tab layout (REQ-347).
  - [ ] `test_snapshot_pools_tab` — Pools tab with pool utilization (REQ-348).
  - [ ] `test_snapshot_status_bar_connected` — status bar showing Connected (REQ-349).
  - [ ] `test_snapshot_status_bar_reconnecting` — status bar during reconnect (REQ-350).
  - [ ] `test_snapshot_status_bar_disconnected` — status bar Disconnected (REQ-351).
  - [ ] `test_snapshot_help_overlay` — help overlay over Dashboard (REQ-352).
  - [ ] `test_snapshot_confirmation_dialog` — cancel confirmation prompt (REQ-353).
  - [ ] `test_snapshot_too_small` — terminal below 80x24 (REQ-354).
  - [ ] `test_snapshot_tab_bar` — tab bar with each tab active (REQ-355-358).
  - [ ] Write remaining snapshots for REQ-359 through REQ-366, REQ-368-369: various viewport sizes, edge states, long stage names, many tiers.
- [ ] **Acceptance criteria tests (REQ-377 through REQ-454):**
  - [ ] `test_ac_status_labels_4bytes` — final confirmation all STATUS_* are 4 bytes (REQ-377).
  - [ ] `test_ac_strings_no_inline` — final strings hygiene scan (REQ-378).
  - [ ] `test_ac_no_color_handling` — NO_COLOR env var acceptance tests across all scenarios (REQ-379-382).
  - [ ] `test_ac_theme_stage_status_styles` — each stage status produces correct style in both modes (REQ-384-386).
  - [ ] `test_ac_ansi_stripping_algorithm` — comprehensive ANSI stripping cases (REQ-389-395).
  - [ ] `test_ac_elapsed_formatting` — all elapsed time edge cases (REQ-401-407).
  - [ ] `test_ac_truncation` — truncate_with_tilde and CLI ellipsis cases (REQ-409-419).
  - [ ] `test_ac_dag_snapshot_full` — complete DAG snapshot acceptance (REQ-421-430).
  - [ ] `test_ac_log_tail_acceptance` — LogTail rendering acceptance (REQ-432-434).
  - [ ] `test_ac_help_overlay_acceptance` — help overlay acceptance (REQ-436-438).
  - [ ] `test_ac_status_bar_acceptance` — status bar acceptance (REQ-439-441).
  - [ ] `test_ac_layout_acceptance` — layout transitions acceptance (REQ-442-445).
  - [ ] `test_ac_keyboard_acceptance` — key dispatch acceptance (REQ-446-449).
  - [ ] `test_ac_confirmation_acceptance` — confirmation flow acceptance (REQ-450-451).
  - [ ] `test_ac_reconnection_acceptance` — reconnection flow acceptance (REQ-452-453).
  - [ ] `test_ac_event_loop_acceptance` — event loop timing acceptance (REQ-454).

## 2. Task Implementation
- [ ] Create golden snapshot files under `crates/devs-tui/tests/snapshots/` directory for each snapshot test.
- [ ] Implement test helper `create_test_app(config: TestConfig) -> App` that sets up AppState with mock data for snapshot testing.
- [ ] Implement `TestConfig` builder with options: `runs: Vec<MockRun>`, `selected_run: Option<usize>`, `color_mode: ColorMode`, `terminal_size: (u16, u16)`, `tab: Tab`, `help_visible: bool`, `confirmation: Option<MockConfirmation>`, `connection_status: ConnectionStatus`.
- [ ] All snapshot tests use `ratatui::backend::TestBackend` with deterministic size.
- [ ] Edge case implementations: handle zero runs, missing run, resize during reconnect, small terminal during activity.
- [ ] All acceptance criteria tests should be comprehensive integration tests that verify end-to-end behavior.
- [ ] Add `// Covers: REQ-ID` annotations to every test function for traceability.

## 3. Code Review
- [ ] Verify every snapshot test has both Color and Monochrome variants.
- [ ] Verify golden files are committed and diffable.
- [ ] Verify all acceptance criteria map to at least one test.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --test snapshot_tests --test edge_case_tests`.

## 5. Update Documentation
- [ ] Document snapshot testing methodology and how to update golden files.

## 6. Automated Verification
- [ ] Run `./do test` and `./do coverage`. Verify all snapshot tests pass and coverage meets QG-004 (50% TUI E2E line coverage). Verify `target/traceability.json` includes all 7_UI_UX_DESIGN-REQ IDs.
