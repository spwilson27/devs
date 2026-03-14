# Task: Implement get_run Response Completeness Validation (Sub-Epic: 05_MCP List & Filter Operations)

## Covered Requirements
- [3_MCP_DESIGN-REQ-AC-1.01]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-core, devs-proto]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-mcp/src/tools/get_run.rs` that verifies:
    - A `get_run` response for a `Running` run contains ALL fields defined in the `WorkflowRun` protobuf model.
    - The `completed_at` field is present as JSON `null` (not absent from the object) for running runs.
    - All nested `StageRun` objects also contain all fields with `null` for unpopulated optional fields.
    - The JSON schema matches the protobuf definition exactly (no missing fields).
- [ ] Write an E2E test in `tests/mcp_e2e.rs` that:
    - Submits a workflow run via MCP `submit_run`.
    - Calls `get_run` while the run is in `Running` status.
    - Asserts that the response JSON contains all required fields.
    - Specifically asserts that `completed_at` exists and is `null` (not undefined/absent).
    - Verifies the same for embedded `StageRun` objects.
- [ ] Write a schema validation test that compares the MCP response against the protobuf `WorkflowRun` message definition.

## 2. Task Implementation
- [ ] Review the `WorkflowRun` protobuf definition in `devs-proto` to enumerate all fields.
- [ ] Update the `get_run` MCP tool handler in `devs-mcp` to ensure all fields are serialized.
- [ ] Implement explicit `null` serialization for optional fields that are not yet populated:
    - `completed_at: Option<DateTime<Utc>>` → serialize as `null` when `None`.
    - `paused_at: Option<DateTime<Utc>>` → serialize as `null` when `None`.
    - `error: Option<String>` → serialize as `null` when `None`.
    - Any other optional fields in `WorkflowRun` and `StageRun`.
- [ ] Ensure the JSON serializer (serde) is configured to emit `null` for `None` values (not skip them).
    - Use `#[serde(skip_serializing_if = "Option::is_none")]` removal or explicit `#[serde(default)]`.
- [ ] Add a response validation layer that checks field completeness before returning from `get_run`.
- [ ] Ensure nested objects (`StageRun`, `PoolState`, etc.) also follow the same completeness rule.

## 3. Code Review
- [ ] Verify that the JSON output is stable (field order, null representation) for agent consumption.
- [ ] Check that the protobuf-to-domain conversion does not drop any fields.
- [ ] Ensure that `get_run` performance is not impacted by the completeness check (should be O(1) field enumeration).
- [ ] Confirm that the response schema is documented for agents.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` to verify unit tests for `get_run` completeness.
- [ ] Run `cargo test --test mcp_e2e` to verify the E2E flow.
- [ ] Run `./do test` to ensure all tests pass and traceability is updated.

## 5. Update Documentation
- [ ] Add `WorkflowRun` JSON response schema to `docs/plan/specs/3_mcp_design.md` §1.3.1.
- [ ] Document the `null` vs absent field convention for all MCP tool responses.
- [ ] Update agent-facing documentation to note that `completed_at: null` indicates a running run.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [3_MCP_DESIGN-REQ-AC-1.01] as covered.
- [ ] Run `./do coverage` to ensure the new validation code meets the 90% unit coverage gate.
- [ ] Run `./do lint` to ensure no clippy warnings or formatting issues.
