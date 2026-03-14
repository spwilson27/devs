# Task: gRPC Standard Unary Responses and Error Mapping (Sub-Epic: 020_Foundational Technical Requirements (Part 11))

## Covered Requirements
- [2_TAS-REQ-002R], [2_TAS-REQ-002S]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto (consumer — proto definitions), devs-core (consumer — domain error types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-grpc/tests/error_mapping_test.rs` (or `crates/devs-proto/tests/error_mapping_test.rs`) with unit tests for the domain-error-to-gRPC-status mapping:
    - Test that `EntityNotFound` (for run, stage, project, pool) maps to `tonic::Code::NotFound`.
    - Test that a validation error maps to `tonic::Code::InvalidArgument`.
    - Test that a duplicate name / state conflict maps to `tonic::Code::AlreadyExists`.
    - Test that a client API version mismatch maps to `tonic::Code::FailedPrecondition`.
    - Test that a resource exhaustion error maps to `tonic::Code::ResourceExhausted`.
    - Test that an "operation not permitted in current state" error maps to `tonic::Code::FailedPrecondition`.
    - Test that an unhandled/internal error maps to `tonic::Code::Internal`.
    - Test that a client cancellation maps to `tonic::Code::Cancelled`.
    - For each mapping, verify the `tonic::Status` message contains a human-readable description of the error.
- [ ] Create `crates/devs-proto/tests/request_id_test.rs` that uses `prost-reflect` (or parses the generated descriptor set) to verify every protobuf message whose name ends with `Response` and is used in a unary RPC has a `string request_id` field.
- [ ] Create a unit test that constructs a sample unary response using the `inject_request_id` helper (to be implemented) and asserts:
    - The `request_id` field is set to a valid UUID4 string (matches regex `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`).
    - Two sequential calls produce different UUIDs.

## 2. Task Implementation
- [ ] Update every `.proto` file in `proto/devs/v1/` to add `string request_id = 100;` to every unary response message. Use field tag 100 consistently to reserve lower tags for domain fields. Unary response messages are those returned by non-streaming RPCs (i.e., RPCs without `stream` keyword on the return type).
- [ ] Regenerate Rust code from proto files (run `cargo build -p devs-proto` or the proto codegen script) and verify the generated structs include `pub request_id: String`.
- [ ] Define a `DomainError` enum in `devs-core` (or extend the existing error type) with variants matching the mapping table:
    ```rust
    pub enum DomainError {
        EntityNotFound { entity_type: &'static str, id: String },
        ValidationError { details: String },
        DuplicateConflict { details: String },
        ApiVersionMismatch { expected: String, actual: String },
        ResourceExhausted { details: String },
        InvalidStateTransition { details: String },
        Internal { source: Box<dyn std::error::Error + Send + Sync> },
        Cancelled,
    }
    ```
- [ ] Implement `impl From<DomainError> for tonic::Status` (or a `ToStatus` trait) with the exact mapping from [2_TAS-REQ-002R]:
    | Domain Error Condition | gRPC Code |
    |---|---|
    | Entity not found | `NOT_FOUND` |
    | Validation error | `INVALID_ARGUMENT` |
    | Duplicate name or state conflict | `ALREADY_EXISTS` |
    | Client API version mismatch | `FAILED_PRECONDITION` |
    | Server resource exhausted | `RESOURCE_EXHAUSTED` |
    | Operation not permitted in current state | `FAILED_PRECONDITION` |
    | Internal server error | `INTERNAL` |
    | Client cancelled streaming RPC | `CANCELLED` |
- [ ] Implement a `inject_request_id()` utility function that generates a `uuid::Uuid::new_v4()` and sets the `request_id` field on any response struct. This can be a simple function or a macro that works with any struct having a `request_id: String` field.
- [ ] Ensure the `uuid` crate is added as a dependency to the appropriate crate with the `v4` feature enabled.

## 3. Code Review
- [ ] Verify the mapping table is exhaustive — every `DomainError` variant has a corresponding `tonic::Code` and no variants are missed.
- [ ] Verify that `Internal` errors do NOT leak internal details (stack traces, file paths) in the gRPC status message sent to clients — only a generic message.
- [ ] Confirm `request_id` uses field tag 100 consistently and does not conflict with existing field tags in any response message.
- [ ] Ensure the `From<DomainError> for tonic::Status` conversion is the single canonical mapping — no ad-hoc status construction elsewhere.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto` and `cargo test -p devs-core` (or whichever crate hosts the mapping).
- [ ] Run `cargo build -p devs-proto` to confirm proto regeneration succeeds.
- [ ] Run `./do test` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to the `DomainError` enum and the `From<DomainError> for tonic::Status` impl explaining the mapping rationale.
- [ ] Add doc comments to the `inject_request_id` function explaining its usage pattern in gRPC service handlers.

## 6. Automated Verification
- [ ] Run a script that greps all `.proto` files for `rpc` lines without `stream` in the return type, extracts the response message name, then verifies each message definition contains `string request_id`.
- [ ] Run `cargo test` with `--no-fail-fast` to confirm all error mapping and request_id tests pass.
