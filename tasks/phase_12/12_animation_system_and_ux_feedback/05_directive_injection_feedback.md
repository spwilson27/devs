# Task: Implement Directive Injection Feedback – "Whisper" Confirmation (Sub-Epic: 12_Animation System and UX Feedback)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-054], [7_UI_UX_DESIGN-REQ-UI-DES-054-1], [7_UI_UX_DESIGN-REQ-UI-DES-054-2], [7_UI_UX_DESIGN-REQ-UI-DES-054-3]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/DirectiveInjectedBadge.test.tsx`, write Vitest + React Testing Library tests:
  - Test: `DirectiveInjectedBadge` renders `null` when `isVisible=false`.
  - Test: `DirectiveInjectedBadge` renders a badge with text "Directive Injected" when `isVisible=true`.
  - Test: The badge container has `position: fixed` or `position: absolute` style and is positioned at the top-right of the Console View.
  - Test: When `isVisible` becomes `true`, the badge has CSS class `directive-badge--slide-in`.
  - Test: Using fake timers, after 3000ms the badge transitions to `opacity: 0` (has class `directive-badge--fading`).
  - Test: After an additional 500ms (total 3500ms), the badge has `display: none` or is removed from the DOM (`isVisible` callback fires).
  - Test: Snapshot test for the badge in the visible state.
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/ThoughtBlock.directiveHighlight.test.tsx`:
  - Test: `ThoughtBlock` with `isDirectiveResponse=true` applies CSS class `thought-block--directive-highlight` (light-blue border).
  - Test: `ThoughtBlock` with `isDirectiveResponse=false` does NOT have the class.
  - Test: The `thought-block--directive-highlight` class is a one-time decoration – after a single render cycle of the next block, it should NOT persist on subsequent thought blocks (test by rendering two consecutive ThoughtBlocks and verify only the second has the highlight).
- [ ] In `packages/webview-ui/src/hooks/__tests__/useDirectiveInjection.test.ts`:
  - Mock `EventBus` from `@devs/core`.
  - Test: Hook returns `{ badgeVisible: false, nextThoughtIsDirectiveResponse: false }` initially.
  - Test: On `DIRECTIVE_INJECTED` event, hook returns `{ badgeVisible: true, nextThoughtIsDirectiveResponse: true }`.
  - Test: After 3500ms (fake timers), `badgeVisible` becomes `false`.
  - Test: After `AGENT_THOUGHT_STREAM` event fires once (following `DIRECTIVE_INJECTED`), `nextThoughtIsDirectiveResponse` resets to `false` (one-time only).
  - Test: Hook unsubscribes on unmount.

## 2. Task Implementation
- [ ] **CSS Keyframes** – In `packages/webview-ui/src/styles/animations.css`, add:
  ```css
  /* Directive Injected Badge – slide in from top-right */
  @keyframes directive-badge-in {
    from { transform: translateY(-20px); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
  }

  .directive-badge--slide-in {
    animation: directive-badge-in 300ms ease-out forwards;
  }

  .directive-badge--fading {
    transition: opacity 500ms ease-out;
    opacity: 0;
  }

  /* Directive Response Thought Block Highlight */
  .thought-block--directive-highlight {
    border: 1px solid var(--devs-info, #38bdf8); /* light-blue */
    border-radius: 4px;
  }
  ```
- [ ] **`DirectiveInjectedBadge` Component** – Create `packages/webview-ui/src/components/AgentConsole/DirectiveInjectedBadge.tsx`:
  - Accept props: `{ isVisible: boolean; onDismissed: () => void }`.
  - Internal state: `phase: 'hidden' | 'visible' | 'fading'`.
  - When `isVisible` changes to `true`:
    1. Set `phase = 'visible'`, apply `directive-badge--slide-in`.
    2. After `3000ms` (via `setTimeout`), set `phase = 'fading'`, apply `directive-badge--fading`.
    3. After an additional `500ms`, call `onDismissed()`.
  - Render: `null` when `phase === 'hidden'`; otherwise render `<div className="directive-injected-badge directive-badge--slide-in [directive-badge--fading]">Directive Injected</div>` positioned at `top: 16px; right: 16px; position: absolute` within the Console View container.
  - Store all `setTimeout` refs in `useRef` and clear them in `useEffect` cleanup.
- [ ] **`ThoughtBlock` Component** – In `packages/webview-ui/src/components/AgentConsole/ThoughtBlock.tsx`:
  - Accept `isDirectiveResponse: boolean` prop.
  - Apply `thought-block--directive-highlight` class when `isDirectiveResponse` is `true`.
  - The class is a one-time decoration: the parent must only set `isDirectiveResponse=true` for a single render of the immediately following thought block after a directive injection.
- [ ] **`useDirectiveInjection` Hook** – Create `packages/webview-ui/src/hooks/useDirectiveInjection.ts`:
  - Subscribe to `DIRECTIVE_INJECTED` → set `badgeVisible = true`, `nextThoughtIsDirectiveResponse = true`.
  - Subscribe to `AGENT_THOUGHT_STREAM` → if `nextThoughtIsDirectiveResponse` is `true`, reset it to `false` (consumed one-time).
  - After badge visibility timer resolves (managed internally via `badgeVisible` → false), the hook updates accordingly.
  - Return `{ badgeVisible: boolean; nextThoughtIsDirectiveResponse: boolean; onBadgeDismissed: () => void }`.
  - `onBadgeDismissed` sets `badgeVisible = false`.
  - Unsubscribe all handlers on cleanup.
- [ ] **Wire into AgentConsole** – In `packages/webview-ui/src/components/AgentConsole/AgentConsole.tsx`:
  - Call `useDirectiveInjection()`.
  - Render `<DirectiveInjectedBadge isVisible={badgeVisible} onDismissed={onBadgeDismissed} />` inside the Console View container.
  - Pass `isDirectiveResponse={nextThoughtIsDirectiveResponse}` to the most recently rendered `ThoughtBlock`.

## 3. Code Review
- [ ] Confirm badge slide-in offset is `+20px Y` (slides DOWN from 20px above) → `translateY(-20px)` to `translateY(0)` is correct.
- [ ] Confirm badge is positioned at the top-right using `position: absolute` within the Console View (not fixed to the viewport).
- [ ] Confirm badge persistence is exactly `3000ms` visible + `500ms` fade = `3500ms` total before removal.
- [ ] Confirm `thought-block--directive-highlight` uses a `light-blue border` (`var(--devs-info)` or `#38bdf8`) and is applied ONLY to the NEXT thought block (one-time), not all subsequent blocks.
- [ ] Verify the `nextThoughtIsDirectiveResponse` flag resets after the FIRST `AGENT_THOUGHT_STREAM` event following a `DIRECTIVE_INJECTED` event – it must not persist to a second thought block.
- [ ] Ensure `setTimeout` refs are all cleaned up in `useEffect` destructors.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run DirectiveInjectedBadge` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run ThoughtBlock.directiveHighlight` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run useDirectiveInjection` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run` and confirm no regressions.

## 5. Update Documentation
- [ ] Add a section `### Directive Injection Feedback ("Whisper" Confirmation)` to `packages/webview-ui/docs/animations.md` documenting:
  - Badge behavior: slide-in from top-right, 3000ms visible, 500ms fade.
  - Triggering EventBus event: `DIRECTIVE_INJECTED`.
  - Next thought highlight: one-time `thought-block--directive-highlight` (light-blue border) on the immediately following `AGENT_THOUGHT_STREAM` block.
  - CSS classes: `directive-badge--slide-in`, `directive-badge--fading`, `thought-block--directive-highlight`.
- [ ] Update `CHANGELOG.md` with: `feat: add Directive Injection Feedback badge and next-thought highlight animations`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run --reporter=json > /tmp/directive_feedback_results.json` and verify exit code `0`.
- [ ] Assert `"numFailedTests": 0` via `node -e "const r=require('/tmp/directive_feedback_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm exit code `0`.
