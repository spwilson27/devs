# Task: TUI Keyboard Event Handling (Sub-Epic: 094_Acceptance Criteria & Roadmap (Part 5))

## Covered Requirements
- [AC-KEY-005], [AC-KEY-006]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui, devs-core]

## 1. Initial Test Written
- [ ] Write a unit test for `dispatch_key()` in `devs-tui/src/app.rs` (or equivalent) that passes an unrecognized key character. The test should assert that the `AppState` remains identical before and after the call.
- [ ] Use `tracing-test` to verify that no `tracing` output is emitted for unrecognized keys.
- [ ] Write integration tests using `ratatui::backend::TestBackend` and `insta` snapshots for every documented keybinding in the TUI (e.g., Tab for switching views, arrow keys for navigation, 'q' for quit).
- [ ] Ensure snapshots are created for each key context combination (e.g., Tab in Dashboard vs Tab in Logs).

## 2. Task Implementation
- [ ] Implement the `dispatch_key()` function in `devs-tui`. It should match incoming keyboard events against the authoritative keybinding table.
- [ ] For recognized keys, update the `AppState` accordingly (e.g., change `active_tab`, update `selected_run_id`).
- [ ] For unrecognized keys, return immediately without mutating state and without logging any warnings or errors to `tracing`.
- [ ] Ensure all keybindings listed in the UI design specification are implemented.

## 3. Code Review
- [ ] Verify that `dispatch_key()` is pure where possible, making it easy to test.
- [ ] Ensure the keybinding table is centralized and easy to update.
- [ ] Verify that `tracing` is not used for normal (unrecognized) key events to avoid log spam.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and ensure all keyboard handling tests pass.
- [ ] Review `insta` snapshots to confirm that keybindings produce the intended UI changes.

## 5. Update Documentation
- [ ] Update internal developer documentation if any new keybinding patterns were introduced.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-KEY-005] and [AC-KEY-006] as covered.
