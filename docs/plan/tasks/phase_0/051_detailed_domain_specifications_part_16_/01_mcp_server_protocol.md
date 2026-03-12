# Task: MCP Server HTTP/JSON-RPC Foundation (Sub-Epic: 051_Detailed Domain Specifications (Part 16))

## Covered Requirements
- [2_TAS-REQ-126], [2_TAS-REQ-127]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp]

## 1. Initial Test Written
- [ ] Write a test in `crates/devs-mcp/tests/server_protocol.rs` using `tower::ServiceExt` or `axum::test_helpers` to send POST requests to `/rpc`.
- [ ] Verify that a request with `Content-Type: text/plain` returns `415 Unsupported Media Type`.
- [ ] Verify that a request without a JSON-RPC `id` field returns a JSON-RPC error response.
- [ ] Verify that a valid JSON-RPC 2.0 request (e.g., `list_runs`) returns a JSON response with the same `id`.
- [ ] Verify that batch requests (JSON array) are rejected with a 400 or appropriate JSON-RPC error.

## 2. Task Implementation
- [ ] In `crates/devs-mcp`, implement the MCP HTTP server using `axum`.
- [ ] Define the JSON-RPC 2.0 request/response structures using `serde`.
- [ ] Implement an axum handler for `POST /rpc`.
- [ ] Add a middleware or guard to enforce `Content-Type: application/json`.
- [ ] Implement method routing based on the JSON-RPC `method` field.
- [ ] Ensure the response always contains the `result` or `error` field and matching `id`.

## 3. Code Review
- [ ] Verify that the server follows HTTP/1.1 specification.
- [ ] Ensure that no business logic is directly in the HTTP handlers (delegate to tool handlers).
- [ ] Verify that the implementation uses types from `devs-core` for domain logic.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` and ensure the protocol tests pass.

## 5. Update Documentation
- [ ] Update the `devs-mcp` README to document the supported JSON-RPC 2.0 subset.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure 100% requirement-to-test traceability for [2_TAS-REQ-126] and [2_TAS-REQ-127].
