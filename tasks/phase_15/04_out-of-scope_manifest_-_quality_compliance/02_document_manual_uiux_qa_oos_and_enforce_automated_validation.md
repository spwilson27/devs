# Task: Document Subjective Manual UI/UX QA as Out-of-Scope and Enforce Automated-Only UI Validation (Sub-Epic: 04_Out-of-Scope Manifest - Quality & Compliance)

## Covered Requirements
- [1_PRD-REQ-OOS-012]

## 1. Initial Test Written
- [ ] In `src/oos/__tests__/oos-manifest.test.ts`, add a unit test asserting that the `OOS_MANIFEST` array contains an entry with `id: "1_PRD-REQ-OOS-012"`.
- [ ] Assert the entry has the following fields:
  - `id`: `"1_PRD-REQ-OOS-012"`
  - `name`: a string matching `"Subjective Manual UI/UX QA"`
  - `description`: a string containing the phrases `"automated"` and `"functional UI validation"`
  - `rationale`: a non-empty string
  - `futureConsideration`: `false`
- [ ] Create a test file at `src/validation/__tests__/ui-validation-policy.test.ts`.
- [ ] Write a unit test that imports the UI validation policy config (e.g., `src/validation/ui-validation-policy.ts`) and asserts:
  - `allowManualUxQa` is `false`
  - `requireAutomatedFunctionalValidation` is `true`
- [ ] Write a test that inspects the generated project scaffold (via a mock scaffolding function) and asserts that no manual QA step (e.g., a task with type `"manual-review"` or `"aesthetic-check"`) is injected into the generated task DAG for any UI-related phase.
- [ ] Write an integration test: when the `TaskDAGBuilder` processes a UI phase, assert that only tasks of type `"automated-test"` or `"e2e-test"` are emitted for the QA category — no `"manual"` type tasks.

## 2. Task Implementation
- [ ] Add the `1_PRD-REQ-OOS-012` entry to `src/oos/oos-manifest.ts`:
  ```typescript
  {
    id: "1_PRD-REQ-OOS-012",
    name: "Subjective Manual UI/UX QA",
    description: "Out of Scope: No manual aesthetic testing; only automated functional UI validation.",
    rationale: "Manual aesthetic review is subjective, non-reproducible, and incompatible with a fully automated agentic TDD pipeline. The system only emits automated functional tests (e.g., Playwright, Cypress) for UI components. Visual regression testing tools (e.g., Percy, Chromatic) may be scaffolded as automated steps if configured.",
    futureConsideration: false,
  }
  ```
- [ ] Create `src/validation/ui-validation-policy.ts` exporting a typed config object:
  ```typescript
  export const UI_VALIDATION_POLICY = {
    allowManualUxQa: false,
    requireAutomatedFunctionalValidation: true,
    allowedTestTypes: ["automated-test", "e2e-test", "visual-regression-automated"],
  } as const;
  ```
- [ ] Update the `TaskDAGBuilder` (e.g., `src/orchestrator/task-dag-builder.ts`) to import `UI_VALIDATION_POLICY` and enforce that, when constructing QA tasks for any UI phase, only task types listed in `UI_VALIDATION_POLICY.allowedTestTypes` are emitted. If a `"manual"` type is ever attempted, throw an `OosViolationError` referencing `1_PRD-REQ-OOS-012`.
- [ ] Add `OosViolationError` to the project error types (e.g., `src/errors/oos-violation-error.ts`) with fields `oosId: string` and `message: string`.

## 3. Code Review
- [ ] Verify the `UI_VALIDATION_POLICY` is imported — not duplicated — in every location that needs to check allowed test types.
- [ ] Confirm `OosViolationError` extends the project's base error class and is properly typed.
- [ ] Verify the `TaskDAGBuilder` does not have any conditional bypass (e.g., `if (process.env.ALLOW_MANUAL_QA)`) that would permit manual QA task injection.
- [ ] Ensure the policy is enforced at DAG construction time, not at execution time, so scope violations are caught before any agent work begins.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=ui-validation-policy` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern=oos-manifest` and confirm the `1_PRD-REQ-OOS-012` assertion passes.
- [ ] Run `npm test` (full suite) and confirm zero regressions.

## 5. Update Documentation
- [ ] Update `docs/oos/README.md` with a section `## Subjective Manual UI/UX QA (1_PRD-REQ-OOS-012)` explaining that only automated functional UI tests are within scope, and listing the allowed test types from `UI_VALIDATION_POLICY`.
- [ ] Update `docs/agent-memory/phase_15.agent.md` to record: "Manual or aesthetic UI/UX QA is explicitly out of scope per [1_PRD-REQ-OOS-012]. All UI validation must be automated and functional. The `TaskDAGBuilder` enforces this at construction time."
- [ ] Add a comment referencing `1_PRD-REQ-OOS-012` in `src/validation/ui-validation-policy.ts` above the policy object.

## 6. Automated Verification
- [ ] Extend `node scripts/verify-oos-manifest.js` to also assert `1_PRD-REQ-OOS-012` is present with all required fields.
- [ ] Add a CI step `verify:ui-policy` that runs a script (`scripts/verify-ui-policy.js`) which:
  1. Imports `UI_VALIDATION_POLICY`.
  2. Asserts `allowManualUxQa === false`.
  3. Asserts `requireAutomatedFunctionalValidation === true`.
  4. Exits with code `0` on success, `1` on failure.
- [ ] Confirm CI passes on a clean run.
