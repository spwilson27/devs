# Task: Implement Tier 1 (Volatile) Layout Store with Zustand (Sub-Epic: 06_Global_State_Tiers)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-041]

## 1. Initial Test Written
- [ ] Create `packages/vscode/src/state/__tests__/layout.store.test.ts` to test `useLayoutStore`.
- [ ] Test the initial state of the layout store (e.g., `activeView` should be 'DASHBOARD').
- [ ] Test that updating `activeView` correctly updates the state.
- [ ] Test that zoom and pan updates work as expected.
- [ ] Verify that there is a `reset()` function that restores all default values.

## 2. Task Implementation
- [ ] Install `zustand` in the `packages/vscode` directory if not already present.
- [ ] Create `packages/vscode/src/state/layout.store.ts` implementing `useLayoutStore`.
- [ ] Implement `activeView: 'DASHBOARD' | 'RESEARCH' | 'SPEC' | 'ROADMAP' | 'CONSOLE'`, `zoom: number`, `pan: { x: number, y: number }`, `sidebarCollapsed: boolean`.
- [ ] Add update actions: `setActiveView(view)`, `updateZoom(zoom)`, `updatePan(x, y)`, `toggleSidebar()`.
- [ ] Implement a `reset()` action for volatile state cleanup on reload.
- [ ] Export the `useLayoutStore` hook for use in React components.

## 3. Code Review
- [ ] Verify that `useLayoutStore` is not used to persist data; it must reset on reload.
- [ ] Ensure that actions are defined within the store for better encapsulation.
- [ ] Confirm no unnecessary re-renders are triggered by ensuring state is updated surgically.

## 4. Run Automated Tests to Verify
- [ ] Execute `pnpm test packages/vscode/src/state/__tests__/layout.store.test.ts`.
- [ ] Ensure 100% pass rate.

## 5. Update Documentation
- [ ] Update `packages/vscode/README.md` with instructions on how to use `useLayoutStore` in components.
- [ ] Document the available actions and state properties.

## 6. Automated Verification
- [ ] Run `pnpm lint` and `tsc` in `packages/vscode` to ensure no errors exist in the implementation.
