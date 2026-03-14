# Task: Implement Background Retention Sweep Tokio Task (Sub-Epic: 07_Logging & Retention)

## Covered Requirements
- [2_TAS-REQ-086]

## Dependencies
- depends_on: [docs/plan/tasks/phase_2/07_logging_retention/02_retention_sweep_logic.md]
- shared_components: [devs-checkpoint, devs-server]

## 1. Initial Test Written
- [ ] In `crates/devs-server/src/retention_task.rs` (new file), write tests annotated with `// Covers: 2_TAS-REQ-086`:
    - [ ] `test_sweep_runs_at_startup` — using `tokio::time::pause()`, start the retention task with a mock `CheckpointStore` and a `ProjectRegistry` containing one project. Assert the sweep is invoked exactly once before any time advance.
    - [ ] `test_sweep_repeats_every_24_hours` — after startup sweep, advance time by 24 hours using `tokio::time::advance(Duration::from_secs(86400))`. Assert the sweep is invoked a second time. Advance another 24 hours, assert a third invocation.
    - [ ] `test_sweep_no_invocation_before_24_hours` — advance time by 23 hours 59 minutes. Assert no second sweep invocation after the initial startup sweep.
    - [ ] `test_sweep_error_does_not_crash_task` — configure the mock `CheckpointStore` to return an error for one project. Assert the task continues running and processes other projects. Assert the task runs again at the next 24-hour interval.
    - [ ] `test_sweep_rescans_project_registry` — start with one project, add a second project to the registry after startup. Advance 24 hours. Assert the sweep runs for both projects on the second cycle.
    - [ ] `test_sweep_respects_cancellation_token` — pass a `CancellationToken` to the task. Cancel it. Assert the task exits cleanly.

## 2. Task Implementation
- [ ] Create `crates/devs-server/src/retention_task.rs`:
    - [ ] Implement `pub fn spawn_retention_sweep_task(store: Arc<CheckpointStore>, registry: Arc<RwLock<ProjectRegistry>>, cancel: CancellationToken) -> JoinHandle<()>`.
    - [ ] The spawned Tokio task MUST:
        1. On startup: iterate all projects in the registry, call `execute_retention_sweep` for each using the project's configured `RetentionPolicy`.
        2. Enter a loop: `tokio::select!` on `cancel.cancelled()` vs `tokio::time::sleep(Duration::from_secs(86400))`.
        3. On sleep completion: re-read the project registry (acquire read lock), sweep each project.
        4. On cancellation: break the loop and return.
    - [ ] Per-project sweep errors MUST be logged at `error!` level with project name and error details. The task MUST NOT panic or exit on sweep failure.
    - [ ] Use `tracing::info!` to log sweep start/completion with `deleted_count` and `freed_bytes` from `SweepResult`.
- [ ] Register the task in the server startup sequence (after checkpoint restore, before accepting client connections).

## 3. Code Review
- [ ] Verify the task uses `tokio::time::sleep`, NOT `std::thread::sleep`.
- [ ] Verify the 24-hour interval is `Duration::from_secs(86400)` — no drift accumulation (sleep-based, not interval-based is acceptable since sweep duration is negligible relative to 24h).
- [ ] Verify `CancellationToken` is respected for clean server shutdown.
- [ ] Verify per-project error isolation — one project failure does not skip remaining projects.
- [ ] Verify doc comments reference [2_TAS-REQ-086].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -- retention_task`.
- [ ] Verify all 6 test cases pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-086` traceability annotations to all test functions.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` maps [2_TAS-REQ-086] to the new tests.
