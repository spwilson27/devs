# Task: Unified State Consistency Between MCP and gRPC Interfaces (Sub-Epic: 071_Detailed Domain Specifications (Part 36))

## Covered Requirements
- [2_TAS-REQ-430]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core", "devs-scheduler", "devs-grpc", "devs-mcp"]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-server/tests/unified_state_consistency.rs` that:
  1. Boots a test server instance with both gRPC and MCP interfaces enabled.
  2. Submits a workflow run via the gRPC `SubmitRun` RPC and captures the `RunId`.
  3. Calls `cancel_run` via the MCP API using the same `RunId`.
  4. Immediately (no sleep, no polling) calls `GetRun` via the gRPC API.
  5. Asserts the returned `WorkflowRun.state` is `Cancelled` (or the terminal cancelled state).
  6. Add `// Covers: 2_TAS-REQ-430` annotation to the test.
- [ ] Create a second test that performs a state mutation via gRPC (`CancelRun` RPC) and reads it back via MCP (`get_run` tool), asserting immediate consistency.
- [ ] Create a unit test in `crates/devs-scheduler/tests/shared_state.rs` verifying that `SchedulerState` is a single `Arc<RwLock<...>>` instance — construct one, obtain two references, mutate via one, read via the other, assert equality without synchronization delay.

## 2. Task Implementation
- [ ] In `crates/devs-server/src/state.rs` (or equivalent shared-state module), ensure that both the gRPC service handlers and the MCP tool handlers receive the **same** `Arc<SchedulerState>` instance — not clones or snapshots.
- [ ] Audit `devs-grpc` service implementations (`GetRun`, `CancelRun`, etc.) to confirm they read/write through the shared `SchedulerState` reference, not a cached copy.
- [ ] Audit `devs-mcp` tool implementations (`cancel_run`, `get_run`, etc.) to confirm they read/write through the same shared `SchedulerState` reference.
- [ ] If any MCP or gRPC handler currently snapshots state into a local variable before responding, refactor it to read directly from the shared state under a lock so that mutations from either interface are immediately visible.

## 3. Code Review
- [ ] Verify there is exactly one `SchedulerState` allocation per server instance — grep for all construction sites and confirm a single `Arc::new(...)`.
- [ ] Verify no `clone()` of inner state containers exists that could create divergent copies.
- [ ] Confirm lock acquisition follows the documented ordering: project registry → workflow runs → pool state → checkpoint.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --test unified_state_consistency` and confirm all tests pass.
- [ ] Run `cargo test -p devs-scheduler --test shared_state` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on the `SchedulerState` struct explaining that it is the single source of truth shared by gRPC and MCP interfaces, referencing [2_TAS-REQ-430].

## 6. Automated Verification
- [ ] Run `./do test` and confirm the traceability scanner detects `// Covers: 2_TAS-REQ-430` annotations.
- [ ] Run `./do lint` and confirm no warnings or errors.
