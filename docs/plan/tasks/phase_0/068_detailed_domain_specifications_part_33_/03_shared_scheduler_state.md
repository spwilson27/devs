# Task: Shared SchedulerState Between gRPC and MCP (Sub-Epic: 068_Detailed Domain Specifications (Part 33))

## Covered Requirements
- [2_TAS-REQ-417]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer), devs-scheduler (consumer), Shared State & Concurrency Patterns (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-server/tests/shared_state.rs` with test `test_grpc_and_mcp_share_scheduler_state()`: instantiate the server's `AppState` (or equivalent top-level state container), extract the `Arc<RwLock<SchedulerState>>` that is passed to both the gRPC service and the MCP service, and assert they are the same `Arc` using `Arc::ptr_eq`.
- [ ] Write test `test_mutation_via_grpc_visible_in_mcp()`: acquire a write lock through the gRPC service's state reference, insert a dummy `WorkflowRun` with a known `RunId`, then acquire a read lock through the MCP service's state reference and assert the same `RunId` is present.
- [ ] Write test `test_mutation_via_mcp_visible_in_grpc()`: reverse of the above — insert a run via MCP's state reference and read it via gRPC's state reference.
- [ ] Write test `test_no_state_cloning_on_construction()`: verify that the `GrpcServer::new(state)` and `McpServer::new(state)` constructors accept `Arc<RwLock<SchedulerState>>` by reference (clone the Arc, not the inner data). Assert `Arc::strong_count` equals expected value (1 original + 1 per server = 3).

## 2. Task Implementation
- [ ] Define `SchedulerState` struct in `crates/devs-scheduler/src/state.rs` containing at minimum: `runs: HashMap<RunId, WorkflowRun>`, `stage_outputs: HashMap<(RunId, String), StageOutput>`. Export it from `devs-scheduler`'s public API.
- [ ] In `crates/devs-server/src/app.rs` (or equivalent), create a single `Arc<RwLock<SchedulerState>>` during server initialization.
- [ ] Pass this `Arc` to `GrpcServer::new()` and `McpServer::new()` — both constructors must accept `Arc<RwLock<SchedulerState>>` and store it as a field.
- [ ] Ensure all gRPC service method implementations (e.g., `submit_run`, `list_runs`, `get_run`) access state exclusively through this shared `Arc`.
- [ ] Ensure all MCP tool handlers (e.g., `submit_run`, `list_runs`, `get_run`, `get_stage_output`) access state exclusively through the same shared `Arc`.
- [ ] Do NOT create any separate state container, cache, or snapshot for MCP — it must read/write the same `SchedulerState`.

## 3. Code Review
- [ ] Verify that `SchedulerState` is never `.clone()`d (only the `Arc` is cloned).
- [ ] Verify that no MCP handler creates its own `HashMap` or `Vec` of runs outside of the shared state.
- [ ] Confirm lock acquisition follows the documented order from `2_TAS-REQ-002P`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --test shared_state` and confirm all 4 tests pass.
- [ ] Run `./do test` and confirm full suite passes.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-417` comments to the shared state tests and to the `AppState` construction site.

## 6. Automated Verification
- [ ] Run `grep -rn 'SchedulerState' crates/devs-grpc/src/ crates/devs-mcp/src/` and verify all references use `Arc<RwLock<SchedulerState>>`, never a bare `SchedulerState`.
- [ ] Run `grep -rn '\.clone()' crates/devs-server/src/` near `SchedulerState` and verify only `Arc::clone` calls exist, not `SchedulerState::clone`.
