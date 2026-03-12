# Task: Standardized MCP Response Schema & Error Handling (Sub-Epic: 011_Foundational Technical Requirements (Part 2))

## Covered Requirements
- [2_PRD-BR-007], [2_PRD-BR-008]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a new unit test in `crates/devs-core/src/mcp_types.rs` (or create this file if it doesn't exist).
- [ ] Write tests that attempt to serialize a successful MCP response and a failed MCP response into JSON.
- [ ] For success: Assert that the `error` field is present and `null`, and the `result` field contains the expected data.
- [ ] For failure: Assert that the `error` field contains a non-empty string, and the `result` field is `null` (or as per [3_MCP_DESIGN-REQ-060]).
- [ ] Ensure the tests fail if any plain text is serialized or if the `error` field is missing from the JSON payload.

## 2. Task Implementation
- [ ] Define a generic `McpResponse<T>` struct in `devs-core`.
- [ ] Add the following fields:
    - `result: Option<T>`
    - `error: Option<String>`
- [ ] Implement a custom `Serialize` for `McpResponse<T>` using `serde` to guarantee:
    - Either `result` or `error` is non-null, but not both.
    - `error` is always serialized even if `None` (as `null`).
- [ ] Define standard error types or constants for human-readable failure descriptions.
- [ ] Ensure `T` is constrained to types that implement `Serialize`.

## 3. Code Review
- [ ] Verify that `McpResponse` uses `serde_json` for authoritative JSON serialization.
- [ ] Ensure that no internal implementation details (e.g., Rust stack traces) are leaked into the `error` field by accident.
- [ ] Verify that the `result` field is always a structured object (even if empty) for success cases.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all MCP serialization tests pass.
- [ ] Verify that the generated JSON matches the MCP protocol specification exactly.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/1_prd.md` or a technical spec file with the authoritative JSON schema for MCP responses.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure [2_PRD-BR-007] and [2_PRD-BR-008] are covered by the new unit tests.
