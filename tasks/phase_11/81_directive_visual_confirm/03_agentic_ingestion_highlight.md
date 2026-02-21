# Task: Implement Agentic Ingestion Highlight on Post-Directive Thought Block (Sub-Epic: 81_Directive_Visual_Confirm)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-054-3]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/ThoughtStreamer/ThoughtBlock.test.tsx`, add the following tests:
  - **No-highlight default test**: Render `<ThoughtBlock content="..." isDirectiveIngestion={false} />` and assert that the element does NOT have the class `thought-block--directive-ingestion` and does NOT have a `border` style containing `light-blue` or the ingestion token.
  - **Highlight present test**: Render `<ThoughtBlock content="..." isDirectiveIngestion={true} />` and assert that the element has the CSS class `thought-block--directive-ingestion`.
  - **Highlight color token test**: Assert that the applied class or inline style sets `border-color` to `var(--vscode-editorInfo-foreground)` (the VSCode light-blue semantic token). Do NOT hardcode `#007acc` or any raw color.
  - **One-time highlight test**: Render a `ThoughtStreamer` mock that fires two consecutive thought blocks, where only the first is `isDirectiveIngestion=true`. Assert the second block does NOT carry the highlight class.
  - **Accessibility test**: When `isDirectiveIngestion={true}`, assert the block has an `aria-label` that includes the text `"directive ingested"` (case-insensitive) to communicate the highlight semantically.
- [ ] All tests must fail before implementation begins.

## 2. Task Implementation
- [ ] In `packages/webview-ui/src/components/ThoughtStreamer/ThoughtBlock.tsx`, add the optional prop `isDirectiveIngestion?: boolean` (default `false`).
  - When `true`, apply CSS class `thought-block--directive-ingestion` to the root element.
  - When `true`, add `aria-label="Agent thought (directive ingested)"` to the root element.
- [ ] Add the following CSS rule to `ThoughtBlock.css` (or the component's CSS module):
  ```css
  .thought-block--directive-ingestion {
    border: 1px solid var(--vscode-editorInfo-foreground);
    border-radius: 4px;
    /* One-time appearance: the class is removed after the first render cycle by the parent */
  }
  ```
  - The `var(--vscode-editorInfo-foreground)` token renders as light-blue in standard and dark VSCode themes, satisfying the spec requirement of a "light-blue border".
- [ ] In the Zustand global UI store (`packages/webview-ui/src/store/uiStore.ts`), add state:
  ```ts
  directiveIngestionPending: boolean; // true after directive submitted, cleared after next thought block renders
  ```
  - Add action `markDirectiveSubmitted()`: sets `directiveIngestionPending = true`.
  - Add action `clearDirectiveIngestion()`: sets `directiveIngestionPending = false`.
- [ ] In the `ThoughtStreamer` component (`packages/webview-ui/src/components/ThoughtStreamer/ThoughtStreamer.tsx`):
  - Read `directiveIngestionPending` from the Zustand store.
  - When rendering a new `ThoughtBlock`, pass `isDirectiveIngestion={directiveIngestionPending}` to the FIRST new block only.
  - After passing the flag, immediately dispatch `clearDirectiveIngestion()` so subsequent blocks do not carry the highlight.
- [ ] In `ConsoleView` or the `DirectiveWhisperer` submission handler, call `markDirectiveSubmitted()` upon successful directive submission (the same event that triggers `triggerBadge()` from task 02).

## 3. Code Review
- [ ] Verify `var(--vscode-editorInfo-foreground)` is used — no hardcoded color values.
- [ ] Verify the `isDirectiveIngestion` flag is consumed exactly once (on the first new ThoughtBlock after submission) and then cleared via `clearDirectiveIngestion()`.
- [ ] Verify the Zustand action `clearDirectiveIngestion()` is called synchronously within the same render pass that consumes `directiveIngestionPending`, preventing stale highlight on subsequent thought blocks.
- [ ] Verify the `aria-label` on the highlighted block provides meaningful context for screen readers.
- [ ] Verify the border uses `border-radius: 4px` consistent with the 4px base grid (REQ-UI-DES-040).
- [ ] Verify `border-width: 1px solid` is used, consistent with REQ-UI-DES-047-2.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ThoughtBlock"` and confirm all new and existing tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ThoughtStreamer"` to confirm the streamer-level integration tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="uiStore"` to confirm the new Zustand state/actions are tested.
- [ ] Run the full webview-ui test suite: `pnpm --filter @devs/webview-ui test` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `packages/webview-ui/src/components/ThoughtStreamer/ThoughtStreamer.agent.md` to document:
  - The `isDirectiveIngestion` prop on `ThoughtBlock` and its one-shot lifecycle.
  - The Zustand state `directiveIngestionPending` and actions `markDirectiveSubmitted` / `clearDirectiveIngestion`.
  - The CSS token used: `var(--vscode-editorInfo-foreground)`.
  - Covered requirements: `7_UI_UX_DESIGN-REQ-UI-DES-054-3`.
- [ ] Update `packages/webview-ui/src/store/uiStore.agent.md` to document the two new actions.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --reporter=json --outputFile=test-results/directive-ingestion-highlight.json` and assert zero failed tests for `ThoughtBlock` and `ThoughtStreamer`.
- [ ] Run `pnpm --filter @devs/webview-ui build` to confirm TypeScript compilation succeeds with no errors.
