# Task: Implement Phase and Milestone Progress Tracking (Sub-Epic: 10_Lifecycle Management & Phase Milestones)

## Covered Requirements
- [9_ROADMAP-M-1], [9_ROADMAP-M-2], [9_ROADMAP-M-3]

## 1. Initial Test Written
- [ ] Create `tests/lifecycle/Milestones.test.ts` to verify progress calculation:
  - If Phase 1 tasks are 100% and Phase 2 tasks are 0%, progress to Milestone 1 should be 50%.
  - Verify that transition to the next milestone occurs only when all prerequisite tasks are marked `COMPLETED`.

## 2. Task Implementation
- [ ] Implement `MilestoneService` in `@devs/core`:
  - `calculateProgress(milestone: ProjectMilestone): number`
  - `isMilestoneComplete(milestone: ProjectMilestone): boolean`
- [ ] Define the mapping between Milestones and Phases:
  - `M1 (Foundation)`: Phases 1 & 2.
  - `M2 (Intelligence)`: Phases 3, 4, & 5.
  - `M3 (Autonomy)`: Phases 6, 7, & 8.
- [ ] Integrate this service into `ProjectManager.status()` to provide high-level milestone visibility.

## 3. Code Review
- [ ] Verify that progress is calculated based on atomic tasks, not just epics, to ensure accuracy.
- [ ] Ensure that milestone definitions are centralized and easy to update as the roadmap evolves.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test tests/lifecycle/Milestones.test.ts` and ensure progress percentages are accurate for various scenarios.

## 5. Update Documentation
- [ ] Update `docs/roadmap/milestones.md` with the technical definitions of completion for each milestone.

## 6. Automated Verification
- [ ] Run `devs status --json` on a partially completed mock project and verify the `milestones` field contains correct progress data.
