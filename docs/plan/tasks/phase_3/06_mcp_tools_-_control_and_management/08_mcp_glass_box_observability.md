# Task: Glass-Box Observability Invariants (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-NEW-001], [3_MCP_DESIGN-REQ-BR-006], [3_MCP_DESIGN-REQ-BR-007], [3_MCP_DESIGN-REQ-AC-2.25], [3_MCP_DESIGN-REQ-AC-4.17], [3_MCP_DESIGN-REQ-DBG-BR-006], [3_MCP_DESIGN-REQ-DBG-BR-007], [3_MCP_DESIGN-REQ-DBG-BR-008], [3_MCP_DESIGN-REQ-DBG-BR-009], [3_MCP_DESIGN-REQ-DBG-BR-010], [3_MCP_DESIGN-REQ-DBG-BR-011], [3_MCP_DESIGN-REQ-DBG-BR-012], [3_MCP_DESIGN-REQ-DBG-BR-013], [3_MCP_DESIGN-REQ-DBG-BR-014], [3_MCP_DESIGN-REQ-DBG-BR-015], [3_MCP_DESIGN-REQ-DBG-BR-016], [3_MCP_DESIGN-REQ-DBG-BR-017], [3_MCP_DESIGN-REQ-DBG-BR-018]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-scheduler, devs-pool, devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/observability_invariants.rs`.
- [ ] Test cases:
    - [ ] `get_stage_output` must return `stdout` and `stderr` as strings (never null).
    - [ ] `get_stage_output` for fan-out stage should return the aggregated array of results if no index specified.
    - [ ] `get_pool_state` must return detailed agent statuses (rate limited, idle, etc.).
    - [ ] `list_checkpoints` must correctly list commits for a given run from the checkpoint branch.
- [ ] Write a test that simulates a large log (over 1MiB) and verifies `get_stage_output` truncates to 1MiB and sets `truncated: true` (DBG-BR-007).
- [ ] Write a test that simulates log sequence number monotonically increasing for a running stage (DBG-BR-001).

## 2. Task Implementation
- [ ] Implement detailed entity exposure (REQ-NEW-001 table) in `devs-mcp` tools:
    - [ ] `get_run` should include all fields from `WorkflowRun`.
    - [ ] `get_stage_output` must correctly expose `truncated` boolean.
- [ ] Implement `get_pool_state` in `devs-mcp`:
    - [ ] Include detailed per-agent metrics (active_count, queued_count, cooldowns).
- [ ] Implement `list_checkpoints(project_id, run_id)` in `devs-mcp`:
    - [ ] Use `devs-checkpoint` store to fetch git commit history for the specific run.
- [ ] Enforce invariants:
    - [ ] `stdout` and `stderr` are always present as strings.
    - [ ] Truncation happens at exactly 1MiB byte boundary.
- [ ] Implement `truncated` boolean in `StageOutput` response.

## 3. Code Review
- [ ] Verify that observability tools do not hold blocking locks.
- [ ] Ensure that `list_checkpoints` uses a cursor or limit for large checkpoint histories.
- [ ] Check that `get_stage_output` correctly handles fan-out indexing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test observability_invariants`
- [ ] Run `./do test` and check `target/traceability.json` for coverage.

## 5. Update Documentation
- [ ] Update `crates/devs-mcp/README.md` to document the detailed schemas and invariants.

## 6. Automated Verification
- [ ] Run `./do test` and verify coverage of observability invariants.
