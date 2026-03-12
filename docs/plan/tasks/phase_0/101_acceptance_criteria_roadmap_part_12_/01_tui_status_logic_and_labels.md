# Task: TUI Status Styles and Labels (Sub-Epic: 101_Acceptance Criteria & Roadmap (Part 12))

## Covered Requirements
- [AC-TYP-018], [AC-TYP-019]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-tui/src/theme.rs` to verify that `theme.style_for_stage_status(StageStatus::Completed)` returns `STYLE_STANDARD` (no foreground color) when the theme is in Monochrome mode.
- [ ] Create a unit test in `devs-tui/src/labels.rs` (or similar) to verify that `run_status_label(RunStatus::Completed)` returns exactly `"completed"` (all lowercase, no padding).

## 2. Task Implementation
- [ ] In `devs-tui`, implement the `Theme` struct or trait if not already present.
- [ ] Ensure `Theme` has a way to be configured for "Monochrome" mode.
- [ ] Implement `style_for_stage_status` to handle `StageStatus::Completed` correctly in monochrome mode by returning a default/standard style.
- [ ] Implement `run_status_label` function that takes a `RunStatus` (likely from `devs-core`) and returns a static string or `Cow<str>`.
- [ ] Ensure `RunStatus::Completed` maps to `"completed"`.

## 3. Code Review
- [ ] Verify that `STYLE_STANDARD` is used correctly and does not introduce hardcoded colors.
- [ ] Ensure the label function is efficient and uses appropriate return types for status labels.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-tui` and ensure all status-related tests pass.

## 5. Update Documentation
- [ ] Document the theme behavior for monochrome mode in the `devs-tui` README or doc comments.

## 6. Automated Verification
- [ ] Run `./do test` to ensure these new tests are picked up and pass.
