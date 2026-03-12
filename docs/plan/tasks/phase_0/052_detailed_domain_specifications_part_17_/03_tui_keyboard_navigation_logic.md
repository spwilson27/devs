# Task: TUI Keyboard Navigation and Input Handling (Sub-Epic: 052_Detailed Domain Specifications (Part 17))

## Covered Requirements
- [2_TAS-REQ-133]

## Dependencies
- depends_on: [02_tui_test_infrastructure_setup.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Write a test in `devs-tui` that simulates key events (e.g., `Tab`, `1`, `Down`, `Enter`) and verifies the resulting state changes:
    - `Tab` cycles to the next tab.
    - `1` jumps to the Dashboard.
    - `Down` updates the selected run index in the Dashboard.
    - `Enter` marks a run as selected.
- [ ] Use `insta` snapshots to verify that the UI reflects the navigation state (e.g., highlighting changes).

## 2. Task Implementation
- [ ] Implement a unified event handler in `devs-tui/src/events.rs` that processes `crossterm::event::KeyEvent`.
- [ ] Map the following keyboard interactions:
    - `Tab` / `Shift+Tab`: Cycle through tabs.
    - `1` `2` `3` `4`: Jump to specific tabs (Dashboard, Logs, Debug, Pools).
    - `↑` `↓`: Move selection in the run list.
    - `Enter`: Select the highlighted run.
    - `p`, `c`, `y`, `n`, `Esc`: Map as per [2_TAS-REQ-133].
    - `↑` `↓` `PgUp` `PgDn` `f` `g` `G`: Map log scrolling and follow mode toggles.
    - `q` / `Ctrl+C`: Quit the application.
- [ ] Ensure the handler correctly updates the internal `TuiState` (to be implemented/defined in `devs-tui/src/state.rs`).
- [ ] Implement confirmations for destructive actions (like `c` for cancel).

## 3. Code Review
- [ ] Verify that the input handler is decoupled from the rendering logic for easier testing.
- [ ] Check that all key events match the specification in [2_TAS-REQ-133] exactly.
- [ ] Confirm that `missing_docs = "deny"` is respected for all event types and handler functions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` to verify the event handling logic and state transitions.
- [ ] Manual test: Use the `./do build` command to run the TUI in a real terminal if a mockup server is available.

## 5. Update Documentation
- [ ] Update `devs-tui/README.md` with a "Keyboard Shortcuts" section based on this implementation.
- [ ] Note any deviations or clarifications made during implementation in the agent's "memory."

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no formatting or clippy errors.
- [ ] Run `./do test` and check `target/traceability.json` to ensure [2_TAS-REQ-133] is covered.
