# Task: Checkpoint Concurrent Write Safety (Sub-Epic: 082_Detailed Domain Specifications (Part 47))

## Covered Requirements
- [2_TAS-REQ-485]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Write a multi-threaded integration test in `devs-core` that simulates multiple stages completing simultaneously for a fan-out workflow.
- [ ] Use a mock `CheckpointStore` that records the sequence and content of `write_checkpoint` calls.
- [ ] Verify that the final `checkpoint.json` reflects all concurrent state transitions, not just the last one to finish.
- [ ] Verify that the `RwLock` write guard is held during the state transition and the subsequent checkpoint write initiation.

## 2. Task Implementation
- [ ] In `devs-core`, ensure the `StateMachine` implementation uses an `RwLock<WorkflowRun>` (or equivalent) for the authoritative state.
- [ ] When a stage completes, acquire the write guard.
- [ ] Apply the transition to the in-memory `WorkflowRun`.
- [ ] Trigger a `write_checkpoint` call that uses the current, updated in-memory state.
- [ ] Ensure that even if multiple threads are calling `write_checkpoint` concurrently, the `RwLock` ensures they are serialized and each write uses the latest state from the in-memory map.
- [ ] Implementation must satisfy the requirement that a write that loses the lock race re-reads the current state from the in-memory map (which is implicit if the guard is held while accessing the map).

## 3. Code Review
- [ ] Verify that the `RwLock` is not held longer than necessary but covers the transition and the state snapshot for writing.
- [ ] Ensure no deadlocks are introduced by the checkpoint writing logic.
- [ ] Check that `devs-checkpoint` `write_checkpoint` is thread-safe or called within a serialized context.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify the multi-threaded completion logic.
- [ ] Run `cargo test -p devs-checkpoint` if applicable.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect the implementation of concurrent write safety in the state machine and checkpointing.

## 6. Automated Verification
- [ ] Run `./do verify_requirements.py` to ensure `[2_TAS-REQ-485]` is correctly mapped to the test.
