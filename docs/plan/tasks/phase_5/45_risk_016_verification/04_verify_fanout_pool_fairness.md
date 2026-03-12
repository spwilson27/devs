# Task: Verify Fan-out Pool Fairness (Sub-Epic: 45_Risk 016 Verification)

## Covered Requirements
- [RISK-021], [RISK-021-BR-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-pool]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-scheduler/tests/test_fanout_fairness.rs`.
- [ ] The test should:
  - Setup an `AgentPool` with a small `max_concurrent` (e.g., 2).
  - Submit a fan-out stage with a count larger than `max_concurrent` (e.g., 4).
  - Simultaneously submit a separate, independent stage (e.g., from another project) that also requires the same pool.
  - Assert that the independent stage can acquire a pool permit between the completions of the fan-out sub-agents, proving that the fan-out sub-agents are not bypassing the dispatcher's queue or hoarding permits.
- [ ] The test must verify that `AgentPool::acquire` is called for every sub-agent spawn, not just once for the parent stage.

## 2. Task Implementation
- [ ] Review the `FanOutManager` or `DagScheduler` implementation in `devs-scheduler`.
- [ ] Ensure that for each item in the fan-out, the scheduler dispatches a sub-stage-run that goes through the standard eligibility queue.
- [ ] Verify that the pool permit acquisition occurs at the individual sub-agent level, not at the parent level for the entire fan-out block.
- [ ] Enforce the `RISK-021-BR-001` architectural rule: fan-out sub-agents must use the same permit acquisition path as any other stage.

## 3. Code Review
- [ ] Ensure that no custom, direct spawn logic exists for fan-out that bypasses the `AgentPool` semaphore.
- [ ] Verify that the priority/weighted queuing policy is correctly applied to sub-agents.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test test_fanout_fairness` and confirm it passes.
- [ ] Observe the pool acquisition logs to verify the interleaving of sub-agents and the independent stage.

## 5. Update Documentation
- [ ] Add the coverage annotation `// Covers: RISK-021-BR-001` to the scheduler's dispatch logic or the integration test.
- [ ] Document the fan-out permit acquisition strategy in `docs/plan/specs/2_tas.md` or a relevant scheduler design document.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` and confirm `RISK-021-BR-001` and `RISK-021` are covered.
