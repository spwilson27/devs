# Task: Implement aria-live Polite Region for Agent Thoughts in ThoughtStreamer (Sub-Epic: 88_Screen_Reader_Optimization)

## Covered Requirements
- [4_USER_FEATURES-REQ-045], [7_UI_UX_DESIGN-REQ-UI-DES-140]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/ThoughtStreamer/ThoughtStreamer.test.tsx`, write a unit test using `@testing-library/react` that renders `<ThoughtStreamer />` and asserts:
  - A container element with `role="log"` and `aria-live="polite"` and `aria-atomic="false"` exists in the DOM.
  - When a new thought entry is appended to the component's props (e.g., `thoughts: [{ id: '1', text: 'Analyzing requirements...' }]`), the text content of the live region updates within the same render cycle.
  - The live region element is **visually hidden** (uses a CSS class like `.sr-only` with `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap;`) and is NOT the same element as the visual scrolling list, ensuring screen reader announcements do not interfere with visual layout.
  - Only the **most recent** thought is placed into the `aria-live` region at any given time (not the full history), preventing announcement queue flooding.
  - Write an integration test asserting that when `ThoughtStreamer` receives a rapid burst of >5 thoughts within 300ms (simulated via `act`), the `aria-live` region only reflects the last debounced thought (debounce window: 250ms).

## 2. Task Implementation
- [ ] In `packages/vscode/src/webview/components/ThoughtStreamer/ThoughtStreamer.tsx`:
  - Add a dedicated, visually-hidden `<div>` element with `aria-live="polite"` `aria-atomic="false"` `role="log"` `aria-label="Agent Thought Stream"`. Apply the `.sr-only` Tailwind utility class (or equivalent CSS class defined in the shared stylesheet) to hide it visually without removing it from the accessibility tree.
  - Implement a `useEffect` hook that watches the incoming `thoughts` prop array. When a new thought is appended, update a local state variable `announcedThought` with the **text of the newest thought entry only** — do NOT populate the entire log history into this element.
  - Debounce updates to `announcedThought` using a 250ms debounce (use `useRef` + `setTimeout`/`clearTimeout` pattern, or the existing `useDebouncedCallback` hook from `@devs/ui-hooks` if available) so that rapid streaming does not spam the screen reader.
  - Render `{announcedThought}` inside this hidden `<div>`. The visual scrollable log (`<ul>` / `<div>` with `overflow-y: auto`) remains unchanged and separate.
  - Export a new utility CSS class `.sr-only` in `packages/vscode/src/webview/styles/accessibility.css` if not already present:
    ```css
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    ```

## 3. Code Review
- [ ] Verify the `aria-live="polite"` region is a sibling to, not a parent or child of, the visual scrollable list — this prevents double-announcing in some AT combinations.
- [ ] Confirm no `aria-atomic="true"` is set on the parent container of the visual list; only the dedicated hidden `<div>` carries the `aria-live` attribute.
- [ ] Confirm the debounce window is exactly 250ms and is cleared on component unmount (cleanup in `useEffect` return).
- [ ] Confirm the `.sr-only` CSS class matches the WCAG-approved pattern and is not overridden by Tailwind's base reset.
- [ ] Ensure the solution does not break the existing `ThoughtStreamer` virtual scrolling behavior (`[6_UI_UX_ARCH-REQ-018]`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=ThoughtStreamer` and confirm all new and existing tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/vscode test:coverage` and confirm the `ThoughtStreamer` component maintains ≥ 90% line coverage.

## 5. Update Documentation
- [ ] Update `packages/vscode/src/webview/components/ThoughtStreamer/README.md` (create if absent) with a section "Accessibility" describing the dual-region pattern: visual log vs. the hidden `aria-live` polite region.
- [ ] Update the project-level accessibility spec at `specs/accessibility.md` (create if absent) with an entry: `[4_USER_FEATURES-REQ-045] / [7_UI_UX_DESIGN-REQ-UI-DES-140] — ThoughtStreamer uses aria-live="polite" with 250ms debounce for agent thought announcements.`
- [ ] Add an entry in the agent "memory" file `tasks/phase_11/DECISIONS.md` noting: "ThoughtStreamer aria-live polite region uses 250ms debounce to prevent screen reader flooding during high-frequency streaming."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=ThoughtStreamer --verbose 2>&1 | grep -E "PASS|FAIL"` and assert the output contains `PASS` and zero `FAIL` lines.
- [ ] Run `grep -r 'aria-live="polite"' packages/vscode/src/webview/components/ThoughtStreamer/` and assert at least one match is found, confirming the attribute is present in source.
- [ ] Run `grep -r 'sr-only' packages/vscode/src/webview/styles/accessibility.css` and assert the class definition is present.
