# Task: Implement Tool Execution Micro-Animations – Completion Pop & Failure Shake (Sub-Epic: 12_Animation System and UX Feedback)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-052], [7_UI_UX_DESIGN-REQ-UI-DES-052-3], [7_UI_UX_DESIGN-REQ-UI-DES-052-4]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/ActionCard.outcomes.test.tsx`, write Vitest + React Testing Library tests:
  - Test: `ActionCard` with `status="completed"` applies `action-card--completion-pop` CSS class.
  - Test: `ActionCard` with `status="completed"` has a `data-animation="completion-pop"` attribute (used for automated verification).
  - Test: `ActionCard` with `status="failed"` applies `action-card--failure-shake` CSS class.
  - Test: `ActionCard` with `status="failed"` has a `data-animation="failure-shake"` attribute.
  - Test: `ActionCard` with `status="idle"` has neither `action-card--completion-pop` nor `action-card--failure-shake`.
  - Test: After the `completed` animation duration (500ms + buffer), the `action-card--completion-pop` class is removed (use `jest.useFakeTimers` / Vitest fake timers and advance by 600ms).
  - Test: After the `failed` animation duration (400ms + buffer), the `action-card--failure-shake` class is removed (advance timers by 500ms).
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/ActionCardHeader.test.tsx`:
  - Test: `ActionCardHeader` has `background: var(--devs-error)` inline style applied when `status="failed"`.
  - Test: `ActionCardHeader` does NOT have the error background when `status="completed"` or `status="idle"`.

## 2. Task Implementation
- [ ] **CSS Keyframes** – In `packages/webview-ui/src/styles/animations.css`, add:
  ```css
  /* Completion "Pop" */
  @keyframes completion-pop {
    0%   { transform: scale(1); border-color: transparent; }
    30%  { transform: scale(1.02); }
    60%  { transform: scale(1); border-color: var(--devs-success); }
    100% { transform: scale(1); border-color: transparent; }
  }

  .action-card--completion-pop {
    animation: completion-pop 500ms ease-out forwards;
    border: 1px solid transparent;
  }

  /* Failure Shake */
  @keyframes failure-shake {
    0%   { transform: translateX(0); }
    20%  { transform: translateX(-4px); }
    40%  { transform: translateX(4px); }
    60%  { transform: translateX(-4px); }
    80%  { transform: translateX(4px); }
    100% { transform: translateX(0); }
  }

  .action-card--failure-shake {
    animation: failure-shake 400ms ease-in-out forwards;
  }
  ```
- [ ] **`ActionCard` Component Updates** – In `packages/webview-ui/src/components/AgentConsole/ActionCard.tsx`:
  - When `status` prop changes to `"completed"`:
    1. Apply `action-card--completion-pop` class immediately.
    2. Use `setTimeout(() => removeClass('action-card--completion-pop'), 500)` to clear it after the animation ends.
    3. Store the timer ref in `useRef` and clear it in the cleanup to avoid state updates on unmounted components.
  - When `status` prop changes to `"failed"`:
    1. Apply `action-card--failure-shake` class immediately.
    2. Use `setTimeout(() => removeClass('action-card--failure-shake'), 400)` to clear it after animation ends.
  - Use a local `animationClass` state variable (string) to hold the active ephemeral animation class, separate from the base class.
  - Add `data-animation` attribute set to `"completion-pop"` or `"failure-shake"` while the respective animation is active, and set to `""` otherwise.
- [ ] **`ActionCardHeader` Component** – In `packages/webview-ui/src/components/AgentConsole/ActionCardHeader.tsx`:
  - Accept `status` prop.
  - Apply `style={{ background: 'var(--devs-error)' }}` inline when `status === 'failed'`.
  - Remove the inline style when `status` changes away from `'failed'` (no animation required for background removal per spec).
- [ ] **Wire into AgentConsole** – Ensure `useToolLifecycle` hook (from Task 02) correctly emits `status="completed"` on `TOOL_LIFECYCLE:COMPLETED` and `status="failed"` on `TOOL_LIFECYCLE:FAILED` events.

## 3. Code Review
- [ ] Confirm the completion pop scale is exactly `scale(1.02)` – not `scale(1.05)` or higher (spec is explicit).
- [ ] Confirm the border-flash color uses the CSS variable `var(--devs-success)` and decays back to `transparent` within 500ms.
- [ ] Confirm the failure shake displacement is `±4px` (`translateX(-4px)` / `translateX(4px)`) and duration is `400ms`.
- [ ] Verify that the failure card header background changes to `var(--devs-error)` immediately (no animation/transition on the background property itself).
- [ ] Confirm that animation classes are cleaned up via `setTimeout` refs stored in `useRef` and properly cleared in `useEffect` cleanup to prevent memory leaks.
- [ ] Verify `data-animation` attribute is used only for testability and does not affect visual output.
- [ ] Ensure completion and failure animations are mutually exclusive (cannot both apply simultaneously).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run ActionCard.outcomes` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run ActionCardHeader` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run useToolLifecycle` to confirm existing tests still pass after the hook is extended with completed/failed statuses.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run` and confirm no regressions.

## 5. Update Documentation
- [ ] Append to the `### Tool Execution Micro-Animations` section in `packages/webview-ui/docs/animations.md`:
  - Document Completion Pop: `action-card--completion-pop`, `scale(1.02)`, `var(--devs-success)` border-flash, 500ms auto-cleanup.
  - Document Failure Shake: `action-card--failure-shake`, `±4px` horizontal shake, 400ms auto-cleanup.
  - Document `ActionCardHeader` error background: immediate `var(--devs-error)` background on `status="failed"`.
- [ ] Update `CHANGELOG.md` with: `feat: add Completion Pop and Failure Shake micro-animations for tool execution outcomes`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run --reporter=json > /tmp/tool_outcomes_results.json` and verify exit code `0`.
- [ ] Assert `"numFailedTests": 0` via `node -e "const r=require('/tmp/tool_outcomes_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm exit code `0`.
