# Task: Implement PRD content components (Goals, Non-Goals, Gherkin User Stories, Constraints) (Sub-Epic: 03_PRD and TAS Document Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-001], [9_ROADMAP-REQ-DOC-001]

## 1. Initial Test Written
- [ ] Add focused unit tests at tests/phase_6/03_prd_and_tas_document_generation/02_prd_content.spec.ts that verify each PRD sub-section extraction separately:
  - Test: "extracts goals array from brief" — assert generatePRDJSON(brief).goals equals expected array.
  - Test: "extracts non-goals array from brief".
  - Test: "produces at least one Gherkin-format user story" — assert /Scenario:/.test(gherkin) and /Given[\s\S]*When[\s\S]*Then/.test(gherkin).
  - Test: "extracts constraints list".
  - Use deterministic sample briefs for each test to make behavior repeatable.

## 2. Task Implementation
- [ ] Implement helper extraction functions in src/generators/prd_helpers.ts:
  - export function extractGoals(brief: string): string[]
  - export function extractNonGoals(brief: string): string[]
  - export function extractUserStories(brief: string): Array<{ title: string; gherkin: string }>
  - export function extractConstraints(brief: string): string[]
- [ ] Each helper must be pure, well-typed, and covered by unit tests.
- [ ] Wire helpers into generatePRD and generatePRDJSON implemented in src/generators/prd.ts.
- [ ] Implement minimal sanitized output: trim sentences, dedupe results, and normalize punctuation.

## 3. Code Review
- [ ] Confirm helper functions have 1 responsibility each and are trivial to stub/mock.
- [ ] Ensure edge cases are handled: empty brief, malformed sentences, no explicit keywords — handlers should return deterministic placeholder content instead of throwing.
- [ ] Verify unit tests cover success and edge cases (empty brief, single-sentence brief).

## 4. Run Automated Tests to Verify
- [ ] Run pnpm jest tests/phase_6/03_prd_and_tas_document_generation/02_prd_content.spec.ts --runInBand and confirm green.
- [ ] Ensure coverage report (if enabled) shows the new helpers are included.

## 5. Update Documentation
- [ ] Update docs/phase_6/prd_generator.md with a section "Extraction helpers" showing example inputs and outputs for extractGoals, extractNonGoals, extractUserStories, extractConstraints.

## 6. Automated Verification
- [ ] Add a lightweight smoke test script scripts/verify_prd_helpers.js that imports helpers from dist (or uses ts-node) and asserts behavior on at least three sample briefs; exit non-zero on failure. Run it as: node scripts/verify_prd_helpers.js and include it as a step in CI for this module.