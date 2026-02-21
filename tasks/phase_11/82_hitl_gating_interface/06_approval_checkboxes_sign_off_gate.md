# Task: Approval Checkboxes & "Approve Architecture" Sign-off Gate Logic (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-092-3], [4_USER_FEATURES-REQ-009]

## 1. Initial Test Written

- [ ] Create `packages/vscode-webview/src/__tests__/ApprovalCheckboxes.test.tsx`.
- [ ] Write RTL unit tests:
  - Test that each `RequirementBlock` with a `priority: 'P3'` (Must-have) prop renders a checkbox with `aria-label="Sign off [REQ-ID]"`.
  - Test that `RequirementBlock` with `priority: 'P2'` or `priority: 'P1'` also renders a checkbox but does NOT count toward the "all P3 signed" gate condition.
  - Test that the **"Approve Architecture"** button in the `SpecSignOffBar` is `disabled` when at least one P3 requirement block is unchecked.
  - Test that the **"Approve Architecture"** button is `enabled` when ALL P3 requirement blocks are checked.
  - Test that clicking a checkbox updates `signedOffReqIds` in `useSpecReviewStore`.
  - Test that unchecking a previously checked P3 checkbox re-disables the **"Approve Architecture"** button.
  - Test that clicking **"Approve Architecture"** when enabled calls `approveGate(gateId)` from `useHitlGateStore` with the current spec review gate ID.
  - Test that the checkbox renders with `role="checkbox"` and responds to `Space` key press to toggle.
  - Test that `aria-checked` reflects the current sign-off state.
- [ ] Write a snapshot test capturing the full `GatedSpecReviewView` render with mixed signed/unsigned P3 requirements.

## 2. Task Implementation

- [ ] Extend `packages/ui-hooks/src/stores/specReviewStore.ts`:
  - Add state: `signedOffReqIds: Set<string>`.
  - Add actions:
    - `signOff(reqId: string)`: adds `reqId` to the set.
    - `unsignOff(reqId: string)`: removes `reqId` from the set.
    - `isAllP3SignedOff(p3ReqIds: string[]): boolean`: returns `true` if every ID in `p3ReqIds` is in `signedOffReqIds`.
  - Persist `signedOffReqIds` to `localStorage` using Zustand's `persist` middleware keyed by `specDocument.title + '_signoffs'` so sign-offs survive page reload.
- [ ] Update `RequirementBlock.tsx`:
  - Add props: `priority: 'P1' | 'P2' | 'P3'; gateId: string`.
  - Render a `<SignOffCheckbox reqId={reqId} gateId={gateId} priority={priority} />` at the top-right of the block.
- [ ] Create `packages/vscode-webview/src/views/GatedSpecReview/SignOffCheckbox.tsx`:
  - Props: `{ reqId: string; gateId: string; priority: 'P1' | 'P2' | 'P3' }`.
  - Renders:
    ```tsx
    <button
      role="checkbox"
      aria-checked={isSignedOff}
      aria-label={`Sign off ${reqId}`}
      onClick={toggle}
      className={cx('sign-off-checkbox', { checked: isSignedOff, 'p3-required': priority === 'P3' })}
    >
      <codicon name={isSignedOff ? 'pass-filled' : 'circle-large-outline'} />
    </button>
    ```
  - Reads `isSignedOff` from `useSpecReviewStore(s => s.signedOffReqIds.has(reqId))`.
  - `toggle`: calls `signOff(reqId)` or `unsignOff(reqId)` accordingly.
  - Visual style: P3 checkbox has amber `--vscode-charts-orange` accent when unchecked (draws attention); turns green `--vscode-charts-green` when checked.
- [ ] Create `packages/vscode-webview/src/views/GatedSpecReview/SpecSignOffBar.tsx`:
  - Props: `{ gateId: string; p3ReqIds: string[] }`.
  - Fixed bar at the bottom of `GatedSpecReviewView`.
  - Renders:
    - Progress text: `{signedCount} / {total} P3 requirements signed off`
    - A progress bar (filled `--vscode-charts-green`) reflecting percentage of P3 sign-offs.
    - **"Approve Architecture"** button: `disabled={!isAllP3SignedOff(p3ReqIds)}`.
    - On click (when enabled): calls `useHitlGateStore.getState().approveGate(gateId)`.
  - Apply `position: sticky; bottom: 0; z-index: var(--z-navigation, 100)`.
- [ ] Update `GatedSpecReviewView.tsx`:
  - Extract all P3 REQ-IDs from the `specDocument.markdown` (parse `[REQ-ID]` + `priority: P3` markers or receive them as a prop `p3ReqIds: string[]`).
  - Pass `p3ReqIds` and `gateId` to `SpecSignOffBar`.
  - Pass `priority` and `gateId` to each `RequirementBlock`.

## 3. Code Review

- [ ] Verify `role="checkbox"` + `aria-checked` + `aria-label` are all present on `SignOffCheckbox` for screen reader compatibility (per [7_UI_UX_DESIGN-REQ-UI-DES-084]).
- [ ] Confirm `signedOffReqIds` persistence key includes `specDocument.title` to avoid cross-document sign-off bleed.
- [ ] Verify the **"Approve Architecture"** button uses `disabled` HTML attribute (not just CSS `pointer-events: none`) so it is correctly excluded from keyboard tab order when disabled.
- [ ] Confirm that `SpecSignOffBar` uses `z-index: var(--z-navigation, 100)` — NOT a higher z-index layer, since it is not a modal (per [7_UI_UX_DESIGN-REQ-UI-DES-049-Z1]).
- [ ] Check that the progress bar uses `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, and `aria-valuemax="100"` for accessibility.
- [ ] Verify the `Set<string>` in Zustand is serialized correctly for `localStorage` persistence (Zustand `persist` does not natively serialize `Set` — use `Array.from` + `new Set()` in the `serialize`/`deserialize` middleware options).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern="ApprovalCheckboxes"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/ui-hooks test -- --testPathPattern="specReviewStore"` for the extended store tests.
- [ ] Run `pnpm --filter @devs/vscode-webview tsc --noEmit`.

## 5. Update Documentation

- [ ] Update `packages/vscode-webview/src/views/GatedSpecReview/README.md` with a **"Sign-Off Flow"** section: document the P3 sign-off gate mechanic, `SpecSignOffBar` API, and localStorage persistence behavior.
- [ ] Update `docs/agent_memory/phase_11_decisions.md`: "Architecture approval requires all P3 (Must-have) requirement blocks to be signed off. Sign-offs persist to localStorage. SpecSignOffBar is sticky at the bottom of GatedSpecReviewView."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/vscode-webview test --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm coverage threshold.
- [ ] Run `grep -r 'role="checkbox"' packages/vscode-webview/src/views/GatedSpecReview/SignOffCheckbox.tsx` and assert present.
- [ ] Run `grep -r 'aria-checked' packages/vscode-webview/src/views/GatedSpecReview/SignOffCheckbox.tsx` and assert present.
- [ ] Run `grep -r 'disabled' packages/vscode-webview/src/views/GatedSpecReview/SpecSignOffBar.tsx` and assert the button disabled logic is present.
