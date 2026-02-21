# Task: Implement Per-Requirement Sign-off Checkboxes and Approval Gate Logic (Sub-Epic: 11_Document Approval and Requirement Linking)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-092-3]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/lib/__tests__/approvalGate.test.ts`, write unit tests for the `ApprovalGate` class:
  - Test `isApproved(reqId: string): boolean` returns `false` for unchecked requirements.
  - Test `signOff(reqId: string): void` correctly marks a single requirement as approved.
  - Test `revokeSignOff(reqId: string): void` reverts approval for a previously signed-off requirement.
  - Test `isArchitectureApprovable(requirements: Requirement[]): boolean`:
    - Returns `false` when any requirement with `priority === 'P3'` (Must-have) is not signed off.
    - Returns `true` only when ALL P3 requirements in the provided list are signed off.
    - Returns `true` when no P3 requirements exist (edge case).
  - Test persistence: simulate a store hydration and assert signed-off state is restored from serialized JSON.
- [ ] In `packages/webview-ui/src/components/__tests__/RequirementSignOff.test.tsx`, write React Testing Library tests:
  - Render `<RequirementSignOff reqId="1_PRD-REQ-UI-018" priority="P3" label="Transparency and Exposure" checked={false} onToggle={mockFn} />`.
  - Assert the checkbox renders with `aria-label="Sign off: Transparency and Exposure"`.
  - Assert clicking the checkbox calls `onToggle` with the requirement ID and new boolean state.
  - Assert the checkbox is visually distinct (has class `sign-off-p3`) when `priority === 'P3'`.
- [ ] In `packages/webview-ui/src/components/__tests__/ApproveArchitectureButton.test.tsx`:
  - Assert the button renders as `disabled` when `isApprovable === false`.
  - Assert the button renders as enabled when `isApprovable === true`.
  - Assert clicking the enabled button calls `onApprove` handler exactly once.
  - Assert the button has `aria-disabled="true"` when disabled (not just the HTML `disabled` attribute).

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/lib/approvalGate.ts`:
  - Export `type Priority = 'P1' | 'P2' | 'P3'` and `interface Requirement { id: string; priority: Priority; label: string }`.
  - Export class `ApprovalGate`:
    - `private signedOff: Set<string>`
    - `signOff(reqId: string): void`
    - `revokeSignOff(reqId: string): void`
    - `isApproved(reqId: string): boolean`
    - `isArchitectureApprovable(requirements: Requirement[]): boolean` — returns true iff every requirement with `priority === 'P3'` is in `signedOff`.
    - `serialize(): string` and `static deserialize(json: string): ApprovalGate` for persistence.
- [ ] Create `packages/webview-ui/src/components/RequirementSignOff.tsx`:
  - Props: `reqId: string`, `priority: Priority`, `label: string`, `checked: boolean`, `onToggle: (reqId: string, checked: boolean) => void`.
  - Renders a `<label>` containing a `<input type="checkbox">` with `aria-label="Sign off: {label}"` and class `sign-off-{priority.toLowerCase()}`.
  - Visually indicate P3 items with a amber/orange left border using Tailwind class `border-l-4 border-amber-500`.
- [ ] Create `packages/webview-ui/src/components/ApproveArchitectureButton.tsx`:
  - Props: `isApprovable: boolean`, `onApprove: () => void`.
  - Renders a `<button>` with `aria-disabled={!isApprovable}` and `disabled={!isApprovable}`.
  - When disabled, shows tooltip: "All P3 (Must-have) requirements must be signed off before approving."
  - Emits a `devs:architecture-approved` DOM event on click for upstream orchestration.
- [ ] Wire both components into `packages/webview-ui/src/components/DocumentDualPane.tsx`:
  - Inject a `<RequirementSignOff>` checkbox after each requirement block rendered in the PRD pane.
  - Render `<ApproveArchitectureButton>` in the dual-pane toolbar, connected to `ApprovalGate.isArchitectureApprovable()`.
  - Persist `ApprovalGate` state to `vscode.getState()` / `vscode.setState()` so approvals survive panel reloads.

## 3. Code Review
- [ ] Confirm `ApprovalGate.isArchitectureApprovable` only gates on P3 requirements and ignores P1/P2.
- [ ] Verify that `aria-disabled` is set in addition to HTML `disabled` to ensure screen reader compatibility.
- [ ] Ensure `vscode.setState` is called debounced (200ms) to avoid excessive state writes on rapid checkbox toggles.
- [ ] Confirm no approval state is stored in a React component's local state — all state lives in `ApprovalGate` (single source of truth).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="approvalGate|RequirementSignOff|ApproveArchitectureButton"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview-ui run typecheck` to confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add section "Approval Gate" to `packages/webview-ui/AGENT.md` describing `ApprovalGate` API, priority semantics (P3 = Must-have blocks approval), serialization format, and the `devs:architecture-approved` event.
- [ ] Update `packages/webview-ui/src/lib/approvalGate.ts` with JSDoc for each public method.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --coverage -- --testPathPattern="approvalGate|RequirementSignOff|ApproveArchitectureButton"` and assert branch coverage ≥ 90% for `approvalGate.ts`.
- [ ] Execute Playwright E2E test (`pnpm e2e -- --grep "approval gate"`) that: loads the dual-pane, confirms the "Approve Architecture" button is disabled, checks all P3 checkboxes, asserts the button becomes enabled, clicks it, and asserts the `devs:architecture-approved` event is dispatched. Confirm test exits with code 0.
