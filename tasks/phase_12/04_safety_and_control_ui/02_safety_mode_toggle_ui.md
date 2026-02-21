# Task: Safety Mode Configuration UI Toggle (Sub-Epic: 04_Safety and Control UI)

## Covered Requirements
- [1_PRD-REQ-UI-007]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/safety/__tests__/SafetyModeToggle.test.tsx`, write React Testing Library tests:
  - Test that the `<SafetyModeToggle />` component renders a toggle/switch labeled "Safety Mode" with an accessible `role="switch"` and `aria-checked` reflecting current state.
  - Test that when Safety Mode is `disabled`, `aria-checked` is `"false"` and the toggle visually appears off.
  - Test that when Safety Mode is `enabled`, `aria-checked` is `"true"` and the toggle visually appears on.
  - Test that clicking the toggle fires a `onModeChange` callback prop with the new mode value (`"enabled"` or `"disabled"`).
  - Test that the component is keyboard accessible: pressing Space or Enter while the switch is focused toggles the mode.
  - Test that a tooltip or label text clarifies what Safety Mode does (text: "Require approval for filesystem and network tool calls").
  - Test that when `disabled` prop is passed (e.g., while an approval is pending), the toggle is non-interactive and shows a disabled state.
- [ ] In `packages/webview-ui/src/store/__tests__/safetySlice.test.ts`, write Redux slice tests:
  - Test that `setSafetyMode("enabled")` updates `state.safety.mode` to `"enabled"`.
  - Test that `setSafetyMode("disabled")` updates `state.safety.mode` to `"disabled"`.
  - Test that the initial state defaults to `{ mode: "disabled" }`.
  - Test that `selectSafetyMode` selector returns the current mode from state.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/store/safetySlice.ts` (Redux Toolkit slice):
  - State shape: `{ mode: "enabled" | "disabled" }`, initial: `{ mode: "disabled" }`.
  - Actions: `setSafetyMode(mode: "enabled" | "disabled")`.
  - Selector: `selectSafetyMode(state: RootState): "enabled" | "disabled"`.
  - On `setSafetyMode`, also dispatch a message to the extension host via `vscode.postMessage({ type: "SET_SAFETY_MODE", payload: { mode } })` using a Redux middleware or in the component's dispatch handler.
- [ ] Create `packages/webview-ui/src/components/safety/SafetyModeToggle.tsx`:
  - Props: `mode: "enabled" | "disabled"`, `onModeChange: (mode: "enabled" | "disabled") => void`, `disabled?: boolean`.
  - Render a `<button role="switch" aria-checked={mode === "enabled"} ...>` styled as a toggle switch using the existing design token CSS variables.
  - Show label text: "Safety Mode".
  - Show a `<Tooltip>` component (reuse existing tooltip primitive) with content: "Require approval for filesystem and network tool calls".
  - When `disabled` prop is true, apply `aria-disabled="true"` and prevent click/key events.
- [ ] Add `<SafetyModeToggle />` to the `<ControlBar />` component in `packages/webview-ui/src/components/layout/ControlBar.tsx`, connected to the Redux store via `useAppSelector(selectSafetyMode)` and `useAppDispatch`.
- [ ] In the extension host message handler (`packages/extension/src/messaging/messageHandler.ts`), handle `SET_SAFETY_MODE` by calling `orchestrator.safetyInterceptor.setMode(payload.mode)`.

## 3. Code Review
- [ ] Confirm the toggle is the single source of truth for Safety Mode state — no local component state duplicating the Redux slice.
- [ ] Verify the component does not directly import from `@devs/core`; all core interactions go through `vscode.postMessage`.
- [ ] Confirm `aria-checked`, `role="switch"`, and keyboard event handlers follow WCAG 2.1 AA switch pattern.
- [ ] Check that the Redux slice action creator is typed (no `string` literal types used without the enum).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="SafetyModeToggle|safetySlice"` and confirm 0 failures.
- [ ] Run `pnpm --filter @devs/webview-ui test:coverage` and confirm `SafetyModeToggle.tsx` and `safetySlice.ts` both have ≥ 90% branch coverage.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/components/safety/SafetyModeToggle.agent.md` documenting:
  - Component props, behavior, and accessibility attributes.
  - The message contract with the extension host (`SET_SAFETY_MODE`).
- [ ] Update `packages/webview-ui/src/store/safetySlice.ts` with inline JSDoc comments on the slice, actions, and selectors.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="SafetyModeToggle|safetySlice" --json --outputFile=/tmp/safety_toggle_results.json` and confirm `"numFailedTests": 0` in the output file.
- [ ] Run `grep -r "SafetyModeToggle" packages/webview-ui/src/components/layout/ControlBar.tsx` and confirm it is imported and rendered (exit code 0).
