# Task: Implement Spec Sign-off Component with Accept/Reject Controls (Sub-Epic: 84_State_Delta_Highlighting)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-087]

## 1. Initial Test Written
- [ ] In `packages/webview/src/components/__tests__/SpecSignOff.test.tsx`, write React Testing Library tests for the `SpecSignOff` component:
  - Test: renders a Markdown block for each `RequirementBlock` in the `blocks` prop using `react-markdown` (per `[6_UI_UX_ARCH-REQ-016]`).
  - Test: each block renders an "Accept" button (`data-testid="accept-btn-{reqId}"`) and a "Reject" button (`data-testid="reject-btn-{reqId}"`).
  - Test: clicking "Accept" calls `onAccept(reqId: string)` prop callback with the correct requirement ID.
  - Test: clicking "Reject" opens a confirmation popover with a text input for a rejection reason.
  - Test: submitting the rejection popover calls `onReject(reqId: string, reason: string)` with the correct arguments.
  - Test: closing the rejection popover without submitting leaves the block status unchanged.
  - Test: an accepted block renders a green check indicator (`data-testid="status-accepted-{reqId}"`) and disables both buttons.
  - Test: a rejected block renders a red cross indicator (`data-testid="status-rejected-{reqId}"`) and disables both buttons.
  - Test: a pending block renders with no status indicator.
  - Test: the component renders a "Submit Review" button (`data-testid="submit-review-btn"`) that is disabled until all blocks have a status (all accepted or rejected).
  - Test: clicking "Submit Review" calls `onSubmitReview()` prop callback.
  - Test: component renders with `role="form"` and `aria-label="Specification Sign-off"` for accessibility.
- [ ] In `packages/webview/src/components/__tests__/SpecSignOff.keyboard.test.tsx`:
  - Test: the "Accept" and "Reject" buttons are reachable via Tab navigation in DOM order.
  - Test: pressing Enter/Space on "Accept" triggers acceptance (same as click).

## 2. Task Implementation
- [ ] Define types in `packages/shared-types/src/specSignOff.ts`:
  - `RequirementBlock`: `{ reqId: string; title: string; markdownContent: string; status: 'pending' | 'accepted' | 'rejected'; rejectionReason?: string }`.
  - `SpecSignOffProps`: `{ documentTitle: string; blocks: RequirementBlock[]; onAccept: (reqId: string) => void; onReject: (reqId: string, reason: string) => void; onSubmitReview: () => void }`.
  - Export from `packages/shared-types/src/index.ts`.
- [ ] Create `packages/webview/src/components/SpecSignOff/SpecSignOff.tsx`:
  - Map over `blocks` prop and render a `<SpecSignOffBlock>` for each.
  - Render a `<button data-testid="submit-review-btn">` at the bottom, disabled when any block has `status: 'pending'`.
  - On click, call `onSubmitReview()`.
  - Wrap in `<form role="form" aria-label="Specification Sign-off">`.
  - Use `React.memo`.
- [ ] Create `packages/webview/src/components/SpecSignOff/SpecSignOffBlock.tsx`:
  - Props: `{ block: RequirementBlock; onAccept: () => void; onReject: (reason: string) => void }`.
  - Renders the `markdownContent` via `<ReactMarkdown>` (per `[6_UI_UX_ARCH-REQ-016]`) inside a `<article>`.
  - Renders Accept and Reject buttons when `block.status === 'pending'`.
  - When Reject is clicked, renders an inline `<RejectionPopover>` with a `<textarea>` for the reason and a "Confirm Reject" button.
  - When `block.status === 'accepted'`, renders `<span data-testid="status-accepted-{block.reqId}">✓ Accepted</span>` and disables buttons.
  - When `block.status === 'rejected'`, renders `<span data-testid="status-rejected-{block.reqId}">✗ Rejected: {block.rejectionReason}</span>` and disables buttons.
  - All button styling via VSCode tokens: Accept uses `--vscode-testing-iconPassed` (green); Reject uses `--vscode-testing-iconFailed` (red).
- [ ] Create `packages/webview/src/components/SpecSignOff/RejectionPopover.tsx`:
  - A focused popover anchored to the Reject button.
  - Contains: `<textarea aria-label="Rejection reason" />` and `<button>Confirm Reject</button>` / `<button>Cancel</button>`.
  - On mount, auto-focus the `<textarea>`.
  - Pressing Escape closes the popover without submitting.
  - Uses `role="dialog"` and `aria-modal="true"`.
- [ ] Create `packages/webview/src/components/SpecSignOff/specSignOff.css`:
  - `.spec-sign-off-block` border-bottom: `1px solid var(--vscode-panel-border)`, padding `12px 0`.
  - `.spec-sign-off-block--accepted` background: `color-mix(in srgb, var(--vscode-testing-iconPassed) 8%, transparent)`.
  - `.spec-sign-off-block--rejected` background: `color-mix(in srgb, var(--vscode-testing-iconFailed) 8%, transparent)`.
  - `.spec-sign-off__btn-accept` and `.spec-sign-off__btn-reject` height `28px`, padding `0 12px` (per `[7_UI_UX_DESIGN-REQ-UI-DES-048-2]`).
  - All colors MUST use `--vscode-*` tokens or CSS `color-mix()` with VSCode tokens.
- [ ] Export `SpecSignOff` from `packages/webview/src/components/index.ts`.

## 3. Code Review
- [ ] Verify `RejectionPopover` uses `role="dialog"` and `aria-modal="true"`, and that focus is trapped within it while open.
- [ ] Verify `onAccept` / `onReject` are called with the exact `reqId` string from the `block` prop (no mutation).
- [ ] Verify the "Submit Review" button is truly disabled (not just visually muted) when any block is pending — check `disabled` attribute, not just CSS.
- [ ] Verify `SpecSignOffBlock` is wrapped in `React.memo` to prevent full re-renders when other blocks' statuses change.
- [ ] Verify all color values in `specSignOff.css` are VSCode tokens or `color-mix()` with VSCode tokens — no hardcoded hex.
- [ ] Verify the markdown content is rendered via `react-markdown` with the CSP-safe sanitization settings consistent with the project's `MermaidHost` and `ThoughtStreamer` implementations.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern=SpecSignOff` — all component and keyboard tests pass.
- [ ] Run `pnpm --filter @devs/webview build` — bundle builds with no errors.
- [ ] Run `pnpm --filter @devs/webview tsc --noEmit` — zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/shared-types tsc --noEmit` — `RequirementBlock` and related types resolve cleanly.

## 5. Update Documentation
- [ ] Add JSDoc to `SpecSignOff`, `SpecSignOffBlock`, and `RejectionPopover` describing props and accessibility contract.
- [ ] Update `packages/webview/AGENTS.md` with a new section "SpecSignOff Component" documenting:
  - The `RequirementBlock` data model.
  - The accept/reject/submit lifecycle.
  - Accessibility requirements (focus trap, ARIA roles).
  - Color token usage conventions.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview test --coverage -- --testPathPattern=SpecSignOff` and confirm ≥ 90% line coverage for `SpecSignOff.tsx`, `SpecSignOffBlock.tsx`, and `RejectionPopover.tsx`.
- [ ] Grep `specSignOff.css` for `#[0-9a-fA-F]` and `rgb(` — confirm zero matches.
- [ ] Run `pnpm test` from repo root — full test suite passes without regressions.
