# Task: TUI Event Loop Latency — RunDelta to Render < 50ms (Sub-Epic: 096_Acceptance Criteria & Roadmap (Part 7))

## Covered Requirements
- [AC-TIMING-002]

## Dependencies
- depends_on: ["04_tui_rendering_performance_benchmark.md"]
- shared_components: [devs-core (state types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/tests/event_loop_latency.rs` with annotation `// Covers: AC-TIMING-002`:
    - Write test `test_run_delta_triggers_render_within_50ms()`:
        1. Set up the TUI event loop in a controlled test harness:
            - Create an `AppState` with at least one active run and a few stages.
            - Create a `tokio::sync::mpsc::unbounded_channel::<TuiEvent>()` for the event source.
            - Create an `Arc<AtomicBool>` flag `render_triggered` initialized to `false`.
            - Create an `Arc<Mutex<Option<Instant>>>` `render_timestamp` initialized to `None`.
        2. Spawn the event loop on a Tokio runtime (single-threaded for determinism):
            - The event loop reads from the `mpsc` receiver.
            - On receiving `TuiEvent::RunDelta`, it updates `AppState` and calls `render()`.
            - Immediately after `render()` returns, it records `Instant::now()` into `render_timestamp` and sets `render_triggered` to `true`.
        3. Record `injection_time = Instant::now()`.
        4. Send `TuiEvent::RunDelta { ... }` (with minimal valid payload) into the channel.
        5. Busy-wait (with 1ms sleeps) until `render_triggered` is `true`, with a 500ms timeout (fail if timeout).
        6. Read `render_timestamp` and compute `latency = render_timestamp - injection_time`.
        7. Assert `latency < Duration::from_millis(50)`.
    - Write test `test_multiple_rapid_events_no_cumulative_latency()`:
        1. Same harness setup as above.
        2. Send 10 `TuiEvent::RunDelta` events in rapid succession (no delay between sends).
        3. After all 10 are processed (use an `AtomicUsize` counter), verify the *last* event's injection-to-render latency is still under 50ms.
        4. This ensures the event loop does not introduce cumulative delays from event queuing.

## 2. Task Implementation
- [ ] In `crates/devs-tui/src/event_loop.rs` (or equivalent):
    - Implement the event loop as an async function: `pub async fn run_event_loop(rx: mpsc::UnboundedReceiver<TuiEvent>, state: Arc<Mutex<AppState>>, terminal: Arc<Mutex<Terminal<impl Backend>>>) -> Result<()>`.
    - Use `tokio::select!` to multiplex:
        - `rx.recv()` — process incoming events.
        - `tick_interval.tick()` — periodic tick (1 second) for clock updates.
    - On receiving `TuiEvent::RunDelta`:
        1. Lock `state`, apply the delta.
        2. Lock `terminal`, call `render()`.
        3. No intermediate `sleep()` or `yield_now()` between receiving the event and calling `render()`.
    - The event loop MUST NOT contain any `tokio::time::sleep()` calls that could exceed 50ms.
- [ ] Define the `TuiEvent` enum in `crates/devs-tui/src/event.rs`:
    ```rust
    pub enum TuiEvent {
        RunDelta { /* fields for incremental state update */ },
        Resize(u16, u16),
        Key(crossterm::event::KeyEvent),
        Tick,
    }
    ```
- [ ] Ensure the `mpsc` channel is unbounded (or bounded with sufficient capacity, e.g., 1024) to avoid backpressure blocking the sender.

## 3. Code Review
- [ ] Verify the event loop has no `sleep()` or `delay()` calls between event receipt and render.
- [ ] Verify `tokio::select!` is used (not a polling loop with sleep).
- [ ] Verify locks are held for the minimum duration necessary — lock `state`, update, unlock, then lock `terminal`, render, unlock.
- [ ] Verify the test uses a real Tokio runtime (not `#[tokio::test]` with default single-thread — explicitly use `rt::Builder::new_current_thread()`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --test event_loop_latency -- --nocapture`.
- [ ] Confirm both `test_run_delta_triggers_render_within_50ms` and `test_multiple_rapid_events_no_cumulative_latency` pass.

## 5. Update Documentation
- [ ] Add a doc comment on the `run_event_loop` function documenting the 50ms latency budget per [AC-TIMING-002].

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` includes `AC-TIMING-002` in covered requirements.
- [ ] Run `./do lint` to confirm no new warnings.
