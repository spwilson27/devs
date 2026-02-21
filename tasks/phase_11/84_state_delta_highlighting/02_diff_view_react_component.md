# Task: Implement DiffView React Component with Syntax-Highlighted Hunks (Sub-Epic: 84_State_Delta_Highlighting)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-086]

## 1. Initial Test Written
- [ ] In `packages/webview/src/components/__tests__/DiffView.test.tsx`, write React Testing Library tests:
  - Test: renders a loading skeleton (`data-testid="diff-view-skeleton"`) when `isLoading` is `true`.
  - Test: renders an empty state message "No changes in this turn." when `files` array is empty and `isLoading` is `false`.
  - Test: for a `DeltaFile` with `status: 'added'`, renders a file header showing `[A] path/to/file.ts` (codicon `codicon-diff-added` prefix).
  - Test: for a `DeltaFile` with `status: 'deleted'`, renders `[D] path/to/file.ts` with codicon `codicon-diff-removed`.
  - Test: for a `DeltaFile` with `status: 'modified'`, renders `[M] path/to/file.ts` with codicon `codicon-diff-modified`.
  - Test: renders `+` lines with class `diff-line--add` and background `var(--vscode-diffEditor-insertedLineBackground)`.
  - Test: renders `-` lines with class `diff-line--remove` and background `var(--vscode-diffEditor-removedLineBackground)`.
  - Test: renders context lines with class `diff-line--context` and no explicit background override.
  - Test: renders the correct old and new line numbers in the gutter for each line.
  - Test: when a file header is clicked, the hunk content for that file collapses/expands (toggle).
  - Test: passes `aria-label="Diff for path/to/file.ts"` on the collapsible file section.
- [ ] In `packages/webview/src/components/__tests__/DiffHunkBlock.test.tsx`, write unit tests for the `DiffHunkBlock` subcomponent:
  - Test: renders a `@@ -oldStart,oldLines +newStart,newLines @@` header line.
  - Test: renders each `DiffLine` with correct content, preserving leading whitespace.
  - Test: does not crash when `hunks` array is empty (renders nothing).

## 2. Task Implementation
- [ ] Create `packages/webview/src/components/DiffView/DiffView.tsx`:
  - Props: `{ files: DeltaFile[]; isLoading: boolean; error: string | null }` (types from `@devs/shared-types`).
  - When `isLoading`, render `<DiffViewSkeleton />` (see below).
  - When `error`, render an error banner using VSCode token `--vscode-errorForeground`.
  - When `files` is empty, render a `<p>` with "No changes in this turn."
  - For each `DeltaFile`, render a collapsible `<details>/<summary>` (native HTML for keyboard accessibility) with:
    - Summary: codicon status icon + file path + file-level stats (e.g., `+12 -3`).
    - Body: one `<DiffHunkBlock>` per hunk.
  - Use `React.memo` on the top-level component.
- [ ] Create `packages/webview/src/components/DiffView/DiffHunkBlock.tsx`:
  - Props: `{ hunk: DiffHunk }`.
  - Renders the `@@` header as a sticky row within the scrollable hunk.
  - For each `DiffLine`, renders a `<div className="diff-line diff-line--{type}">` with:
    - Gutter columns: `oldLineNo` (or blank for `add`) and `newLineNo` (or blank for `remove`), `min-width: 40px`, right-aligned, `font-family: var(--vscode-editor-font-family)`.
    - Content column: the line `content` string, `white-space: pre`, `font-family: var(--vscode-editor-font-family)`.
  - Use `React.memo`.
- [ ] Create `packages/webview/src/components/DiffView/DiffViewSkeleton.tsx`:
  - Renders 3 skeleton file header rows and 5 skeleton line rows per header using the project-standard shimmer CSS class (e.g., `skeleton-shimmer` from `[7_UI_UX_DESIGN-REQ-UI-DES-086-1]` implementation).
  - Must respect `prefers-reduced-motion` — disable shimmer animation if the media query matches.
- [ ] Create `packages/webview/src/components/DiffView/diffView.css` (or Tailwind utilities if the project uses Tailwind exclusively):
  - `.diff-line--add` background: `var(--vscode-diffEditor-insertedLineBackground)`.
  - `.diff-line--remove` background: `var(--vscode-diffEditor-removedLineBackground)`.
  - `.diff-line--context` no explicit background (inherits from panel).
  - `.diff-gutter` column: `min-width: 40px; text-align: right; padding-right: 8px; color: var(--vscode-editorLineNumber-foreground); user-select: none;`.
  - All colors MUST use `--vscode-*` tokens — zero hardcoded hex values.
- [ ] Export `DiffView` from `packages/webview/src/components/index.ts`.

## 3. Code Review
- [ ] Verify all color values in `diffView.css` use `var(--vscode-*)` tokens — grep for `#` or `rgb(` patterns and confirm zero matches.
- [ ] Verify `DiffView` and `DiffHunkBlock` are wrapped in `React.memo` to prevent unnecessary re-renders when parent state changes unrelated to diff data.
- [ ] Verify the `<details>/<summary>` collapse pattern is used (not a custom JS toggle) to get keyboard accessibility for free.
- [ ] Verify the file status icon uses `codicon-diff-added`, `codicon-diff-removed`, `codicon-diff-modified` from VSCode Codicons (per `[6_UI_UX_ARCH-REQ-073]`).
- [ ] Verify `DiffViewSkeleton` disables shimmer animation when `prefers-reduced-motion: reduce` is set (per `[7_UI_UX_DESIGN-REQ-UI-DES-085-1]`).
- [ ] Verify no inline `style` objects are used for colors (they bypass VSCode theme switching).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern=DiffView` — all component tests pass.
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern=DiffHunkBlock` — all subcomponent tests pass.
- [ ] Run `pnpm --filter @devs/webview build` — Webview bundle builds without error; confirm bundle size delta does not exceed 20 KB gzipped (per `[6_UI_UX_ARCH-REQ-007]`).
- [ ] Run `pnpm --filter @devs/webview tsc --noEmit` — zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a JSDoc comment to `DiffView` describing its props and the VSCode token dependencies.
- [ ] Add a JSDoc comment to `DiffHunkBlock` describing the `hunk` prop structure.
- [ ] Update `packages/webview/AGENTS.md` with a section "DiffView Component" documenting its rendering contract, skeleton behavior, and color token usage.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview test --coverage -- --testPathPattern=DiffView` and confirm ≥ 90% line coverage for `DiffView.tsx`, `DiffHunkBlock.tsx`, and `DiffViewSkeleton.tsx`.
- [ ] Grep `diffView.css` for `#[0-9a-fA-F]` and `rgb(` — confirm zero matches (all colors are VSCode tokens).
- [ ] Run `pnpm --filter @devs/webview build` and verify no build errors in CI output.
