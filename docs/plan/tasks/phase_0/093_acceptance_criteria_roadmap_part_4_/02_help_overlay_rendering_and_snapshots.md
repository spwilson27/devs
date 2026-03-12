# Task: Help Overlay Rendering & Snapshots (Sub-Epic: 093_Acceptance Criteria & Roadmap (Part 4))

## Covered Requirements
- [AC-HELP-004]
- [AC-HELP-005]

## Dependencies
- depends_on: [01_dag_arrow_constants_and_help_content.md]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a TUI snapshot test for `HelpOverlay` using `ratatui::backend::TestBackend` (200x50, monochrome).
- [ ] Set `help_visible = true` in the `AppState` and verify that the output snapshot matches `HELP_OVERLAY_CONTENT` exactly.
- [ ] Create another snapshot test for terminal-too-small edge case:
  - [ ] Set `help_visible = true` in `AppState`.
  - [ ] Set terminal size to 79x24 in the `TestBackend`.
  - [ ] Assert that the output snapshot shows the terminal-too-small message, NOT the help overlay.

## 2. Task Implementation
- [ ] In `crates/devs-tui/src/widgets/help_overlay.rs` (or similar), implement the `HelpOverlay` widget:
  - [ ] Use `ratatui::widgets::Clear` to clear the underlying content.
  - [ ] Render a `Paragraph` with `HELP_OVERLAY_CONTENT`.
  - [ ] Ensure the overlay uses a border with ASCII characters: `+`, `-`, and `|`.
  - [ ] Center the overlay in the terminal with 2-column padding on each side.
- [ ] In the main TUI `render()` function, add logic to render the `HelpOverlay` last if `help_visible == true`.
- [ ] Implement the terminal-too-small logic:
  - [ ] If `width < 80` or `height < 24`, render only the size warning message, replacing all other content including the help overlay.

## 3. Code Review
- [ ] Confirm that `HelpOverlay` uses `Clear` to prevent background bleed-through.
- [ ] Verify that no wide characters are used in the border or structural parts of the overlay.
- [ ] Check that the overlay does not freeze the background application state transitions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and use `insta` to review and approve the snapshots:
  - [ ] `help_overlay__visible`
  - [ ] `dashboard__terminal_too_small`

## 5. Update Documentation
- [ ] Update `GEMINI.md` to record that the Help Overlay is implemented and verified with snapshots.

## 6. Automated Verification
- [ ] Run `./do lint` to verify that no `\x1b[` (ANSI) or Unicode box-drawing characters (U+2500–U+257F) exist in the snapshot `.txt` files.
