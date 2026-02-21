# Task: Implement Gated Autonomy Attention Pulse Animation (Sub-Epic: 12_Animation System and UX Feedback)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-053], [7_UI_UX_DESIGN-REQ-UI-DES-053-1], [7_UI_UX_DESIGN-REQ-UI-DES-053-2], [7_UI_UX_DESIGN-REQ-UI-DES-053-3]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/ApprovalGate/__tests__/AttentionPulse.test.tsx`, write Vitest + React Testing Library tests:
  - Test: `ApprovalButton` with `isGated=true` has CSS class `approval-button--attention-pulse`.
  - Test: `ApprovalButton` with `isGated=false` does NOT have `approval-button--attention-pulse`.
  - Test: `DirectivesField` with `isGated=true` has CSS class `directives-field--attention-pulse`.
  - Test: Clicking the `ApprovalButton` while `isGated=true` removes `approval-button--attention-pulse` immediately.
  - Test: Pressing `Tab` to focus the `ApprovalButton` while `isGated=true` removes `approval-button--attention-pulse` (simulate `focus` event, then check class is gone).
  - Test: Pressing `Tab` to focus the `DirectivesField` while `isGated=true` removes `directives-field--attention-pulse`.
- [ ] In `packages/webview-ui/src/components/Sidebar/__tests__/PhaseStepperPulse.test.tsx`:
  - Test: The `PhaseStepper` icon for the current phase has CSS class `phase-stepper-icon--pulse-amber` when `isGated=true`.
  - Test: The `PhaseStepper` icon does NOT have `phase-stepper-icon--pulse-amber` for non-current phases.
  - Test: The `phase-stepper-icon--pulse-amber` class is removed when `isGated` becomes `false`.
- [ ] In `packages/webview-ui/src/hooks/__tests__/useApprovalGate.test.ts`:
  - Mock `EventBus` from `@devs/core`.
  - Test: Hook returns `{ isGated: false }` initially.
  - Test: On `APPROVAL_GATE:REQUIRED` event, hook returns `{ isGated: true }`.
  - Test: On `APPROVAL_GATE:RESOLVED` event, hook returns `{ isGated: false }`.
  - Test: Hook unsubscribes on unmount.

## 2. Task Implementation
- [ ] **CSS Keyframes** – In `packages/webview-ui/src/styles/animations.css`, add:
  ```css
  /* Gated Autonomy Attention Pulse (primary glow) */
  @keyframes attention-pulse-primary {
    0%, 100% { box-shadow: 0 0 0px var(--devs-primary); }
    50%       { box-shadow: 0 0 8px var(--devs-primary); }
  }

  .approval-button--attention-pulse,
  .directives-field--attention-pulse {
    animation: attention-pulse-primary 1200ms ease-in-out infinite;
  }

  /* Phase Stepper amber pulse */
  @keyframes attention-pulse-amber {
    0%, 100% { box-shadow: 0 0 0px var(--devs-amber, #f59e0b); opacity: 1; }
    50%       { box-shadow: 0 0 8px var(--devs-amber, #f59e0b); opacity: 0.7; }
  }

  .phase-stepper-icon--pulse-amber {
    animation: attention-pulse-amber 1200ms ease-in-out infinite;
  }
  ```
- [ ] **`useApprovalGate` Hook** – Create `packages/webview-ui/src/hooks/useApprovalGate.ts`:
  - Subscribe to `APPROVAL_GATE:REQUIRED` event → set `isGated = true`.
  - Subscribe to `APPROVAL_GATE:RESOLVED` event → set `isGated = false`.
  - Return `{ isGated: boolean }`.
  - Unsubscribe on cleanup.
- [ ] **`ApprovalButton` Component** – In `packages/webview-ui/src/components/ApprovalGate/ApprovalButton.tsx`:
  - Accept `isGated: boolean` and `onApprove: () => void` props.
  - Apply `approval-button--attention-pulse` class when `isGated` is `true`.
  - On `onClick` event: remove `approval-button--attention-pulse` class immediately (set local `pulseActive` state to `false`) then call `onApprove()`.
  - On `onFocus` event: remove `approval-button--attention-pulse` class immediately.
- [ ] **`DirectivesField` Component** – In `packages/webview-ui/src/components/AgentConsole/DirectivesField.tsx`:
  - Accept `isGated: boolean` prop.
  - Apply `directives-field--attention-pulse` class when `isGated` is `true`.
  - On `onFocus` event on the `<textarea>` / `<input>`: remove the pulse class immediately.
- [ ] **`PhaseStepper` Component** – In `packages/webview-ui/src/components/Sidebar/PhaseStepper.tsx`:
  - Accept `isGated: boolean` and `currentPhaseIndex: number` props.
  - For the icon corresponding to `currentPhaseIndex`, apply `phase-stepper-icon--pulse-amber` when `isGated` is `true`.
  - Remove the class when `isGated` becomes `false`.
- [ ] **Wire into App Shell** – In the root layout or App Shell component, call `useApprovalGate()` and pass `isGated` down to `ApprovalButton`, `DirectivesField`, and `PhaseStepper`.

## 3. Code Review
- [ ] Confirm the glow value is exactly `0 0 8px var(--devs-primary)` (not a spread shadow, a blur-only glow).
- [ ] Confirm the phase stepper pulse uses `var(--devs-amber)` (amber color), NOT `var(--devs-primary)`.
- [ ] Confirm pulse animations are `infinite` and removed IMMEDIATELY (not via fade) when the user interacts or focuses the element.
- [ ] Verify the termination logic handles both `onClick` (click interaction) and `onFocus` (keyboard Tab navigation) for all pulsing elements per REQ-UI-DES-053-3.
- [ ] Confirm that `isGated` state is derived exclusively from `APPROVAL_GATE:REQUIRED` / `APPROVAL_GATE:RESOLVED` events, not from any local component logic.
- [ ] Ensure the `PhaseStepper` pulse only applies to the current phase icon (not all phase icons).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run AttentionPulse` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run PhaseStepperPulse` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run useApprovalGate` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run` and confirm no regressions.

## 5. Update Documentation
- [ ] Add a section `### Gated Autonomy Attention Pulse` to `packages/webview-ui/docs/animations.md` documenting:
  - EventBus events: `APPROVAL_GATE:REQUIRED` / `APPROVAL_GATE:RESOLVED`.
  - CSS classes applied: `approval-button--attention-pulse`, `directives-field--attention-pulse`, `phase-stepper-icon--pulse-amber`.
  - Termination rule: pulses stop immediately on user interaction OR keyboard focus reaching the element.
  - The distinction between primary glow (for approval/directives) and amber glow (for phase stepper).
- [ ] Update `CHANGELOG.md` with: `feat: add Gated Autonomy Attention Pulse for approval gate UX guidance`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run --reporter=json > /tmp/attention_pulse_results.json` and verify exit code `0`.
- [ ] Assert `"numFailedTests": 0` via `node -e "const r=require('/tmp/attention_pulse_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm exit code `0`.
