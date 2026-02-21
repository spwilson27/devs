# Task: Implement Discovery Definition of Done (DoD) Checker (Sub-Epic: 13_HITL Gate & Phase Transition)

## Covered Requirements
- [9_ROADMAP-DOD-P3], [9_ROADMAP-REQ-007], [1_PRD-REQ-HITL-001]

## 1. Initial Test Written
- [ ] In `packages/core/src/phase-gate/__tests__/discovery-dod-checker.test.ts`, write unit tests that assert:
  - `DiscoveryDoDChecker.check(reports, gate)` returns `{ passed: true, failedChecks: [] }` when ALL DoD criteria are satisfied:
    1. All four report types are present: `market`, `competitive`, `tech`, `user`.
    2. Each report has a non-empty `mermaidSwotDiagram` string.
    3. Each report's `confidenceScore` is ≥ 0.85.
    4. Each report has at least one `citation` with a non-empty `url`.
    5. The gate's state is `APPROVED`.
  - `DiscoveryDoDChecker.check()` returns `{ passed: false, failedChecks: ['missing_report:user'] }` when the `user` report type is absent.
  - `DiscoveryDoDChecker.check()` returns `{ passed: false, failedChecks: ['missing_swot:market'] }` when the `market` report has an empty `mermaidSwotDiagram`.
  - `DiscoveryDoDChecker.check()` returns `{ passed: false, failedChecks: ['low_confidence:tech'] }` when the `tech` report score is < 0.85.
  - `DiscoveryDoDChecker.check()` returns `{ passed: false, failedChecks: ['no_citations:competitive'] }` when the `competitive` report has an empty `citations` array.
  - `DiscoveryDoDChecker.check()` returns `{ passed: false, failedChecks: ['gate_not_approved'] }` when gate state is not `APPROVED`.
  - Multiple failures are accumulated: all failed checks appear in `failedChecks`, not just the first.
  - `DiscoveryDoDChecker.check()` is a pure function with no side effects.
- [ ] In `packages/core/src/phase-gate/__tests__/discovery-dod-checker.integration.test.ts`, write an integration test that:
  - Constructs a realistic set of four `ResearchReport` objects and an `APPROVED` gate.
  - Calls `DiscoveryDoDChecker.check()` and asserts `passed: true`.
  - Mutates one report to remove its SWOT diagram and asserts `passed: false` with `failedChecks` containing `'missing_swot:<type>'`.

## 2. Task Implementation
- [ ] Create `packages/core/src/phase-gate/discovery-dod-checker.ts`:
  - Define and export `DoDCheckResult` type: `{ passed: boolean; failedChecks: string[] }`.
  - Define and export `REQUIRED_REPORT_TYPES: readonly string[] = ['market', 'competitive', 'tech', 'user']`.
  - Implement `DiscoveryDoDChecker` class with a single static method `check(reports: ResearchReport[], gate: PhaseGateRecord): DoDCheckResult`:
    1. Build a `Map<string, ResearchReport>` keyed by `reportType`.
    2. For each type in `REQUIRED_REPORT_TYPES`, check presence → push `'missing_report:<type>'` if absent.
    3. For each present report, check `mermaidSwotDiagram` non-empty → push `'missing_swot:<type>'`.
    4. For each present report, check `confidenceScore >= CONFIDENCE_THRESHOLD` → push `'low_confidence:<type>'`.
    5. For each present report, check `citations.length > 0` → push `'no_citations:<type>'`.
    6. Check `gate.state === PhaseGateState.APPROVED` → push `'gate_not_approved'`.
    7. Return `{ passed: failedChecks.length === 0, failedChecks }`.
- [ ] Update `packages/core/src/phase-gate/index.ts` to export `DiscoveryDoDChecker` and `DoDCheckResult`.

## 3. Code Review
- [ ] Verify `DiscoveryDoDChecker.check()` is a pure static method with zero side effects (no repository calls, no event emissions, no I/O).
- [ ] Verify `REQUIRED_REPORT_TYPES` is exported as a `readonly` constant so external tests can assert against it.
- [ ] Verify failed check keys follow the `'<check>:<reportType>'` naming convention consistently.
- [ ] Verify the method accumulates ALL failures before returning (not short-circuiting on the first failure).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="discovery-dod"` and confirm all tests pass.
- [ ] Confirm the integration test asserts `passed: true` for a fully valid report set and `passed: false` after a mutation.

## 5. Update Documentation
- [ ] Append to `packages/core/src/phase-gate/phase-gate.agent.md`:
  - Section: **Discovery Definition of Done (DoD)** — enumerate all five check categories, the `failedChecks` key format, and `REQUIRED_REPORT_TYPES`.
  - Add a Mermaid table or checklist rendering of the five DoD criteria.
- [ ] Update the project-level `docs/phases/phase-5-discovery.md` (if it exists) to reference the DoD checker and link to the agent.md file.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:coverage -- --testPathPattern="discovery-dod"` and assert exit code 0 with 100% statement coverage (this is a pure function — full coverage is achievable and required).
- [ ] Run `pnpm --filter @devs/core build` and assert exit code 0.
