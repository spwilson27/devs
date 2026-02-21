# Task: Scaffold `@devs/ui-hooks` Package and Implement Status Hooks (Sub-Epic: 05_UI_Interaction_Triggers)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-034]

## 1. Initial Test Written
- [ ] Create unit tests for `useTaskStatus` hook to verify it correctly subscribes to the Zustand store (`@devs/ui-state`) and returns the expected task status (e.g., `PENDING`, `RUNNING`, `SUCCESS`, `FAILURE`).
- [ ] Mock the Zustand store and ensure the hook re-renders when the store state changes.

## 2. Task Implementation
- [ ] Initialize the `@devs/ui-hooks` package in the monorepo workspace.
- [ ] Configure `package.json` with necessary dependencies, specifically React (as a peer dependency) and `@devs/ui-state`.
- [ ] Implement the `useTaskStatus(taskId: string)` hook. This hook should:
    - Select the task status from the global Zustand store.
    - Provide a reactive interface for components to monitor individual task progress.
- [ ] Export the hook from the package's main entry point.

## 3. Code Review
- [ ] Verify that the hook uses selector-based subscriptions to prevent unnecessary re-renders of the component using it.
- [ ] Ensure that the package configuration follows the monorepo's standards for TypeScript and linting.
- [ ] Confirm that the hook handles cases where the `taskId` might not exist in the store (e.g., returning `null` or a default status).

## 4. Run Automated Tests to Verify
- [ ] Run `vitest` or the project's preferred test runner to execute the `useTaskStatus` unit tests.
- [ ] Verify that the tests pass with 100% coverage for the new hook.

## 5. Update Documentation
- [ ] Add a README to `@devs/ui-hooks` explaining the purpose of the package and providing usage examples for `useTaskStatus`.
- [ ] Update the Phase 11 status to reflect the successful scaffolding of the UI hooks package.

## 6. Automated Verification
- [ ] Run a shell script that verifies the existence of the `@devs/ui-hooks` package and checks that `useTaskStatus` is exported.
