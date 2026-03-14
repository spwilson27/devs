# Task: Implement gRPC Error Code Mapping and Message Format (Sub-Epic: 033_Foundational Technical Requirements (Part 24))

## Covered Requirements
- [2_TAS-REQ-086B], [2_TAS-REQ-086C]

## Dependencies
- depends_on: []
- shared_components: [devs-core (owner of domain error types — this task defines the error enum and gRPC status mapping)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/error.rs` (or a corresponding test module), write the following tests. All tests must be annotated with `// Covers: 2_TAS-REQ-086B` or `// Covers: 2_TAS-REQ-086C` as appropriate.
- [ ] `test_run_not_found_maps_to_not_found`: create a `DevsError::RunNotFound { run_id: "abc" }` variant. Convert it to `tonic::Status`. Assert `status.code() == tonic::Code::NotFound`. Assert `status.message()` starts with `"run not found: "`.
- [ ] `test_workflow_not_found_maps_to_not_found`: same pattern for `DevsError::WorkflowNotFound`. Assert message starts with `"workflow not found: "`.
- [ ] `test_project_not_found_maps_to_not_found`: same for `DevsError::ProjectNotFound`. Message prefix: `"project not found: "`.
- [ ] `test_pool_not_found_maps_to_not_found`: same for `DevsError::PoolNotFound`. Message prefix: `"pool not found: "`.
- [ ] `test_stage_not_found_maps_to_not_found`: same for `DevsError::StageNotFound`. Message prefix: `"stage not found: "`.
- [ ] `test_duplicate_run_name_maps_to_already_exists`: create `DevsError::DuplicateRunName { name: "foo" }`. Assert `Code::AlreadyExists`. Message prefix: `"duplicate run name: "`.
- [ ] `test_illegal_transition_maps_to_failed_precondition`: create `DevsError::IllegalTransition { from: "Completed", action: "Cancel" }`. Assert `Code::FailedPrecondition`. Message prefix: `"illegal transition: "`.
- [ ] `test_client_version_mismatch_maps_to_failed_precondition`: create `DevsError::ClientVersionMismatch`. Assert `Code::FailedPrecondition`. Message prefix: `"client version mismatch: "`.
- [ ] `test_pool_exhausted_maps_to_resource_exhausted`: create `DevsError::PoolExhausted { pool: "primary" }`. Assert `Code::ResourceExhausted`. Message prefix: `"pool exhausted: "`.
- [ ] `test_context_file_too_large_maps_to_resource_exhausted`: create `DevsError::ContextFileTooLarge { size_bytes: 11_000_000 }`. Assert `Code::ResourceExhausted`. Message prefix: `"context file too large: "`.
- [ ] `test_server_shutting_down_maps_to_unavailable`: create `DevsError::ServerShuttingDown`. Assert `Code::Unavailable`. Message prefix: `"server shutting down: "`.
- [ ] `test_server_not_ready_maps_to_unavailable`: create `DevsError::ServerNotReady`. Assert `Code::Unavailable`. Message prefix: `"server not ready: "`.
- [ ] `test_internal_error_maps_to_internal`: create `DevsError::Internal { cause: "panic in scheduler" }`. Assert `Code::Internal`. Message prefix: `"internal: "`.
- [ ] `test_input_validation_maps_to_invalid_argument`: create `DevsError::InputValidation { errors: vec!["bad field".into()] }`. Assert `Code::InvalidArgument`. Message prefix: `"input validation: "`.
- [ ] `test_malformed_uuid_maps_to_invalid_argument`: create `DevsError::MalformedUuid { value: "not-a-uuid" }`. Assert `Code::InvalidArgument`. Message prefix: `"malformed uuid: "`.
- [ ] `test_message_format_is_kind_colon_detail`: for each variant, assert that `status.message()` matches the regex `^[a-z ]+: .+$` — the prefix is lowercase words separated by spaces, followed by colon-space, followed by non-empty detail.
- [ ] `test_internal_is_never_used_for_domain_errors`: iterate over all domain error variants (everything except `Internal`) and assert none maps to `Code::Internal`.

## 2. Task Implementation
- [ ] Define `pub enum DevsError` in `crates/devs-core/src/error.rs` with at minimum these variants (each storing relevant context fields as owned `String`s):
  - `RunNotFound { run_id: String }`
  - `WorkflowNotFound { name: String, project_id: String }`
  - `ProjectNotFound { project_id: String }`
  - `PoolNotFound { pool_name: String }`
  - `StageNotFound { run_id: String, stage_name: String }`
  - `DuplicateRunName { name: String }`
  - `IllegalTransition { from: String, action: String }`
  - `ClientVersionMismatch { expected: String, actual: String }`
  - `InputValidation { errors: Vec<String> }`
  - `MalformedUuid { value: String }`
  - `PoolExhausted { pool: String }`
  - `ContextFileTooLarge { size_bytes: u64 }`
  - `ServerShuttingDown`
  - `ServerNotReady`
  - `Internal { cause: String }`
- [ ] Implement `std::fmt::Display` for `DevsError` using the `"<error-kind>: <detail>"` format. The `<error-kind>` prefix must be a static, machine-stable string (e.g., `"run not found"`, `"illegal transition"`, `"input validation"`). The `<detail>` part contains the dynamic context.
- [ ] Implement `std::error::Error` for `DevsError`.
- [ ] Implement `From<DevsError> for tonic::Status` that maps each variant to the exact gRPC status code specified in the §5.11 table of `docs/plan/specs/2_tas.md`. Use `tonic::Status::new(code, self.to_string())` so the Display format becomes the gRPC message.
- [ ] Add a helper method `pub fn error_kind(&self) -> &'static str` that returns the machine-stable prefix for each variant. This allows clients to match on the prefix without parsing.
- [ ] Re-export `DevsError` from `crates/devs-core/src/lib.rs`.
- [ ] Note: `devs-core` must NOT depend on `tonic` directly. Instead, define a `pub fn to_grpc_code(&self) -> i32` method returning the integer code, and implement the `From<DevsError> for tonic::Status` conversion in a separate thin crate or behind a `grpc` feature flag. Alternatively, if `devs-core` already has a `tonic` dependency, proceed with direct `From` impl.

## 3. Code Review
- [ ] Verify that `Code::Internal` is used **only** for the `Internal` variant — no other variant maps to it.
- [ ] Verify the complete error code mapping table matches §5.11 exactly: `NOT_FOUND=5`, `ALREADY_EXISTS=6`, `FAILED_PRECONDITION=9`, `INVALID_ARGUMENT=3`, `RESOURCE_EXHAUSTED=8`, `UNAVAILABLE=14`, `INTERNAL=13`.
- [ ] Verify every `Display` output follows `"<kind>: <detail>"` with a stable prefix.
- [ ] Verify `DevsError` is `Send + Sync + 'static`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` — all error mapping and formatting tests must pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-086B` and `// Covers: 2_TAS-REQ-086C` traceability annotations to all relevant test functions.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no lint errors in `devs-core`.
- [ ] Run `./do test` and confirm all `devs-core` error tests pass.
