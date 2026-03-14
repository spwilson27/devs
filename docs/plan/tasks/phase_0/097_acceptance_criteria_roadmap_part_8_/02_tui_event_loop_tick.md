# Task: TUI Event Loop Tick Timing (Sub-Epic: 097_Acceptance Criteria & Roadmap (Part 8))

## Covered Requirements
- [AC-TIMING-003]

## Dependencies
- depends_on: []
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-tui/src/event_loop.rs` (or `crates/devs-tui/tests/`) that initializes a `Tick` source and collects 5 `Tick` events.
- [ ] Assert that the time taken to receive 5 `Tick` events is 5,000 ms ± 250 ms.
- [ ] Ensure the test is annotated with `// Covers: AC-TIMING-003`.

## 2. Task Implementation
- [ ] Implement a `Tick` event source in the TUI event loop (e.g., using `tokio::time::interval` with a duration of 1,000 ms).
- [ ] Ensure the `Tick` event is dispatched to the main `App` state for processing.
- [ ] Configure the event loop to produce exactly one `Tick` every 1,000 ms, regardless of other events (input, resize, etc.).

## 3. Code Review
- [ ] Verify that the `Tick` interval is explicitly set to 1,000 ms.
- [ ] Confirm that the event loop does not drift significantly over time (though ± 50 ms per tick is allowed by [AC-TIMING-003]).
- [ ] Ensure that `Tick` events continue to arrive even if no user input is present.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and ensure the tick timing test passes.

## 5. Update Documentation
- [ ] Reflect the implementation of the 1,000 ms Tick interval in the TUI technical documentation or agent memory.

## 6. Automated Verification
- [ ] Run the timing test 5 times sequentially to ensure it's not flaky.
- [ ] Verify that `./do test` completes without failures in the TUI crate.
