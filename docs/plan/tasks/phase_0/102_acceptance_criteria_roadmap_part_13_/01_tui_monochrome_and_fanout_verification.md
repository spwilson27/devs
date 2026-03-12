# Task: TUI Monochrome and Fan-out Verification (Sub-Epic: 102_Acceptance Criteria & Roadmap (Part 13))

## Covered Requirements
- [AC-TYP-023], [AC-TYP-026]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] In `devs-tui/src/widgets/stage_list.rs` (or similar), create a unit test for `StageRunDisplay::render` that sets up a stage with `fan_out_count = Some(4)`.
- [ ] Verify that the rendered string includes the suffix `"(x4)"` within the 20-character name field [AC-TYP-026].
- [ ] In `devs-tui/tests/snapshots.rs`, create a new snapshot test named `dashboard__monochrome_mode`.
- [ ] This test should invoke the TUI rendering with `NO_COLOR=1` (or setting the `Theme` to `ColorMode::Monochrome`) and capture a snapshot of a dashboard with a running run.

## 2. Task Implementation
- [ ] Implement the `Theme::from_env()` logic (if not already done) to respect the `NO_COLOR` environment variable [AC-TYP-023].
- [ ] Ensure that when `ColorMode::Monochrome` is active, the `ratatui` backend receives no color escape sequences.
- [ ] Update the stage rendering logic to append `(xN)` to the stage name for fan-out stages [AC-TYP-026].
- [ ] Specifically, ensure the combined name and suffix are truncated together to fit within the 20-character field as specified in [UI-DES-041].
- [ ] Capture the `dashboard__monochrome_mode` snapshot and verify it contains no `\x1b[` sequences.

## 3. Code Review
- [ ] Verify that `(xN)` is appended *before* truncation so that the suffix is always visible if possible.
- [ ] Confirm that `NO_COLOR` handling is central (likely in `Theme`) and correctly propagates to all widgets.
- [ ] Check that the `Monochrome` mode doesn't accidentally use bold or italic if they produce escape sequences.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and verify the unit tests for fan-out display pass.
- [ ] Run `cargo insta review` and confirm the monochrome snapshot is ANSI-free.

## 5. Update Documentation
- [ ] Document the `NO_COLOR` support and fan-out naming convention in the TUI developer's guide.

## 6. Automated Verification
- [ ] Run `./do test` and check for successful execution of TUI unit and snapshot tests.
- [ ] Use `grep` to verify the `dashboard__monochrome_mode.snap` file contains no `\x1b` characters.
