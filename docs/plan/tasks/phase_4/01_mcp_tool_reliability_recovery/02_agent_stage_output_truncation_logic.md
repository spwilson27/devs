# Task: Implement Stage Output Truncation Logic (Sub-Epic: 01_MCP Tool Reliability & Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-047]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-core/src/agent/client/truncation.rs`.
- [ ] The test must:
    - [ ] Mock the `get_stage_output` response to return a field (e.g., `stdout`) containing 500 lines of error messages.
    - [ ] Assert that the agent client processing logic truncates this to the first 50 diagnostic lines.
    - [ ] Verify that a "truncated" flag is correctly set/read, and that the agent is notified that more output is available in the checkpoint store.
    - [ ] Verify truncation for different failure types (e.g., compile vs. test).

## 2. Task Implementation
- [ ] Implement the `StageOutputTruncator` in the agent client:
    - [ ] For each stage output retrieved via `get_stage_output`, check its line count.
    - [ ] If it exceeds 50 lines (for compilation errors) or 100 lines (for test failures), apply the truncation.
    - [ ] Maintain the truncation at the agent client level before it is sent to the LLM's context.
    - [ ] Add a "truncation header" that indicates the file path in the checkpoint store for the full output.
- [ ] Ensure that `stdout` and `stderr` are handled separately and each truncated to their respective limits.

## 3. Code Review
- [ ] Verify that 50 lines is sufficient for common compilation errors (usually the first 5-10 are the root cause).
- [ ] Ensure the truncation does not happen for small, successful stage outputs where structured JSON is expected.
- [ ] Check for edge cases where the first 50 lines are only "noise" (e.g., long command flags); use a regex-based heuristic if necessary.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib agent::client::truncation`
- [ ] Run `./do test` and verify traceability for REQ-047.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` with the specific line-count thresholds for different stage types.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[3_MCP_DESIGN-REQ-047]` as covered.
