# Task: Implement "Foundation" Milestone (P1-P2) Definition of Done (DoD) Validation (Sub-Epic: 10_Lifecycle Management & Phase Milestones)

## Covered Requirements
- [9_ROADMAP-DOD-P1], [9_ROADMAP-M-1]

## 1. Initial Test Written
- [ ] Create `tests/lifecycle/FoundationDoD.test.ts`.
- [ ] Mock a completed Phase 1 & 2 project state and verify `checkFoundationDoD()` returns `true`.
- [ ] Create a state where a core table is missing or a P1 task is failed and verify it returns `false` with a list of missing requirements.

## 2. Task Implementation
- [ ] Implement `FoundationValidator` in `@devs/core/src/lifecycle/validators/`:
  - Check for existence of `state.sqlite`.
  - Validate schema integrity of all 7 core tables.
  - Verify `SIMPLE-GIT` connectivity and initial commit presence.
  - Verify `@devs/core` and `@devs/cli` modules are initialized in the monorepo.
  - Ensure all Phase 1 & 2 tasks in the `tasks` table are marked `COMPLETED`.
- [ ] Implement a `validateMilestone(milestoneId)` method in `ProjectManager` that uses this validator.

## 3. Code Review
- [ ] Ensure the validator provides detailed error messages for why a DoD check failed.
- [ ] Verify that this check is used as a gate before the project can transition to the `INTELLIGENCE` phase (Phase 3).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test tests/lifecycle/FoundationDoD.test.ts` and ensure all validation rules are enforced.

## 5. Update Documentation
- [ ] Update `docs/milestones/foundation_dod.md` with the exact checklist the validator uses.

## 6. Automated Verification
- [ ] Run a CLI command (e.g., `devs validate foundation`) and verify it outputs a "Milestone Complete" or detailed "Missing Requirements" report.
