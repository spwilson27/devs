# Task: Shared SchedulerState Implementation (Sub-Epic: 068_Detailed Domain Specifications (Part 33))

## Covered Requirements
- [2_TAS-REQ-417], [2_TAS-REQ-001C]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-scheduler, devs-grpc, devs-mcp, devs-server]

## 1. Initial Test Written
- [ ] Write an integration test in `devs-server` that starts both the gRPC and MCP servers.
- [ ] Submit a run through the gRPC server and immediately verify that the same run exists in the `list_runs` response of the MCP server (all within the same process).
- [ ] This test must confirm that they point to the same in-memory object.

## 2. Task Implementation
- [ ] Define `SchedulerState` in `devs-core/src/state.rs` (if not already there).
- [ ] Wrap `SchedulerState` in `Arc<RwLock<SchedulerState>>` within `devs-server`.
- [ ] Inject this `Arc` into the initializers of both `devs-grpc` and `devs-mcp`.
- [ ] Ensure any mutation through gRPC (e.g., `SubmitRun`) uses the same write lock and is immediately reflected in MCP tools.

## 3. Code Review
- [ ] Verify that no "cloning" of the state occurs that would lead to stale data in either interface.
- [ ] Confirm that all mutations follow the defined global lock acquisition order (per `2_TAS-REQ-002P`).

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and ensure the state-sharing integration test passes.

## 5. Update Documentation
- [ ] Update documentation to reflect the shared memory architecture between the two protocols.

## 6. Automated Verification
- [ ] Run an E2E test that submits a run via CLI and then fetches it via an MCP tool call (using `grpcurl` and a JSON-RPC client), confirming the `run_id` matches.
