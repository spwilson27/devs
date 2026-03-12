# Task: Run Submission and Listing Refinements (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-022], [3_MCP_DESIGN-REQ-BR-023], [3_MCP_DESIGN-REQ-BR-024], [3_MCP_DESIGN-REQ-BR-025], [3_MCP_DESIGN-REQ-BR-026], [3_MCP_DESIGN-REQ-BR-027], [3_MCP_DESIGN-REQ-092], [3_MCP_DESIGN-REQ-NEW-005]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/listing_tools.rs` for `list_runs` with advanced parameters.
- [ ] Test cases:
    - [ ] List runs with `status` filter (Running, Pending, Terminal).
    - [ ] List runs with `limit` and `offset` for pagination.
    - [ ] List runs sorted by `created_at` (ascending and descending).
    - [ ] Submit run with `path`-type input. Verify it is accepted at submission time even if the path does not exist (REQ-092).
- [ ] Write unit tests for the input coercion logic in `crates/devs-core/src/types/input.rs`. Verify coercion from strings to booleans, integers, and paths.

## 2. Task Implementation
- [ ] Implement advanced filtering and sorting in `list_runs` in `devs-mcp`:
    - [ ] Map the `ListRunsRequest` fields to scheduler state queries.
    - [ ] Support `status` filter (multi-select if possible).
    - [ ] Support `sort_by` (created_at, started_at, completed_at) and `order` (ASC, DESC).
- [ ] Implement input type coercion and validation in `submit_run`:
    - [ ] Coerce strings like `"true"` to `boolean`.
    - [ ] Coerce strings like `"42"` to `integer`.
    - [ ] Validate that required inputs are present.
    - [ ] Ensure `path`-type inputs are accepted as strings at submission time (deferred validation).
- [ ] Handle error prefixes: `invalid_argument:` for coercion/missing-input errors.

## 3. Code Review
- [ ] Verify that `list_runs` default limit is 100 to prevent oversized responses.
- [ ] Ensure that input validation is synchronous and fast (no filesystem/network checks).
- [ ] Check that `offset` and `limit` are correctly enforced for large run lists.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test listing_tools`
- [ ] Run `cargo test -p devs-core --test input_types`

## 5. Update Documentation
- [ ] Update `crates/devs-mcp/README.md` to document the listing filters and submission validation.

## 6. Automated Verification
- [ ] Run `./do test` and verify coverage of submission/listing requirements.
