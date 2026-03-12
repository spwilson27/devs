# Task: Define Core Protobuf Messages and Services (Sub-Epic: 009_Core Domain Types)

## Covered Requirements
- [2_TAS-REQ-067], [2_TAS-REQ-068]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/008_proto_core_foundation/01_define_proto_schema.md]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create a shell script `verify_proto_content.sh` that checks the contents of `proto/devs/v1/run.proto` and `proto/devs/v1/common.proto`:
  - Verify that `common.proto` contains `RunStatusMessage` and `StageStatusMessage` as per [2_TAS-REQ-068].
  - Verify that `run.proto` contains `WorkflowRun`, `StageRun`, `RunEvent` and `RunService` as per [2_TAS-REQ-068].
  - Verify that all field types and names match the specification (e.g., `google.protobuf.Timestamp`, `repeated StageRun stage_runs`).

## 2. Task Implementation
- [ ] Implement `proto/devs/v1/common.proto`:
  - Define `RunStatusMessage` enum: `PENDING`, `RUNNING`, `PAUSED`, `COMPLETED`, `FAILED`, `CANCELLED`.
  - Define `StageStatusMessage` enum: `PENDING`, `WAITING`, `ELIGIBLE`, `RUNNING`, `PAUSED`, `COMPLETED`, `FAILED`, `CANCELLED`, `TIMED_OUT`.
  - Define `Uuid` message if needed for shared ID types.
- [ ] Implement `proto/devs/v1/run.proto`:
  - Define `WorkflowRun` with fields: `run_id`, `slug`, `workflow_name`, `project_id`, `status`, `inputs_json`, `snapshot_json`, `created_at`, `started_at`, `completed_at`, `stage_runs`.
  - Define `StageRun` with fields: `stage_run_id`, `run_id`, `stage_name`, `attempt`, `status`, `agent_tool`, `pool_name`, `started_at`, `completed_at`, `exit_code`.
  - Define `RunEvent` with fields: `run_id`, `event_type`, `run`, `stage`, `occurred_at`.
  - Define `RunService` with RPCs: `SubmitRun`, `GetRun`, `ListRuns`, `CancelRun`, `PauseRun`, `ResumeRun`, `WatchRun`.
- [ ] Implement placeholders for the remaining files in `proto/devs/v1/` as per [2_TAS-REQ-067]:
  - `workflow.proto` (WorkflowDefinition, WorkflowService)
  - `stage.proto` (StageOutput, StageService)
  - `log.proto` (LogChunk, LogService)
  - `pool.proto` (AgentPool, PoolService)
  - `project.proto` (Project, ProjectService)
- [ ] Ensure `tonic-build` or `prost-build` in the `devs-proto` crate correctly processes these files.
- [ ] Run `cargo build -p devs-proto` to verify code generation.

## 3. Code Review
- [ ] Verify that proto files follow the package `devs.v1`.
- [ ] Ensure that `google/protobuf/timestamp.proto` and `google/protobuf/wrappers.proto` are imported and used correctly.
- [ ] Check field numbering for consistency and future-proofing.

## 4. Run Automated Tests to Verify
- [ ] Execute `./verify_proto_content.sh` and ensure it passes.
- [ ] Ensure `cargo build -p devs-proto` succeeds without errors.

## 5. Update Documentation
- [ ] Update `crates/devs-proto/README.md` summarizing the services and messages defined.

## 6. Automated Verification
- [ ] Run `grep -r "WorkflowRun" proto/devs/v1/` and `grep -r "RunService" proto/devs/v1/` to ensure full implementation of required representative messages.
