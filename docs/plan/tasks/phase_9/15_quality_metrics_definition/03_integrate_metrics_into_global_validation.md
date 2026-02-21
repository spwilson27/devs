# Task: Integrate Quality Metrics into Global Validation Phase (Sub-Epic: 15_Quality Metrics Definition)

## Covered Requirements
- [9_ROADMAP-REQ-MET-001], [9_ROADMAP-REQ-MET-003], [9_ROADMAP-DOD-P8]

## 1. Initial Test Written
- [ ] Create integration tests in `tests/validation/globalValidationMetrics.test.ts`.
- [ ] Write a test `should execute BenchmarkingSuite during Global Validation` ensuring metrics (TAR, TTFC, RTI) are generated and attached to the final Global Audit report.
- [ ] Write a test `should fail Global Validation if Optimization DOD is not met` demonstrating that the pipeline pauses or rejects the commit.
- [ ] Write a test `should successfully complete Global Validation if all metrics and DOD checks pass`.

## 2. Task Implementation
- [ ] Modify `src/orchestrator/GlobalValidationRunner.ts`.
- [ ] Instantiate `BenchmarkingSuite` and `OptimizationDODValidator` within the global validation pipeline (Post-Phase 8 Gate).
- [ ] Execute `validateOptimizationMetrics()` and block validation success (return failure state) if the DOD is not met.
- [ ] Collect metrics from `BenchmarkingSuite` and include them in the final project audit summary output.
- [ ] Save the generated metrics and DOD results back to the `state.sqlite` database in a dedicated `validation_reports` table or existing summary structure.

## 3. Code Review
- [ ] Verify that the integration does not bypass or short-circuit any existing validation gates (e.g. unit/integration test suite runs).
- [ ] Ensure the validation phase remains idempotent and ACID-compliant when writing the final report to SQLite.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/validation/globalValidationMetrics.test.ts` and confirm all integration tests pass.
- [ ] Run the full end-to-end test suite to ensure the orchestration graph functions correctly with the new validation gates in place.

## 5. Update Documentation
- [ ] Update the LangGraph node diagram in `docs/architecture/orchestrator.md` to show the newly added metrics and optimization validation steps.
- [ ] Update `.devs/state.sqlite` schema docs to reflect the addition of the validation reports storage.

## 6. Automated Verification
- [ ] Trigger a mock Global Validation run using `devs run --phase validate` (or equivalent test runner) and verify that the output JSON or terminal log explicitly includes TAR, TTFC, RTI, and DOD status.
