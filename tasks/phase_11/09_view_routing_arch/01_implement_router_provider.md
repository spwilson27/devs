# Task: Implement Router Provider (Sub-Epic: 09_View_Routing_Arch)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-052]

## 1. Initial Test Written
- [ ] Create a Vitest test suite for `RouterProvider.test.tsx`.
- [ ] Mock the `vscode.postMessage` and `window.addEventListener('message', ...)` calls.
- [ ] Write a test that confirms the `useRouter` hook returns the default view (`DASHBOARD`) on initialization.
- [ ] Write a test that validates that calling `navigateTo(ViewType.RESEARCH)` updates the current view.
- [ ] Write a test that confirms that an illegal view transition is handled or rejected (e.g., trying to navigate to a null view).
- [ ] Write a test that confirms that the router notifies the VSCode extension host via `postMessage` when a view change occurs.

## 2. Task Implementation
- [ ] Define a `ViewType` enum in `@devs/vscode-webview/src/types/routing.ts` (e.g., `DASHBOARD`, `RESEARCH`, `SPEC`, `ROADMAP`, `CONSOLE`, `SETTINGS`).
- [ ] Implement `RouterContext` and a `RouterProvider` component in `@devs/vscode-webview/src/providers/RouterProvider.tsx`.
- [ ] Create a `useRouter` custom hook that exposes `currentView` and `navigateTo`.
- [ ] Implement the `RouterView` component which switches between the actual view components (using React.lazy or a simple switch).
- [ ] Ensure that the initial state is hydrated from `vscode.getState()` if available.
- [ ] Integrate with the global Zustand store if required by the project's state architecture.

## 3. Code Review
- [ ] Verify that the `RouterProvider` is a thin wrapper around the state and doesn't contain heavy business logic.
- [ ] Ensure that all `ViewType` values are accounted for in the switch statement within `RouterView`.
- [ ] Check that the code follows strict TypeScript typing (no `any`).
- [ ] Confirm that `navigateTo` correctly updates both the internal state and the VSCode state.

## 4. Run Automated Tests to Verify
- [ ] Execute `pnpm test` (or the project's test command) and confirm all `RouterProvider` tests pass.
- [ ] Verify that no regressions were introduced in other Webview components.

## 5. Update Documentation
- [ ] Update the `README.md` or a dedicated architecture document in the Webview directory explaining how to add a new view to the router.
- [ ] Update the agent's memory or `.agent.md` file with the new routing pattern.

## 6. Automated Verification
- [ ] Run a script that scans the code for the `ViewType` enum and ensures it contains the mandatory views as per the PRD.
- [ ] Validate that the build (`pnpm build`) succeeds without type errors.
