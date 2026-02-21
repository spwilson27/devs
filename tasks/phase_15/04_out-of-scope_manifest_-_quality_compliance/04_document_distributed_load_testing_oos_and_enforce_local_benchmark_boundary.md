# Task: Document Distributed Load Testing as Out-of-Scope and Enforce Lightweight Performance Validation Boundary (Sub-Epic: 04_Out-of-Scope Manifest - Quality & Compliance)

## Covered Requirements
- [1_PRD-REQ-OOS-014]

## 1. Initial Test Written
- [ ] In `src/oos/__tests__/oos-manifest.test.ts`, add a unit test asserting that the `OOS_MANIFEST` array contains an entry with `id: "1_PRD-REQ-OOS-014"`.
- [ ] Assert the entry has:
  - `id`: `"1_PRD-REQ-OOS-014"`
  - `name`: a string matching `"Distributed Load & Stress Testing"`
  - `description`: a string containing `"distributed"` or `"load test"`
  - `rationale`: a non-empty string
  - `futureConsideration`: `false`
- [ ] Create a test file at `src/performance/__tests__/performance-validation-policy.test.ts`.
- [ ] Write a unit test asserting the performance policy config (`src/performance/performance-validation-policy.ts`) has:
  - `allowDistributedLoadTesting`: `false`
  - `allowedPerformanceTestTypes`: an array containing `"unit-benchmark"` and/or `"local-load-test"`, and NOT containing `"distributed-load"`, `"stress-test-cluster"`, or `"k6-cloud"` (or similar multi-node identifiers)
- [ ] Write an integration test: when the `TaskDAGBuilder` processes a performance phase, assert only task types from `allowedPerformanceTestTypes` are emitted. Assert that a task of type `"distributed-load"` triggers an `OosViolationError` with `oosId: "1_PRD-REQ-OOS-014"`.
- [ ] Write a test asserting that the generated project's test scaffold does NOT include a configuration for a distributed load testing tool (e.g., no `k6-cloud`, `Gatling Enterprise`, `Locust distributed mode` config files).

## 2. Task Implementation
- [ ] Add the `1_PRD-REQ-OOS-014` entry to `src/oos/oos-manifest.ts`:
  ```typescript
  {
    id: "1_PRD-REQ-OOS-014",
    name: "Distributed Load & Stress Testing",
    description: "Out of Scope: No large-scale distributed load tests.",
    rationale: "Distributed load and stress testing (e.g., multi-node k6, Gatling Enterprise, JMeter clusters) requires production-like infrastructure, dedicated cloud resources, and cost management that is outside the scope of an automated greenfield code generator. The system may scaffold simple local benchmark tests (e.g., single-node k6, autocannon) to validate basic endpoint responsiveness. Full load testing is a post-handover responsibility.",
    futureConsideration: false,
  }
  ```
- [ ] Create `src/performance/performance-validation-policy.ts` exporting:
  ```typescript
  export const PERFORMANCE_VALIDATION_POLICY = {
    allowDistributedLoadTesting: false,
    allowedPerformanceTestTypes: ["unit-benchmark", "local-load-test", "single-node-k6"],
  } as const;
  ```
- [ ] Update the `TaskDAGBuilder` to import `PERFORMANCE_VALIDATION_POLICY` and validate that performance phase tasks only use types from `allowedPerformanceTestTypes`. Throw `OosViolationError` (with `oosId: "1_PRD-REQ-OOS-014"`) for any violation.
- [ ] In the CI scaffold generator (`src/scaffolding/ci-config-generator.ts`), ensure that any performance test step emitted uses only single-node tooling. Add a comment in the generated CI config referencing `1_PRD-REQ-OOS-014`.

## 3. Code Review
- [ ] Verify `PERFORMANCE_VALIDATION_POLICY` is `as const` typed.
- [ ] Confirm the `TaskDAGBuilder` guard for performance types is a lookup against the policy's `allowedPerformanceTestTypes` array — not a hardcoded inline check.
- [ ] Ensure no cloud-specific environment variables (e.g., `K6_CLOUD_TOKEN`) are ever injected into the scaffolded CI config.
- [ ] Verify the `OosViolationError` thrown for performance violations includes a clear user-facing message explaining the OOS boundary and what the user should do post-handover.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=performance-validation-policy` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern=oos-manifest` and confirm the `1_PRD-REQ-OOS-014` entry assertion passes.
- [ ] Run `npm test` (full suite) and confirm zero regressions.

## 5. Update Documentation
- [ ] Add a section `## Distributed Load & Stress Testing (1_PRD-REQ-OOS-014)` to `docs/oos/README.md` explaining the distinction between allowed local benchmarks and out-of-scope distributed load tests.
- [ ] Update `docs/agent-memory/phase_15.agent.md` to record: "Distributed load and stress testing is out of scope per [1_PRD-REQ-OOS-014]. Only single-node local benchmarks may be scaffolded. The `TaskDAGBuilder` enforces this at construction time."
- [ ] Add a comment referencing `1_PRD-REQ-OOS-014` above the `PERFORMANCE_VALIDATION_POLICY` export.

## 6. Automated Verification
- [ ] Extend `scripts/verify-oos-manifest.js` to assert `1_PRD-REQ-OOS-014` is present and fully populated.
- [ ] Add CI step `verify:performance-policy` running `scripts/verify-performance-policy.js` which:
  1. Imports `PERFORMANCE_VALIDATION_POLICY`.
  2. Asserts `allowDistributedLoadTesting === false`.
  3. Asserts `allowedPerformanceTestTypes` does not contain `"distributed-load"` or `"stress-test-cluster"`.
  4. Exits with code `0` on success, `1` on failure.
- [ ] Confirm CI passes on a clean run.
