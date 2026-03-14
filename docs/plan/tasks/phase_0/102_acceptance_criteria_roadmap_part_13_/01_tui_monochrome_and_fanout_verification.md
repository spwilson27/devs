# Task: TUI Monochrome NO_COLOR Rendering and Fan-Out Stage Display (Sub-Epic: 102_Acceptance Criteria & Roadmap (Part 13))

## Covered Requirements
- [AC-TYP-023], [AC-TYP-026]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — stage/run display types)]

## 1. Initial Test Written
- [ ] In `crates/devs-tui/src/widgets/` (e.g., `stage_box.rs` or `stage_list.rs`), write a unit test `test_fanout_stage_renders_count_suffix` that constructs a `StageRunDisplay` with `name = "build"` and `fan_out_count = Some(4)`, then asserts the rendered name region contains the substring `"(x4)"` and the total rendered width does not exceed 20 characters. Tag with `// Covers: AC-TYP-026`.
- [ ] Write a second unit test `test_fanout_stage_name_truncation_with_suffix` that uses a long stage name (e.g., `"very_long_stage_name_here"`) with `fan_out_count = Some(12)`. Assert that the combined `name + " (x12)"` is truncated to exactly 20 characters using the project's `truncate_with_tilde` function, and that the `(x12)` suffix remains visible. Tag with `// Covers: AC-TYP-026`.
- [ ] In `crates/devs-tui/tests/snapshots.rs` (or the existing snapshot test module), write a snapshot test `dashboard__run_running_monochrome` that sets `std::env::set_var("NO_COLOR", "1")` (or configures `Theme` with `ColorMode::Monochrome`), renders a dashboard widget containing at least one running workflow run, captures the output via `insta::assert_snapshot!`, and asserts the snapshot string contains zero occurrences of `\x1b[`. Tag with `// Covers: AC-TYP-023`.
- [ ] Write a companion unit test `test_no_color_disables_all_ansi` that renders a single widget (e.g., a status label) with `NO_COLOR=1`, captures the output buffer bytes, and asserts no byte sequence `\x1b[` exists. Tag with `// Covers: AC-TYP-023`.

## 2. Task Implementation
- [ ] Implement or verify `Theme::from_env()` (or equivalent) reads the `NO_COLOR` environment variable. When `NO_COLOR` is set to any non-empty value, all `ratatui::style::Style` values returned by the theme must have `fg = None`, `bg = None`, and no color modifiers. This satisfies [AC-TYP-023].
- [ ] In the stage rendering function (e.g., `render_stage_box` or `StageRunDisplay::to_line`), when `fan_out_count` is `Some(n)` and `n > 1`, append ` (x{n})` to the stage name string *before* applying truncation. The combined string is then passed through `truncate_with_tilde(combined, 20)`. This satisfies [AC-TYP-026].
- [ ] Ensure the monochrome theme propagates to all child widgets — verify no widget directly constructs `Style::default().fg(Color::...)` without going through the theme.
- [ ] Capture and commit the `dashboard__run_running_monochrome` insta snapshot file.

## 3. Code Review
- [ ] Verify `(xN)` suffix is appended before truncation so it is preserved when space allows.
- [ ] Verify `NO_COLOR` handling is centralized in one location (e.g., `Theme`) — no per-widget color checks.
- [ ] Confirm monochrome mode also suppresses `Bold` if it produces escape sequences on the test terminal backend (ratatui `TestBackend` should be safe, but verify).
- [ ] Ensure `fan_out_count = Some(1)` does NOT render `(x1)` — only counts > 1 trigger the suffix.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- fanout` and verify all fan-out display tests pass.
- [ ] Run `cargo test -p devs-tui -- monochrome` and verify all monochrome tests pass.
- [ ] Run `cargo insta test -p devs-tui` and review any new/changed snapshots.

## 5. Update Documentation
- [ ] Add doc comments to `Theme::from_env()` explaining `NO_COLOR` support and linking to https://no-color.org/.
- [ ] Add doc comment to the fan-out rendering logic explaining the `(xN)` convention and truncation behavior.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all TUI tests pass.
- [ ] Grep the committed snapshot file for `\x1b` and confirm zero matches: `grep -c '\\x1b' crates/devs-tui/tests/snapshots/dashboard__run_running_monochrome.snap` should output `0`.
