# Task: Implement Server Restart Validation Sequence (Sub-Epic: 05_MCP List & Filter Operations)

## Covered Requirements
- [3_MCP_DESIGN-REQ-086]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, ./do Entrypoint Script, devs-scheduler]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-mcp/src/tools/restart_server.rs` that verifies:
    - `restart_server` checks for active runs before proceeding.
    - `restart_server` validates that the build sequence has been completed.
    - The tool returns an error if the validation sequence has not been completed.
- [ ] Write an E2E test in `tests/mcp_e2e.rs` that:
    - Modifies a server-binary crate (e.g., `devs-mcp`).
    - Calls `build-only` workflow and verifies success.
    - Calls `unit-test-crate` workflow and verifies success.
    - Calls `e2e-all` workflow and verifies success.
    - Calls `presubmit-check` workflow and verifies success.
    - Then calls `restart_server` and verifies the server restarts successfully.
    - Verifies that calling `restart_server` without completing the sequence returns an error.
- [ ] Write a test verifying that the validation sequence is tracked per source change (e.g., via git SHA or build timestamp).

## 2. Task Implementation
- [ ] Add a `BuildValidationState` struct in `devs-mcp` or `devs-server` to track:
    - Last modified git SHA for each server-binary crate.
    - Completion status of each validation workflow (`build-only`, `unit-test-crate`, `e2e-all`, `presubmit-check`).
    - Timestamp of last successful validation sequence.
- [ ] Implement `record_workflow_completion(workflow_name: &str, run_id: &RunId) -> Result<()>` function.
- [ ] Implement `validate_restart_prerequisites() -> Result<(), ValidationError>` function that:
    - Checks for active runs via `list_runs`.
    - Verifies all four workflows have completed successfully since the last source change.
    - Returns specific error messages for each failure mode.
- [ ] Update `restart_server` MCP tool to call `validate_restart_prerequisites()` before proceeding.
- [ ] Add a `get_build_validation_state` MCP tool for agents to query validation status.
- [ ] Integrate with `./do` script to emit validation completion markers that the MCP server can read.
- [ ] Ensure validation state is persisted across server restarts (store in `.devs/` directory).

## 3. Code Review
- [ ] Verify that the validation sequence is atomic (all-or-nothing).
- [ ] Check that source change detection is accurate (git SHA comparison).
- [ ] Ensure the validation state does not cause false positives (e.g., stale state after git checkout).
- [ ] Confirm that error messages are actionable for agents.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` for restart validation unit tests.
- [ ] Run `cargo test --test mcp_e2e` for the full validation sequence E2E.
- [ ] Run `./do test` to ensure all tests pass and traceability is updated.

## 5. Update Documentation
- [ ] Add the validation sequence requirement to `docs/plan/specs/3_mcp_design.md` §3.2 (Self-Modification Loop).
- [ ] Document the `restart_server` tool behavior and prerequisites in MCP tool documentation.
- [ ] Add the validation sequence to agent prompt templates for self-modification workflows.
- [ ] Update the TAS to reflect the new validation tracking mechanism.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [3_MCP_DESIGN-REQ-086] as covered.
- [ ] Run `./do coverage` to ensure the new validation code meets the 90% unit coverage gate.
- [ ] Manually test the flow: modify crate → skip validation → attempt restart → verify error → complete validation → restart succeeds.
