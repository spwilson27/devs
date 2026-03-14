# Task: Persistence Strategy — JSON/Git State Model and In-Process Sync Types (Sub-Epic: 056_Detailed Domain Specifications (Part 21))

## Covered Requirements
- [2_TAS-REQ-152]

## Dependencies
- depends_on: none
- shared_components: [devs-core (Consumer — domain types), Shared State & Concurrency Patterns (Consumer — Arc/RwLock patterns)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/persistence.rs` (or equivalent), write unit tests:
  - `test_workflow_run_json_roundtrip` — a `WorkflowRun` struct serializes to JSON and deserializes back identically.
  - `test_stage_run_json_roundtrip` — a `StageRun` struct serializes to JSON and deserializes back identically.
  - `test_checkpoint_file_path_convention` — a helper function `checkpoint_path(project_dir, run_id)` returns `<project_dir>/.devs/checkpoints/<run_id>.json`.
  - `test_log_file_path_convention` — a helper function `log_path(project_dir, run_id, stage, attempt)` returns `<project_dir>/.devs/logs/<run_id>/<stage>/<attempt>.log`.
  - `test_shared_state_container_type` — verify that `type RunStore = Arc<RwLock<HashMap<RunId, WorkflowRun>>>` compiles and can be cloned across threads.
- [ ] Each test must include `// Covers: 2_TAS-REQ-152` annotation.

## 2. Task Implementation
- [ ] Define path convention functions in `devs-core`:
  - `pub fn checkpoint_dir(project_dir: &Path) -> PathBuf` — returns `<project_dir>/.devs/checkpoints/`.
  - `pub fn checkpoint_path(project_dir: &Path, run_id: &Uuid) -> PathBuf`.
  - `pub fn log_dir(project_dir: &Path, run_id: &Uuid, stage: &str) -> PathBuf`.
  - `pub fn log_path(project_dir: &Path, run_id: &Uuid, stage: &str, attempt: u32) -> PathBuf`.
- [ ] Ensure `WorkflowRun` and `StageRun` derive `Serialize, Deserialize` with `serde_json` as the serialization format.
- [ ] Define `type RunStore = Arc<RwLock<HashMap<RunId, WorkflowRun>>>;` as the canonical in-process state container type alias in `devs-core`.
- [ ] Document that there is no relational database — all persistence is JSON-in-git, reconstruction on restart is by reading checkpoint files.

## 3. Code Review
- [ ] Verify path functions use `Path::join` (no string concatenation).
- [ ] Verify no database dependencies (no `sqlx`, `diesel`, `rusqlite` in `Cargo.toml`).
- [ ] Confirm `RunStore` uses `tokio::sync::RwLock`, not `std::sync::RwLock`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib` and confirm all persistence tests pass.

## 5. Update Documentation
- [ ] Add doc comments explaining the persistence strategy: JSON files under `.devs/`, `Arc<RwLock<...>>` in-process, reconstruct on restart.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm no warnings or errors.
