# Task: Define Normative Protobuf Service Files (Sub-Epic: 033_Foundational Technical Requirements (Part 24))

## Covered Requirements
- [2_TAS-REQ-086A]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto (owner — this task creates the six normative proto files and wires up tonic-build)]

## 1. Initial Test Written
- [ ] In `crates/devs-proto/tests/proto_structure.rs`, write `test_all_six_proto_files_exist` that uses `std::fs::metadata` to assert these six files exist under `proto/devs/v1/`: `common.proto`, `workflow.proto`, `stage.proto`, `log.proto`, `pool.proto`, `project.proto`.
- [ ] Write `test_all_protos_declare_package_devs_v1` that reads each `.proto` file with `include_str!` and asserts it contains `package devs.v1;`.
- [ ] Write `test_all_service_protos_import_common_and_timestamp` that reads each of the five service proto files (all except `common.proto`) and asserts each contains both `import "devs/v1/common.proto"` and `import "google/protobuf/timestamp.proto"`.
- [ ] Write `test_common_run_status_enum_variants` that instantiates each variant of the generated `RunStatusEnum` and asserts there are exactly 7 variants: `Unspecified=0`, `Pending=1`, `Running=2`, `Paused=3`, `Completed=4`, `Failed=5`, `Cancelled=6`.
- [ ] Write `test_common_stage_status_enum_variants` that asserts `StageStatusEnum` has exactly 10 variants: `Unspecified=0`, `Pending=1`, `Waiting=2`, `Eligible=3`, `Running=4`, `Paused=5`, `Completed=6`, `Failed=7`, `Cancelled=8`, `TimedOut=9`.
- [ ] Write `test_workflow_service_has_four_rpcs` that asserts the generated `workflow_service_client::WorkflowServiceClient` type can be instantiated (compile-time proof the trait methods exist): `register_workflow`, `delete_workflow`, `get_workflow`, `list_workflows`.
- [ ] Write `test_stage_service_has_six_rpcs` that asserts `stage_service_client::StageServiceClient` has methods: `get_stage`, `pause_stage`, `resume_stage`, `retry_stage`, `cancel_stage`, `get_stage_output`.
- [ ] Write `test_log_service_has_two_rpcs` that asserts `log_service_client::LogServiceClient` has `stream_logs` (returns streaming) and `get_log_snapshot`.
- [ ] Write `test_pool_service_has_three_rpcs` that asserts `pool_service_client::PoolServiceClient` has `get_pool_status`, `list_pools`, `watch_pool_state` (returns streaming).
- [ ] Write `test_project_service_has_five_rpcs` that asserts `project_service_client::ProjectServiceClient` has `add_project`, `remove_project`, `get_project`, `list_projects`, `update_project`.
- [ ] Write `test_stage_run_proto_fields` that constructs a `StageRunProto` and asserts all 10 fields are accessible: `stage_run_id`, `run_id`, `stage_name`, `attempt`, `status`, `agent_tool`, `pool_name`, `started_at`, `completed_at`, `exit_code`.
- [ ] Write `test_workflow_definition_proto_fields` that constructs a `WorkflowDefinitionProto` and asserts all 7 fields: `name`, `format`, `inputs`, `stages`, `timeout_secs`, `default_env_json`, `artifact_collection`.
- [ ] Write `test_stage_output_proto_fields` that constructs a `StageOutputProto` and asserts all 6 fields: `stdout`, `stderr`, `structured_json`, `exit_code`, `log_path`, `truncated`.
- [ ] Annotate every test with `// Covers: 2_TAS-REQ-086A`.

## 2. Task Implementation
- [ ] Create directory `proto/devs/v1/`.
- [ ] Create `proto/devs/v1/common.proto` with the **exact** content from §5.10.6 of `docs/plan/specs/2_tas.md`. This includes: `RunStatusEnum` (7 variants), `StageStatusEnum` (10 variants), and `StageRunProto` message (10 fields with wrapper types for `exit_code` as `google.protobuf.Int32Value`).
- [ ] Create `proto/devs/v1/workflow.proto` with the **exact** content from §5.10.1. This includes: `WorkflowService` with 4 RPCs (`RegisterWorkflow`, `DeleteWorkflow`, `GetWorkflow`, `ListWorkflows`), and messages `RegisterWorkflowRequest`, `DeleteWorkflowRequest`, `DeleteWorkflowResponse`, `GetWorkflowRequest`, `ListWorkflowsRequest`, `ListWorkflowsResponse`, `WorkflowSummaryProto`, `WorkflowDefinitionProto`, `WorkflowInputProto`, `StageDefinitionProto`.
- [ ] Create `proto/devs/v1/stage.proto` with the **exact** content from §5.10.2. This includes: `StageService` with 6 RPCs, and messages for each request plus `StageOutputProto` (6 fields including `bytes stdout`, `bytes stderr`, `bool truncated`).
- [ ] Create `proto/devs/v1/log.proto` with the **exact** content from §5.10.3. This includes: `LogService` with `StreamLogs` (server-streaming returning `stream LogChunkProto`) and `GetLogSnapshot`, plus `LogChunkProto` (5 fields) and `LogSnapshotProto` (4 fields).
- [ ] Create `proto/devs/v1/pool.proto` with the **exact** content from §5.10.4. This includes: `PoolService` with `GetPoolStatus`, `ListPools`, `WatchPoolState` (server-streaming), plus `PoolStateProto`, `AgentStateProto`, `PoolStateEventProto`.
- [ ] Create `proto/devs/v1/project.proto` with the **exact** content from §5.10.5. This includes: `ProjectService` with 5 RPCs, `ProjectProto` (9 fields), `AddProjectRequest`, `RemoveProjectRequest`/`Response`, `GetProjectRequest`, `ListProjectsRequest`/`Response`, `UpdateProjectRequest`.
- [ ] In `crates/devs-proto/build.rs`, configure `tonic_build::configure()` to compile all six `.proto` files. Set the proto include path to `["proto/"]` so that imports like `devs/v1/common.proto` resolve correctly. Enable `build_server(true)` and `build_client(true)`.
- [ ] In `crates/devs-proto/src/lib.rs`, use `tonic::include_proto!("devs.v1")` or equivalent to re-export all generated types. Ensure the public API is `devs_proto::*` with all message and service types accessible.
- [ ] Add `tonic-build` to `[build-dependencies]` and `tonic`, `prost`, `prost-types` to `[dependencies]` in `crates/devs-proto/Cargo.toml`.

## 3. Code Review
- [ ] Diff each `.proto` file line-by-line against the spec in §5.10.1–§5.10.6 of `docs/plan/specs/2_tas.md`. Zero deviations allowed — field numbers, names, types, and comments must match exactly.
- [ ] Verify wrapper types are used precisely where specified: `google.protobuf.UInt64Value` for `timeout_secs`, `google.protobuf.UInt32Value` for `attempt`, `google.protobuf.Int32Value` for `exit_code`, `google.protobuf.Timestamp` for all time fields.
- [ ] Confirm no extra messages, fields, RPCs, or enums beyond the spec.
- [ ] Verify `build.rs` compiles all six files and the generated code is re-exported.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build -p devs-proto` — must succeed with zero errors and zero warnings.
- [ ] Run `cargo test -p devs-proto` — all tests in `proto_structure.rs` must pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-086A` traceability annotations to all test functions.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no lint errors in `devs-proto`.
- [ ] Run `./do test` and confirm all `devs-proto` tests pass.
