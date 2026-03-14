# Task: gRPC Server-Streaming Behavior Contracts (Sub-Epic: 035_Foundational Technical Requirements (Part 26))

## Covered Requirements
- [2_TAS-REQ-086M]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto (consumer), devs-core (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/streaming_contracts.rs`, write the following tests **before** implementation:
  - **StreamRunEvents contract tests:**
    - `test_stream_run_events_initial_message_is_snapshot`: Create a mock/test `RunEventBuffer` with a known `WorkflowRun` state. Call the stream initialization logic. Assert the first emitted event has `event_type == "run.snapshot"` and contains the full current run state (all stage runs included).
    - `test_stream_run_events_subsequent_are_state_transitions`: After the initial snapshot, push a state change. Assert the next event has `event_type` of `"run.status_changed"` or `"stage.status_changed"` (not `"run.snapshot"`).
    - `test_stream_run_events_backpressure_drops_oldest`: Create a `RunEventBuffer` with capacity 256. Push 257 events without consuming. Assert buffer size is 256 and the first (oldest) event was dropped, not the most recent.
    - `test_stream_run_events_terminal_state_closes_stream`: Push a `RunStatus::Completed` event. Assert the stream emits the terminal event and then signals completion (returns `None` on next poll).
    - `test_stream_run_events_nonexistent_run_returns_not_found`: Call stream initialization with a `RunId` that doesn't exist. Assert the result is a `NOT_FOUND` error (not a stream).
    - `test_stream_run_events_already_terminal_sends_snapshot_then_closes`: Initialize a stream for a run already in `Completed` state. Assert exactly one event is emitted (`event_type == "run.snapshot"` with terminal status), then stream closes.
  - **StreamLogs contract tests:**
    - `test_stream_logs_no_follow_returns_existing_then_closes`: Create a buffer with 5 log chunks. Call with `follow: false`. Assert exactly 5 chunks returned in `sequence` order, then stream closes.
    - `test_stream_logs_no_follow_empty_returns_zero_chunks`: Stage in `Waiting` state, no log data. Call with `follow: false`. Assert zero chunks, stream closes immediately.
    - `test_stream_logs_follow_streams_existing_then_waits`: Create a buffer with 3 chunks. Call with `follow: true`. Assert 3 chunks received, then the stream blocks (does not close).
    - `test_stream_logs_follow_terminal_sends_done_chunk`: With `follow: true`, push a terminal stage status. Assert a final chunk with `done: true` and empty `data` is emitted, then stream closes.
    - `test_stream_logs_chunk_size_max_32kib`: Push 64 KiB of data from an agent write. Assert the buffer splits it into at least 2 chunks, each with `data.len() <= 32768`.
    - `test_stream_logs_sequence_numbers_monotonic_from_one`: Push 3 chunks. Assert sequence numbers are `1`, `2`, `3`.
  - **WatchPoolState contract tests:**
    - `test_watch_pool_initial_message_is_snapshot`: Initialize pool watch. Assert first event has `event_kind == "pool.snapshot"`.
    - `test_watch_pool_backpressure_drops_oldest`: Same 256-buffer behavior as `StreamRunEvents`.
    - `test_watch_pool_stream_stays_open`: After initial snapshot, assert stream does not close (it remains open until client disconnect).

## 2. Task Implementation
- [ ] In `crates/devs-core/src/streaming.rs`, implement foundational streaming buffer types:
  - `pub struct EventBuffer<T>` — a bounded ring buffer with configurable capacity (default 256). Methods:
    - `new(capacity: usize) -> Self`
    - `push(&self, event: T)` — if full, drops the oldest entry. Logs dropped events at `tracing::debug!`.
    - `subscribe(&self) -> EventReceiver<T>` — returns a receiver that gets the current snapshot as first item, then subsequent pushes.
  - `pub struct LogChunkBuffer` — specialized buffer for log streaming. Fields: `chunks: Vec<LogChunk>`, `next_sequence: u64` (starts at 1). Methods:
    - `append(&mut self, data: &[u8])` — splits data into <= 32768-byte chunks, assigns monotonically increasing sequence numbers.
    - `iter_from(&self, start_sequence: u64) -> impl Iterator<Item = &LogChunk>`
    - `mark_done(&mut self)` — appends a final chunk with `done: true` and empty `data`.
  - `pub struct LogChunk` — fields: `sequence: u64`, `data: Vec<u8>`, `done: bool`.
- [ ] Add `pub mod streaming;` to `crates/devs-core/src/lib.rs`.
- [ ] Define streaming behavior constants in `crates/devs-core/src/streaming.rs`:
  - `pub const EVENT_BUFFER_CAPACITY: usize = 256;`
  - `pub const LOG_CHUNK_MAX_BYTES: usize = 32_768;`

## 3. Code Review
- [ ] Verify `EventBuffer` is `Send + Sync` (required for use across async tasks).
- [ ] Verify the ring buffer drops the **oldest** event on overflow, not the newest.
- [ ] Verify `LogChunkBuffer` sequence numbers start at 1 (not 0) and never reset.
- [ ] Verify chunk splitting handles exact 32 KiB boundaries correctly (no off-by-one).
- [ ] Verify the `subscribe` method provides the initial snapshot semantics required by all three streaming RPCs.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- streaming` to verify all streaming contract tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `EventBuffer` and `LogChunkBuffer` referencing [2_TAS-REQ-086M] and the three specific RPC behaviors.
- [ ] Document the backpressure policy (drop oldest, log at DEBUG) in the module-level doc comment.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm zero warnings.
