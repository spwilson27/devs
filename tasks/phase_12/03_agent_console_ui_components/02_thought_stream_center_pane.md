# Task: Thought Stream Center Pane Component (Sub-Epic: 03_Agent Console UI Components)

## Covered Requirements
- [1_PRD-REQ-UI-005], [7_UI_UX_DESIGN-REQ-UI-DES-094-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/ThoughtStream.test.tsx`, write tests that:
  - Assert `ThoughtStream` renders an empty state message (`data-testid="thought-stream-empty"`) when given an empty `thoughts` array.
  - Assert that for a list of `ThoughtEntry` objects `[{ id, timestamp, text, type: 'reasoning' }]`, the component renders each entry as an element with `data-testid="thought-entry-{id}"`.
  - Assert each rendered thought entry displays the `text` content using a `serif` font family class (verify CSS class `thoughtText` is applied).
  - Assert new entries appended to the `thoughts` prop appear at the bottom of the list (last child of the scroll container).
  - Assert the scroll container auto-scrolls to the bottom when a new thought entry is appended (spy on `scrollTop`/`scrollIntoView`).
  - Assert the component does NOT scroll when the user has manually scrolled up (user-scroll lock test: set `scrollTop` to non-max value, add entry, assert `scrollTop` unchanged).
  - Assert `ThoughtEntry` with `type: 'observation'` renders with a distinct CSS class compared to `type: 'reasoning'`.
  - Write a snapshot test of `ThoughtStream` with two entries of each type.

## 2. Task Implementation
- [ ] Define `packages/webview-ui/src/components/AgentConsole/types.ts`:
  ```typescript
  export type ThoughtType = 'reasoning' | 'action' | 'observation';
  export interface ThoughtEntry {
    id: string;           // UUID
    timestamp: number;    // Unix ms
    text: string;         // Narrative content
    type: ThoughtType;
  }
  ```
- [ ] Create `packages/webview-ui/src/components/AgentConsole/ThoughtStream.tsx`:
  - Accept props: `thoughts: ThoughtEntry[]`, `className?: string`.
  - Render a `<div data-testid="thought-stream" role="log" aria-live="polite" aria-label="Agent thought stream">` as the scroll container with `overflow-y: auto`.
  - Map each `ThoughtEntry` to a `<ThoughtEntryItem>` sub-component (defined in the same file or a sibling file).
  - Implement auto-scroll to bottom using a `useRef` on the container and a `useEffect` that calls `scrollIntoView({ behavior: 'smooth' })` on the last entry ref — but only when `isUserScrolled` state is `false`.
  - Track user scroll via an `onScroll` handler: if `scrollTop + clientHeight < scrollHeight - 10`, set `isUserScrolled = true`; if at bottom, reset to `false`.
  - `ThoughtEntryItem` renders: timestamp formatted as `HH:mm:ss`, the `text` in a `<p>` with `.thoughtText` class (font-family: Georgia/serif), and a left-border color variant based on `type` (reasoning: `--color-thought`, action: `--color-action`, observation: `--color-observation`).
- [ ] Create `packages/webview-ui/src/components/AgentConsole/ThoughtStream.module.css`:
  - `.thoughtStream` — `overflow-y: auto; height: 100%; display: flex; flex-direction: column; gap: var(--spacing-sm);`
  - `.thoughtEntry` — `padding: var(--spacing-xs) var(--spacing-sm); border-left: 3px solid transparent; animation: slideInFromBottom 180ms ease-out;`
  - `.thoughtText` — `font-family: Georgia, 'Times New Roman', serif; font-size: 0.875rem; line-height: 1.6; margin: 0;`
  - `.reasoning` — `border-left-color: var(--color-thought, #7c9ef8);`
  - `.action` — `border-left-color: var(--color-action, #f8c97c);`
  - `.observation` — `border-left-color: var(--color-observation, #7cf8a4);`
  - `@keyframes slideInFromBottom` — `from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`
- [ ] Wire `ThoughtStream` into the center pane of `AgentConsole`, receiving `thoughts` from a `useAgentConsoleStore` Zustand slice (to be created as a stub in this task returning an empty array).

## 3. Code Review
- [ ] Confirm `role="log"` and `aria-live="polite"` are set on the scroll container to comply with WCAG 2.1 SC 4.1.3 (Status Messages).
- [ ] Verify the auto-scroll user-lock logic is fully covered by tests and does not cause jitter.
- [ ] Confirm no `dangerouslySetInnerHTML` is used — thought text must be rendered as plain text or sanitized Markdown.
- [ ] Validate the `slideInFromBottom` animation uses `transform` and `opacity` only (GPU-composited properties) to maintain 60 FPS.
- [ ] Check that `ThoughtEntry.id` is used as the React `key` prop (not array index).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ThoughtStream"` and confirm all assertions pass.
- [ ] Run with `--coverage` and confirm `ThoughtStream.tsx` has ≥ 95% line coverage and 100% branch coverage for the scroll-lock logic.

## 5. Update Documentation
- [ ] Add `ThoughtStream` to `packages/webview-ui/docs/COMPONENTS.md` with prop table, `ThoughtEntry` type definition, and auto-scroll behavior description.
- [ ] Update `.devs/memory/phase_12_decisions.md` to record: "ThoughtStream uses Georgia serif font, `aria-live=polite`, and a user-scroll lock pattern. CSS animation: slideInFromBottom 180ms ease-out using GPU-composited properties."

## 6. Automated Verification
- [ ] `pnpm --filter @devs/webview-ui test -- --ci --forceExit --testPathPattern="ThoughtStream"` exits with code 0.
- [ ] `pnpm --filter @devs/webview-ui build` completes without errors.
- [ ] Visual regression: run `pnpm --filter @devs/webview-ui test:storybook` (if Storybook is configured) against the `ThoughtStream` story and assert no pixel diff > 0.1%.
