# Task: TOCTOU Prevention — Duplicate-Name Check and Snapshot Write Under Single Mutex Acquisition (Sub-Epic: 55_Risk 025 Verification)

## Covered Requirements
- [RISK-025-BR-004]

## Dependencies
- depends_on: []
- shared_components: [devs-scheduler, devs-checkpoint]

## 1. Initial Test Written

- [ ] In `crates/devs-scheduler/tests/submit_run_toctou.rs`, write a unit test `test_duplicate_name_check_and_snapshot_write_are_atomic` that:
  1. Construct a `SchedulerState` with a single project `project-alpha` using an in-memory `CheckpointStore` stub that records the order in which operations are called.
  2. Register a workflow definition `"wf-v1"` under `project-alpha`.
  3. Set up an instrumentation hook on the in-memory store that records the mutex hold state (held / released) at the moment `check_duplicate_run_name` is invoked and again at the moment `write_workflow_snapshot` is invoked.
  4. Call `submit_run` once successfully, capturing `run_id_1`.
  5. Assert that both `check_duplicate_run_name` and `write_workflow_snapshot` were called while the per-project mutex was held (i.e., no mutex release occurred between them).
  6. Annotate the test with `// REQ: RISK-025-BR-004`.

- [ ] Write a second unit test `test_second_submit_run_cannot_reuse_name_within_lock_window` that:
  1. Spawns two `tokio::task`s that each call `submit_run` with the **same** `run_name` for the same project and workflow.
  2. Uses `tokio::join!` to run them concurrently.
  3. Asserts that exactly **one** call returns `Ok(run_id)` and the other returns `Err(SubmitError::DuplicateRunName)`.
  4. Reads both snapshot files on disk (only one should exist) and confirms no corrupt or partial snapshot was written.
  5. Annotate with `// REQ: RISK-025-BR-004`.

- [ ] Write a third unit test `test_no_intermediate_mutex_release_between_name_check_and_snapshot` that:
  1. Instruments the per-project `Mutex` using a wrapper type `TracingMutex` that records `lock()` / `unlock()` events to a `Vec<Event>`.
  2. Calls `submit_run` once.
  3. Parses the recorded `Vec<Event>` and asserts that no `unlock` event appears between the `check_duplicate_run_name` call and the `write_workflow_snapshot` call.
  4. Annotate with `// REQ: RISK-025-BR-004`.

## 2. Task Implementation

- [ ] Open `crates/devs-scheduler/src/scheduler.rs`. Locate the `submit_run` async function. Confirm it acquires the per-project mutex **once** at the start and holds it through the following sequence — without any intermediate `.await` that would implicitly release the lock or any explicit `drop(guard)`:
  ```rust
  let _guard = project_mutex.lock().await;           // (1) acquire lock
  let snapshot = live_workflows.get(&wf_name)
      .ok_or(SubmitError::WorkflowNotFound)?
      .clone();                                       // (2) deep-clone definition
  check_duplicate_run_name(&state, &project_id, &run_name)?; // (3) duplicate check
  let run = WorkflowRun {
      definition_snapshot: snapshot,
      // ...
  };
  checkpoint_store.write_workflow_snapshot(&run.snapshot)?; // (4) write-once persist
  // _guard drops here at end of scope                // (5) release lock
  Ok(run)
  ```
  If the function has any `await` points between steps (3) and (4), refactor to use a synchronous checkpoint write or to hold the guard across the await using a `tokio::sync::Mutex` (not `std::sync::Mutex`).

- [ ] If not already present, introduce a `TracingMutex` test-helper type in `crates/devs-scheduler/src/testing.rs` (behind `#[cfg(test)]`):
  ```rust
  /// [RISK-025-BR-004] Test helper: wraps a Mutex and records lock/unlock events.
  pub struct TracingMutex<T> {
      inner: tokio::sync::Mutex<T>,
      events: std::sync::Arc<tokio::sync::Mutex<Vec<LockEvent>>>,
  }
  #[derive(Debug, Clone, PartialEq)]
  pub enum LockEvent { Locked, Unlocked }
  ```

- [ ] Ensure `check_duplicate_run_name` is a synchronous helper (not `async`) so it does not contain an `.await` that could yield the executor while the mutex guard is held. If it currently performs async I/O, refactor it to operate only on in-memory state passed to it as a `&SchedulerState` slice (checkpoint reads required for duplicate detection MUST be pre-loaded into in-memory state before lock acquisition).

- [ ] Add the traceability annotation `// REQ: RISK-025-BR-004` as an inline comment at the exact line in `submit_run` where the per-project mutex is acquired and also at the point where it is released (end of guard scope).

## 3. Code Review

- [ ] Confirm that between the duplicate-name check call site and the `write_workflow_snapshot` call site in `submit_run`, there are **zero** `.await` expressions that could yield the executor (and thus potentially release the `tokio::sync::Mutex` guard if using a non-`Send` guard pattern).
- [ ] Confirm `std::sync::Mutex` is NOT used for the per-project mutex — it would cause a deadlock across `.await`. The per-project mutex MUST be `tokio::sync::Mutex`.
- [ ] Confirm the `TracingMutex` test helper is only compiled under `#[cfg(test)]` and does not affect production code.
- [ ] Confirm that `check_duplicate_run_name` does not perform any I/O (disk, network) that could introduce non-deterministic delay between the name check and snapshot write.
- [ ] Confirm the inline comment `// REQ: RISK-025-BR-004` is present on the mutex acquisition line in production code.

## 4. Run Automated Tests to Verify

- [ ] Run:
  ```bash
  cargo test -p devs-scheduler submit_run_toctou
  ```
  All three tests must pass.

- [ ] Run the full scheduler test suite:
  ```bash
  cargo test -p devs-scheduler
  ```
  No regressions.

- [ ] Run the complete workspace test suite:
  ```bash
  ./do test
  ```
  All tests pass.

## 5. Update Documentation

- [ ] Add a block comment above the per-project mutex acquisition in `submit_run` explaining the atomicity invariant:
  ```rust
  // RISK-025-BR-004: The duplicate-name check and snapshot write MUST occur within
  // the same lock acquisition. Releasing the lock between these two operations
  // creates a TOCTOU window where a duplicate name could be accepted or a concurrent
  // snapshot could overwrite the correct one.
  // REQ: RISK-025-BR-004
  let _guard = project_mutex.lock().await;
  ```
- [ ] Update `crates/devs-scheduler/README.md` (or the module-level doc comment in `scheduler.rs`) to include a paragraph on the per-project mutex invariant and cite `RISK-025-BR-004`.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `RISK-025-BR-004` appears with `status: covered`.
- [ ] Run `./do coverage` and confirm `crates/devs-scheduler` meets the ≥90% unit coverage gate.
- [ ] Inspect `target/traceability.json` and confirm `"RISK-025-BR-004"` has a non-empty `test_refs` list containing at least the three test names added in this task.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and confirm zero new warnings are introduced.
