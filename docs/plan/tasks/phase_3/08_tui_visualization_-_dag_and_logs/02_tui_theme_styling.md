# Task: TUI Theme & Styling (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-057], [7_UI_UX_DESIGN-REQ-058], [7_UI_UX_DESIGN-REQ-059], [7_UI_UX_DESIGN-REQ-078], [7_UI_UX_DESIGN-REQ-030], [7_UI_UX_DESIGN-REQ-031], [7_UI_UX_DESIGN-REQ-032], [7_UI_UX_DESIGN-REQ-047]

## Dependencies
- depends_on: [01_tui_foundational_strings_hygiene.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/theme.rs` unit tests to verify:
    - `theme.log_line_style(LogStream::Stderr)` in `ColorMode::Color` returns `fg(Yellow)`.
    - `theme.log_line_style(LogStream::Stderr)` in `ColorMode::Monochrome` returns `modifier(Bold)`.
    - `theme.log_line_style(LogStream::Stdout)` returns `Style::new()` (no styling) in both modes.
    - `theme.status_style(StageStatus::Running)` returns `modifier(Bold)` (or the defined theme color).
    - `theme.notice_style()` returns `Style::new()` (no color, no modifier).

## 2. Task Implementation
- [ ] Define `ColorMode` enum (`Color`, `Monochrome`).
- [ ] Define `Theme` trait with methods for:
    - `status_style(StageStatus) -> Style`
    - `log_line_style(LogStream) -> Style`
    - `notice_style() -> Style`
- [ ] Implement `AppTheme` struct with mode-aware logic.
- [ ] Ensure `NO_COLOR` environment variable detection (auto-switch to `Monochrome`).
- [ ] Ensure color is "additive" and never "load-bearing" (per [REQ-003]).

## 3. Code Review
- [ ] Verify that `LogBuffer::truncated` notice uses `Style::new()` (per [REQ-059]).
- [ ] Ensure monochrome mode uses modifiers (Bold/Dim/Reversed) instead of colors to distinguish states.
- [ ] Confirm `LogStream::Stdout` has no default styling.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-tui -- theme`

## 5. Update Documentation
- [ ] Document the `NO_COLOR` support and the monochrome theme fallback strategy in `crates/devs-tui/README.md`.

## 6. Automated Verification
- [ ] Run a `TestBackend` test that renders a log line with both `ColorMode` values and assert on the `Style` attributes (using `ratatui::buffer::Cell` inspections).
