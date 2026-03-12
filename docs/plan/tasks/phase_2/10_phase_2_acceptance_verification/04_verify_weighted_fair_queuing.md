# Task: Verify Weighted Fair Queuing (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-007]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-pool]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-scheduler/tests/wf_queuing_verification.rs` that submits 100 stage dispatch requests from two different projects.
- [ ] Project A is configured with `weight = 3` and Project B with `weight = 1`.
- [ ] Both projects must have a surplus of eligible stages ready to run.
- [ ] The test must assert that the dispatch ratio between Project A and Project B is within ±10% of the expected 3:1 ratio (e.g., 75/25) over the 100 dispatches.

## 2. Task Implementation
- [ ] Implement the Weighted Fair Queuing (WFQ) algorithm in `devs-scheduler` for project-level stage selection.
- [ ] Ensure that the scheduler correctly uses project weights during agent pool permit acquisition.
- [ ] Implement a fair-share counter or deficit round-robin mechanism to maintain the target ratio over time.

## 3. Code Review
- [ ] Verify that the WFQ implementation is resilient to new project registrations and project removals.
- [ ] Ensure that a project with `weight = 0` is rejected at configuration load time (per ROAD-BR-208).

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-scheduler --test wf_queuing_verification`
- [ ] Ensure the test consistently passes within the ±10% tolerance.

## 5. Update Documentation
- [ ] Update `docs/plan/phases/phase_2.md` with verification results for Weighted Fair Queuing.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-ROAD-P2-007] as passing.
