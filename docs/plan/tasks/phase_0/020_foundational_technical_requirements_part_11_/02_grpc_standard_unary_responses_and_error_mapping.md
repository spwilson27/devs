# Task: gRPC Standard Unary Responses and Error Mapping (Sub-Epic: 020_Foundational Technical Requirements (Part 11))

## Covered Requirements
- [2_TAS-REQ-002R], [2_TAS-REQ-002S]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-proto/tests/test_grpc_standards.rs` (or similar) that:
    - Verifies that all generated Rust message structs for unary responses include a `request_id` field of type `String`.
    - Verifies that a `ToStatus` trait (to be implemented) correctly maps domain errors (e.g., `EntityNotFound`) to `tonic::Status` with the appropriate `tonic::Code` [2_TAS-REQ-002R].
- [ ] Create a test that uses `prost-reflect` or similar to inspect the descriptor pool and assert that every message ending in `Response` (unary) has a `request_id` field.

## 2. Task Implementation
- [ ] Update all `.proto` files in `proto/devs/v1/` to include `string request_id = <tag>;` in every unary response message [2_TAS-REQ-002S]. The field tag should be consistent (e.g., 100 or the last field).
- [ ] Implement a `ToStatus` trait in `devs-proto` (or a common utility module) that provides a standard `into_status()` method for mapping internal errors to `tonic::Status`.
- [ ] Implement the mapping table specified in [2_TAS-REQ-002R] (Entity not found -> NOT_FOUND, Validation error -> INVALID_ARGUMENT, etc.).
- [ ] Add a utility function/macro to automatically inject a UUID4 `request_id` into response messages during service implementation (can be a simple helper for now).

## 3. Code Review
- [ ] Ensure that the mapping table is exhaustive and handles the "Internal server error" case for any unmapped error.
- [ ] Verify that the `request_id` is a UUID4-compliant string.
- [ ] Check that `request_id` is only added to unary responses, not streaming ones unless explicitly required.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-proto`.
- [ ] Verify generated code has the expected `request_id` field.

## 5. Update Documentation
- [ ] Document the error mapping table and the requirement to include `request_id` in all new unary responses.

## 6. Automated Verification
- [ ] Run a shell script that `grep`s for unary response messages in `.proto` files and checks if they contain `request_id`.
