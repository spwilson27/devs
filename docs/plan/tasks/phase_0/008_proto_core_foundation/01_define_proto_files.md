# Task: Define Proto Schema Files and Directory Structure (Sub-Epic: 008_Proto & Core Foundation)

## Covered Requirements
- [2_TAS-REQ-008], [2_TAS-REQ-008A], [2_TAS-REQ-009], [2_TAS-REQ-009A], [2_TAS-REQ-009B]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto (Owner)]

## 1. Initial Test Written
- [ ] Create `devs-proto/tests/proto_structure_test.rs` with tests that verify:
  - All 8 `.proto` files exist at their expected paths under `proto/devs/v1/`: `common.proto`, `workflow_definition.proto`, `run.proto`, `stage.proto`, `log.proto`, `pool.proto`, `project.proto`, `server.proto`
  - Each `.proto` file begins with `syntax = "proto3";` followed by `package devs.v1;` (REQ-008A, REQ-009)
  - `server.proto` defines `ServerService` with `GetInfo` RPC, `GetInfoRequest` (empty), and `GetInfoResponse` with fields `server_version` (string, =1), `mcp_port` (uint32, =2), `request_id` (string, =3) (REQ-009B)
  - Write a helper function `parse_proto_file(path: &str) -> String` that reads a proto file and returns its contents for assertion
  - Write a test `test_all_proto_files_exist()` that checks `std::fs::metadata` for each expected proto path relative to workspace root
  - Write a test `test_proto_headers()` that reads each proto file and asserts the first two non-empty lines are `syntax = "proto3";` and `package devs.v1;`
  - Write a test `test_naming_conventions()` that parses proto files with regex to verify: service names are PascalCase (`[A-Z][a-zA-Z]*Service`), message names are PascalCase, field names are snake_case (`[a-z][a-z0-9_]*`), enum values are SCREAMING_SNAKE_CASE prefixed with enum name (REQ-009)
  - Write a test `test_field_numbers_sequential()` that parses each message in each proto file and verifies field numbers start at 1 and are sequential (no gaps unless `reserved`) (REQ-009A)
  - Write a test `test_server_service_get_info()` that verifies `server.proto` contains the exact `ServerService` definition with `GetInfo` RPC and correct response message fields (REQ-009B)

## 2. Task Implementation
- [ ] Create directory `proto/devs/v1/`
- [ ] Create `proto/devs/v1/common.proto` with:
  - Header: `syntax = "proto3"; package devs.v1; import "google/protobuf/timestamp.proto";`
  - Shared enums: `RunStatus` (RUN_STATUS_UNSPECIFIED=0, RUN_STATUS_PENDING=1, RUN_STATUS_RUNNING=2, RUN_STATUS_COMPLETED=3, RUN_STATUS_FAILED=4, RUN_STATUS_CANCELLED=5, RUN_STATUS_PAUSED=6), `StageStatus` (STAGE_STATUS_UNSPECIFIED=0, STAGE_STATUS_WAITING=1, STAGE_STATUS_ELIGIBLE=2, STAGE_STATUS_RUNNING=3, STAGE_STATUS_COMPLETED=4, STAGE_STATUS_FAILED=5, STAGE_STATUS_CANCELLED=6, STAGE_STATUS_PAUSED=7)
  - Shared messages: e.g. `Pagination` (int32 page_size=1, string page_token=2)
- [ ] Create `proto/devs/v1/server.proto` with:
  - Header block per REQ-008A
  - `service ServerService { rpc GetInfo(GetInfoRequest) returns (GetInfoResponse); }`
  - `message GetInfoRequest {}`
  - `message GetInfoResponse { string server_version = 1; uint32 mcp_port = 2; string request_id = 3; }`
- [ ] Create `proto/devs/v1/workflow_definition.proto` with header and stub `WorkflowDefinition` message
- [ ] Create `proto/devs/v1/run.proto` with header and stub `WorkflowRun` message referencing `RunStatus` from `common.proto`
- [ ] Create `proto/devs/v1/stage.proto` with header and stub `StageRun` message referencing `StageStatus`
- [ ] Create `proto/devs/v1/log.proto` with header and stub log streaming messages
- [ ] Create `proto/devs/v1/pool.proto` with header and stub pool messages
- [ ] Create `proto/devs/v1/project.proto` with header and stub project messages
- [ ] All enum values MUST use SCREAMING_SNAKE_CASE prefixed with the enum type name (REQ-009)
- [ ] All field numbers MUST be sequential starting from 1 with no gaps (REQ-009A)

## 3. Code Review
- [ ] Verify every `.proto` file has the correct header block (syntax, package, imports)
- [ ] Verify naming conventions: PascalCase services/messages, snake_case fields, SCREAMING_SNAKE_CASE enum values with type prefix
- [ ] Verify no field number gaps or reuse across all messages
- [ ] Verify the `ServerService` `GetInfo` RPC matches the spec exactly (REQ-009B)
- [ ] Verify the directory layout matches REQ-008 exactly (8 files under `proto/devs/v1/`)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto --test proto_structure_test` and verify all tests pass
- [ ] Verify proto files are parseable by running `protoc --proto_path=proto proto/devs/v1/*.proto --descriptor_set_out=/dev/null` (if protoc available)

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-008` annotation to the proto file existence test
- [ ] Add `// Covers: 2_TAS-REQ-008A` annotation to the header validation test
- [ ] Add `// Covers: 2_TAS-REQ-009` annotation to the naming convention test
- [ ] Add `// Covers: 2_TAS-REQ-009A` annotation to the field numbering test
- [ ] Add `// Covers: 2_TAS-REQ-009B` annotation to the ServerService GetInfo test

## 6. Automated Verification
- [ ] Run `cargo test -p devs-proto --test proto_structure_test 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-008' devs-proto/tests/` and confirm at least one match
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-009' devs-proto/tests/` and confirm at least one match
