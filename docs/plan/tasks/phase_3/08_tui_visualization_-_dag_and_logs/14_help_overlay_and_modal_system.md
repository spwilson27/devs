# Task: Help Overlay & Modal Interaction (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-239], [7_UI_UX_DESIGN-REQ-240], [7_UI_UX_DESIGN-REQ-241], [7_UI_UX_DESIGN-REQ-242], [7_UI_UX_DESIGN-REQ-243], [7_UI_UX_DESIGN-REQ-244], [7_UI_UX_DESIGN-REQ-245], [7_UI_UX_DESIGN-REQ-246], [7_UI_UX_DESIGN-REQ-247], [7_UI_UX_DESIGN-REQ-248], [7_UI_UX_DESIGN-REQ-249], [7_UI_UX_DESIGN-REQ-250], [7_UI_UX_DESIGN-REQ-321], [7_UI_UX_DESIGN-REQ-322], [7_UI_UX_DESIGN-REQ-323], [7_UI_UX_DESIGN-REQ-324], [7_UI_UX_DESIGN-REQ-325], [7_UI_UX_DESIGN-REQ-326], [7_UI_UX_DESIGN-REQ-327], [7_UI_UX_DESIGN-REQ-328]

## Dependencies
- depends_on: [11_keyboard_input_and_tab_navigation.md, 02_theme_and_color_mode_system.md]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/widgets/help_overlay.rs` (empty). Create `crates/devs-tui/tests/help_overlay_tests.rs`.
- [ ] Write `test_help_overlay_centered` — overlay is centered horizontally and vertically with 2-column padding (REQ-239).
- [ ] Write `test_help_overlay_toggle` — `?` key toggles overlay on/off (REQ-240).
- [ ] Write `test_help_overlay_esc_closes` — `Esc` key closes overlay (REQ-241).
- [ ] Write `test_help_overlay_key_column_bold` — key names in left column use BOLD style (REQ-065, REQ-242).
- [ ] Write `test_help_overlay_two_columns` — left column = keys, right column = descriptions (REQ-243).
- [ ] Write `test_help_overlay_explicit_background` — only widget with non-Reset background in Color mode (REQ-064, REQ-244).
- [ ] Write `test_help_overlay_content_complete` — all key bindings listed: navigation, actions, control keys (REQ-245).
- [ ] Write `test_help_overlay_no_scroll` — overlay content fits without scrolling (REQ-246).
- [ ] Write `test_help_overlay_modal_blocks_keys` — with overlay open, only `?`/`Esc`/`q`/`Tab` processed (REQ-207 from task 11, REQ-247).
- [ ] Write `test_help_overlay_monochrome` — renders correctly in Monochrome (REQ-248).
- [ ] Write snapshot test `test_help_overlay_snapshot_color` — golden snapshot in Color mode (REQ-249).
- [ ] Write snapshot test `test_help_overlay_snapshot_mono` — golden snapshot in Monochrome (REQ-250).
- [ ] Write tests for REQ-321 through REQ-328: overlay sizing relative to terminal, overlay over various tabs, overlay text wrapping, overlay rendering performance.

## 2. Task Implementation
- [ ] Implement `HelpOverlayWidget` in `widgets/help_overlay.rs`:
  - Centered with 2-column horizontal padding (REQ-239).
  - Two-column layout: keys (BOLD) | descriptions (REQ-242, REQ-243).
  - Explicit non-Reset background in Color mode; only widget with this exception (REQ-064, REQ-244).
  - Content: all key bindings with descriptions (REQ-245). Fits without scroll (REQ-246).
- [ ] Implement modal state in `AppState`: `help_overlay_visible: bool`.
- [ ] `?` toggles (REQ-240), `Esc` closes (REQ-241).
- [ ] Help overlay sizing responsive to terminal size (REQ-321-328).

## 3. Code Review
- [ ] Verify help overlay is the ONLY widget with explicit bg in Color mode.
- [ ] Verify all key bindings are listed in the overlay content.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib widgets::help_overlay` and `cargo test -p devs-tui --test help_overlay_tests`.

## 5. Update Documentation
- [ ] Document the modal overlay behavior.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all overlay tests and snapshots pass.
