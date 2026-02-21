# Task: HITL Approval Modal Popup Component (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [1_PRD-REQ-INT-010], [4_USER_FEATURES-REQ-009]

## 1. Initial Test Written

- [ ] Create `packages/vscode-webview/src/__tests__/HitlApprovalModal.test.tsx`.
- [ ] Write React Testing Library (RTL) unit tests:
  - Test that the modal does NOT render when `activeGateId` is `null` in the Zustand store.
  - Test that the modal renders with the correct `title` and `description` (rendered as Markdown) when `activeGateId` is set.
  - Test that clicking the **"Approve"** button calls `approveGate(gateId)` on the store.
  - Test that clicking the **"Reject"** button reveals a rejection reason `<textarea>` and the **"Confirm Rejection"** button.
  - Test that the **"Confirm Rejection"** button is disabled when the rejection `<textarea>` is empty.
  - Test that submitting a non-empty rejection reason calls `rejectGate(gateId, reason)`.
  - Test that pressing `Escape` calls `dismissGate(gateId)` for `ADVISORY` gates but does NOT dismiss `BLOCKING` gates.
  - Test that the modal renders with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the title element.
  - Test that focus is trapped inside the modal when it is open (use `@testing-library/user-event` tab key cycling).
- [ ] Write a Storybook story (`HitlApprovalModal.stories.tsx`) with three states: `BLOCKING_GATE`, `ADVISORY_GATE`, `REJECTION_IN_PROGRESS`.

## 2. Task Implementation

- [ ] Create `packages/vscode-webview/src/components/HitlApprovalModal/HitlApprovalModal.tsx`:
  - Consume `useHitlGateStore` to get `activeGateId` and the active gate entry.
  - Render `null` when `activeGateId` is null.
  - Render a modal overlay with `z-index: var(--z-modal, 300)` (per [7_UI_UX_DESIGN-REQ-UI-DES-049-Z3]).
  - Use `--vscode-*` CSS custom properties exclusively; no hardcoded colors (per [6_UI_UX_ARCH-REQ-004]).
  - Implement the modal structure:
    ```
    <div role="dialog" aria-modal="true" aria-labelledby="hitl-modal-title">
      <header>
        <codicon name="warning" /> {title}          ← Bold System UI, --devs-primary color
        <span class="checkpoint-badge">Phase {checkpointPhase}</span>
      </header>
      <section class="description">
        <ReactMarkdown>{description}</ReactMarkdown>  ← react-markdown
      </section>
      <footer>
        <button id="btn-approve">Approve</button>
        <button id="btn-reject">Reject…</button>
        {priority === 'ADVISORY' && <button id="btn-dismiss">Dismiss</button>}
      </footer>
    </div>
    ```
  - Implement `RejectionReasonPanel` as a sub-component (collapsible, rendered inside the footer when "Reject…" is clicked):
    - `<textarea placeholder="Describe why this gate is being rejected…" />`
    - `<button disabled={reason.trim() === ''}>Confirm Rejection</button>`
  - Implement focus trap using a `useFocusTrap` hook (create in `packages/ui-hooks/src/hooks/useFocusTrap.ts`).
  - On mount, focus the **"Approve"** button; on unmount, restore focus to the previously focused element.
  - Attach `keydown` listener: `Escape` → `dismissGate` if `ADVISORY`; do nothing if `BLOCKING`.
- [ ] Add `HitlApprovalModal` to the root Webview app (`packages/vscode-webview/src/App.tsx`) as a portal rendered outside the main layout tree using `ReactDOM.createPortal`.
- [ ] Add CSS in `packages/vscode-webview/src/components/HitlApprovalModal/HitlApprovalModal.module.css`:
  - Overlay: `position: fixed; inset: 0; background: color-mix(in srgb, var(--vscode-editor-background) 60%, transparent); backdrop-filter: blur(4px);`
  - Modal card: `border-radius: 4px; border: 1px solid var(--vscode-panel-border); box-shadow: var(--shadow-md);` (per [7_UI_UX_DESIGN-REQ-UI-DES-047]).
  - Animate in with a `scale(0.95) → scale(1)` + `opacity: 0 → 1` transition of `150ms ease-out` (functional motion, per [7_UI_UX_DESIGN-REQ-UI-DES-006]).

## 3. Code Review

- [ ] Verify no hardcoded colors exist in the component or its CSS — all colors MUST use `var(--vscode-*)` or `var(--devs-*)` tokens.
- [ ] Confirm the `role="dialog"` + `aria-modal="true"` + `aria-labelledby` triad is present for accessibility (per [7_UI_UX_DESIGN-REQ-UI-DES-084]).
- [ ] Confirm focus trap implementation does not leak event listeners after modal closes (check via `removeEventListener` in cleanup).
- [ ] Verify `ReactDOM.createPortal` is used (modal must not be a child of a CSS `transform` or `overflow: hidden` ancestor).
- [ ] Confirm the `Escape` key behavior correctly differentiates `BLOCKING` vs `ADVISORY` gate types.
- [ ] Check z-index uses the design token `--z-modal` (300) as specified in [7_UI_UX_DESIGN-REQ-UI-DES-049-Z3].

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern="HitlApprovalModal"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode-webview tsc --noEmit` to verify no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Add entry in `packages/vscode-webview/src/components/README.md` under a **"HITL Components"** heading documenting `HitlApprovalModal` props, accessibility requirements, and portal placement.
- [ ] Update `docs/agent_memory/phase_11_decisions.md`: "HitlApprovalModal is rendered as a React portal in App.tsx root. It uses focus trap and restores focus on close. BLOCKING gates cannot be dismissed via Escape."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/vscode-webview test --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm coverage threshold passes.
- [ ] Run `grep -r 'role="dialog"' packages/vscode-webview/src/components/HitlApprovalModal/` and assert the attribute is present.
- [ ] Run `grep -r 'createPortal' packages/vscode-webview/src/App.tsx` and assert the portal usage is present.
