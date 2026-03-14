# Task: Implement Idempotent Terminal-State Event Processing (Sub-Epic: 063_Detailed Domain Specifications (Part 28))

## Covered Requirements
- [2_TAS-REQ-280]

## Dependencies
- depends_on: [01_scheduler_state_transitions.md]
- shared_components: [devs-core (consumer — uses StageRunState enum and event processing)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/state_machine.rs` (or the event processing module), create a test module `mod idempotent_event_tests`.
- [ ] **Test: `test_duplicate_completed_event_is_discarded`** — Create a `StageRun` already in `Completed` state. Send a second `StageCompleted` event. Assert the state remains `Completed` and no downstream side effects (e.g., no webhook event emitted, no dependency re-evaluation triggered). The event processing function should return an `Ok(EventResult::Discarded)` or equivalent indicator.
- [ ] **Test: `test_duplicate_failed_event_is_discarded`** — Create a `StageRun` in `Failed` state. Send another `StageFailed` event. Assert state unchanged and event discarded.
- [ ] **Test: `test_completed_then_failed_is_discarded`** — Create a `StageRun` in `Completed` state. Send a `StageFailed` event (cross-terminal). Assert state remains `Completed` and the failed event is discarded. This is the key idempotency case — once terminal, no further transitions.
- [ ] **Test: `test_failed_then_completed_is_discarded`** — Create a `StageRun` in `Failed` state. Send a `StageCompleted` event. Assert state remains `Failed`.
- [ ] **Test: `test_timed_out_then_completed_is_discarded`** — Create a `StageRun` in `TimedOut` state. Send a `StageCompleted` event. Assert state remains `TimedOut`.
- [ ] **Test: `test_cancelled_then_any_terminal_is_discarded`** — Create a `StageRun` in `Cancelled` state. Send `StageCompleted`, `StageFailed`, `StageTimedOut` events. Assert all are discarded.
- [ ] **Test: `test_non_terminal_event_still_processed`** — Create a `StageRun` in `Running` state. Send a `StageCompleted` event. Assert it transitions to `Completed` normally. This ensures the idempotency guard doesn't block legitimate transitions.
- [ ] **Test: `test_at_most_one_terminal_per_tick`** — In a single scheduler tick, deliver two `StageCompleted` events for the same stage (simulating a race). Assert only the first is processed and the second returns `Discarded`.
- [ ] Annotate all tests with `// Covers: [2_TAS-REQ-280]`.
- [ ] Verify all tests fail (Red phase) before implementation.

## 2. Task Implementation
- [ ] In the event processing function (wherever terminal events like `StageCompleted`, `StageFailed`, `StageTimedOut`, `StageCancelled` are handled), add a guard at the top: if the stage is already in a terminal state (`Completed`, `Failed`, `Cancelled`, `TimedOut`), discard the event immediately.
- [ ] Define terminal states as a helper method on `StageRunState`: `fn is_terminal(&self) -> bool` returning `true` for `Completed | Failed | Cancelled | TimedOut`.
- [ ] The event processing function should return a result type that distinguishes between `Applied` (state changed) and `Discarded` (idempotent no-op) so callers know whether to propagate side effects.
- [ ] Add a `tracing::debug!("Discarding duplicate terminal event {:?} for stage {} already in {:?}", event, stage_id, current_state)` log line when discarding.
- [ ] Add a doc comment on the event processing function quoting [2_TAS-REQ-280]: "The scheduler MUST process at most one terminal-state event per stage per tick; duplicate events are idempotent."
- [ ] Ensure the guard is checked BEFORE any side effects (webhook dispatch, dependency re-evaluation) occur.

## 3. Code Review
- [ ] Verify `is_terminal()` covers exactly the four states: `Completed`, `Failed`, `Cancelled`, `TimedOut`.
- [ ] Ensure the discard path does not log at `WARN` or `ERROR` level — `DEBUG` is correct since duplicates are expected in concurrent scenarios.
- [ ] Confirm no side effects leak past the guard (no webhook events, no state writes, no metric increments for discarded events).
- [ ] Check that the `EventResult` enum (or equivalent) is used consistently by all callers.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- idempotent_event_tests` to verify all 8 tests pass.
- [ ] Run `./do lint` to ensure clippy, fmt, and doc standards are met.

## 5. Update Documentation
- [ ] Add a note in the state machine module docs explaining the idempotency invariant: once a stage reaches a terminal state, it cannot transition again.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` maps `2_TAS-REQ-280` to the new tests.
- [ ] Run `grep -r 'Covers:.*2_TAS-REQ-280' crates/` to confirm annotations exist.
