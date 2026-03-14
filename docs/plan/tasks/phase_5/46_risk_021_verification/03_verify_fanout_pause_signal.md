# Task: Verify Fan-out Pause Signal Propagation (Sub-Epic: 46_Risk 021 Verification)

## Covered Requirements
- [RISK-021-BR-002]

## Dependencies
- depends_on: []
- shared_components: [devs-adapters, devs-scheduler, devs-cli]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e/fanout_pause_test.rs` that:
    - Submits a fan-out workflow with `count: 4` into a pool with `max_concurrent: 4`.
    - Mock agents record their stdin and wait (loop) until they see a specific signal.
    - Uses `devs pause <run-id>` (CLI) while the sub-agents are `Running`.
    - Asserts that all 4 running sub-agents receive `devs:pause\n` on their stdin within 1 second.
    - Asserts that the pool's `active_count` remains 4 (the permits are not released by paused agents).
    - Submits a 5th agent and asserts it remains `Waiting` because the pool is full.
    - Resumes the run and verifies sub-agents proceed to completion.
- [ ] The test MUST be annotated with `// Covers: RISK-021-BR-002`.

## 2. Task Implementation
- [ ] Ensure that `devs-scheduler` correctly identifies all `Running` sub-agents of a fan-out when the parent stage is paused.
- [ ] Implement the `devs:pause\n` signal propagation in the `AgentAdapter` (via `devs-adapters`).
- [ ] Confirm that `devs-pool` permits are held until the agent process actually exits, even if it is paused.
- [ ] Ensure that `Eligible` sub-agents are blocked from acquiring permits while their parent stage is `Paused`.

## 3. Code Review
- [ ] Verify that the `devs:pause\n` signal is delivered to all sub-agents in a fan-out within the required 1-second SLA.
- [ ] Confirm that semaphore permits are not released prematurely during pause.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test fanout_pause_test` and ensure it passes.
- [ ] Run `./do test` and ensure no traceability violations are reported for `RISK-021-BR-002`.

## 5. Update Documentation
- [ ] Update the internal "Memory" to reflect that pause signal propagation to fan-out sub-agents is verified.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm that `RISK-021-BR-002` is 100% covered.
- [ ] Inspect the `target/traceability.json` to ensure the new test is correctly mapped.
