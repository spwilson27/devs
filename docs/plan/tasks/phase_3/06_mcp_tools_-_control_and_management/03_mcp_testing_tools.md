# Task: MCP Testing Tools (Injection and Assertion) (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-020], [3_MCP_DESIGN-REQ-021], [3_MCP_DESIGN-REQ-BR-028], [3_MCP_DESIGN-REQ-BR-029], [3_MCP_DESIGN-REQ-BR-030], [3_MCP_DESIGN-REQ-BR-031], [3_MCP_DESIGN-REQ-BR-032], [3_MCP_DESIGN-REQ-BR-033], [3_MCP_DESIGN-REQ-BR-034], [3_MCP_DESIGN-REQ-BR-035], [3_MCP_DESIGN-REQ-BR-036], [3_MCP_DESIGN-REQ-EC-TEST-001], [3_MCP_DESIGN-REQ-EC-TEST-002], [3_MCP_DESIGN-REQ-EC-TEST-003], [3_MCP_DESIGN-REQ-EC-TEST-004], [3_MCP_DESIGN-REQ-EC-TEST-005], [3_MCP_DESIGN-REQ-EC-MCP-012], [3_MCP_DESIGN-REQ-EC-MCP-016]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/testing_tools.rs` for `inject_stage_input` and `assert_stage_output`.
- [ ] For `inject_stage_input`:
    - [ ] Should return success for stages in `Pending`, `Waiting`, or `Eligible`.
    - [ ] Should return error `failed_precondition:` for stages in `Running` or terminal status.
    - [ ] Injected input should override the original input (verified by inspecting `WorkflowRun`).
- [ ] For `assert_stage_output`:
    - [ ] Should return `{ "passed": true }` or `{ "passed": false, "actual": ... }`.
    - [ ] Should return `failed_precondition:` for stages not yet terminal.
- [ ] Write E2E test in `tests/mcp_testing_e2e.rs` demonstrating a "mocked" stage:
    - [ ] Submit run for a workflow.
    - [ ] Call `inject_stage_input` for a stage before it dispatches.
    - [ ] Wait for run to complete.
    - [ ] Verify `assert_stage_output` correctly evaluates against the captured output.

## 2. Task Implementation
- [ ] Implement `inject_stage_input(run_id, stage_name, input_json)` in `devs-mcp`:
    - [ ] Validate the run and stage existence.
    - [ ] Update the `StageRun`'s input field in the scheduler's state.
    - [ ] Ensure this is done before the stage dispatches to an agent.
- [ ] Implement `assert_stage_output(run_id, stage_name, field, expected, operator)` in `devs-mcp`:
    - [ ] Wait for the stage to reach terminal status if necessary (or return error if non-blocking is required).
    - [ ] Extract the specified `field` from the stage's `structured_output` or `stdout`/`stderr`.
    - [ ] Compare `actual` with `expected` using the specified `operator` (`eq`, `ne`, `gt`, `contains`, etc.).
    - [ ] Return structured response with `passed` and `actual` values.

## 3. Code Review
- [ ] Verify that injection is thread-safe and respects the state machine (cannot inject into a running stage).
- [ ] Ensure assertion operators handle various types (strings, numbers, booleans, nested JSON objects).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test testing_tools`
- [ ] Run `cargo test --test mcp_testing_e2e`

## 5. Update Documentation
- [ ] Update `crates/devs-mcp/README.md` to document testing tool usage and assertion operators.

## 6. Automated Verification
- [ ] Run `./do test` and verify coverage of testing tool requirements.
