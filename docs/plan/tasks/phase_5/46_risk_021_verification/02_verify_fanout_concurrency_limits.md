# Task: Verify Fan-out Concurrency & Pool Interaction (Sub-Epic: 46_Risk 021 Verification)

## Covered Requirements
- [AC-RISK-021-01], [MIT-021]

## Dependencies
- depends_on: []
- shared_components: [devs-pool, devs-scheduler, devs-mcp]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e/fanout_concurrency_test.rs` that:
    - Configures a named pool (e.g., `primary`) with `max_concurrent: 4`.
    - Submits a fan-out workflow with `count: 64`.
    - Each sub-agent should invoke a mock tool that sleeps for several seconds before finishing.
    - Uses the MCP `get_pool_state(name: "primary")` tool to poll the pool status.
    - Asserts that `active_count` reaches 4 and does not exceed it.
    - Asserts that `queued_count` reaches 60 as the sub-agents wait for semaphore permits.
    - Waits for some sub-agents to complete and verifies that `active_count` remains at its peak (4) as long as there are agents in the queue.
- [ ] The test MUST be annotated with `// Covers: AC-RISK-021-01, MIT-021`.

## 2. Task Implementation
- [ ] Ensure `devs-pool` correctly uses an `Arc<tokio::sync::Semaphore>` for `max_concurrent` enforcement across all projects and fan-outs.
- [ ] Verify that the `DagScheduler` in `devs-scheduler` dispatches all sub-agents to the pool on equal footing, allowing the pool's semaphore to manage the queue.
- [ ] Ensure that `get_pool_state` accurately reflects the number of active permits and the length of the semaphore's wait list.

## 3. Code Review
- [ ] Verify that fan-out sub-agents do not bypass the pool's scheduling logic.
- [ ] Confirm that `active_count` and `queued_count` are derived directly from the underlying semaphore state for accuracy.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test fanout_concurrency_test` and ensure it passes.
- [ ] Run `./do test` and ensure no traceability violations are reported for `AC-RISK-021-01`.

## 5. Update Documentation
- [ ] Update the internal "Memory" to reflect that the 64/4 fan-out concurrency limit has been empirically verified.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm that `AC-RISK-021-01` is 100% covered.
- [ ] Inspect the `target/traceability.json` to ensure the new test is correctly mapped.
