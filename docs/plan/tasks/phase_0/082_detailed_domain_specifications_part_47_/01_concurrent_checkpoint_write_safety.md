# Task: Concurrent Checkpoint Write Safety for Fan-Out Stage Completions (Sub-Epic: 082_Detailed Domain Specifications (Part 47))

## Covered Requirements
- [2_TAS-REQ-485]

## Dependencies
- depends_on: ["none"]
- shared_components: [devs-core (consumer), devs-checkpoint (consumer), devs-scheduler (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/tests/concurrent_write_safety.rs`, create a test `test_concurrent_fan_out_completions_serialize_correctly` that:
  1. Creates an in-memory `Arc<RwLock<HashMap<RunId, WorkflowRun>>>` with a single run containing a fan-out stage with 4 sub-stages.
  2. Spawns 4 `tokio::spawn` tasks that each simultaneously:
     a. Acquire the `RwLock` write guard on the runs map.
     b. Apply a stage completion transition (marking one sub-stage as `Completed`).
     c. Release the lock.
     d. Call `save_checkpoint()` which re-reads from the in-memory map (not from disk or a stale local copy).
  3. After all 4 tasks join, reads `checkpoint.json` from disk and asserts all 4 sub-stages are marked `Completed`.
  4. Asserts that the final checkpoint file reflects the union of all transitions.
- [ ] Add a test `test_checkpoint_writer_reads_current_state_not_stale` that:
  1. Creates a run with 2 concurrent completions.
  2. Task A acquires the lock, transitions stage 1, releases, but delays before writing.
  3. Task B acquires the lock, transitions stage 2, releases, and writes immediately.
  4. Task A then writes — assert it re-reads the current in-memory state (containing both transitions), not its stale local snapshot.
  5. Verify final checkpoint contains both stage transitions.

## 2. Task Implementation
- [ ] In the checkpoint write path (e.g., `save_checkpoint` in `devs-checkpoint`), ensure the function:
  1. Does NOT accept a pre-serialized state snapshot as input.
  2. Instead, accepts an `Arc<RwLock<HashMap<RunId, WorkflowRun>>>` reference and acquires a read lock at write time to serialize the current state.
  3. This guarantees that a writer who lost the lock race will still write the most up-to-date state.
- [ ] Ensure the `RwLock` write guard for state transitions and the checkpoint file write are NOT held simultaneously — the lock is released after the in-memory transition, then the checkpoint write re-reads.
- [ ] Add a code comment referencing `2_TAS-REQ-485` at the re-read point.

## 3. Code Review
- [ ] Verify no checkpoint write path holds a cached/stale copy of the run state between lock release and file write.
- [ ] Verify `RwLock` is used (not `Mutex`) to allow concurrent reads during serialization.
- [ ] Confirm the pattern: acquire write lock → mutate → release → acquire read lock → serialize → write file.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint concurrent_write_safety` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-485` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint concurrent_write_safety -- --nocapture 2>&1 | grep -E "test result:.*passed"` and verify 0 failures.
