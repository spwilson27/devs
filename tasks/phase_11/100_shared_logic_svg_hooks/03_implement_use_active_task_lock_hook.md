# Task: Implement `useActiveTaskLock` for HITL Navigation Protection (Sub-Epic: 100_Shared_Logic_SVG_Hooks)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-067]

## 1. Initial Test Written
- [ ] Create `packages/ui-hooks/src/__tests__/useActiveTaskLock.test.ts`.
- [ ] Mock the global Zustand store (`useStore`) to simulate `activeTask` and `isHITLGateActive` states.
- [ ] Mock `window.confirm` or the VSCode `showWarningMessage` bridge.
- [ ] Test that when `isHITLGateActive` is `false`, the lock does not trigger on navigation events.
- [ ] Test that when `isHITLGateActive` is `true`, a warning is triggered when the user attempts to change the view (e.g., via a mock router or view change function).

## 2. Task Implementation
- [ ] Create `packages/ui-hooks/src/useActiveTaskLock.ts`.
- [ ] Implement the hook to subscribe to the Zustand state for `isHITLGateActive`.
- [ ] Use `useEffect` to intercept navigation attempts. In a VSCode Webview, this may involve checking the current `viewRouter` state and preventing updates if a lock is active.
- [ ] Implement a `withNavigationLock` wrapper or a direct check within the hook that prompts the user if they try to switch views while a high-priority "Human-in-the-Loop" gate is active.
- [ ] Ensure the warning message is technically concise as per `7_UI_UX_DESIGN-REQ-UI-DES-004-2`.

## 3. Code Review
- [ ] Verify that the lock only applies to "high-priority" gates as specified in `6_UI_UX_ARCH-REQ-067`.
- [ ] Ensure the hook does not introduce memory leaks by cleaning up state subscriptions.
- [ ] Check that the implementation doesn't block "emergency" navigation or system-level actions (if applicable).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the `packages/ui-hooks` directory.
- [ ] Ensure all scenarios (locked vs. unlocked) are covered and passing.

## 5. Update Documentation
- [ ] Update the UI Hooks documentation to include `useActiveTaskLock`.
- [ ] Add a note in the "Human-in-the-Loop" design section explaining how this hook protects the implementation flow.

## 6. Automated Verification
- [ ] Run a script to verify that `useActiveTaskLock` is integrated into the `CONSOLE` view component.
- [ ] Validate that the hook uses the standard VSCode theme tokens for any UI warnings it triggers.
