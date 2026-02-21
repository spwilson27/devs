# Task: Transactional Sign-off Modal — Base Component Scaffold (Sub-Epic: 83_Transactional_Signoff_Diff)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-101]

## 1. Initial Test Written
- [ ] In `packages/webview/src/components/modals/__tests__/TransactionalSignoffModal.test.tsx`, write the following tests **before** implementing the component:
  - **Render test**: Given a `proposal` prop containing `{ id, documentTitle, originalMarkdown, proposedMarkdown, affectedTaskCount }`, assert the modal mounts and renders the document title.
  - **Visibility test**: Assert the modal is hidden when `isOpen={false}` and visible (in the DOM / `role="dialog"`) when `isOpen={true}`.
  - **Accept callback test**: Simulate clicking the "Approve" button and assert `onAccept(proposal.id)` is called exactly once.
  - **Reject callback test**: Simulate clicking the "Reject" button and assert `onReject(proposal.id)` is called exactly once.
  - **Keyboard dismissal test**: Simulate pressing `Escape` and assert `onReject` is called (modal treated as rejected on dismiss).
  - **Focus trap test**: Assert that after opening, the first focusable element inside the modal receives focus, and Tab cycling stays within the modal.
  - **Aria attributes test**: Assert `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the modal title element are present.
  - Use `@testing-library/react` + `jest` + `userEvent` from `@testing-library/user-event`.

## 2. Task Implementation
- [ ] Create `packages/webview/src/components/modals/TransactionalSignoffModal.tsx`:
  - Accept props interface:
    ```ts
    interface TransactionalSignoffModalProps {
      isOpen: boolean;
      proposal: {
        id: string;
        documentTitle: string;
        originalMarkdown: string;
        proposedMarkdown: string;
        affectedTaskCount: number;
      };
      onAccept: (proposalId: string) => void;
      onReject: (proposalId: string) => void;
    }
    ```
  - Render a full-screen overlay (`z-index: var(--z-modal, 300)`) using VSCode design tokens (`--vscode-editorWidget-background`, `--vscode-editorWidget-border`) — **no hardcoded colors**.
  - Modal container: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="signoff-modal-title"`.
  - Header: `<h2 id="signoff-modal-title">` displaying `proposal.documentTitle`, styled at 16px (H2 type-scale).
  - Body: placeholder `<div data-testid="signoff-modal-body" />` (content slots for diff view and risk badge, implemented in subsequent tasks).
  - Footer: "Approve" `<button>` (primary action, VSCode `--vscode-button-*` tokens) and "Reject" `<button>` (secondary, VSCode `--vscode-button-secondaryBackground`).
  - Implement focus trap using a custom `useFocusTrap` hook (`packages/webview/src/hooks/useFocusTrap.ts`): on `isOpen` transition to `true`, collect all focusable descendants, `focus()` the first, and intercept `Tab`/`Shift+Tab` to cycle within the set.
  - Bind `Escape` keydown at window level (via `useEffect`) → call `onReject(proposal.id)`.
  - Early-return `null` when `!isOpen` to avoid rendering hidden DOM.
- [ ] Export the component from `packages/webview/src/components/modals/index.ts`.
- [ ] Create `packages/webview/src/hooks/useFocusTrap.ts` implementing the focus trap described above.

## 3. Code Review
- [ ] Verify **no hardcoded hex/rgb color values** exist in the component; all colors reference `var(--vscode-*)` tokens.
- [ ] Confirm z-index uses the design-token variable `var(--z-modal)` or the literal `300` declared as a CSS custom property — consistent with `[7_UI_UX_DESIGN-REQ-UI-DES-049-Z3]`.
- [ ] Confirm `aria-modal`, `aria-labelledby`, and `role="dialog"` are present and correctly wired.
- [ ] Confirm the focus trap releases event listeners in the `useEffect` cleanup to avoid memory leaks.
- [ ] Confirm `Escape` keydown listener is removed on unmount.
- [ ] Ensure the component is a pure presentational layer — no direct MCP/IPC calls; state is driven entirely by props.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern="TransactionalSignoffModal"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern="useFocusTrap"` if a separate hook test file was created.

## 5. Update Documentation
- [ ] Create `packages/webview/src/components/modals/TransactionalSignoffModal.agent.md` documenting:
  - Component purpose: human-in-the-loop sign-off for mid-implementation TAS changes.
  - Props contract (list each field and its type).
  - Slot structure for `signoff-modal-body` (diff + risk badge inserted by sibling tasks).
  - Focus-trap and keyboard behaviour.
  - Design-token dependencies.
- [ ] Update `packages/webview/src/hooks/useFocusTrap.ts` with a JSDoc comment explaining the trap lifecycle.

## 6. Automated Verification
- [ ] CI step `pnpm --filter @devs/webview test --ci --coverage` must exit 0.
- [ ] Assert coverage for `TransactionalSignoffModal.tsx` and `useFocusTrap.ts` is ≥ 90% (lines) by checking the generated `coverage/lcov.info`.
- [ ] Run `pnpm --filter @devs/webview lint` and confirm zero ESLint errors in the new files.
