# Task: Aria-Live Polite Region for Agent Thought Announcements (Sub-Epic: 14_Loop Detection and Accessibility)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-140-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/a11y/__tests__/LiveRegion.polite.test.tsx`, write RTL unit tests covering:
  - A `<LiveRegion politeness="polite">` component renders a `<div>` (or `<span>`) with `aria-live="polite"`, `aria-atomic="true"`, and `role="status"`.
  - The live region element is visually hidden by default (using a visually-hidden CSS utility class, not `display:none` or `visibility:hidden`, to keep it accessible to screen readers).
  - When the `message` prop changes, the new text content is present in the DOM within the live region element.
  - When `message` is an empty string, the live region is empty (so screen readers don't re-announce stale content).
  - The component accepts an optional `id` prop for labelling purposes.
- [ ] In `packages/webview-ui/src/components/console/__tests__/AgentConsole.a11y.test.tsx`, write an integration test:
  - The `<AgentConsole>` component renders a polite `<LiveRegion>` with `id="agent-thoughts-live"` in its subtree.
  - When a new thought event is received (mock the EventBus or pass via props), the `<LiveRegion>`'s `message` updates to the new thought text (verifiable via `getByRole('status')` and `textContent`).
  - The live region is NOT updated by tool-call / action events (only by thought/reasoning events), ensuring low noise.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/a11y/LiveRegion.tsx`:
  - Props: `{ message: string; politeness: 'polite' | 'assertive'; id?: string; className?: string }`.
  - Renders: `<div id={id} role={politeness === 'polite' ? 'status' : 'alert'} aria-live={politeness} aria-atomic="true" className={cx(styles.visuallyHidden, className)}>`.
  - Apply the `message` as children (text content).
  - Use a `useEffect` that briefly sets message to `''` then back to the new value when `message` changes to force screen reader re-announcement (debounce pattern with a 50ms reset delay via `setTimeout`).
- [ ] Create `packages/webview-ui/src/components/a11y/LiveRegion.module.css`:
  - `.visuallyHidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }`.
- [ ] Export `LiveRegion` from `packages/webview-ui/src/components/a11y/index.ts` (create the index file if absent).
- [ ] In `packages/webview-ui/src/components/console/AgentConsole.tsx`:
  - Add state: `const [latestThought, setLatestThought] = useState('')`.
  - Subscribe to the EventBus `thought:received` event (or equivalent) and call `setLatestThought(event.payload.content)`.
  - Render `<LiveRegion id="agent-thoughts-live" politeness="polite" message={latestThought} />` inside the component (after the main visible content so it doesn't affect visual layout).

## 3. Code Review
- [ ] Verify the `<LiveRegion>` uses `role="status"` for polite (not `role="alert"`) per ARIA spec.
- [ ] Confirm the visually-hidden CSS class uses the correct off-screen technique (clipping), NOT `display:none` or `visibility:hidden` which would hide content from screen readers.
- [ ] Verify the 50ms debounce reset pattern is used to ensure the screen reader re-announces unchanged repeated messages (e.g., if two consecutive thoughts have the same content).
- [ ] Confirm the `LiveRegion` component is generic/reusable and has no hard-coded business logic (only presentation).
- [ ] Verify `AgentConsole` only updates the live region for thought events and not for tool-call or other event types.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=LiveRegion.polite` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=AgentConsole.a11y` and confirm all tests pass.
- [ ] Run the full webview-ui test suite: `pnpm --filter @devs/webview-ui test --ci` and confirm no regressions.

## 5. Update Documentation
- [ ] Create or update `docs/ui/accessibility.md` with a section `### Aria-Live Regions` explaining:
  - The `LiveRegion` component and its props.
  - When to use `polite` vs. `assertive` (reference REQ-140-1 and REQ-140-2).
  - The debounce re-announcement pattern and why it is needed.
- [ ] Add `LiveRegion` to the component storybook (if Storybook is configured) with stories for polite and assertive variants.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --ci --forceExit` and assert exit code `0`.
- [ ] Run `grep -rn "aria-live=\"polite\"" packages/webview-ui/src/` to confirm the rendered output contains a polite live region.
- [ ] Run `grep -rn "agent-thoughts-live" packages/webview-ui/src/components/console/AgentConsole.tsx` to confirm the live region is wired into the console component.
