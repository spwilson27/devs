# Task: Persistence Before Event Broadcast Ordering (Sub-Epic: 061_Detailed Domain Specifications (Part 26))

## Covered Requirements
- [2_TAS-REQ-268]

## Dependencies
- depends_on: ["01_checkpoint_schema_version_enforcement.md"]
- shared_components: [devs-core (consumer), devs-checkpoint (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/state_mutation.rs` (or `crates/devs-core/src/transition.rs`), define a `StateMutationPipeline` trait or struct that encapsulates the Mutation → Persist → Broadcast sequence. The pipeline takes a `Persister` trait object and a `Broadcaster` trait object.
- [ ] Define trait `CheckpointPersister`:
  ```rust
  #[cfg_attr(test, mockall::automock)]
  pub trait CheckpointPersister: Send + Sync {
      fn persist(&self, envelope: &CheckpointEnvelope) -> Result<(), CheckpointError>;
  }
  ```
- [ ] Define trait `EventBroadcaster`:
  ```rust
  #[cfg_attr(test, mockall::automock)]
  pub trait EventBroadcaster: Send + Sync {
      fn broadcast(&self, event: RunEvent);
  }
  ```
- [ ] Write test `test_broadcast_never_called_before_persist`: Use `mockall` `Sequence` to enforce ordering. Set up `MockCheckpointPersister::persist` and `MockEventBroadcaster::broadcast` with sequence constraints. Call `apply_transition(mutation, &persister, &broadcaster)`. Assert persist is called before broadcast.
  ```rust
  // Covers: 2_TAS-REQ-268
  #[test]
  fn test_broadcast_never_called_before_persist() {
      let mut seq = mockall::Sequence::new();
      let mut persister = MockCheckpointPersister::new();
      let mut broadcaster = MockEventBroadcaster::new();
      persister.expect_persist()
          .times(1)
          .in_sequence(&mut seq)
          .returning(|_| Ok(()));
      broadcaster.expect_broadcast()
          .times(1)
          .in_sequence(&mut seq)
          .returning(|_| ());
      let mutation = /* create test state mutation */;
      apply_transition(mutation, &persister, &broadcaster);
  }
  ```
- [ ] Write test `test_broadcast_skipped_on_persist_failure`: Mock `persist` to return `Err`. Assert `broadcast` is never called (`.times(0)`). This ensures a failed persist does not trigger a broadcast of stale state.
- [ ] Write test `test_mutation_applied_before_persist`: Add a third sequence step. The mutation (modifying an `Arc<RwLock<State>>`) must happen before persist. Verify via a callback in the mock that the state has already changed when persist is called.
- [ ] Write test `test_persist_receives_mutated_state`: In the `persist` mock's `returning` closure, inspect the `CheckpointEnvelope` argument and assert it contains the post-mutation state, not the pre-mutation state.

## 2. Task Implementation
- [ ] Implement `apply_transition` function (or method on a `TransitionEngine` struct) in `crates/devs-core/src/state_mutation.rs`:
  ```rust
  pub fn apply_transition(
      state: &Arc<RwLock<RunState>>,
      transition: StateTransition,
      persister: &dyn CheckpointPersister,
      broadcaster: &dyn EventBroadcaster,
  ) -> Result<(), TransitionError> {
      // Step 1: Acquire write lock, apply mutation
      let snapshot = {
          let mut guard = state.write().unwrap();
          guard.apply(transition);
          guard.to_checkpoint_envelope()
      };
      // Step 2: Persist (outside lock)
      persister.persist(&snapshot)?;
      // Step 3: Broadcast
      broadcaster.broadcast(snapshot.to_run_event());
      Ok(())
  }
  ```
- [ ] Define `StateTransition` enum with variants for the state changes that trigger checkpointing (e.g., `StageStarted`, `StageCompleted`, `StageFailed`, `RunCompleted`, `RunFailed`).
- [ ] Define `RunEvent` struct/enum that carries the event type and the post-mutation state snapshot.
- [ ] Add doc comments citing [2_TAS-REQ-268] on the `apply_transition` function, explicitly documenting the ordering invariant: "Mutation → Persist → Broadcast. A subscriber MUST NOT receive an event for a state that has not yet been persisted to disk."

## 3. Code Review
- [ ] Verify that the write lock is released before `persist` is called (persist should not hold the state lock).
- [ ] Verify that `broadcast` is only called after `persist` returns `Ok`.
- [ ] Verify that on persist failure, the broadcast is skipped but the in-memory mutation is NOT reverted (per [2_TAS-REQ-271] interaction — the mutation stands).
- [ ] Verify `mockall` is added as a dev-dependency only (not a runtime dependency).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- state_mutation` and confirm all 4 tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `CheckpointPersister` and `EventBroadcaster` traits explaining their role in the ordering invariant.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the traceability scanner finds `// Covers: 2_TAS-REQ-268` annotations.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.
