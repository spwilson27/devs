# Task: Implement list_runs Filtering and Sorting (Sub-Epic: 05_MCP List & Filter Operations)

## Covered Requirements
- [3_MCP_DESIGN-REQ-002] (list_runs filtering and sorting support)

## Dependencies
- depends_on: [01_list_runs_pagination.md]
- shared_components: [devs-mcp, devs-core, devs-proto]

## Note
- This task was previously mapped to [3_MCP_DESIGN-REQ-079], but that requirement is now covered by:
  - [3_MCP_DESIGN-REQ-079] → `06_prompt_header_validation.md`

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-mcp/src/tools/list_runs.rs` that verify:
    - `list_runs` accepts `status`, `workflow_name`, and `project_id` as optional filter parameters.
    - Multiple filters can be combined (AND logic).
    - Results are sorted by `created_at` descending by default.
    - An empty array is returned when no runs match the filter.
- [ ] Write an E2E test in `tests/mcp_e2e.rs` that creates runs for two different workflows and projects, and verifies that `list_runs` with `workflow_name` filter returns only the relevant runs.
- [ ] Write an E2E test simulating a polling loop that terminates when `offset + runs.len() >= total`.

## 2. Task Implementation
- [ ] Update `list_runs` MCP tool schema in `devs-mcp` to include `status`, `workflow_name`, and `project_id`.
- [ ] Implement filter mapping in `devs-mcp` to translate these parameters into the internal gRPC/domain filter types.
- [ ] Implement filtering logic in the state engine's run collection (likely in `devs-core` or `devs-server`).
- [ ] Ensure that filtering is applied *before* pagination is calculated.
- [ ] Implement/verify descending sort by `created_at` in the state retrieval logic.
- [ ] Update the `total` field in the response to reflect the count of runs *after* filters are applied (but before limit/offset).

## 3. Code Review
- [ ] Verify that enum fields like `status` are correctly mapped from strings to domain types.
- [ ] Check that `workflow_name` and `project_id` matching is case-sensitive or follows project-wide normalization rules.
- [ ] Confirm that loop termination logic for agents (using `total`) is robust and tested.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` to verify unit tests for filtering.
- [ ] Run `cargo test --test mcp_e2e` to verify the full filtered list flow.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` tool documentation for `list_runs` with filter parameter details.
- [ ] Record the implementation of loop termination conditions in agent-facing documentation.

## 6. Automated Verification
- [ ] Run `./do test` to ensure all tests pass and traceability is updated.
