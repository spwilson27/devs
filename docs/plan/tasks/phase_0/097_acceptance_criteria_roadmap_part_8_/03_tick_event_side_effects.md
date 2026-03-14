# Task: Tick Event Side Effects Implementation (Sub-Epic: 097_Acceptance Criteria & Roadmap (Part 8))

## Covered Requirements
- [AC-TIMING-004], [AC-TIMING-005]

## Dependencies
- depends_on: ["02_tui_event_loop_tick.md"]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-tui/src/state.rs` (or `crates/devs-tui/tests/`) that sets a `StatusMessage` with `expires_at` in the past.
- [ ] Inject a `Tick` event into the `AppState` and assert that the `StatusMessage` is cleared (set to `None`).
- [ ] Add a unit test that creates a `LogBuffer` for a terminal run (Completed, Failed, or Cancelled) that is NOT currently selected in the TUI.
- [ ] Set its `last_appended_at` timestamp to more than 30 minutes in the past.
- [ ] Inject a `Tick` event and assert that the `LogBuffer` is evicted from `AppState`.
- [ ] Ensure the tests are annotated with `// Covers: AC-TIMING-004` and `// Covers: AC-TIMING-005`.

## 2. Task Implementation
- [ ] Implement a `handle_tick(&mut self)` method in `AppState` (or a similar location in the TUI state management).
- [ ] Inside `handle_tick`, iterate through the current `StatusMessage` (if any) and clear it if its `expires_at` timestamp is less than or equal to the current time.
- [ ] Also inside `handle_tick`, iterate through all `LogBuffer` entries in `AppState`.
- [ ] Evict (remove from the map/collection) any `LogBuffer` that satisfies all of these conditions:
    - The associated `WorkflowRun` is in a terminal state (`Completed`, `Failed`, or `Cancelled`).
    - The run is NOT the currently selected run in any TUI tab.
    - The `last_appended_at` timestamp of the buffer is more than 30 minutes older than the current time.

## 3. Code Review
- [ ] Verify that `last_appended_at` is updated correctly whenever new logs are added to the buffer.
- [ ] Confirm that active (running) runs NEVER have their log buffers evicted, even if they've been idle for 30 minutes.
- [ ] Ensure that the currently selected run's buffers are protected from eviction.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and ensure the tick side-effect tests pass.

## 5. Update Documentation
- [ ] Record the TUI's log buffer eviction and status message clearing behaviors in the agent memory or project documentation.

## 6. Automated Verification
- [ ] Verify that `./do test` passes without failures.
- [ ] Run the eviction test with a mocked clock (if possible) to ensure precise 30-minute behavior.
