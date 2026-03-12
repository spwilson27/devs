# Task: TUI Layout & Resize Handling (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-004], [7_UI_UX_DESIGN-REQ-006], [7_UI_UX_DESIGN-REQ-007], [7_UI_UX_DESIGN-REQ-008], [7_UI_UX_DESIGN-REQ-009], [7_UI_UX_DESIGN-REQ-018], [7_UI_UX_DESIGN-REQ-019], [7_UI_UX_DESIGN-REQ-020], [7_UI_UX_DESIGN-REQ-021], [7_UI_UX_DESIGN-REQ-022], [7_UI_UX_DESIGN-REQ-023], [7_UI_UX_DESIGN-REQ-024], [7_UI_UX_DESIGN-REQ-025], [7_UI_UX_DESIGN-REQ-026], [7_UI_UX_DESIGN-REQ-027], [7_UI_UX_DESIGN-REQ-028], [7_UI_UX_DESIGN-REQ-029], [7_UI_UX_DESIGN-REQ-033], [7_UI_UX_DESIGN-REQ-034], [7_UI_UX_DESIGN-REQ-035], [7_UI_UX_DESIGN-REQ-036], [7_UI_UX_DESIGN-REQ-037], [7_UI_UX_DESIGN-REQ-038], [7_UI_UX_DESIGN-REQ-039], [7_UI_UX_DESIGN-REQ-040], [7_UI_UX_DESIGN-REQ-041], [7_UI_UX_DESIGN-REQ-042], [7_UI_UX_DESIGN-REQ-043], [7_UI_UX_DESIGN-REQ-044], [7_UI_UX_DESIGN-REQ-045], [7_UI_UX_DESIGN-REQ-046], [7_UI_UX_DESIGN-REQ-048], [7_UI_UX_DESIGN-REQ-049], [7_UI_UX_DESIGN-REQ-050], [7_UI_UX_DESIGN-REQ-051], [7_UI_UX_DESIGN-REQ-052], [7_UI_UX_DESIGN-REQ-053], [7_UI_UX_DESIGN-REQ-054], [7_UI_UX_DESIGN-REQ-055], [7_UI_UX_DESIGN-REQ-056], [7_UI_UX_DESIGN-REQ-470]

## Dependencies
- depends_on: [01_tui_foundational_strings_hygiene.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create TUI integration tests using `TestBackend` to verify:
    - Terminal size check: if terminal is < 80x24, render only `MSG_TERMINAL_TOO_SMALL`.
    - `MSG_TERMINAL_TOO_SMALL` expands `%W` and `%H` placeholders correctly.
    - Dashboard layout uses deterministic sizing rules (pane splits, column widths).
    - Resize handling: interface resumes immediately when resized above threshold.
    - No tab bar, status bar, or other widgets rendered when too small.

## 2. Task Implementation
- [ ] Implement `render_utils::expand_msg_placeholders()` for the too-small message.
- [ ] Implement the terminal size check logic in the main TUI render loop.
- [ ] Define fixed layout constants for pane splits (e.g., 30/70 split for Dashboard list/detail).
- [ ] Implement the `Resize` event handler in the `App` state machine to trigger a re-render.
- [ ] Ensure all elapsed times in the interface are formatted as `M:SS` (deterministic temporal representation).

## 3. Code Review
- [ ] Verify that the too-small message uses no color, no modifiers, and no structural characters beyond alphanumeric/spaces.
- [ ] Confirm that `M:SS` formatting correctly zero-padds seconds.
- [ ] Ensure `render()` is idempotent and doesn't mutate state on resize.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-tui -- layout`

## 5. Update Documentation
- [ ] Update `crates/devs-tui/README.md` with the minimum terminal size requirement.

## 6. Automated Verification
- [ ] Render the TUI into a 70x20 `TestBackend` and assert that the output matches the terminal-too-small template exactly.
