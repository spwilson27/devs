# Task: Implement ReqBadge Hoverable Component with PRD Link (Sub-Epic: 95_Requirement_SAOP_Models)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-019]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/__tests__/ReqBadge.test.tsx`, write React Testing Library unit tests for a `<ReqBadge>` component before implementing it:
  - **Renders badge text**: Render `<ReqBadge id="6_UI_UX_ARCH-REQ-019" />`. Assert the element with text `"REQ-019"` (short form) is present in the DOM.
  - **Has tooltip on hover**: Simulate `mouseenter` on the badge. Assert a tooltip element appears in the DOM containing the full REQ-ID `"6_UI_UX_ARCH-REQ-019"`.
  - **Tooltip dismisses on mouseleave**: After simulating `mouseenter`, simulate `mouseleave`. Assert the tooltip is no longer visible (`toBeVisible()` → false or `not.toBeInTheDocument()`).
  - **Link navigation**: The badge should render as a `<button>` (not `<a>`) that, when clicked, calls the `onNavigate` callback prop with the REQ-ID string. Assert this with a mock function: `expect(onNavigate).toHaveBeenCalledWith("6_UI_UX_ARCH-REQ-019")`.
  - **Keyboard accessibility**: Simulate `focus` and `keydown` with `key: "Enter"` on the badge. Assert `onNavigate` is called.
  - **Keyboard accessibility**: Simulate `keydown` with `key: " "` (Space). Assert `onNavigate` is called.
  - **ARIA attributes**: Assert the badge has `role="button"`, `aria-label` containing the full REQ-ID, and `tabIndex={0}`.
  - **VSCode token styling**: Assert the rendered badge element has a class or inline style referencing `--vscode-badge-background` or `--vscode-badge-foreground` (confirm the token name matches the VSCode design token spec for badges).
  - **No hardcoded colors**: Assert the component does NOT have any hex color (`#[0-9a-fA-F]{3,6}`) or `rgb(` values in its inline styles.
- [ ] In `packages/webview-ui/src/components/__tests__/ThoughtRenderer.test.tsx`, write tests for a `<ThoughtRenderer>` component:
  - **Plain text renders as-is**: Input `"No req ids here"` → assert no badge elements are rendered.
  - **Mixed content**: Input `"Implementing [TAS-102] per spec"` → assert the string is split with `"Implementing "` as a text node, a `<ReqBadge id="TAS-102" />`, and `" per spec"` as a text node.
  - **Multiple badges**: Input `"[1_PRD-REQ-INT-002] and [TAS-029]"` → assert two `<ReqBadge>` elements are rendered.
  - **onNavigate propagation**: Clicking a badge in `<ThoughtRenderer>` calls the `onNavigate` prop of `<ThoughtRenderer>`.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/ReqBadge.tsx`:
  ```tsx
  interface ReqBadgeProps {
    id: string;              // Full REQ-ID e.g. "6_UI_UX_ARCH-REQ-019"
    onNavigate: (id: string) => void;
  }
  ```
  - Render a `<button>` element (not an `<a>` tag, as navigation is mediated via `postMessage` to the extension host, not the browser router).
  - Display a shortened label: extract the final segment after the last `-REQ-` prefix. E.g., `"6_UI_UX_ARCH-REQ-019"` → display `"REQ-019"`.
  - Style using exclusively VSCode design tokens: background `var(--vscode-badge-background)`, foreground `var(--vscode-badge-foreground)`, border-radius `2px`, font-size `var(--vscode-font-size)` scaled to `10px`, padding `1px 4px`.
  - On hover (`onMouseEnter`/`onMouseLeave`) or focus, show a tooltip `<div>` positioned above the badge containing: the full REQ-ID (e.g., `"6_UI_UX_ARCH-REQ-019"`).
  - On `click` or `keydown` (Enter or Space), call `onNavigate(id)`.
  - Add `aria-label={`Requirement ${id}`}` and `role="button"` and `tabIndex={0}`.
  - The tooltip must be rendered into a portal (`ReactDOM.createPortal`) attached to `document.body` to avoid clipping inside `overflow: hidden` scroll containers.
- [ ] Create `packages/webview-ui/src/components/ThoughtRenderer.tsx`:
  ```tsx
  interface ThoughtRendererProps {
    content: string;
    onNavigate: (reqId: string) => void;
  }
  ```
  - Calls `splitThoughtByReqIds(content)` from `@devs/ui-hooks`.
  - Renders the resulting `ThoughtSegment[]`: `TextSegment` → `<span>{value}</span>`; `ReqIdSegment` → `<ReqBadge id={id} onNavigate={onNavigate} />`.
  - Wrap the whole output in a `<span>` with `aria-label="Agent thought"`.
- [ ] Wire up the `onNavigate` handler in the extension host bridge (`packages/vscode/src/webview/bridge.ts` or equivalent):
  - When called with a REQ-ID string, post a `vscode.postMessage({ type: "NAVIGATE_TO_REQ", reqId })` message to the extension host.
  - The extension host handler should open the relevant spec file (e.g., `specs/1_prd.md`) in a VSCode text editor tab, scrolled to the line containing the REQ-ID.

## 3. Code Review
- [ ] Verify `ReqBadge` has zero hardcoded color values — all styling uses `var(--vscode-*)` tokens.
- [ ] Verify the tooltip portal is attached to `document.body` and correctly cleaned up when the component unmounts.
- [ ] Verify `ThoughtRenderer` is a pure presentational component — no internal state beyond tooltip visibility (which belongs in `ReqBadge`).
- [ ] Verify that pressing Tab moves focus between badges in a thought that contains multiple REQ-IDs.
- [ ] Verify the extension host `NAVIGATE_TO_REQ` handler resolves file paths relative to the workspace root, not an absolute system path.
- [ ] Verify that `ThoughtRenderer` does not call `splitThoughtByReqIds` on every render — memoize with `useMemo` keyed on `content`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test` and confirm all tests in `ReqBadge.test.tsx` and `ThoughtRenderer.test.tsx` pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview-ui typecheck` and confirm zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/webview-ui test --coverage` and confirm `ReqBadge.tsx` has ≥ 90% line coverage.

## 5. Update Documentation
- [ ] Add JSDoc to `ReqBadge` and `ThoughtRenderer` components referencing `[6_UI_UX_ARCH-REQ-019]` and `[6_UI_UX_ARCH-REQ-015]`.
- [ ] Update `packages/webview-ui/ui-webview.agent.md` (create if absent) with: "`ReqBadge` renders hoverable REQ-ID badges in thought text. Clicking sends `NAVIGATE_TO_REQ` postMessage to extension host. Navigation handled by `bridge.ts`."
- [ ] Update `packages/webview-ui/README.md` with a "Requirement Badges" section documenting the `onNavigate` contract.

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/webview-ui test --reporter=json > /tmp/req_badge_test_results.json` and verify exit code is `0`.
- [ ] Execute `cat /tmp/req_badge_test_results.json | jq '.numFailedTests'` and assert the value is `0`.
- [ ] Execute `pnpm --filter @devs/webview-ui test --coverage --reporter=json > /tmp/req_badge_coverage.json` and assert `ReqBadge.tsx` line coverage is ≥ 90%.
- [ ] Manually (or via a Playwright E2E test in `packages/e2e/`): render a thought containing `[6_UI_UX_ARCH-REQ-019]`, hover the badge, and assert the tooltip text `"6_UI_UX_ARCH-REQ-019"` is visible in the DOM.
