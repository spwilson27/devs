# Task: Build DirectiveConfirmationBadge Component with Slide-In Animation (Sub-Epic: 81_Directive_Visual_Confirm)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-054-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/DirectiveConfirmationBadge/DirectiveConfirmationBadge.test.tsx`, write the following tests using Vitest + React Testing Library:
  - **Render test**: Assert that when `visible={true}` is passed, the badge renders with the text `"Directive Injected"`.
  - **Hidden test**: Assert that when `visible={false}`, the badge is not present in the DOM (or has `aria-hidden="true"`).
  - **Slide-in position test**: Assert that when first rendered with `visible={true}`, the component's outermost element has an initial CSS transform of `translateY(20px)` (or equivalent inline style / CSS class), and that after the entrance animation class is applied it transitions to `translateY(0)`.
  - **Position test**: Assert that the badge is absolutely positioned at the top-right of its containing element (verify via `getComputedStyle` or class-name assertions).
  - **ARIA test**: Assert the badge has `role="status"` and `aria-live="polite"`.
- [ ] All tests must fail (red) before implementation begins.

## 2. Task Implementation
- [ ] Create the directory `packages/webview-ui/src/components/DirectiveConfirmationBadge/`.
- [ ] Create `DirectiveConfirmationBadge.tsx`:
  - Accept props: `visible: boolean`.
  - When `visible` is `true`, render a `<div>` with:
    - Absolute positioning anchored to top-right: `position: absolute; top: 12px; right: 12px;`
    - Tailwind classes (or CSS module): `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium shadow-md`
    - Background: `bg-[var(--vscode-notificationsInfoIcon-foreground)]` at low opacity via `color-mix(in srgb, var(--vscode-notificationsInfoIcon-foreground) 15%, var(--vscode-editor-background))` — this satisfies REQ-UI-DES-013 glass-box principle, applied here for thematic consistency.
    - A VSCode Codicon prefix: `<i className="codicon codicon-check" aria-hidden="true" />` followed by the text node `"Directive Injected"`.
    - `role="status"` and `aria-live="polite"` on the outer div.
  - Entrance animation: apply a CSS class `directive-badge--enter` on mount when `visible=true` that sets:
    ```css
    @keyframes directive-badge-slide-in {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .directive-badge--enter {
      animation: directive-badge-slide-in 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    ```
  - When `visible` is `false`, render `null` (unmount to prevent stale ARIA announcements).
- [ ] Create `DirectiveConfirmationBadge.css` (or add to the component's CSS module) with the keyframe and class defined above.
- [ ] Export the component from `packages/webview-ui/src/components/index.ts`.

## 3. Code Review
- [ ] Verify the animation duration is exactly 200ms and uses `cubic-bezier(0.4, 0, 0.2, 1)` easing (Anti-Magic Rule REQ-UI-DES-006-2 compliance).
- [ ] Verify the component uses only VSCode design tokens (`--vscode-*`) for colors — no hardcoded hex/rgb values.
- [ ] Verify the Codicon class follows the required `codicon codicon-<name>` prefix pattern.
- [ ] Verify `role="status"` and `aria-live="polite"` are present.
- [ ] Verify no decorative-only slide animations exist outside of the entrance transition (Anti-Magic Rule).
- [ ] Verify the component is pure/memoized (`React.memo`) to prevent unnecessary re-renders.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="DirectiveConfirmationBadge"` and confirm all tests pass (green).
- [ ] Run the full webview-ui test suite: `pnpm --filter @devs/webview-ui test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/components/DirectiveConfirmationBadge/DirectiveConfirmationBadge.agent.md` with:
  - Component purpose and responsibility.
  - Props API table (`visible: boolean`).
  - Animation spec: `200ms cubic-bezier(0.4,0,0.2,1)` slide-in from `+20px Y-offset`.
  - Note: component is controlled (stateless); parent is responsible for `visible` state lifecycle.
  - Covered requirements: `7_UI_UX_DESIGN-REQ-UI-DES-054-1`.
- [ ] Update `packages/webview-ui/src/components/index.ts` export list in the module's `.agent.md` if one exists.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --reporter=json --outputFile=test-results/directive-badge.json` and assert the JSON output contains zero `failed` tests for `DirectiveConfirmationBadge`.
- [ ] Run `pnpm --filter @devs/webview-ui build` to confirm TypeScript compilation succeeds with no errors related to the new component.
