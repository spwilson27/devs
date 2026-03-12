# Task: Tab Navigation and Event Handling (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [1_PRD-REQ-038]
- [6_UI_UX_ARCHITECTURE-REQ-050]
- [6_UI_UX_ARCHITECTURE-REQ-062]
- [6_UI_UX_ARCHITECTURE-REQ-063]
- [6_UI_UX_ARCHITECTURE-REQ-064]
- [6_UI_UX_ARCHITECTURE-REQ-065]
- [6_UI_UX_ARCHITECTURE-REQ-066]
- [6_UI_UX_ARCHITECTURE-REQ-321]
- [6_UI_UX_ARCHITECTURE-REQ-347]
- [6_UI_UX_ARCHITECTURE-REQ-461]
- [6_UI_UX_ARCHITECTURE-REQ-467]
- [6_UI_UX_ARCHITECTURE-REQ-470]

## Dependencies
- depends_on: [04_tui_base_layout_and_state.md, 03_ui_strings_and_hygiene.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a test that simulates a key press `1` and asserts `AppState::active_tab` becomes `Dashboard`.
- [ ] Create a test that simulates a key press `q` and asserts the app signals shutdown.
- [ ] Create a test that simulates a key press `?` and asserts `AppState::help_visible` becomes `true`.
- [ ] Create a test that verifies `StatusBar` text when `connection_status` is `Disconnected`.

## 2. Task Implementation
- [ ] Implement the `TabBar` widget to render 4 tabs: Dashboard, Logs, Debug, Pools.
- [ ] Implement keybindings: `1-4` for tab switching, `q` to quit, `?` for help.
- [ ] Create the `HelpOverlay` widget that toggles on `?`.
- [ ] Implement the `StatusBar` widget to show connection state, current tab, and global status messages.
- [ ] Ensure `AppState::active_tab` is used by the `MainArea` to determine which tab widget to render.
- [ ] Verify that `STATUS_*` constants are used for all stage status labels in the TUI.

## 3. Code Review
- [ ] Verify that tabs do not share mutable state directly.
- [ ] Ensure that keypresses are handled in a central event loop.
- [ ] Verify that all strings are from `strings.rs`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui` and check the unit test results.
