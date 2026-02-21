# Task: Global Pause/Resume Control Bar UI (Sub-Epic: 04_Safety and Control UI)

## Covered Requirements
- [1_PRD-REQ-UI-008]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/control/__tests__/PauseResumeButton.test.tsx`, write React Testing Library tests:
  - Test that when `orchestratorState` is `"running"`, a "Pause" button is rendered with `aria-label="Pause all agents"`.
  - Test that when `orchestratorState` is `"paused"`, a "Resume" button is rendered with `aria-label="Resume all agents"`.
  - Test that clicking "Pause" fires the `onPause` callback prop.
  - Test that clicking "Resume" fires the `onResume` callback prop.
  - Test that when `loading` prop is `true` (pause/resume in progress), the button shows a spinner and is `disabled`.
  - Test that `aria-pressed` or `aria-label` reflects the current state for screen reader announcements.
  - Test a keyboard shortcut: pressing `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) anywhere in the app triggers the pause/resume toggle (test via a global `keydown` event listener registered in the component).
- [ ] In `packages/webview-ui/src/store/__tests__/orchestratorSlice.test.ts`, extend tests:
  - Test that `setOrchestratorState("paused")` updates `state.orchestrator.state`.
  - Test that `setOrchestratorState("running")` updates `state.orchestrator.state`.
  - Test that `setPauseResumeLoading(true/false)` updates `state.orchestrator.pauseResumeLoading`.
  - Test that `selectOrchestratorState` and `selectPauseResumeLoading` selectors work correctly.

## 2. Task Implementation
- [ ] Extend or create `packages/webview-ui/src/store/orchestratorSlice.ts`:
  - Add to state: `state: "running" | "paused"` (initial: `"running"`), `pauseResumeLoading: boolean` (initial: `false`).
  - Actions: `setOrchestratorState`, `setPauseResumeLoading`.
  - Selectors: `selectOrchestratorState`, `selectPauseResumeLoading`.
  - In the webview's EventBus listener, on `orchestrator:paused` → dispatch `setOrchestratorState("paused")` and `setPauseResumeLoading(false)`. On `orchestrator:resumed` → dispatch `setOrchestratorState("running")` and `setPauseResumeLoading(false)`.
- [ ] Create `packages/webview-ui/src/components/control/PauseResumeButton.tsx`:
  - Props: `orchestratorState: "running" | "paused"`, `loading: boolean`, `onPause: () => void`, `onResume: () => void`.
  - Render a single button that switches between "Pause" and "Resume" labels with matching icons (use existing icon set).
  - Show a spinner overlay when `loading` is `true` and disable the button.
  - Register a global `keydown` listener for `Ctrl+Shift+P` / `Cmd+Shift+P` on mount; clean up on unmount.
  - Button variant: "warning" when showing Pause, "success" when showing Resume (using design tokens).
- [ ] Add `<PauseResumeButton />` to the `<ControlBar />` component in `packages/webview-ui/src/components/layout/ControlBar.tsx`:
  - Connect to Redux with `useAppSelector` and `useAppDispatch`.
  - On `onPause`: dispatch `setPauseResumeLoading(true)` and `postMessage({ type: "PAUSE_ORCHESTRATOR" })`.
  - On `onResume`: dispatch `setPauseResumeLoading(true)` and `postMessage({ type: "RESUME_ORCHESTRATOR" })`.
- [ ] In the extension host message handler, handle:
  - `PAUSE_ORCHESTRATOR` → `await orchestrator.pause()`.
  - `RESUME_ORCHESTRATOR` → `await orchestrator.resume()`.
  - After each, send `orchestrator:paused` or `orchestrator:resumed` event back to the webview.

## 3. Code Review
- [ ] Confirm the loading state is set optimistically on click (before the extension host responds) to give immediate feedback.
- [ ] Verify the global keyboard shortcut handler does not leak — it must be removed in the `useEffect` cleanup.
- [ ] Confirm the button's focus ring is visible at `2px` minimum (WCAG 2.1 Focus Visible) and the color contrast ratio for the button label meets ≥ 4.5:1.
- [ ] Verify the component does not hard-code the keyboard shortcut string — it should reference a `KEYBOARD_SHORTCUTS` constants file.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="PauseResumeButton|orchestratorSlice"` and confirm 0 failures.
- [ ] Run `pnpm --filter @devs/webview-ui test:coverage` and confirm `PauseResumeButton.tsx` has ≥ 90% branch coverage.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/components/control/PauseResumeButton.agent.md` documenting:
  - Keyboard shortcut and its definition location.
  - The loading state flow.
  - The message contract with the extension host.
- [ ] Update `packages/webview-ui/src/store/orchestratorSlice.ts` with inline JSDoc on all actions and selectors.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="PauseResumeButton" --json --outputFile=/tmp/pause_resume_button_results.json` and confirm `"numFailedTests": 0`.
- [ ] Run `grep -rn "PAUSE_ORCHESTRATOR\|RESUME_ORCHESTRATOR" packages/extension/src/messaging/messageHandler.ts` to confirm both handlers are registered (exit code 0).
