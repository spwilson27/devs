# Task: Implement Priority Acknowledgement Badge in ThoughtStreamer (Sub-Epic: 80_Priority_Toggle_Feedback)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-091]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/ThoughtStreamer/__tests__/DirectiveBadge.test.tsx`, write unit tests using Vitest + React Testing Library:
  - **No-badge default test**: Render a `<ThoughtEntry>` with `type: 'thought'` and assert **no** badge element with `data-testid="directive-badge"` is rendered.
  - **Pending badge test**: Render a `<ThoughtEntry>` with `type: 'directive'`, `priority: 'immediate'`, `status: 'pending'`, and assert a badge element with text "Pivot Pending" (or equivalent) and CSS class `directive-badge--pending` is rendered.
  - **Acknowledged badge test**: Render with `status: 'acknowledged'` and `priority: 'immediate'`, assert the badge text changes to "Pivot Acknowledged" and has CSS class `directive-badge--acknowledged`.
  - **Normal priority badge test**: Render with `priority: 'normal'` and `status: 'acknowledged'`, assert the badge reads "Directive Received" (a lower-urgency acknowledgement) and uses a distinct CSS class `directive-badge--normal`.
  - **Error state badge test**: Render with `status: 'error'`, assert the badge text is "Directive Failed" and has class `directive-badge--error`.
  - **ARIA role test**: Assert the badge element has `role="status"` and `aria-live="polite"`, so screen readers announce status changes.
  - **Accessibility contrast test**: Using a color-contrast utility (e.g., `axe-core` integration), assert badge color combinations meet WCAG 2.1 AA (4.5:1) contrast ratio for each status variant.
- [ ] In `packages/vscode/src/webview/components/ThoughtStreamer/__tests__/ThoughtStreamerBadgeIntegration.test.tsx`, write an integration test:
  - Simulate the full lifecycle: directive appended with `status: 'pending'` → badge shows "Pivot Pending" → store updated to `status: 'acknowledged'` → badge transitions to "Pivot Acknowledged" without a full re-render of the surrounding log.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/components/ThoughtStreamer/DirectiveBadge.tsx`:
  - Props: `priority: 'normal' | 'immediate'`, `status: 'pending' | 'acknowledged' | 'error'`.
  - Render a `<span>` with `data-testid="directive-badge"`, `role="status"`, and `aria-live="polite"`.
  - Compute badge label and CSS class based on `priority` + `status` combination:
    | priority    | status       | label                  | CSS class                       |
    |-------------|--------------|------------------------|---------------------------------|
    | immediate   | pending      | "⚡ Pivot Pending"     | `directive-badge--immediate-pending` |
    | immediate   | acknowledged | "✓ Pivot Acknowledged" | `directive-badge--immediate-ack` |
    | immediate   | error        | "✗ Directive Failed"   | `directive-badge--error`         |
    | normal      | pending      | "· Sending…"           | `directive-badge--normal-pending`|
    | normal      | acknowledged | "✓ Directive Received" | `directive-badge--normal-ack`    |
    | normal      | error        | "✗ Directive Failed"   | `directive-badge--error`         |
  - Use VSCode design tokens for badge colors:
    - Pending: `var(--vscode-editorWarning-foreground)` on `var(--vscode-editorWarning-background)`.
    - Acknowledged: `var(--vscode-editorInfo-foreground)` on `var(--vscode-editorInfo-background)`.
    - Error: `var(--vscode-editorError-foreground)` on `var(--vscode-editorError-background)`.
  - Badge must meet minimum 24px height and use `font-size: 11px` (Metadata scale per `[7_UI_UX_DESIGN-REQ-UI-DES-033-6]`).
- [ ] In `packages/vscode/src/webview/components/ThoughtStreamer/ThoughtEntry.tsx`, integrate `<DirectiveBadge>`:
  - Conditionally render `<DirectiveBadge priority={entry.priority} status={entry.status} />` only when `entry.type === 'directive'`.
  - Place the badge inline after the directive text, right-aligned within the entry row.
- [ ] Add CSS in `packages/vscode/src/webview/styles/components/ThoughtStreamer.css` for all badge variant classes, using only `var(--vscode-*)` tokens. Include a subtle `transition: background-color 150ms ease` for the status change animation (functional motion, per `[7_UI_UX_DESIGN-REQ-UI-DES-006-1]`), but wrap it in `@media (prefers-reduced-motion: no-preference)` to respect reduced motion settings.
- [ ] Export `DirectiveBadge` from `packages/vscode/src/webview/components/ThoughtStreamer/index.ts`.

## 3. Code Review
- [ ] Verify `DirectiveBadge` has **no** hardcoded hex/rgb color values — only `var(--vscode-*)` tokens.
- [ ] Verify `role="status"` and `aria-live="polite"` are present on the badge element.
- [ ] Verify the status transition animation is guarded by `@media (prefers-reduced-motion: no-preference)`.
- [ ] Verify `DirectiveBadge` is only rendered when `entry.type === 'directive'`, never for `type: 'thought'` or `type: 'tool_call'`.
- [ ] Verify badge text content is meaningful and communicates the current agent state without ambiguity.
- [ ] Verify font-size uses the Metadata scale (11px / `var(--vscode-font-size)` equivalent).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DirectiveBadge|ThoughtStreamerBadgeIntegration"` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="DirectiveBadge"` and confirm line and branch coverage ≥ 90% for `DirectiveBadge.tsx`.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="ThoughtEntry"` to confirm existing `ThoughtEntry` tests still pass after the integration.

## 5. Update Documentation
- [ ] In `packages/vscode/src/webview/components/ThoughtStreamer/README.md` (create if absent), add a section describing `DirectiveBadge`: its props, status/priority matrix, ARIA semantics, and VSCode token usage.
- [ ] Update `specs/agent_memory/phase_11_decisions.md` with: "ThoughtStreamer entries with `type: 'directive'` render a `DirectiveBadge` that reflects `status` ('pending' | 'acknowledged' | 'error') and `priority` ('normal' | 'immediate'). Badge uses VSCode semantic tokens and includes `role='status'` / `aria-live='polite'` for screen reader compatibility."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DirectiveBadge|ThoughtStreamerBadgeIntegration" --reporter=json > /tmp/badge_test_results.json` and assert `"numFailedTests": 0`.
- [ ] Run `grep -rn "role=\"status\"" packages/vscode/src/webview/components/ThoughtStreamer/DirectiveBadge.tsx` and assert exactly **one** match.
- [ ] Run `grep -rn "hardcoded\|#[0-9a-fA-F]\{3,6\}\|rgb(" packages/vscode/src/webview/components/ThoughtStreamer/DirectiveBadge.tsx` and assert **no matches** (no hardcoded colors).
- [ ] Run `grep -rn "prefers-reduced-motion" packages/vscode/src/webview/styles/components/ThoughtStreamer.css` and assert at least **one** match (reduced motion guard exists).
