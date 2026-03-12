# Task: Define Foundational gRPC Protobuf Schema (Sub-Epic: 008_Proto & Core Foundation)

## Covered Requirements
- [2_TAS-REQ-008], [2_TAS-REQ-009]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create a shell script `verify_proto_layout.sh` that checks for the existence of the following files in `proto/devs/v1/`:
  - `common.proto`
  - `workflow_definition.proto`
  - `run.proto`
  - `stage.proto`
  - `log.proto`
  - `pool.proto`
  - `project.proto`
  - `server.proto`
- [ ] The script should also verify that each file starts with `syntax = "proto3";` and `package devs.v1;`.

## 2. Task Implementation
- [ ] Create the directory structure `proto/devs/v1/`.
- [ ] Implement `common.proto` containing foundational message types like `Timestamp` (imported from `google/protobuf/timestamp.proto`), `RunStatus`, and `StageStatus` enums.
- [ ] Implement `workflow_definition.proto` for `WorkflowDefinitionService` and associated messages.
- [ ] Implement `run.proto` for `RunService` and `WorkflowRun` messages.
- [ ] Implement `stage.proto` for `StageService` and `StageRun` messages.
- [ ] Implement `log.proto` for `LogService` and log streaming messages.
- [ ] Implement `pool.proto` for `PoolService` and agent pool messages.
- [ ] Implement `project.proto` for `ProjectService` and project configuration messages.
- [ ] Implement `server.proto` for `ServerService` including `GetInfo` RPC returning version and MCP port.
- [ ] Ensure all message and service names use `PascalCase`.
- [ ] Ensure all field names use `snake_case`.
- [ ] Ensure all enum value names use `SCREAMING_SNAKE_CASE` with the enum name prefix.

## 3. Code Review
- [ ] Verify that the proto package name is exactly `devs.v1`.
- [ ] Verify that field numbers are assigned sequentially starting from 1.
- [ ] Verify that no field numbers are reused and `reserved` statements are used for any deleted fields (if any).

## 4. Run Automated Tests to Verify
- [ ] Execute `./verify_proto_layout.sh` and ensure it passes.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_0/008_proto_core_foundation/REPORTS.md` (create if not exists) summarizing the proto layout.

## 6. Automated Verification
- [ ] Run `grep -r "package devs.v1;" proto/devs/v1/` and ensure all 8 files match.
