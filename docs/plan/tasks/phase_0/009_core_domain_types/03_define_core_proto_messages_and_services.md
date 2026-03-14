# Task: Define Core Protobuf Messages and Services (Sub-Epic: 009_Core Domain Types)

## Covered Requirements
- [2_TAS-REQ-067], [2_TAS-REQ-068]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto (consumer — proto files and build system must already exist from sub-epic 008_proto_core_foundation)]

## 1. Initial Test Written
- [ ] Create `crates/devs-proto/tests/proto_content_test.rs` (integration test) containing:
  - **File existence tests ([2_TAS-REQ-067]):**
    - `test_common_proto_exists`: Assert `proto/devs/v1/common.proto` exists on disk.
    - `test_run_proto_exists`: Assert `proto/devs/v1/run.proto` exists.
    - `test_workflow_proto_exists`: Assert `proto/devs/v1/workflow.proto` exists.
    - `test_stage_proto_exists`: Assert `proto/devs/v1/stage.proto` exists.
    - `test_log_proto_exists`: Assert `proto/devs/v1/log.proto` exists.
    - `test_pool_proto_exists`: Assert `proto/devs/v1/pool.proto` exists.
    - `test_project_proto_exists`: Assert `proto/devs/v1/project.proto` exists.
  - **Generated type tests ([2_TAS-REQ-068]):**
    - `test_run_status_enum_variants`: Import generated `RunStatusMessage` and verify all 6 variants exist: `Pending`, `Running`, `Paused`, `Completed`, `Failed`, `Cancelled` (as i32 values 0–5).
    - `test_stage_status_enum_variants`: Import generated `StageStatusMessage` and verify all 9 variants: `Pending`(0), `Waiting`(1), `Eligible`(2), `Running`(3), `Paused`(4), `Completed`(5), `Failed`(6), `Cancelled`(7), `TimedOut`(8).
    - `test_workflow_run_fields`: Construct a default `WorkflowRun` and verify fields `run_id`, `slug`, `workflow_name`, `project_id`, `status`, `inputs_json`, `snapshot_json`, `created_at`, `started_at`, `completed_at`, `stage_runs` are accessible.
    - `test_stage_run_fields`: Construct a default `StageRun` and verify fields `stage_run_id`, `run_id`, `stage_name`, `attempt`, `status`, `agent_tool`, `pool_name`, `started_at`, `completed_at`, `exit_code` are accessible.
    - `test_run_event_fields`: Construct a default `RunEvent` and verify fields `run_id`, `event_type`, `run`, `stage`, `occurred_at` are accessible.
    - `test_run_service_rpc_names`: Verify the generated `RunService` client/server types exist and expose methods: `submit_run`, `get_run`, `list_runs`, `cancel_run`, `pause_run`, `resume_run`, `watch_run`.
  - **Annotate all tests with `// Covers: 2_TAS-REQ-067` or `// Covers: 2_TAS-REQ-068` as appropriate.**

## 2. Task Implementation
- [ ] Implement `proto/devs/v1/common.proto`:
  - `syntax = "proto3"; package devs.v1;`
  - Import `google/protobuf/timestamp.proto` and `google/protobuf/wrappers.proto`.
  - Define `message RunStatusMessage` with nested `enum Value { PENDING=0; RUNNING=1; PAUSED=2; COMPLETED=3; FAILED=4; CANCELLED=5; }` and field `Value value = 1;`.
  - Define `message StageStatusMessage` with nested `enum Value { PENDING=0; WAITING=1; ELIGIBLE=2; RUNNING=3; PAUSED=4; COMPLETED=5; FAILED=6; CANCELLED=7; TIMED_OUT=8; }` and field `Value value = 1;`.
- [ ] Implement `proto/devs/v1/run.proto`:
  - Import `common.proto`, `google/protobuf/timestamp.proto`, `google/protobuf/wrappers.proto`.
  - Define `message WorkflowRun` with all 11 fields exactly as specified in [2_TAS-REQ-068]: `run_id`(1), `slug`(2), `workflow_name`(3), `project_id`(4), `status`(5, type `RunStatusMessage`), `inputs_json`(6), `snapshot_json`(7), `created_at`(8, Timestamp), `started_at`(9, Timestamp), `completed_at`(10, Timestamp), `stage_runs`(11, repeated StageRun).
  - Define `message StageRun` with 10 fields: `stage_run_id`(1), `run_id`(2), `stage_name`(3), `attempt`(4, uint32), `status`(5, StageStatusMessage), `agent_tool`(6), `pool_name`(7), `started_at`(8, Timestamp), `completed_at`(9, Timestamp), `exit_code`(10, google.protobuf.Int32Value).
  - Define `message RunEvent` with 5 fields: `run_id`(1), `event_type`(2), `run`(3, WorkflowRun), `stage`(4, StageRun), `occurred_at`(5, Timestamp).
  - Define request/response messages: `SubmitRunRequest`, `GetRunRequest`, `ListRunsRequest`, `ListRunsResponse`, `CancelRunRequest`, `CancelRunResponse`, `PauseRunRequest`, `PauseRunResponse`, `ResumeRunRequest`, `ResumeRunResponse`, `WatchRunRequest`.
  - Define `service RunService` with 7 RPCs: `SubmitRun`, `GetRun`, `ListRuns`, `CancelRun`, `PauseRun`, `ResumeRun`, `WatchRun` (server-streaming for WatchRun returning `stream RunEvent`).
- [ ] Create placeholder proto files for remaining services ([2_TAS-REQ-067]):
  - `proto/devs/v1/workflow.proto`: Stub `message WorkflowDefinition {}`, stub `service WorkflowService {}`.
  - `proto/devs/v1/stage.proto`: Stub `message StageOutput {}`, stub `service StageService {}`.
  - `proto/devs/v1/log.proto`: Stub `message LogChunk {}`, stub `service LogService {}`.
  - `proto/devs/v1/pool.proto`: Stub `message AgentPool {}`, stub `message PoolState {}`, stub `service PoolService {}`.
  - `proto/devs/v1/project.proto`: Stub `message Project {}`, stub `service ProjectService {}`.
  - All stubs must have correct `syntax`, `package`, and header block per [2_TAS-REQ-008A].
- [ ] Update `devs-proto/build.rs` to include all new `.proto` files in the compilation list.
- [ ] Run `cargo build -p devs-proto` to generate Rust types and verify compilation succeeds.
- [ ] Verify generated files in `crates/devs-proto/src/gen/` are updated and committed.

## 3. Code Review
- [ ] Verify all proto files use `package devs.v1;` and `syntax = "proto3";`.
- [ ] Verify field numbers are sequential with no gaps or reuse.
- [ ] Verify `google/protobuf/timestamp.proto` and `google/protobuf/wrappers.proto` imports are present where needed.
- [ ] Verify message and field names match the spec in [2_TAS-REQ-068] exactly.
- [ ] Verify placeholder files are minimal but valid (parseable by protoc).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto` and confirm all tests pass.
- [ ] Run `cargo build -p devs-proto` and confirm it compiles cleanly.
- [ ] Run `cargo clippy -p devs-proto -- -D warnings` and confirm zero warnings.

## 5. Update Documentation
- [ ] Add comments at the top of each proto file referencing [2_TAS-REQ-067] and [2_TAS-REQ-068] where applicable.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-proto 2>&1 | tail -5` and confirm `test result: ok`.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-067" crates/devs-proto/` returns at least 1 match.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-068" crates/devs-proto/` returns at least 1 match.
- [ ] Run `ls proto/devs/v1/` and confirm all 7 proto files exist: `common.proto`, `run.proto`, `workflow.proto`, `stage.proto`, `log.proto`, `pool.proto`, `project.proto`.
