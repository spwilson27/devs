# Task: Implement Requirement→Task Mapping API & Data Models (Sub-Epic: 08_Roadmap_Visualization_UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-014]

## 1. Initial Test Written
- [ ] Create unit tests under tests/core/distiller/mapper.test.(ts|js) that exercise a pure mapping function mapRequirementToTasks(requirement: { id: string, text: string, metadata?: any }) -> Task[].
  - Provide at least two deterministic sample inputs (simple requirement and multi-sentence requirement) and assert the produced Task[] items include: id, title, description, estimated_effort, and traceability back to the source REQ-ID.
  - Test that repeated calls with the same requirement produce identical outputs (idempotence) and that invalid inputs throw a validation error.

## 2. Task Implementation
- [ ] Implement typed models: src/core/models/requirement.ts and src/core/models/task.ts with explicit fields: id, title, description, inputs, outputs, success_criteria, estimated_effort_tokens, prerequisites[].
- [ ] Implement the mapper at src/core/distiller/mapper.ts exporting mapRequirementToTasks(requirement) using small, deterministic heuristics (split by actionable verbs, enforce max 200 LOC equivalent per task). Keep the function pure for easy unit testing.
- [ ] Add a CLI helper script src/cli/redistill-sample.ts that accepts a JSON requirement and prints mapped tasks; use this for manual verification and CI checks.

## 3. Code Review
- [ ] Ensure the mapper is pure, deterministic, well-documented, includes input validation, and produces tasks with stable IDs (e.g., hash of requirement id + ordinal). Verify unit tests cover edge cases and that models use strict types.

## 4. Run Automated Tests to Verify
- [ ] Run the mapper tests: `npm test -- tests/core/distiller/mapper.test` and ensure all assertions (idempotence, field presence) pass.

## 5. Update Documentation
- [ ] Update docs/distillation.md describing the mapping heuristics, the Task model schema, and sample inputs/outputs including one example mapping for REQ-ID `4_USER_FEATURES-REQ-014`.

## 6. Automated Verification
- [ ] Create a verification script `scripts/verify_mapper.sh` which runs the CLI helper with a pinned example requirement containing id `4_USER_FEATURES-REQ-014` and asserts the output contains tasks with trace fields referencing that REQ-ID. The CI should run this script and fail the build if mapping is incorrect.