# Task: Implement Tier 2 (Project Mirror) Store with Zustand (Sub-Epic: 06_Global_State_Tiers)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-042]

## 1. Initial Test Written
- [ ] Create `packages/vscode/src/state/__tests__/project.store.test.ts` to test `useProjectStore`.
- [ ] Test the initial state (empty records for `tasks`, `requirements`, etc.).
- [ ] Test the `hydrateTasks()` and `hydrateRequirements()` actions.
- [ ] Verify that records are stored by ID for efficient lookup.
- [ ] Assert that `useProjectStore.getState().tasks` is a record, not an array.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/state/project.store.ts` using `zustand`.
- [ ] Implement `tasks: Record<string, Task>`, `requirements: Record<string, Requirement>`, `epics: Record<string, Epic>`, `documents: Record<string, Document>`.
- [ ] Add hydration actions: `setTasks(tasks: Task[])`, `setRequirements(requirements: Requirement[])`, etc., which normalize the incoming arrays into records.
- [ ] Implement `updateTask(id, patch)` and `updateRequirement(id, patch)` for surgical updates.
- [ ] Export `useProjectStore` for use in dashboard components.

## 3. Code Review
- [ ] Verify that the store is normalized to `Record<ID, T>` to avoid O(N) array filtering in the UI.
- [ ] Ensure that the data model in `useProjectStore` matches the output of the `@devs/core` orchestrator.
- [ ] Check for proper typing of `Task`, `Requirement`, etc., imported from `packages/vscode/src/state/types.ts`.

## 4. Run Automated Tests to Verify
- [ ] Execute `pnpm test packages/vscode/src/state/__tests__/project.store.test.ts`.
- [ ] Ensure 100% pass rate.

## 5. Update Documentation
- [ ] Document the normalized structure of `useProjectStore` in `packages/vscode/README.md`.
- [ ] Add an example of how to access a specific task by ID from the store.

## 6. Automated Verification
- [ ] Run `tsc` in `packages/vscode` to ensure type consistency for the store.
