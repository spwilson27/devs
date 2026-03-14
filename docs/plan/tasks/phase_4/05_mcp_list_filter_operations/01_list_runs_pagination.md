# Task: Implement list_runs Pagination (Sub-Epic: 05_MCP List & Filter Operations)

## Covered Requirements
- [3_MCP_DESIGN-REQ-001] (list_runs pagination support)

## Dependencies
- depends_on: []
- shared_components: [devs-mcp, devs-core, devs-proto]

## Note
- This task was previously mapped to [3_MCP_DESIGN-REQ-054] and [3_MCP_DESIGN-REQ-AC-1.01], but those requirements are now covered by:
  - [3_MCP_DESIGN-REQ-054] → `05_context_file_generation.md`
  - [3_MCP_DESIGN-REQ-AC-1.01] → `07_get_run_response_completeness.md`

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-mcp/src/tools/list_runs.rs` that verify:
    - `list_runs` supports `limit` and `offset` parameters in the JSON-RPC request.
    - Default `limit` is 100 if omitted.
    - Maximum `limit` is enforced (e.g. 1000).
    - Response includes `total`, `limit`, and `offset` fields in the result object.
    - An `offset` value beyond `total` returns an empty array and correct metadata.
- [ ] Write an E2E test in `tests/mcp_e2e.rs` that creates multiple runs (e.g., 5) and verifies that `list_runs` with `limit=2` and `offset=2` returns the 3rd and 4th most recent runs.

## 2. Task Implementation
- [ ] Update the `list_runs` tool handler in `devs-mcp` to parse optional `limit` and `offset` parameters.
- [ ] Modify the gRPC `RunService` call (or the internal engine call) to pass pagination parameters through to the state engine.
- [ ] Implement pagination logic in the state engine (likely in `devs-core` or `devs-server` state management) to slice the run collection and count the total.
- [ ] Ensure results are sorted by `created_at` descending as per requirement BR-022 (implicitly covered by pagination logic).
- [ ] Update the MCP response structure to include `total`, `limit`, and `offset` alongside the `runs` array.

## 3. Code Review
- [ ] Verify that pagination is applied efficiently at the storage/collection level, not after fetching all runs into memory.
- [ ] Ensure that `total` count is accurate even when filtering is applied (filters will be implemented in the next task).
- [ ] Validate that JSON-RPC errors are returned correctly for invalid `limit` or `offset` (e.g., negative values).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` to verify unit tests.
- [ ] Run `cargo test --test mcp_e2e` to verify the E2E pagination flow.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` tool documentation for `list_runs` to reflect supported pagination parameters and response schema.
- [ ] Update agent "memory" with the newly available pagination capabilities for `list_runs`.

## 6. Automated Verification
- [ ] Run `./do test` to ensure all tests pass and traceability is updated for the covered requirements.
