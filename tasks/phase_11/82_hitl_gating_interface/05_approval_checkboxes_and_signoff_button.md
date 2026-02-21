# Task: Approval Checkboxes & Sign-off Button (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-092-3], [4_USER_FEATURES-REQ-009]

## 1. Initial Test Written
- [ ] In `packages/webview/src/components/hitl/__tests__/RequirementSignOff.test.tsx`, write React Testing Library tests for `<RequirementSignOff>`:
  - Renders a checkbox input with `aria-label="Sign off REQ-001"` for each requirement block.
  - The checkbox is unchecked by default.
  - Clicking the checkbox marks it as checked and updates internal state.
  - The component does not render a checkbox for `priority: 'P4'` requirements (non-must-have).
- [ ] In `packages/webview/src/components/hitl/__tests__/ApproveArchitectureButton.test.tsx`, write tests for `<ApproveArchitectureButton>`:
  - When zero P3 (Must-have) requirements are signed off, the button has `disabled={true}` and `aria-disabled="true"`.
  - When all P3 requirements are signed off, the button has `disabled={false}`.
  - A partial sign-off (some but not all P3 requirements checked) keeps the button disabled.
  - Clicking the enabled button calls the `onApprove` prop callback.
  - Clicking the disabled button does NOT call `onApprove`.
  - The button label is "Approve Architecture" and uses codicon `$(check-all)` as a prefix icon.
- [ ] In `packages/webview/src/components/hitl/__tests__/SignOffPanel.test.tsx`, write integration tests for `<SignOffPanel>` (composes `RequirementSignOff` + `ApproveArchitectureButton`):
  - Given 3 P3 requirements, the button is disabled until all 3 are checked.
  - After checking all 3, the button becomes enabled.
  - Unchecking any one re-disables the button.
  - When `onApprove` is called, the component posts `{ command: 'approve' }` via the injected `vscodeApi.postMessage`.
  - When `onReject` is called, the component posts `{ command: 'reject' }`.

## 2. Task Implementation
- [ ] Create `packages/webview/src/components/hitl/RequirementSignOff.tsx`:
  - Props: `reqId: string`, `label: string`, `priority: 'P1' | 'P2' | 'P3' | 'P4'`, `checked: boolean`, `onChange: (reqId: string, checked: boolean) => void`.
  - Render a `<label>` containing a `<input type="checkbox" aria-label={\`Sign off \${reqId}\`}>` and the requirement label text.
  - Only render when `priority !== 'P4'`; return `null` for P4 requirements.
  - Apply `min-height: 24px` and `cursor: pointer` on the label (interactive target ≥ 24px per design spec `7_UI_UX_DESIGN-REQ-UI-DES-048-1`).
  - On change, call `onChange(reqId, event.target.checked)`.
- [ ] Create `packages/webview/src/components/hitl/ApproveArchitectureButton.tsx`:
  - Props: `allP3SignedOff: boolean`, `onApprove: () => void`.
  - Render `<button disabled={!allP3SignedOff} aria-disabled={String(!allP3SignedOff)} onClick={onApprove}>`.
  - Button text: `<i className="codicon codicon-check-all" aria-hidden="true" /> Approve Architecture`.
  - Use `vscode-button` variant styling via CSS class `vscode-button--primary` (not hardcoded background color).
  - When disabled, apply `opacity: 0.5` and `cursor: not-allowed`.
- [ ] Create `packages/webview/src/components/hitl/SignOffPanel.tsx`:
  - Props: `requirements: Array<{ reqId: string; label: string; priority: 'P1'|'P2'|'P3'|'P4' }>`, `onApprove: () => void`, `onReject: () => void`, `vscodeApi: VscodeApi`.
  - State: `signedOff: Record<string, boolean>` — keyed by `reqId`, initialized to all `false`.
  - Compute `allP3SignedOff = requirements.filter(r => r.priority === 'P3').every(r => signedOff[r.reqId])`.
  - Render a scrollable list of `<RequirementSignOff>` for each requirement.
  - Render `<ApproveArchitectureButton allP3SignedOff={allP3SignedOff} onApprove={() => { vscodeApi.postMessage({ command: 'approve' }); onApprove(); }} />`.
  - Render a secondary `<button onClick={() => { vscodeApi.postMessage({ command: 'reject' }); onReject(); }}>Reject</button>`.
- [ ] Integrate `<SignOffPanel>` into `<GatedSpecReview>` below the dual-pane area, with requirements derived from `gate.requirements`.

## 3. Code Review
- [ ] Verify the `allP3SignedOff` computation uses `.every()` (not `.reduce()` or manual loop) for clarity and correctness.
- [ ] Verify `<RequirementSignOff>` returns `null` for P4 requirements — not just hidden via CSS, but truly not rendered.
- [ ] Verify `<ApproveArchitectureButton>` uses the native `disabled` HTML attribute (not only `aria-disabled`) to ensure the click handler is natively blocked.
- [ ] Verify all interactive elements meet the 24px minimum touch target (`min-height: 24px` or `min-width: 24px`).
- [ ] Verify no color values in button styling are hardcoded — use VSCode CSS variables or Tailwind classes that map to VSCode tokens.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern="RequirementSignOff|ApproveArchitecture|SignOffPanel"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview build` and assert no TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## Sign-Off Flow` section to `packages/webview/src/components/hitl/README.md`:
  - Document priority levels (P3 = Must-have, gating the Approve button).
  - Document the `VscodeApi.postMessage` protocol (`{ command: 'approve' }` and `{ command: 'reject' }`).
- [ ] Update `docs/agent-memory/architecture-decisions.md`:
  ```
  ## [ADR-HITL-005] Approval Sign-Off Gate Logic
  - The "Approve Architecture" button is disabled until ALL P3 (Must-have) requirements have a signed-off checkbox.
  - P4 requirements are excluded from rendering and gate computation entirely.
  - Button uses native disabled attribute for click prevention (not CSS pointer-events alone).
  - postMessage protocol: { command: 'approve' } or { command: 'reject' }.
  ```

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview test -- --ci --testPathPattern="RequirementSignOff|ApproveArchitecture|SignOffPanel"` and assert exit code `0`.
- [ ] Run `grep -n "disabled={!allP3SignedOff}" packages/webview/src/components/hitl/ApproveArchitectureButton.tsx` to confirm the gate logic is present.
- [ ] Run `pnpm --filter @devs/webview build` and assert exit code `0`.
