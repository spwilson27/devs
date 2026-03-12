# Task: TUI Event Loop Configuration & Throttling (Sub-Epic: 15_TDD Lifecycle Roadmap)

## Covered Requirements
- [AC-RLOOP-002], [AC-RLOOP-004]

## Dependencies
- depends_on: [01_immutable_render_contract.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-tui/src/event.rs` verifying `EventLoopConfig::default()` returns exactly:
  - `crossterm_buffer`: 256
  - `run_events_buffer`: 256
  - `pool_events_buffer`: 64
  - `connection_buffer`: 32
  - `tick_buffer`: 8
  - `tick_interval_ms`: 1000
- [ ] Write an integration test that uses a bounded `tokio::sync::mpsc::channel` with a capacity of 256 to simulate the `crossterm` event stream.
- [ ] Inject 300 `TuiEvent::Tick` events into the channel and verify that:
  - At most 256 events are processed.
  - The remaining events are dropped.
  - The application does not panic.

## 2. Task Implementation
- [ ] Implement the `EventLoopConfig` struct in `crates/devs-tui/src/event.rs`.
- [ ] Implement `Default` for `EventLoopConfig` with the required values from §5.1.1.
- [ ] Update the `EventLoop` initialization in `app.rs` to use these configured buffer sizes when creating channels.
- [ ] Ensure that `try_send` is used for non-essential events like `Tick` and `Resize` when the channel is full, effectively dropping them to prevent backpressure.
- [ ] Implement the `TuiEvent` enum variants for all required event types if they don't already exist.

## 3. Code Review
- [ ] Verify that essential events (like `RunSnapshot` or `LogLine`) use `send().await` or a sufficiently large buffer to avoid losing critical state updates.
- [ ] Check that the `Tick` interval uses the `tick_interval_ms` from the config.
- [ ] Ensure no infinite loops or deadlocks are possible during high event frequency.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` to confirm the unit and integration tests pass.
- [ ] Verify the "300 events" test case specifically: `cargo test --test event_loop throttling`.

## 5. Update Documentation
- [ ] Add doc comments to `EventLoopConfig` referencing §5.1.1 of `7_UI_UX_DESIGN`.
- [ ] Update internal developer docs to explain the throttling behavior.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no new warnings related to channel usage or asynchronous code.
- [ ] Confirm that `cargo build -p devs-tui` completes without errors.
