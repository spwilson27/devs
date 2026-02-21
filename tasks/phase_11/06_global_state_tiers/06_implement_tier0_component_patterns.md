# Task: Tier 0 Pattern Implementation and Testing (Sub-Epic: 06_Global_State_Tiers)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-040]

## 1. Initial Test Written
- [ ] Create `packages/vscode/src/components/__tests__/transient.state.test.tsx` using `react-testing-library`.
- [ ] Render a mock component that uses `useState` for a local toggle.
- [ ] Simulate a click to change the toggle state.
- [ ] Unmount and remount the component.
- [ ] Verify that the state is reset to the default value (proving it is transient).
- [ ] Test that changing transient state does not trigger updates in `useLayoutStore` or `useProjectStore`.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/components/common/patterns/TransientStateExample.tsx` as a reference component.
- [ ] Use `useState` for ephemeral state like `isHovered`, `isExpanded`, or `inputValue`.
- [ ] Document in code comments the rule for Tier 0: "Never use global stores for component-local UI state."
- [ ] Add a `useReducer` example for more complex transient state (e.g., local form state).
- [ ] Ensure that no Tier 0 state is passed to global stores unless a specific `save` action is triggered by the user.
- [ ] Implement `packages/vscode/src/components/common/patterns/README.md` documenting the 4 tiers and where `useState` fits in.

## 3. Code Review
- [ ] Verify that Tier 0 state is not synced via MCP or persisted to VSCode.
- [ ] Ensure that `useState` is preferred over global stores for all UI-only interactions (hover, local toggles, focused elements).
- [ ] Confirm that no "prop drilling" occurs by using local state only where necessary.

## 4. Run Automated Tests to Verify
- [ ] Execute `pnpm test packages/vscode/src/components/__tests__/transient.state.test.tsx`.
- [ ] Ensure 100% pass rate.

## 5. Update Documentation
- [ ] Update `packages/vscode/README.md` with the "State Tier Guidelines" and examples for Tier 0.
- [ ] Include code snippets for `useState` vs. `useLayoutStore` usage.

## 6. Automated Verification
- [ ] Run `pnpm lint` in `packages/vscode` to ensure components follow React hooks best practices.
