# Task: Side-by-Side Markdown Diff View Inside Sign-off Modal (Sub-Epic: 83_Transactional_Signoff_Diff)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-101], [7_UI_UX_DESIGN-REQ-UI-DES-101-1]

## 1. Initial Test Written
- [ ] In `packages/webview/src/components/modals/__tests__/SpecDiffView.test.tsx`, write the following tests **before** implementing the component:
  - **Render split panes test**: Given `originalMarkdown` and `proposedMarkdown` props, assert two pane containers are rendered (e.g., `data-testid="diff-pane-original"` and `data-testid="diff-pane-proposed"`).
  - **Added line highlighting test**: For lines present only in `proposedMarkdown`, assert they receive the CSS class `diff-line--added` (green background via VSCode token).
  - **Removed line highlighting test**: For lines present only in `originalMarkdown`, assert they receive the CSS class `diff-line--removed` (red background via VSCode token).
  - **Unchanged line test**: Lines identical in both versions must carry class `diff-line--unchanged` and no highlight.
  - **Line number rendering test**: Assert that each rendered line has a corresponding `<span class="diff-line-number">` containing the correct 1-based line number.
  - **Synchronized scroll test**: Simulate scroll on the left pane and assert the right pane's `scrollTop` is updated to match (mocked via `scrollTop` setter spy).
  - **Empty diff test**: When `originalMarkdown === proposedMarkdown`, assert a `data-testid="diff-no-changes"` message is visible.
  - **Accessibility test**: Assert both pane containers have `aria-label` values ("Original specification" / "Proposed specification").
  - Use `@testing-library/react` + `jest`; mock `diff` library (e.g., `jest.mock('diff')`) to control diff output deterministically.

- [ ] In `packages/webview/src/utils/__tests__/computeLineDiff.test.ts`, write unit tests for the `computeLineDiff(original: string, proposed: string)` utility:
  - Returns an array of `{ type: 'added' | 'removed' | 'unchanged', content: string, lineNumberOriginal: number | null, lineNumberProposed: number | null }`.
  - Correctly numbers added lines (no `lineNumberOriginal`), removed lines (no `lineNumberProposed`), and unchanged lines (both numbers).

## 2. Task Implementation
- [ ] Install/confirm the `diff` package is available in `packages/webview` (`pnpm add diff` + `pnpm add -D @types/diff` if not already present).
- [ ] Create `packages/webview/src/utils/computeLineDiff.ts`:
  - Use `diffLines(original, proposed)` from the `diff` library.
  - Map the result to `LineDiffEntry[]` as described in the test spec above.
  - Export `computeLineDiff(original: string, proposed: string): LineDiffEntry[]`.
- [ ] Create `packages/webview/src/components/modals/SpecDiffView.tsx`:
  - Props:
    ```ts
    interface SpecDiffViewProps {
      originalMarkdown: string;
      proposedMarkdown: string;
    }
    ```
  - Call `computeLineDiff` at render time (memoised with `useMemo` on the two inputs).
  - Render two side-by-side scrollable panes using CSS grid (`grid-template-columns: 1fr 1fr`).
    - Left pane (`data-testid="diff-pane-original"`): render removed and unchanged lines.
    - Right pane (`data-testid="diff-pane-proposed"`): render added and unchanged lines.
  - Each line: `<div class="diff-line diff-line--{type}">` containing a `<span class="diff-line-number">` and `<span class="diff-line-content">` for the text.
  - Color tokens:
    - `diff-line--added`: `background: color-mix(in srgb, var(--vscode-gitDecoration-addedResourceForeground) 15%, transparent)`.
    - `diff-line--removed`: `background: color-mix(in srgb, var(--vscode-gitDecoration-deletedResourceForeground) 15%, transparent)`.
  - Implement synchronized scrolling: attach `onScroll` to the left pane ref; update right pane ref's `scrollTop` to the same value inside a `requestAnimationFrame` callback.
  - When `originalMarkdown === proposedMarkdown`, render `<p data-testid="diff-no-changes">No changes detected.</p>` instead of the split panes.
  - Pane `aria-label`: "Original specification" / "Proposed specification".
- [ ] Render `<SpecDiffView originalMarkdown={proposal.originalMarkdown} proposedMarkdown={proposal.proposedMarkdown} />` inside the `signoff-modal-body` div of `TransactionalSignoffModal`.
- [ ] Export `SpecDiffView` from `packages/webview/src/components/modals/index.ts`.

## 3. Code Review
- [ ] Confirm `computeLineDiff` is a pure function with no side effects and is independently unit-testable.
- [ ] Verify `useMemo` wraps `computeLineDiff` call in `SpecDiffView` — avoids recomputation on unrelated re-renders.
- [ ] Confirm no hardcoded colors — only `var(--vscode-*)` tokens and `color-mix()`.
- [ ] Verify synchronized scroll uses `requestAnimationFrame` (not direct assignment) to stay within 60FPS target (`[7_UI_UX_DESIGN-REQ-UI-DES-059-1]`).
- [ ] Confirm both panes have appropriate `aria-label` attributes for screen-reader identification.
- [ ] Confirm the component is purely presentational (no IPC/MCP calls).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern="SpecDiffView|computeLineDiff"` and confirm all tests pass.

## 5. Update Documentation
- [ ] Create `packages/webview/src/components/modals/SpecDiffView.agent.md` documenting:
  - Purpose: renders a side-by-side line diff of two Markdown spec strings.
  - Props contract.
  - Dependency on `computeLineDiff` utility.
  - CSS class naming convention for diff lines.
  - Synchronized scroll implementation rationale.
- [ ] Add a JSDoc comment to `computeLineDiff.ts` explaining the `LineDiffEntry` shape and how line numbers are assigned.

## 6. Automated Verification
- [ ] CI step `pnpm --filter @devs/webview test --ci --coverage` must exit 0.
- [ ] Assert coverage for `SpecDiffView.tsx` and `computeLineDiff.ts` is ≥ 90% (lines).
- [ ] Run `pnpm --filter @devs/webview lint` and confirm zero ESLint errors in new files.
