# Task: TUI DAG Interaction & Scrolling (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-123], [7_UI_UX_DESIGN-REQ-140], [7_UI_UX_DESIGN-REQ-141], [7_UI_UX_DESIGN-REQ-142], [7_UI_UX_DESIGN-REQ-143], [7_UI_UX_DESIGN-REQ-144], [7_UI_UX_DESIGN-REQ-145], [7_UI_UX_DESIGN-REQ-146], [7_UI_UX_DESIGN-REQ-147], [7_UI_UX_DESIGN-REQ-148], [7_UI_UX_DESIGN-REQ-149], [7_UI_UX_DESIGN-REQ-150], [7_UI_UX_DESIGN-REQ-151], [7_UI_UX_DESIGN-REQ-152], [7_UI_UX_DESIGN-REQ-153], [7_UI_UX_DESIGN-REQ-154], [7_UI_UX_DESIGN-REQ-155], [7_UI_UX_DESIGN-REQ-156], [7_UI_UX_DESIGN-REQ-157], [7_UI_UX_DESIGN-REQ-158], [7_UI_UX_DESIGN-REQ-159], [7_UI_UX_DESIGN-REQ-160], [7_UI_UX_DESIGN-REQ-161], [7_UI_UX_DESIGN-REQ-162], [7_UI_UX_DESIGN-REQ-163], [7_UI_UX_DESIGN-REQ-164], [7_UI_UX_DESIGN-REQ-165], [7_UI_UX_DESIGN-REQ-314], [7_UI_UX_DESIGN-REQ-315], [7_UI_UX_DESIGN-REQ-316], [7_UI_UX_DESIGN-REQ-317], [7_UI_UX_DESIGN-REQ-318], [7_UI_UX_DESIGN-REQ-431]

## Dependencies
- depends_on: [06_tui_dag_rendering.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create TUI integration tests using `TestBackend` to verify:
    - Horizontal scrolling of `DagView` with `Left/Right` arrow keys.
    - Scroll indicator `< scroll >` visibility when the DAG exceeds the pane width.
    - Scroll offset resets to 0 when a different run is selected.
    - Scroll offset is NOT reset on terminal resize (clamped to 0 if no longer needed).
    - Scroll bounds: `[0, max(0, total_dag_width - available_cols)]`.

## 2. Task Implementation
- [ ] Implement `dag_scroll_offset` management in `AppState`.
- [ ] Implement `compute_total_dag_width()` based on the number of tiers.
- [ ] Add key handlers for `Key::Left` and `Key::Right` in the Dashboard tab to update `dag_scroll_offset`.
- [ ] Implement the `< scroll >` indicator in `DagView::render()`.
- [ ] Add logic in `AppState::select_run()` to reset `dag_scroll_offset` to 0.
- [ ] Implement scroll offset clamping in `render()` to handle terminal resizing gracefully.

## 3. Code Review
- [ ] Verify that scrolling doesn't wrap around (no-op at bounds).
- [ ] Confirm that selecting a new run always starts the DAG view at the beginning.
- [ ] Check that resizing the terminal back to a smaller size restores the scroll position (if it was clamped but not reset).

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-tui -- widgets::dag::scroll`

## 5. Update Documentation
- [ ] Update the TUI interaction guide with DAG horizontal scrolling shortcuts.

## 6. Automated Verification
- [ ] Render a wide mock DAG (5+ tiers) into a 40-column `TestBackend` and assert the presence of the scroll indicator and the contents of the rendered buffer at offset 0 and offset 1.
