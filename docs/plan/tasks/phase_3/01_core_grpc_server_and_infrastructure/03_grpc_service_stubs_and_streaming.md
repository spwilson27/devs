# Task: gRPC Service Stubs (Workflow, Stage, Log, Pool, Project) and Streaming RPCs (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [2_TAS-REQ-052], [2_TAS-REQ-054], [2_TAS-REQ-072]

## Dependencies
- depends_on: ["01_devs_grpc_crate_scaffold_and_server_service.md"]
- shared_components: ["devs-proto (consumer)", "devs-scheduler (consumer)", "devs-pool (consumer)", "devs-checkpoint (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-grpc/tests/service_stubs_test.rs`:
  - `test_workflow_service_submit_run_unimplemented`: Call `WorkflowService::submit_run` with valid request; assert `UNIMPLEMENTED` status (stub behavior before scheduler integration).
  - `test_workflow_service_list_runs_returns_empty`: Call `list_runs`; assert empty list response.
  - `test_stage_service_get_stage_output_unimplemented`: Call `StageService::get_stage_output`; assert `UNIMPLEMENTED`.
  - `test_log_service_stream_logs_returns_stream`: Call `LogService::stream_logs` with `follow: true`; assert a streaming response is returned (not unary).
  - `test_pool_service_get_pool_state_unimplemented`: Stub test.
  - `test_project_service_add_project_unimplemented`: Stub test.
- [ ] In `crates/devs-grpc/tests/streaming_test.rs`:
  - `test_stream_run_events_sends_events_on_state_change`: Create a mock event channel, connect a `StreamRunEvents` client, push events, verify client receives them.
  - `test_stream_run_events_respects_cancellation`: Start a stream, drop the client, verify the server-side task completes without error.
  - `test_stream_logs_chunked_newline_delimited_json`: Call `stream_logs` with `follow: true`; verify each chunk is a newline-delimited JSON `LogChunk` object.

## 2. Task Implementation
- [ ] Implement `WorkflowServiceImpl` with all four RPCs as stubs returning `UNIMPLEMENTED`. Accept `Arc<dyn SchedulerApi>` trait object for future integration.
- [ ] Implement `StageServiceImpl` with `get_stage_output` and `list_stages` stubs.
- [ ] Implement `LogServiceImpl`:
  - `get_logs` returns historical log data (stub).
  - `stream_logs` returns a `tonic::Response<ReceiverStream<LogChunk>>`. Each chunk is newline-delimited JSON per [2_TAS-REQ-072].
- [ ] Implement `PoolServiceImpl` with `get_pool_state` and `watch_pool_state` stubs.
- [ ] Implement `ProjectServiceImpl` with `add_project`, `list_projects`, `remove_project` stubs.
- [ ] Implement `StreamRunEvents` as a server-streaming RPC on `WorkflowService` using `tokio::sync::broadcast` for event distribution.
- [ ] Register all five new services in `GrpcServer` builder alongside `ServerService`.
- [ ] Ensure streaming RPCs respect Tokio cancellation via `CancellationToken` or `select!` on the receiver.

## 3. Code Review
- [ ] Verify all six services are registered in the server builder.
- [ ] Confirm streaming RPCs clean up resources when client disconnects.
- [ ] Check that `LogChunk` serialization produces newline-delimited JSON, not array wrapping.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to each service impl explaining the RPC contract.
- [ ] Add `// Covers:` annotations for 2_TAS-REQ-052, 2_TAS-REQ-054, 2_TAS-REQ-072.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
