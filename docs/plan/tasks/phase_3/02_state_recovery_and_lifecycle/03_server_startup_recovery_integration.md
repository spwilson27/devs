# Task: Integrate Recovery into Server Startup Sequence with Pool Initialization (Sub-Epic: 02_State Recovery and Lifecycle)

## Covered Requirements
- [1_PRD-REQ-031], [2_TAS-REQ-026]

## Dependencies
- depends_on: [docs/plan/tasks/phase_3/02_state_recovery_and_lifecycle/02_checkpoint_restoration_service.md]
- shared_components: [devs-server (owner of startup sequence), devs-scheduler (consumer — feed recovered runs), devs-pool (consumer — initialize semaphores), devs-config (consumer — read pool definitions), Server Discovery Protocol (consumer — write discovery file after recovery)]

## 1. Initial Test Written
- [ ] Create `crates/devs-server/tests/startup_recovery_integration.rs`.
- [ ] Write test `test_startup_sequence_order`: start a server instance with a seeded project repo containing two in-flight runs (one `Running`, one `Pending`). Assert via the gRPC `ListRuns` API that both runs appear in the server state after startup. Assert the formerly `Running` run's `Running` stages are now `Eligible`.
- [ ] Write test `test_pool_semaphores_initialized_before_recovery`: verify that `PoolState` is populated from `devs.toml` pool definitions (step 4 of [2_TAS-REQ-026]) before recovered runs are fed to the scheduler. This can be verified by asserting `get_pool_state("primary")` returns the correct `max_concurrent` value immediately after startup.
- [ ] Write test `test_discovery_file_written_after_recovery`: verify that the discovery file (`~/.config/devs/server.addr` or `DEVS_DISCOVERY_FILE` override) does NOT exist until the full recovery sequence completes (step 5 of [2_TAS-REQ-026]). Start a server with a project that has checkpoints; assert the discovery file appears only after all projects are restored.
- [ ] Write test `test_recovered_runs_dispatched_to_scheduler`: seed a project with a run that has an `Eligible` stage (post-recovery). After startup, poll `devs-cli status <run>` and verify the scheduler picks up the `Eligible` stage for dispatch (it transitions to `Running` or stays `Eligible` if no agents are available).
- [ ] Add `// Covers: 1_PRD-REQ-031` and `// Covers: 2_TAS-REQ-026` annotations.

## 2. Task Implementation
- [ ] In the `devs-server` startup function (e.g., `async fn run_server(config: ServerConfig)`), implement the five-step sequence defined in [2_TAS-REQ-026]:
  1. Read `~/.config/devs/projects.toml` (via `devs-config`) and populate the `ProjectRegistry`.
  2. For each project, restore checkpoints (via `restore_all_projects` from Task 02) and apply crash-recovery rules.
  3. Populate `ServerState.runs` (`Arc<RwLock<HashMap<RunId, WorkflowRun>>>`) with all recovered runs.
  4. Initialize `PoolState` from `devs.toml` pool definitions — construct `tokio::sync::Semaphore` with the configured `max_concurrent` permits for each pool.
  5. Write the discovery file atomically (temp file + rename) only after steps 1–4 complete successfully.
- [ ] After step 5, notify the `DagScheduler` of each recovered run so it can evaluate and dispatch `Eligible` stages.
- [ ] Ensure pool permits are NOT pre-allocated during recovery. The scheduler must acquire permits through the normal `acquire_agent` flow when it dispatches stages.

## 3. Code Review
- [ ] Verify the five steps execute in the exact order specified by [2_TAS-REQ-026]. The discovery file must be the LAST step.
- [ ] Verify that startup does not proceed to accepting client connections until recovery is complete (the gRPC listener should bind but the discovery file signals readiness).
- [ ] Confirm no duplicate `RunEvent` broadcasts during recovery — events should only fire when the scheduler re-dispatches.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-server -- startup_recovery`

## 5. Update Documentation
- [ ] Add doc comments to the server startup function documenting the five-step recovery sequence and its ordering guarantees.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` includes coverage entries for `1_PRD-REQ-031` and `2_TAS-REQ-026`.
