# Task: Per-Stage Monotonic Log Chunk Sequence Numbers (Sub-Epic: 064_Detailed Domain Specifications (Part 29))

## Covered Requirements
- [2_TAS-REQ-289]

## Dependencies
- depends_on: []
- shared_components: ["devs-proto", "devs-scheduler"]

## 1. Initial Test Written
- [ ] Write a unit test `test_log_chunk_sequence_starts_at_one` that:
  1. Creates a new log chunk emitter for a stage.
  2. Emits the first chunk and asserts its `sequence_number` field is `1`.
- [ ] Write a unit test `test_log_chunk_sequence_monotonically_increases` that:
  1. Emits 10 log chunks for a single stage.
  2. Asserts the sequence numbers are `1, 2, 3, ..., 10` with no gaps or reordering.
- [ ] Write a unit test `test_log_chunk_sequences_are_per_stage` that:
  1. Emits chunks for two different stages in the same run.
  2. Asserts each stage has its own independent sequence starting at `1`.
- [ ] Write a unit test `test_client_detects_sequence_gap` that:
  1. Simulates receiving chunks with sequence numbers `[1, 2, 5, 6]` (gap at 3-4).
  2. Calls a gap-detection utility function and asserts it returns the missing range `[3, 4]`.
- [ ] Write a unit test `test_log_chunk_proto_has_sequence_field` that:
  1. Creates a `LogChunk` proto message and sets `sequence_number = 42`.
  2. Serializes and deserializes, asserting the field round-trips correctly.

## 2. Task Implementation
- [ ] Add a `sequence_number` field (type `uint64`) to the `LogChunk` proto message if not already present.
- [ ] In the server-side log chunk emitter (within the scheduler or executor), maintain a per-stage `AtomicU64` counter initialized to `0`. Each chunk emission increments the counter and assigns the new value as the sequence number.
- [ ] When buffer limits cause chunks to be dropped, do NOT reset or adjust the counter — the gap in sequence numbers is the signal to clients that chunks were lost.
- [ ] In client-side log rendering utilities (CLI `devs logs`, TUI Logs tab), add a helper function `detect_sequence_gaps(chunks: &[LogChunk]) -> Vec<(u64, u64)>` that returns ranges of missing sequence numbers.
- [ ] When a gap is detected, clients should surface a warning message such as `"Warning: {n} log chunks were dropped (sequence {start}-{end})"`.

## 3. Code Review
- [ ] Verify the counter is per-stage, not per-run or global.
- [ ] Confirm the counter uses `AtomicU64` (or equivalent thread-safe mechanism) since chunks may be emitted from async tasks.
- [ ] Verify dropped chunks do not cause sequence number reuse.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --workspace -- log_chunk_sequence` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on the `LogChunk` proto message explaining the sequence number semantics and gap detection contract.

## 6. Automated Verification
- [ ] Run `cargo test --workspace` and verify exit code 0.
