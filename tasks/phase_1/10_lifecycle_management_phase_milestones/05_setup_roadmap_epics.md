# Task: Setup Roadmap Epics for Future Phases (P3-P8) (Sub-Epic: 10_Lifecycle Management & Phase Milestones)

## Covered Requirements
- [9_ROADMAP-M-2], [9_ROADMAP-M-3], [9_ROADMAP-PHASE-007], [9_ROADMAP-PHASE-008]

## 1. Initial Test Written
- [ ] Write a test in `tests/persistence/RoadmapSetup.test.ts` that:
  - Initializes a project.
  - Queries the `epics` table.
  - Asserts that all epics for Phases 3 through 8 are present and in the correct order.

## 2. Task Implementation
- [ ] Create a constant `DEFAULT_ROADMAP` containing the 8-16 standard Epics defined in the PRD/Roadmap documents.
- [ ] Tag each Epic with its `phase_id` and `milestone_id`.
- [ ] Update `ProjectManager.init()` to populate the `epics` table with these defaults.
- [ ] Ensure that future phases are marked as `PENDING` or `LOCKED` until prerequisites are met.

## 3. Code Review
- [ ] Verify that epic IDs and order match the `specs/9_project_roadmap.md` exactly.
- [ ] Check that dependencies between epics are correctly represented in the database.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test tests/persistence/RoadmapSetup.test.ts` and verify the roadmap integrity.

## 5. Update Documentation
- [ ] Ensure the `docs/roadmap/` directory contains summaries for each of these pre-defined epics.

## 6. Automated Verification
- [ ] Run `devs status` and check the "Upcoming Milestones" section to ensure Phases 3-8 are listed.
