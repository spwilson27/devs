# Task: Define Normative Protobuf Files (Sub-Epic: 033_Foundational Technical Requirements (Part 24))

## Covered Requirements
- [2_TAS-REQ-086A]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create a test in `devs-proto` that attempts to compile all `.proto` files in `proto/devs/v1/` using `prost-build` or `tonic-build` in a `build.rs` script.
- [ ] The test should verify that all six normative service files exist: `workflow.proto`, `stage.proto`, `log.proto`, `pool.proto`, `project.proto`, and `common.proto`.
- [ ] The test should verify that they all belong to the `devs.v1` package.

## 2. Task Implementation
- [ ] Create the directory structure `proto/devs/v1/`.
- [ ] Implement `common.proto` containing shared types like `WorkflowDefinitionProto`, `WorkflowSummaryProto`, `StageStatus`, `RunStatus`, etc., as specified in Section 5.10 of `docs/plan/specs/2_tas.md`.
- [ ] Implement `workflow.proto` with `WorkflowService` and its request/response messages.
- [ ] Implement `stage.proto` with `StageService` for managing individual stage runs.
- [ ] Implement `log.proto` with `LogService` for streaming and fetching logs.
- [ ] Implement `pool.proto` with `PoolService` for agent pool management.
- [ ] Implement `project.proto` with `ProjectService` for project registration.
- [ ] Ensure all files import `devs/v1/common.proto` and `google/protobuf/timestamp.proto` as required.
- [ ] Update `devs-proto/build.rs` to compile these new proto files.

## 3. Code Review
- [ ] Verify that all service definitions match the normative definitions in `docs/plan/specs/2_tas.md` exactly.
- [ ] Ensure proper use of `google.protobuf.Timestamp` and `google.protobuf.Int32Value`/`StringValue` where appropriate.
- [ ] Confirm that all files use `syntax = "proto3";` and `package devs.v1;`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build -p devs-proto` to ensure Protobuf code generation succeeds.
- [ ] Run unit tests in `devs-proto` to verify the generated code is accessible and correctly structured.

## 5. Update Documentation
- [ ] None required beyond internal code comments.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `devs-proto` tests pass.
- [ ] Verify traceability using `./tools/verify_requirements.py`.
