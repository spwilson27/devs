# Task: TUI Theme Monochrome Stage Style and Run Status Labels (Sub-Epic: 101_Acceptance Criteria & Roadmap (Part 12))

## Covered Requirements
- [AC-TYP-018], [AC-TYP-019]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — uses RunStatus/StageStatus enums), devs-tui (owner of theme and label logic)]

## 1. Initial Test Written
- [ ] In `devs-tui/src/theme.rs` (or `devs-tui/src/theme/mod.rs` if module-based), write a unit test `test_monochrome_completed_stage_returns_style_standard`:
  - Construct a `Theme` with `ColorMode::Monochrome` (e.g., `Theme::new(ColorMode::Monochrome)` or `Theme::from_color_mode(ColorMode::Monochrome)`).
  - Call `theme.style_for_stage_status(StageStatus::Completed)`.
  - Assert the returned `ratatui::style::Style` equals `STYLE_STANDARD` — a constant defined as `Style::default()` (i.e., no foreground color, no background color, no modifiers).
  - Add `// Covers: AC-TYP-018` annotation above or inside the test.
- [ ] In `devs-tui/src/theme.rs`, write a second unit test `test_color_completed_stage_returns_green_fg` as a contrast test:
  - Construct a `Theme` with `ColorMode::Color`.
  - Call `theme.style_for_stage_status(StageStatus::Completed)`.
  - Assert the returned `Style` has `fg == Some(Color::Green)`.
  - This test validates the monochrome test is meaningful (monochrome should NOT return green).
- [ ] In `devs-tui/src/labels.rs` (create if not present), write a unit test `test_run_status_label_completed`:
  - Call `run_status_label(RunStatus::Completed)`.
  - Assert the result is exactly `"completed"` — lowercase, no leading/trailing whitespace, no padding.
  - Add `// Covers: AC-TYP-019` annotation.
- [ ] In the same file, write `test_run_status_label_all_variants` that exhaustively matches all `RunStatus` variants and asserts each returns a non-empty lowercase string with no padding. This ensures completeness.

## 2. Task Implementation
- [ ] Define `ColorMode` enum in `devs-tui/src/theme.rs` (or appropriate module) with variants `Color` and `Monochrome`.
- [ ] Define `pub const STYLE_STANDARD: Style = Style::new();` — the zero-styled default with no fg/bg/modifiers.
- [ ] Implement `Theme` struct containing a `color_mode: ColorMode` field.
- [ ] Implement `Theme::new(mode: ColorMode) -> Self`.
- [ ] Implement `Theme::from_env() -> Self` that checks `std::env::var("NO_COLOR")`: if the variable is set (to any value including empty string), use `ColorMode::Monochrome`; otherwise `ColorMode::Color`.
- [ ] Implement `Theme::style_for_stage_status(&self, status: StageStatus) -> Style`:
  - When `self.color_mode == ColorMode::Monochrome`, return `STYLE_STANDARD` for ALL statuses.
  - When `self.color_mode == ColorMode::Color`, return colored styles: `Completed` → green fg, `Running` → blue fg, `Failed` → red fg, `Pending` → gray fg (exact colors may vary; green for Completed is required by the contrast test).
- [ ] In `devs-tui/src/labels.rs`, implement `pub fn run_status_label(status: RunStatus) -> &'static str` using a match:
  - `RunStatus::Pending` → `"pending"`
  - `RunStatus::Running` → `"running"`
  - `RunStatus::Completed` → `"completed"`
  - `RunStatus::Failed` → `"failed"`
  - `RunStatus::Cancelled` → `"cancelled"`
  - All values must be lowercase with no padding.
- [ ] Ensure `StageStatus` and `RunStatus` are imported from `devs-core`. If they don't exist yet in devs-core, define placeholder enums with the required variants and a `// BOOTSTRAP-STUB` comment.

## 3. Code Review
- [ ] Verify `STYLE_STANDARD` is `Style::default()` / `Style::new()` with no color fields set.
- [ ] Verify the monochrome path returns `STYLE_STANDARD` for every status variant, not just `Completed`.
- [ ] Verify `run_status_label` is exhaustive (no `_ =>` wildcard catch-all) so new variants cause a compile error.
- [ ] Verify no `unwrap()` or `panic!()` in non-test code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- test_monochrome_completed_stage_returns_style_standard` and confirm it passes.
- [ ] Run `cargo test -p devs-tui -- test_run_status_label_completed` and confirm it passes.
- [ ] Run `cargo test -p devs-tui` to confirm all tests in the crate pass.

## 5. Update Documentation
- [ ] Add doc comments to `Theme::style_for_stage_status` explaining the monochrome vs color behavior.
- [ ] Add doc comments to `run_status_label` specifying the lowercase/no-padding contract.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the new tests appear in output and pass.
- [ ] Run `cargo test -p devs-tui 2>&1 | grep -c "test result"` to verify test execution occurred.
