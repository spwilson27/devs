# Task: TUI Event Loop Latency Verification (Sub-Epic: 096_Acceptance Criteria & Roadmap (Part 7))

## Covered Requirements
- [AC-TIMING-002]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-tui/tests/event_latency_test.rs`:
    - Start the TUI event loop in a background thread.
    - Inject a `TuiEvent::RunDelta` into the event channel.
    - Capture the timestamp immediately before injection.
    - Instrument the `render()` trigger to record the timestamp when it starts.
    - Assert that the difference is less than 50 ms.

## 2. Task Implementation
- [ ] Implement the event loop in `devs-tui` using `tokio::select!` or a similar mechanism that prioritizes event processing.
- [ ] Ensure that the event loop does not have any `sleep()` or `delay()` calls that could exceed 50 ms.
- [ ] Use `std::time::Instant` for precise timing measurements in the test.

## 3. Code Review
- [ ] Verify that the event loop correctly handles multiple simultaneous events without cumulative latency.
- [ ] Ensure that the test harness does not introduce artificial delays.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --test event_latency_test`.

## 5. Update Documentation
- [ ] Update the TUI architecture documentation to reflect the event-driven rendering model and its latency guarantees.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-TIMING-002] as covered.
