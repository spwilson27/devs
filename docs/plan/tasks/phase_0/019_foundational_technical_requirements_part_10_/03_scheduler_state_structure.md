# Task: DAG Scheduler State Structure (Sub-Epic: 019_Foundational Technical Requirements (Part 10))

## Covered Requirements
- [2_TAS-REQ-002O]

## Dependencies
- depends_on: ["01_async_rwlock_mutex_policy_enforcement.md"]
- shared_components: [devs-core (Owner — SchedulerState type defined here)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/state.rs` (new module), write a unit test `test_scheduler_state_is_arc_rwlock` that creates a `SchedulerState`, wraps it in `Arc<RwLock<_>>`, clones the Arc, and reads from both handles concurrently to prove the type is compatible with the required pattern.
- [ ] Write a unit test `test_scheduler_state_stores_workflow_runs` that creates a `SchedulerState`, inserts a mock `WorkflowRunEntry` with a `RunId`, and retrieves it by ID, asserting the entry matches.
- [ ] Write a unit test `test_scheduler_state_stores_stage_runs` that creates a `SchedulerState`, inserts a `StageRunEntry` associated with a `RunId` and stage name, and retrieves it, asserting correctness.
- [ ] Write a unit test `test_scheduler_state_default_is_empty` that creates a `SchedulerState::default()` and asserts both workflow run and stage run collections are empty.
- [ ] Write a unit test `test_scheduler_state_is_canonical_runtime_source` as a doc-test on the struct, demonstrating that `SchedulerState` is the single canonical source of truth for runtime state (per requirement text).

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/state.rs` module with:
  - `pub struct SchedulerState` containing:
    - `runs: HashMap<RunId, WorkflowRunEntry>` — all active and recently completed workflow runs
    - `stages: HashMap<(RunId, String), StageRunEntry>` — all stage run instances keyed by (run_id, stage_name)
  - `pub struct WorkflowRunEntry` with fields: `id: RunId`, `workflow_name: String`, `status: WorkflowRunStatus`, `created_at: DateTime<Utc>`, `updated_at: DateTime<Utc>`
  - `pub struct StageRunEntry` with fields: `run_id: RunId`, `stage_name: String`, `status: StageRunStatus`, `output: Option<serde_json::Value>`
  - `pub enum WorkflowRunStatus { Pending, Running, Completed, Failed, Cancelled }`
  - `pub enum StageRunStatus { Pending, Running, Completed, Failed, Cancelled, Skipped }`
  - Implement `Default` for `SchedulerState` (empty collections).
  - Module-level doc comment: "SchedulerState is the canonical source of truth for runtime state. Git checkpoint is the source of truth for persisted state. On startup, checkpoint data is loaded into SchedulerState before connections are accepted."
- [ ] Use placeholder `RunId` type (e.g., `pub type RunId = uuid::Uuid;` or a newtype wrapper) — this will be refined when `devs-core` domain types are fully defined.
- [ ] Add `pub mod state;` to `crates/devs-core/src/lib.rs`.
- [ ] Ensure `SchedulerState` derives `Debug` and `Default`.

## 3. Code Review
- [ ] Verify `SchedulerState` uses `HashMap` (not `BTreeMap`) for O(1) lookups appropriate for runtime state.
- [ ] Verify no `tokio::sync` primitives are embedded inside `SchedulerState` itself — the `Arc<RwLock<SchedulerState>>` wrapping is done by consumers, keeping the state type synchronization-agnostic.
- [ ] Verify `WorkflowRunStatus` and `StageRunStatus` enums cover all states mentioned in the project description.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- state` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-002O` annotation to each test function.
- [ ] Ensure struct-level doc comment on `SchedulerState` references [2_TAS-REQ-002O] and states it is the canonical runtime source of truth.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- state 2>&1 | grep -E "test result: ok"` to confirm tests pass.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-002O" crates/devs-core/` to confirm traceability annotations exist.
