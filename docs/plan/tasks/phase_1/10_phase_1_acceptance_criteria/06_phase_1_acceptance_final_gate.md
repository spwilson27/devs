# Task: Phase 1 Acceptance Final Gate (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [AC-ROAD-P1-009]

## Dependencies
- depends_on: [02_checkpoint_resilience_tests.md, 03_adapter_quality_and_freshness_verification.md, 04_architectural_lint_enforcement.md, 05_pool_and_executor_lifecycle_tests.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a final gate verification test in the `presubmit` script.
- [ ] The test must run `cargo llvm-cov` and parse the output to ensure each of the following crates achieve ≥ 90% unit coverage individually: `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, and `devs-executor`.
- [ ] The test must fail if any of these crates fall below the threshold.

## 2. Task Implementation
- [ ] Run `cargo llvm-cov --workspace` and identify gaps in coverage for the specified crates.
- [ ] Add unit tests to these crates until each reaches the 90% threshold.
- [ ] Ensure that `devs-core` also remains at ≥ 90% coverage as a regression check.
- [ ] Run `./do presubmit` and ensure it passes within the 900-second budget.

## 3. Code Review
- [ ] Verify that coverage is achieved through meaningful tests, not just exercising boilerplate.
- [ ] Confirm that no coverage is achieved by importing internal types into E2E tests (which is forbidden).

## 4. Run Automated Tests to Verify
- [ ] Run `./do coverage` and ensure `overall_passed` is `true` for Phase 1 crates.
- [ ] Run `cargo llvm-cov --package devs-config --package devs-checkpoint --package devs-adapters --package devs-pool --package devs-executor`.

## 5. Update Documentation
- [ ] Prepare the Phase 1 PTC ADR file (`docs/adr/<NNNN>-phase-1-complete.md`).
- [ ] Update any agent memory reflecting that Phase 1 is formally closed.

## 6. Automated Verification
- [ ] Run the traceability scanner and confirm all Phase 1 requirements (`ROAD-011` through `ROAD-015`) are covered by tests.
- [ ] Confirm that `target/traceability.json` has `phase_gates[1].gate_passed: true`.
