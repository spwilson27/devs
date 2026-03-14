# Task: Verify Passive Rate-Limit Attempt Count Stability (Sub-Epic: 32_Risk 010 Verification)

## Covered Requirements
- [AC-RISK-010-04]

## Dependencies
- depends_on: ["01_verify_pool_rate_limit_mcp.md"]
- shared_components: [devs-pool, devs-adapters, devs-proto, devs-server]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-server/tests/passive_rate_limit_test.rs` that:
    - Starts a `devs-server` with a mock adapter that exits with code 1 and a rate-limit string (e.g., "Too Many Requests").
    - Submits a workflow run with a stage targeting that adapter.
    - Waits for the stage to transition from `Eligible` to `Running` and then back due to rate limiting (or another terminal-like state if it's re-queued).
    - Calls the `get_run` MCP tool (or use the internal state observer) to retrieve the `StageRun` state.
    - Asserts that the `attempt` count remains unchanged (e.g., at 1) despite the rate-limit failure.
    - Asserts that the stage returns to an `Eligible` or similar re-queue state without incrementing the attempt count.

## 2. Task Implementation
- [ ] Ensure the `devs-pool` logic for handling passive rate-limit detections (via `AgentAdapter::detect_rate_limit()`) correctly passes a flag to the scheduler/state-machine to NOT increment the attempt counter.
- [ ] Confirm that the transition from `Running` back to `Eligible` (due to rate limit) does not use the standard `fail_stage` path which increments attempts.
- [ ] Verify that `AgentAdapter::detect_rate_limit()` returns true for the mock adapter's output.

## 3. Code Review
- [ ] Verify that only rate-limit related failures avoid the attempt increment; other non-zero exit codes must still increment it.
- [ ] Ensure that the `attempt` counter logic is centralized and consistent with `RISK-010-BR-001`.

## 4. Run Automated Tests to Verify
- [ ] Run the newly created test: `cargo test --package devs-server --test passive_rate_limit_test`.

## 5. Update Documentation
- [ ] Add a comment in the `StageRun` state machine logic referencing [AC-RISK-010-04] to explain why the attempt count isn't incremented.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `traceability.json` shows [AC-RISK-010-04] as covered by the new test.
