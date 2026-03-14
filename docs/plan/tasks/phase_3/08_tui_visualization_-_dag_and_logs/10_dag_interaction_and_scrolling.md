# Task: DAG Interaction & Scrolling (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-123], [7_UI_UX_DESIGN-REQ-140], [7_UI_UX_DESIGN-REQ-141], [7_UI_UX_DESIGN-REQ-142], [7_UI_UX_DESIGN-REQ-143], [7_UI_UX_DESIGN-REQ-144], [7_UI_UX_DESIGN-REQ-145], [7_UI_UX_DESIGN-REQ-146], [7_UI_UX_DESIGN-REQ-147], [7_UI_UX_DESIGN-REQ-148], [7_UI_UX_DESIGN-REQ-149], [7_UI_UX_DESIGN-REQ-150], [7_UI_UX_DESIGN-REQ-151], [7_UI_UX_DESIGN-REQ-152], [7_UI_UX_DESIGN-REQ-153], [7_UI_UX_DESIGN-REQ-154], [7_UI_UX_DESIGN-REQ-155], [7_UI_UX_DESIGN-REQ-156], [7_UI_UX_DESIGN-REQ-157], [7_UI_UX_DESIGN-REQ-158], [7_UI_UX_DESIGN-REQ-159], [7_UI_UX_DESIGN-REQ-160], [7_UI_UX_DESIGN-REQ-161], [7_UI_UX_DESIGN-REQ-162], [7_UI_UX_DESIGN-REQ-163], [7_UI_UX_DESIGN-REQ-164], [7_UI_UX_DESIGN-REQ-165], [7_UI_UX_DESIGN-REQ-166], [7_UI_UX_DESIGN-REQ-167], [7_UI_UX_DESIGN-REQ-169], [7_UI_UX_DESIGN-REQ-170], [7_UI_UX_DESIGN-REQ-172], [7_UI_UX_DESIGN-REQ-314], [7_UI_UX_DESIGN-REQ-315], [7_UI_UX_DESIGN-REQ-316], [7_UI_UX_DESIGN-REQ-317], [7_UI_UX_DESIGN-REQ-318], [7_UI_UX_DESIGN-REQ-431]

## Dependencies
- depends_on: [09_dag_box_rendering.md, 07_layout_system_and_terminal_sizing.md]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/tests/dag_interaction_tests.rs`.
- [ ] Write `test_dag_stage_selection` — arrow keys navigate between stage boxes; selected stage highlighted with REVERSED (REQ-123, REQ-140).
- [ ] Write `test_dag_horizontal_scroll` — Left/Right arrows scroll DAG horizontally when wider than pane (REQ-141, REQ-142).
- [ ] Write `test_dag_vertical_scroll` — Up/Down arrows scroll DAG vertically when taller than pane (REQ-143, REQ-144).
- [ ] Write `test_scroll_bounds_closed_interval` — scroll position clamped to `[0, max_scroll]` inclusive (REQ-166).
- [ ] Write `test_per_pane_scroll_bounds` — RunList, DagView, LogTail each have independent scroll state (REQ-167).
- [ ] Write `test_page_scroll_amount` — PgUp/PgDn scrolls by `max(1, visible_rows - 1)` (REQ-170).
- [ ] Write `test_navigation_keys_for_scroll` — verify arrow, PgUp/PgDn, Home/End key bindings (REQ-169).
- [ ] Write `test_run_list_selection_scroll_coupling` — selecting a run in RunList scrolls to keep it visible (REQ-172).
- [ ] Write `test_stage_selection_updates_log_tail` — selecting a stage filters LogTail to that stage (REQ-145).
- [ ] Write `test_dag_scroll_state_persists_across_ticks` — scroll position maintained between renders (REQ-146).
- [ ] Write tests REQ-147 through REQ-165: edge cases for scrolling (first/last element, wrap behavior, empty DAG, selection after state change, deselection).
- [ ] Write tests REQ-314 through REQ-318: DAG viewport clipping, partial box visibility, scroll indicator display.
- [ ] Write `test_dag_interaction_snapshot` — snapshot test of DAG with selection and scroll state (REQ-431).

## 2. Task Implementation
- [ ] Implement DAG scroll state in `AppState`: `dag_scroll_x: u16`, `dag_scroll_y: u16`, `selected_stage: Option<String>`.
- [ ] Implement stage selection via arrow keys within DagView (REQ-123, REQ-140):
  - Up/Down: move between stages in same tier.
  - Left/Right: move between tiers.
  - Selected stage rendered with REVERSED modifier.
- [ ] Implement horizontal/vertical scrolling when DAG exceeds pane dimensions (REQ-141-144).
- [ ] Scroll bounds as closed intervals `[0, max]` (REQ-166). Per-pane independent scroll (REQ-167).
- [ ] Navigation keys: arrows (line), PgUp/PgDn (page = `max(1, visible - 1)`), Home/End (REQ-169, REQ-170).
- [ ] RunList selection auto-scrolls to keep selected item visible (REQ-172).
- [ ] Stage selection filters LogTail display (REQ-145).
- [ ] Handle all edge cases: empty DAG, single stage, selection at boundaries (REQ-147-165).
- [ ] Viewport clipping for partially visible boxes (REQ-314-318).

## 3. Code Review
- [ ] Verify scroll bounds are clamped, never negative or beyond max.
- [ ] Verify selection state is preserved across state updates.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --test dag_interaction_tests`.

## 5. Update Documentation
- [ ] Document keyboard navigation bindings for DAG view.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all interaction tests pass.
