# Task: Theme Monochrome Mode and NO_COLOR Support (Sub-Epic: 092_Acceptance Criteria & Roadmap (Part 3))

## Covered Requirements
- [AC-ASCII-026], [AC-ASCII-027]

## Dependencies
- depends_on: []
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a new unit test in `crates/devs-tui/src/theme_tests.rs` (or `crates/devs-tui/src/theme.rs` unit tests).
- [ ] Implement `test_theme_from_env_no_color()`:
    - Set the environment variable `NO_COLOR=1`. [AC-ASCII-026]
    - Call `Theme::from_env()`.
    - Assert that the returned theme uses `ColorMode::Monochrome`.
- [ ] Implement `test_theme_monochrome_rendering()`:
    - Set up a representative `AppState`.
    - Render the TUI application (or a set of widgets) using a theme with `ColorMode::Monochrome`. [AC-ASCII-027]
    - Render to a `ratatui::backend::TestBackend`.
    - Iterate through all cells in the rendered buffer.
    - Assert that NO cell has a foreground or background color other than the default/unspecified color (e.g., `Color::Reset`).
- [ ] Add requirement annotations `// Verifies [AC-ASCII-026]` and `// Verifies [AC-ASCII-027]` to these tests.

## 2. Task Implementation
- [ ] Define (or update) the `Theme` struct and `ColorMode` enum in `crates/devs-tui/src/theme.rs`.
- [ ] Implement `Theme::from_env()`:
    - Check for the existence of the `NO_COLOR` environment variable. If set to any value (or specific values as per standard), return `ColorMode::Monochrome`. [AC-ASCII-026]
- [ ] Ensure that when `ColorMode::Monochrome` is active, all `ratatui::style::Style` applications in the TUI return styles without color modifiers (no `fg` or `bg` colors). [AC-ASCII-027]
- [ ] Implement (or update) the `Theme` logic to support at least two modes: `FullColor` and `Monochrome`.

## 3. Code Review
- [ ] Verify that `NO_COLOR` is handled according to the `no-color.org` specification (any value including empty string, though typically `1`).
- [ ] Confirm that `Monochrome` mode completely strips all colors from the UI, ensuring high-contrast readability on non-color terminals.
- [ ] Ensure that `devs_proto` types are not referenced in the `theme.rs` module.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` to execute the unit tests.
- [ ] Ensure `test_theme_from_env_no_color` and `test_theme_monochrome_rendering` pass.

## 5. Update Documentation
- [ ] Document the `NO_COLOR` support and monochrome mode behavior in `.agent/MEMORY.md`.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to confirm that [AC-ASCII-026] and [AC-ASCII-027] are correctly traced.
