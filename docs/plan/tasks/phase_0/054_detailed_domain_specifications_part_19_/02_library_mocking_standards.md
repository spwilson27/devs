# Task: Library Crate Unit Testing and Mocking Standards (Sub-Epic: 054_Detailed Domain Specifications (Part 19))

## Covered Requirements
- [2_TAS-REQ-143]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consume), devs-scheduler (consume — define mock trait), devs-checkpoint (consume — define mock trait)]

## 1. Initial Test Written
- [ ] In `devs-checkpoint/src/lib.rs`, within a `#[cfg(test)] mod tests` block, write:
  - `test_in_memory_checkpoint_store_save_and_restore`: Create an `InMemoryCheckpointStore` (backed by `HashMap`). Call `save_checkpoint()` with a mock `WorkflowRun`. Call `restore_checkpoints()` and assert the saved run is returned. Verify no filesystem or git operations occur (the mock is purely in-memory).
  - `test_in_memory_checkpoint_store_overwrite`: Save two checkpoints for the same `RunId`. Assert only the latest is returned by `restore_checkpoints()`.
- [ ] In `devs-scheduler/src/lib.rs`, within a `#[cfg(test)] mod tests` block, write:
  - `test_mock_dag_scheduler_submit_run`: Create a `MockDagScheduler`. Call `submit_run()` and assert it returns a canned `RunId`. Verify no real scheduling, pool acquisition, or checkpoint operations occur.
  - `test_mock_dag_scheduler_cancel_run`: Call `cancel_run()` on the mock. Assert it returns `Ok(())`.
- [ ] In any crate that depends on `devs-scheduler` (e.g., `devs-grpc`), write a test that:
  - Uses `MockDagScheduler` as a trait object `Arc<dyn SchedulerApi>`.
  - Calls a method through the trait object and asserts the mock response.
  - Confirms no real gRPC server, git repository, or Docker daemon is started.
- [ ] Add a compile-time test (or `#[test]` assertion) that verifies `InMemoryCheckpointStore` implements `CheckpointStore` trait.
- [ ] Add a compile-time test that verifies `MockDagScheduler` implements the scheduler trait.

## 2. Task Implementation
- [ ] Define the `CheckpointStore` trait in `devs-checkpoint` (if not already present) with methods: `save_checkpoint()`, `restore_checkpoints()`, `snapshot_definition()`, `enforce_retention()`. All library crates must depend on this trait, not a concrete type.
- [ ] Implement `InMemoryCheckpointStore` within `devs-checkpoint` in a `#[cfg(test)]` module (or `pub` if other crates need it in their tests):
  ```rust
  #[cfg(test)]
  pub struct InMemoryCheckpointStore {
      data: std::sync::Mutex<HashMap<RunId, WorkflowRun>>,
  }
  ```
  - Implement `CheckpointStore` for it using the `HashMap` as backing store. No git2, no filesystem.
- [ ] Define the `SchedulerApi` trait in `devs-scheduler` (if not already present) with methods: `submit_run()`, `cancel_run()`, `get_run()`, `list_runs()`, `get_stage_output()`, `signal_completion()`.
- [ ] Implement `MockDagScheduler` within `devs-scheduler` in a `#[cfg(test)]` module:
  ```rust
  #[cfg(test)]
  pub struct MockDagScheduler {
      // Pre-configured responses for each method
  }
  ```
- [ ] Enforce the rule from [2_TAS-REQ-143]: **no unit test may start a real gRPC server, real git repository, or real Docker daemon**. Document this in a `TESTING.md` or equivalent file with examples of correct and incorrect patterns.
- [ ] Audit all existing `#[test]` functions in all library crates. If any violate the no-real-infrastructure rule, refactor them to use mocks.

## 3. Code Review
- [ ] Verify `#[cfg(test)]` is applied to all mock structs and their `impl` blocks — mock code must not appear in release builds.
- [ ] Verify trait objects (`dyn CheckpointStore`, `dyn SchedulerApi`) are used at crate boundaries, not concrete types.
- [ ] Verify no unit test creates a `tempdir` for git operations, spawns a `tonic::Server`, or invokes Docker CLI.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --workspace` in an environment without git, Docker, or gRPC ports available — all unit tests must still pass.
- [ ] Run `./do test` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add a "Testing Standards" section to project documentation stating the [2_TAS-REQ-143] rule and listing the available mock types (`InMemoryCheckpointStore`, `MockDagScheduler`).

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm zero failures.
- [ ] Verify traceability annotations: `// Covers: 2_TAS-REQ-143` on `InMemoryCheckpointStore`, `MockDagScheduler`, and any test enforcing the no-real-infrastructure rule.
