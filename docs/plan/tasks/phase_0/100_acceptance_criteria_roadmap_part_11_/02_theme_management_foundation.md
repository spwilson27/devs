# Task: Theme Management Foundation (Sub-Epic: 100_Acceptance Criteria & Roadmap (Part 11))

## Covered Requirements
- [AC-TYP-015], [AC-TYP-016], [AC-TYP-017]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/008_proto_core_foundation/03_setup_devs_core_foundation.md]
- shared_components: [devs-tui, devs-core]

## 1. Initial Test Written
- [ ] Add the following tests to `crates/devs-tui/src/theme.rs`:
  - `test_theme_no_color_env`: [AC-TYP-015] Verify that `Theme::from_env()` returns `ColorMode::Monochrome` when `NO_COLOR` is set (including empty value).
  - `test_theme_default_color_env`: [AC-TYP-016] Verify that `Theme::from_env()` returns `ColorMode::Color` when `NO_COLOR` is NOT set.
  - `test_style_for_completed_status`: [AC-TYP-017] Verify that `theme.style_for_stage_status(StageStatus::Completed)` returns a `Style` with `fg = Color::Green` in Color mode.
- [ ] Ensure tests are annotated with `// Covers: AC-TYP-015`, `// Covers: AC-TYP-016`, and `// Covers: AC-TYP-017`.

## 2. Task Implementation
- [ ] Create/Update `crates/devs-tui/src/theme.rs`.
- [ ] Implement `ColorMode` enum:
  ```rust
  pub enum ColorMode {
      Color,
      Monochrome,
  }
  ```
- [ ] Implement `Theme` struct:
  ```rust
  use ratatui::style::{Color, Style};
  // Ensure StageStatus is imported from devs-core or devs-proto as defined in the domain foundation.
  use devs_core::StageStatus; 

  pub struct Theme {
      pub mode: ColorMode,
  }

  impl Theme {
      pub fn from_env() -> Self {
          // Check NO_COLOR environment variable.
          let mode = if std::env::var_os("NO_COLOR").is_some() {
              ColorMode::Monochrome
          } else {
              ColorMode::Color
          };
          Self { mode }
      }

      pub fn style_for_stage_status(&self, status: StageStatus) -> Style {
          match self.mode {
              ColorMode::Color => {
                  match status {
                      StageStatus::Completed => Style::default().fg(Color::Green),
                      // Implement other status stylings as required by the spec.
                      _ => Style::default(),
                  }
              }
              ColorMode::Monochrome => Style::default(), // No color in monochrome.
          }
      }
  }
  ```
- [ ] Ensure `ratatui` is added to `devs-tui` dependencies in `crates/devs-tui/Cargo.toml`.

## 3. Code Review
- [ ] Confirm that `AC-TYP-015` and `AC-TYP-016` correctly handle the `NO_COLOR` standard.
- [ ] Confirm that `AC-TYP-017` returns `Color::Green` specifically for `StageStatus::Completed` in Color mode.
- [ ] Ensure that `Theme` does not use global state (like `once_cell`) unless strictly necessary; prefer passing it as context during TUI rendering as per `UI-DES-PHI-030`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib theme::tests` and ensure all tests pass.
- [ ] Use `serial_test` crate for environment variable tests if needed, or clear the environment variable carefully.

## 5. Update Documentation
- [ ] Update `crates/devs-tui/README.md` with information on how the theme system handles `NO_COLOR`.

## 6. Automated Verification
- [ ] Run `./do lint` and verify code quality.
- [ ] Verify requirement-to-test traceability using `.tools/verify_requirements.py`.
