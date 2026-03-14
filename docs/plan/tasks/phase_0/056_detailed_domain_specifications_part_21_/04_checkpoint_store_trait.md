# Task: CheckpointStore Trait Definition (Sub-Epic: 056_Detailed Domain Specifications (Part 21))

## Covered Requirements
- [2_TAS-REQ-155]

## Dependencies
- depends_on: ["02_persistence_strategy_json_git.md"]
- shared_components: [devs-checkpoint (Owner — CheckpointStore trait), devs-core (Consumer — WorkflowRun, RetentionPolicy)]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/src/lib.rs`, write tests:
  - `test_checkpoint_store_trait_is_object_safe` — verify `dyn CheckpointStore` compiles (construct a `Box<dyn CheckpointStore>`).
  - `test_checkpoint_store_trait_is_send_sync` — verify `fn assert_send_sync<T: Send + Sync>()` compiles with a concrete mock impl.
  - `test_mock_save_snapshot_roundtrip` — using an in-memory mock implementation, call `save_snapshot` then `load_all_runs` and verify the run is returned.
  - `test_mock_save_checkpoint_roundtrip` — `save_checkpoint` then `load_all_runs` returns the run with updated checkpoint state.
  - `test_mock_save_log_chunk` — `save_log_chunk` succeeds and the data is retrievable (mock stores in `HashMap`).
  - `test_mock_sweep_retention_removes_old` — `sweep_retention` with a policy removes runs older than `max_age_days` and returns a `SweepReport` with correct counts.
  - `test_sweep_report_fields` — `SweepReport` has `runs_removed: usize` and `bytes_freed: u64` fields.
- [ ] Define `LogStream` enum: `Stdout, Stderr`.
- [ ] Each test must include `// Covers: 2_TAS-REQ-155` annotation.

## 2. Task Implementation
- [ ] Define the trait in `crates/devs-checkpoint/src/lib.rs` exactly matching the spec:
  ```rust
  pub trait CheckpointStore: Send + Sync {
      fn save_snapshot(&self, run: &WorkflowRun) -> Result<()>;
      fn save_checkpoint(&self, run: &WorkflowRun) -> Result<()>;
      fn load_all_runs(&self) -> Result<Vec<WorkflowRun>>;
      fn save_log_chunk(&self, run_id: Uuid, stage: &str, attempt: u32,
                        stream: LogStream, data: &[u8]) -> Result<()>;
      fn sweep_retention(&self, policy: &RetentionPolicy) -> Result<SweepReport>;
  }
  ```
- [ ] Define `pub enum LogStream { Stdout, Stderr }`.
- [ ] Define `pub struct SweepReport { pub runs_removed: usize, pub bytes_freed: u64 }`.
- [ ] Define `pub struct RetentionPolicy { pub max_age_days: Option<u32>, pub max_size_mb: Option<u32> }` in `devs-core` (or re-export if already there from task 03).
- [ ] Implement `MockCheckpointStore` (in `#[cfg(test)]` module) backed by `Arc<Mutex<HashMap<...>>>` to make tests pass.

## 3. Code Review
- [ ] Verify the trait signature exactly matches [2_TAS-REQ-155].
- [ ] Verify trait is object-safe (`dyn CheckpointStore` compiles).
- [ ] Verify `Send + Sync` bounds are present.
- [ ] Confirm no `async` methods — the trait uses blocking `Result<>` returns (async wrapping is the caller's responsibility via `spawn_blocking`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --lib` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on the trait, each method, `LogStream`, `SweepReport`, and `RetentionPolicy` explaining semantics and usage.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm no warnings or errors.
