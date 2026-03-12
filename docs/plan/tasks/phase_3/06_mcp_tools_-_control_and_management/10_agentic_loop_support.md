# Task: Agentic Loop Support and Reflexive Testing (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-088], [3_MCP_DESIGN-REQ-NEW-006], [3_MCP_DESIGN-REQ-NEW-010], [3_MCP_DESIGN-REQ-NEW-011], [3_MCP_DESIGN-REQ-NEW-020], [3_MCP_DESIGN-REQ-NEW-021], [3_MCP_DESIGN-REQ-NEW-023], [3_MCP_DESIGN-REQ-NEW-024], [3_MCP_DESIGN-REQ-NEW-025], [3_MCP_DESIGN-REQ-NEW-026], [3_MCP_DESIGN-REQ-NEW-027], [3_MCP_DESIGN-REQ-NEW-031], [3_MCP_DESIGN-REQ-NEW-032], [3_MCP_DESIGN-REQ-NEW-033], [3_MCP_DESIGN-REQ-EC-TDD-001], [3_MCP_DESIGN-REQ-EC-TDD-002], [3_MCP_DESIGN-REQ-EC-TDD-003], [3_MCP_DESIGN-REQ-EC-TDD-004], [3_MCP_DESIGN-REQ-EC-TDD-005], [3_MCP_DESIGN-REQ-EC-TDD-006], [3_MCP_DESIGN-REQ-EC-TDD-007], [3_MCP_DESIGN-REQ-EC-TDD-008], [3_MCP_DESIGN-REQ-EC-TDD-009], [3_MCP_DESIGN-REQ-EC-PAR-001], [3_MCP_DESIGN-REQ-EC-PAR-002], [3_MCP_DESIGN-REQ-EC-PAR-003], [3_MCP_DESIGN-REQ-EC-PAR-004], [3_MCP_DESIGN-REQ-EC-PAR-005], [3_MCP_DESIGN-REQ-EC-PAR-006], [3_MCP_DESIGN-REQ-EC-SELF-001], [3_MCP_DESIGN-REQ-EC-SELF-002], [3_MCP_DESIGN-REQ-EC-SELF-003], [3_MCP_DESIGN-REQ-EC-SELF-004], [3_MCP_DESIGN-REQ-EC-SELF-005], [3_MCP_DESIGN-REQ-EC-SELF-006], [3_MCP_DESIGN-REQ-EC-CTX-001], [3_MCP_DESIGN-REQ-EC-CTX-002], [3_MCP_DESIGN-REQ-EC-CTX-003], [3_MCP_DESIGN-REQ-EC-CTX-004], [3_MCP_DESIGN-REQ-EC-CTX-005], [3_MCP_DESIGN-REQ-EC-CTX-006], [3_MCP_DESIGN-REQ-EC-CTX-007], [3_MCP_DESIGN-REQ-EC-CTX-008], [3_MCP_DESIGN-REQ-EC-CTX-009], [3_MCP_DESIGN-REQ-EC-CTX-010], [1_PRD-REQ-041]

## Dependencies
- depends_on: [09_agentic_infrastructure.md]
- shared_components: [devs-mcp, devs-executor, devs-core]

## 1. Initial Test Written
- [ ] Write a "reflexive" E2E test in `tests/reflexive_mcp_e2e.rs`.
- [ ] The test must:
    - [ ] Submit a workflow run.
    - [ ] The orchestrated stage (a mock agent) must read `DEVS_MCP_ADDR` from its environment.
    - [ ] The orchestrated stage must then make an HTTP `POST` to `http://{{DEVS_MCP_ADDR}}/mcp/v1/call` calling `get_run`.
    - [ ] Verify the response is successful and contains the run ID.
- [ ] Write unit tests for the `task_state.json` merge algorithm (NEW-033) in `crates/devs-core/src/agent/state.rs`. Verify merging multiple sessions with different timestamps and traceability data.
- [ ] Write integration tests for the `list_runs` and `get_pool_state` details needed for the agent loops (NEW-010, NEW-011).

## 2. Task Implementation
- [ ] Implement `DEVS_MCP_ADDR` injection in `devs-executor`:
    - [ ] Ensure the server's local MCP listening address is available to all spawned agents.
- [ ] Implement support for `Request-ID` header in `devs-mcp`:
    - [ ] Correlate JSON-RPC requests with server-side logs and stage runs.
- [ ] Implement advanced error prefixes and diagnostics for all EC-* scenarios:
    - [ ] Ensure `get_stage_output` provides enough detail for the agent's failure classification protocol (NEW-021).
    - [ ] Implement the `wait for cancelled` logic correctly in the server to support REQ-061.
- [ ] Implement the `task_state.json` merge algorithm as a utility for development agents.
- [ ] Ensure the `devs` server handles concurrent self-modifications (e.g., recompiling itself while running) as specified in REQ-086 and REQ-087.

## 3. Code Review
- [ ] Verify that reflexive tool calls (run → mcp → run state) do not cause deadlocks.
- [ ] Ensure that `DEVS_MCP_ADDR` is correctly resolved even in Docker/Remote environments if possible, or documented as restricted.
- [ ] Check that `task_state.json` atomicity rules (write-tmp-rename) are strictly followed.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test reflexive_mcp_e2e`
- [ ] Run `cargo test -p devs-core --test agent_state`
- [ ] Run `./do test` and verify traceability of loop-support requirements.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect the completion of the Glass-Box control and management interface.

## 6. Automated Verification
- [ ] Run `./do test` and verify that all requirements in the sub-epic are covered.
