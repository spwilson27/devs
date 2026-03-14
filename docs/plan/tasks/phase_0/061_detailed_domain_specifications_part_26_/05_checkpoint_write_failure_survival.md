# Task: Server Survival of Checkpoint Write Failure (Sub-Epic: 061_Detailed Domain Specifications (Part 26))

## Covered Requirements
- [2_TAS-REQ-271]

## Dependencies
- depends_on: [02_persistence_before_event_broadcast.md, 04_corrupt_checkpoint_isolation.md]
- shared_components: [devs-core (consumer), devs-checkpoint (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/state_mutation.rs` (alongside the tests from task 02), write tests for the write-failure path. All tests annotated with `// Covers: 2_TAS-REQ-271`.
- [ ] Write test `test_persist_failure_does_not_crash`:
  ```rust
  // Covers: 2_TAS-REQ-271
  #[test]
  fn test_persist_failure_does_not_crash() {
      let state = Arc::new(RwLock::new(RunState::new_test()));
      let mut persister = MockCheckpointPersister::new();
      let mut broadcaster = MockEventBroadcaster::new();
      persister.expect_persist()
          .times(1)
          .returning(|_| Err(CheckpointError::Io(io::Error::new(io::ErrorKind::Other, "disk full"))));
      broadcaster.expect_broadcast().times(0); // must NOT be called
      let result = apply_transition(&state, StageCompleted { .. }, &persister, &broadcaster);
      assert!(result.is_err()); // error is returned, not panicked
  }
  ```
- [ ] Write test `test_persist_failure_preserves_in_memory_mutation`:
  ```rust
  // Covers: 2_TAS-REQ-271
  #[test]
  fn test_persist_failure_preserves_in_memory_mutation() {
      let state = Arc::new(RwLock::new(RunState::new_test()));
      let mut persister = MockCheckpointPersister::new();
      let broadcaster = MockEventBroadcaster::new();
      persister.expect_persist().returning(|_| Err(CheckpointError::Io(
          io::Error::new(io::ErrorKind::Other, "disk full")
      )));
      let _ = apply_transition(&state, StageCompleted { stage: "build".into() }, &persister, &broadcaster);
      // The in-memory state MUST reflect the mutation despite persist failure
      let guard = state.read().unwrap();
      assert_eq!(guard.stage_state("build"), StageState::Completed);
  }
  ```
- [ ] Write test `test_persist_failure_does_not_terminate_run`:
  ```rust
  // Covers: 2_TAS-REQ-271
  #[test]
  fn test_persist_failure_does_not_terminate_run() {
      let state = Arc::new(RwLock::new(RunState::new_test()));
      let mut persister = MockCheckpointPersister::new();
      let broadcaster = MockEventBroadcaster::new();
      persister.expect_persist().returning(|_| Err(CheckpointError::Io(
          io::Error::new(io::ErrorKind::Other, "disk full")
      )));
      let _ = apply_transition(&state, StageCompleted { stage: "build".into() }, &persister, &broadcaster);
      let guard = state.read().unwrap();
      // Run must still be Running, NOT Failed or Cancelled
      assert_eq!(guard.run_state(), WorkflowRunState::Running);
  }
  ```
- [ ] Write test `test_persist_failure_retry_on_next_transition`: After a failed persist, a subsequent successful transition should persist successfully. Mock `persist` to fail on first call and succeed on second. Assert both mutations are reflected and the second broadcast fires.

## 2. Task Implementation
- [ ] In `apply_transition` (from task 02), ensure the error path:
  1. Does NOT revert the in-memory state change (the `RwLock` write has already been released with the new state).
  2. Does NOT call `broadcast` (already ensured by task 02's ordering).
  3. Returns `Err(TransitionError::PersistFailed(..))` to the caller.
  4. Does NOT `panic!`, `process::exit`, or `abort`.
- [ ] Add `PersistFailed` variant to `TransitionError`:
  ```rust
  #[derive(Debug, thiserror::Error)]
  pub enum TransitionError {
      #[error("checkpoint persist failed: {0}")]
      PersistFailed(#[from] CheckpointError),
      // ...
  }
  ```
- [ ] In the caller (scheduler dispatch loop or equivalent), handle `TransitionError::PersistFailed` by logging at `ERROR` level with `tracing::error!` and continuing operation. The run continues; the next state transition will attempt to persist again.
- [ ] Add `Io(#[from] std::io::Error)` variant to `CheckpointError` if not already present.
- [ ] Document the contract on `apply_transition`: "On persist failure, the in-memory mutation stands. The server MUST NOT crash, terminate the run, or revert the state change."

## 3. Code Review
- [ ] Verify there is no `unwrap()`, `expect()`, or `?` in the `apply_transition` function that could panic on persist failure.
- [ ] Verify the in-memory mutation is applied BEFORE the persist attempt (lock released before persist call).
- [ ] Verify the caller of `apply_transition` handles `PersistFailed` gracefully — logging only, no run termination.
- [ ] Verify no `process::exit`, `std::panic::`, or `abort` in any error path.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- persist_failure` and confirm all 4 tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `TransitionError::PersistFailed` explaining the survival contract per [2_TAS-REQ-271].

## 6. Automated Verification
- [ ] Run `./do test` and confirm the traceability scanner finds `// Covers: 2_TAS-REQ-271` annotations.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.
