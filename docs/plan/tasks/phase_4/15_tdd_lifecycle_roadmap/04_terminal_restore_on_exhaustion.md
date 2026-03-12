# Task: Terminal Restore on Reconnect Exhaustion (Sub-Epic: 15_TDD Lifecycle Roadmap)

## Covered Requirements
- [AC-RLOOP-005]

## Dependencies
- depends_on: [02_event_loop_config_throttling.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Write an E2E test in `crates/devs-tui/tests/e2e/reconnect_exhaustion.rs` using `assert_cmd` (or equivalent).
- [ ] Mock the server connection and simulate a sequence of failed reconnection attempts that exceed the budget.
- [ ] Assert that:
  - The process exits with code 1.
  - The final terminal output does not contain corrupted escape sequences.
  - The process correctly signals to the OS that raw mode has been disabled and the cursor is visible (this can be checked by verifying that the `crossterm::terminal::disable_raw_mode` and `crossterm::cursor::Show` commands were called if using a mock terminal, or by observing terminal behavior in a controlled environment).

## 2. Task Implementation
- [ ] Implement the `TuiEvent::ReconnectBudgetExceeded` variant in `crates/devs-tui/src/event.rs`.
- [ ] Update the `EventLoop` logic to trigger this event when the connection retry count exceeds the limit.
- [ ] Update the `handle_event` or the main `loop` in `app.rs` to catch `TuiEvent::ReconnectBudgetExceeded`.
- [ ] Upon receiving the event, the application MUST:
  - Call `crossterm::terminal::disable_raw_mode()`.
  - Call `crossterm::execute!(stdout, crossterm::cursor::Show)`.
  - Print a final error message to stderr.
  - Call `std::process::exit(1)`.
- [ ] Ensure that this cleanup happens even if the process is terminated by a panic (using `std::panic::set_hook` if necessary, or a `Drop` guard).

## 3. Code Review
- [ ] Verify that no other exit paths (like `Quit` command) skip the terminal restoration.
- [ ] Ensure the error message printed to stderr is machine-stable and matches the design specification.
- [ ] Check that `ReconnectBudgetExceeded` is correctly handled across all TUI tabs.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E test: `cargo test --test e2e reconnect_exhaustion`.
- [ ] Verify that it consistently exits with code 1.

## 5. Update Documentation
- [ ] Document the `ReconnectBudgetExceeded` event and the terminal restoration policy.
- [ ] Update any troubleshooting guides or "agent memory" regarding TUI exit behaviors.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no new warnings related to terminal management.
- [ ] Confirm that `cargo build -p devs-tui` completes successfully.
