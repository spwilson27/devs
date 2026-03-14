# Task: Scaffold devs-checkpoint Crate and Define CheckpointStore Trait (Sub-Epic: 04_Persistence & Checkpoints)

## Covered Requirements
- [1_PRD-REQ-029], [1_PRD-REQ-030]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consume), devs-proto (consume), devs-checkpoint (create/own)]

## 1. Initial Test Written
- [ ] Create `crates/devs-checkpoint/tests/store_trait_tests.rs`. Write a test `test_checkpoint_store_trait_is_object_safe` that asserts `CheckpointStore` can be used as `dyn CheckpointStore` (i.e., `Box<dyn CheckpointStore>` compiles).
- [ ] Write a test `test_checkpoint_branch_config_variants` that constructs both `CheckpointBranch::WorkingBranch` and `CheckpointBranch::Dedicated("devs/state".into())` and asserts their `branch_name()` method returns the expected values (`None` for working branch, `Some("devs/state")` for dedicated).
- [ ] Write a test `test_project_ref_creates_valid_dotdevs_path` that constructs a `ProjectRef` with a known repo path and asserts `project_ref.dotdevs_path()` returns `<repo_path>/.devs/`.
- [ ] Write a test `test_checkpoint_metadata_schema_version` that creates a `CheckpointMetadata` struct and asserts `schema_version` defaults to `1`.

## 2. Task Implementation
- [ ] Create `crates/devs-checkpoint/Cargo.toml` with dependencies: `devs-core`, `devs-proto`, `git2`, `serde`, `serde_json`, `tokio`, `chrono`, `tempfile`, `thiserror`. Add `[dev-dependencies]`: `tokio` (with `macros`, `rt-multi-thread`), `tempfile`.
- [ ] Create `crates/devs-checkpoint/src/lib.rs` exporting the public API modules: `store`, `error`, `types`.
- [ ] Implement `crates/devs-checkpoint/src/types.rs`:
  - `CheckpointBranch` enum: `WorkingBranch`, `Dedicated(String)` with `branch_name(&self) -> Option<&str>` method.
  - `CheckpointMetadata` struct with `schema_version: u32` (default 1), `created_at: DateTime<Utc>`, `run_id: String`.
  - `ProjectRef` struct with `repo_path: PathBuf`, `checkpoint_branch: CheckpointBranch`, `project_id: String`, with method `dotdevs_path(&self) -> PathBuf`.
  - `RetentionPolicy` struct with `max_age: Option<Duration>`, `max_size_bytes: Option<u64>`.
- [ ] Implement `crates/devs-checkpoint/src/error.rs` with `CheckpointError` enum using `thiserror`: `GitError`, `SerializationError`, `IoError`, `NotFound`, `BranchNotFound`, `AtomicWriteFailed`.
- [ ] Implement `crates/devs-checkpoint/src/store.rs` with the `CheckpointStore` async trait:
  - `async fn save_checkpoint(&self, project: &ProjectRef, run: &WorkflowRun) -> Result<(), CheckpointError>`
  - `async fn restore_checkpoints(&self, project: &ProjectRef) -> Result<Vec<WorkflowRun>, CheckpointError>`
  - `async fn snapshot_definition(&self, project: &ProjectRef, def: &WorkflowDefinition) -> Result<String, CheckpointError>`
  - `async fn enforce_retention(&self, project: &ProjectRef, policy: &RetentionPolicy) -> Result<(), CheckpointError>`
  - `async fn delete_run(&self, project: &ProjectRef, run_id: &str) -> Result<(), CheckpointError>`
- [ ] Add `devs-checkpoint` to the workspace `Cargo.toml` members list.

## 3. Code Review
- [ ] Verify `CheckpointStore` trait is object-safe (no generic methods, no `Self` in return position).
- [ ] Verify all public types have doc comments.
- [ ] Verify `CheckpointBranch` derives `Clone, Debug, Serialize, Deserialize, PartialEq`.
- [ ] Verify no `git2` or `tokio` types leak into the trait's public signature (use domain types only).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-029` and `// Covers: 1_PRD-REQ-030` annotations to relevant test functions.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint -- --format=json 2>&1 | grep -c '"event":"ok"'` and verify count matches expected number of tests.
- [ ] Run `cargo doc -p devs-checkpoint --no-deps` and verify zero warnings.
