# Task: Define ServerState Structure (Sub-Epic: 01_Core Domain Models & State Machine)

## Covered Requirements
- [2_TAS-REQ-025]

## Dependencies
- depends_on: ["01_run_status_state_machine.md", "02_stage_status_state_machine.md"]
- shared_components: [devs-core (Owner — defines ServerState), devs-proto (Consumer — uses wire types for conversion only)]

## 1. Initial Test Written
- [ ] Create test module in `crates/devs-core/src/state.rs` or `crates/devs-core/tests/server_state_tests.rs`
- [ ] Write `test_server_state_has_runs_field` that constructs a `ServerState` and verifies `runs` is accessible and initially empty
- [ ] Write `test_server_state_has_pools_field` that verifies `pools` field exists and is initially empty
- [ ] Write `test_server_state_has_projects_field` that verifies `projects` field exists and is initially empty
- [ ] Write `test_server_state_has_run_events_field` that verifies `run_events` field exists (broadcast channel or event store)
- [ ] Write `test_server_state_has_config_field` that verifies `config` field holds a global configuration reference
- [ ] Write `test_server_state_default` that constructs a default `ServerState` and asserts all collections are empty

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/state.rs`
- [ ] Define `ServerState` struct with fields:
  - `runs: HashMap<RunId, WorkflowRun>` (the canonical run state container)
  - `pools: HashMap<String, PoolState>` (pool utilization snapshots)
  - `projects: HashMap<String, ProjectEntry>` (registered projects)
  - `run_events: Vec<RunEvent>` (or an appropriate event store type)
  - `config: ServerConfig` (global config reference — use a placeholder/minimal type if `devs-config` isn't built yet)
- [ ] Define placeholder types where needed: `RunId` (wrapping `Uuid`), `WorkflowRun` (struct containing `RunStatus`, name, etc.), `PoolState`, `ProjectEntry`, `RunEvent`
- [ ] Implement `ServerState::new(config: ServerConfig) -> Self` constructor
- [ ] Implement `Default` for `ServerState` where appropriate
- [ ] Add `pub mod state;` to `crates/devs-core/src/lib.rs`
- [ ] Add doc comments describing each field's purpose per [2_TAS-REQ-025]

## 3. Code Review
- [ ] Verify `ServerState` contains exactly the five fields specified in [2_TAS-REQ-025]: `runs`, `pools`, `projects`, `run_events`, `config`
- [ ] Verify no wire types (protobuf-generated types) leak into `ServerState` — only domain types
- [ ] Verify no runtime dependencies (tokio, etc.) are added to the type definitions themselves (concurrency wrappers like `Arc<RwLock<>>` belong in the server crate, not in the domain type)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- server_state` and verify all tests pass
- [ ] Run `cargo clippy -p devs-core -- -D warnings`

## 5. Update Documentation
- [ ] Add doc comment on `ServerState` referencing [2_TAS-REQ-025] and explaining its role as the central state container

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- server_state --nocapture 2>&1 | tail -5` and confirm "test result: ok"
