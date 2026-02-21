# Task: Integrated Diff View for Agent-Proposed Architectural Changes (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [4_USER_FEATURES-REQ-009]

## 1. Initial Test Written
- [ ] In `packages/webview/src/components/hitl/__tests__/ArchitectureDiffView.test.tsx`, write React Testing Library tests for `<ArchitectureDiffView>`:
  - Given `before: string` and `after: string` props containing Markdown text, the component renders two columns: `data-testid="diff-before"` and `data-testid="diff-after"`.
  - Lines present only in `after` are marked with `data-diff="added"` and have a green left-border (`border-left: 3px solid var(--vscode-diffEditor-insertedLineBackground)`).
  - Lines present only in `before` are marked with `data-diff="removed"` and have a red left-border (`border-left: 3px solid var(--vscode-diffEditor-removedLineBackground)`).
  - Unchanged lines are marked with `data-diff="unchanged"` and have no border styling.
  - The component renders a `data-testid="diff-risk-badge"` element when `riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'` prop is provided, with text matching the risk level.
  - When `riskLevel="HIGH"`, the badge has `background: var(--vscode-statusBarItem-errorBackground)`.
  - When `riskLevel="LOW"`, the badge has `background: var(--vscode-statusBarItem-warningBackground)`.
- [ ] In `packages/webview/src/components/hitl/__tests__/DiffRiskBadge.test.tsx`, write unit tests for `<DiffRiskBadge>`:
  - Renders the `riskLevel` string in all caps.
  - Applies the correct VSCode background CSS variable per risk level.
  - Has `role="status"` and `aria-label={\`Risk level: \${riskLevel}\`}` for accessibility.
- [ ] In `packages/webview/src/hooks/__tests__/useDiff.test.ts`, write tests for the `useDiff(before, after)` hook:
  - Returns an array of `{ line: string; type: 'added' | 'removed' | 'unchanged' }` objects.
  - Correctly identifies added, removed, and unchanged lines for a simple two-line diff.
  - Returns an empty array when both `before` and `after` are empty strings.
  - Does not throw on very large inputs (> 10,000 lines); completes within 200ms (use `jest.useFakeTimers` or a timeout assertion).

## 2. Task Implementation
- [ ] Create `packages/webview/src/hooks/useDiff.ts`:
  - Accept `before: string` and `after: string`.
  - Use a simple LCS-based line diff algorithm (do NOT import an external diff library; implement a minimal Myers diff or falling back to a line-by-line comparison).
  - Return `DiffLine[]` where `DiffLine = { line: string; type: 'added' | 'removed' | 'unchanged' }`.
  - Memoize the result with `useMemo([before, after])` to avoid re-computation on unrelated re-renders.
- [ ] Create `packages/webview/src/components/hitl/DiffRiskBadge.tsx`:
  - Props: `riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'`.
  - Map risk level to VSCode CSS variables:
    - `HIGH` → `var(--vscode-statusBarItem-errorBackground)`
    - `MEDIUM` → `var(--vscode-statusBarItem-warningBackground)`
    - `LOW` → `var(--vscode-statusBarItem-prominentBackground)`
  - Render `<span role="status" aria-label={\`Risk level: \${riskLevel}\`} data-testid="diff-risk-badge">`.
  - Apply `font-family: var(--vscode-editor-font-family)` and `font-size: 11px` (Metadata scale).
- [ ] Create `packages/webview/src/components/hitl/ArchitectureDiffView.tsx`:
  - Props: `before: string`, `after: string`, `riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW'`.
  - Use `useDiff(before, after)` to obtain `DiffLine[]`.
  - Render a side-by-side two-column layout using CSS Grid (`grid-template-columns: 1fr 1fr`).
  - Left column (`data-testid="diff-before"`): render `removed` and `unchanged` lines.
  - Right column (`data-testid="diff-after"`): render `added` and `unchanged` lines.
  - Per-line wrapper: `<div data-diff={type} style={{ borderLeft: lineStyle }}>`.
  - If `riskLevel` prop is provided, render `<DiffRiskBadge riskLevel={riskLevel} />` above the diff columns.
  - Apply `font-family: var(--vscode-editor-font-family)`, `font-size: 12px`, `line-height: 1.4` (Technical Mono typography per design spec).
- [ ] Integrate `<ArchitectureDiffView>` into `<GatedSpecReview>`: render it in a collapsible section below the dual-pane layout, visible when `gate.proposedChanges` is non-null. `gate.proposedChanges` should have shape `{ before: string; after: string; riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' }`.
- [ ] Add `proposedChanges?: { before: string; after: string; riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' } | null` to the `HitlGate` model (extend the data model created in task 01).

## 3. Code Review
- [ ] Verify `useDiff` is a pure function with no side effects — same inputs always produce same outputs.
- [ ] Verify the diff algorithm handles edge cases: empty `before`, empty `after`, identical `before` and `after`.
- [ ] Verify no external `diff` or `jsdiff` npm package is imported — the implementation must be self-contained.
- [ ] Verify all border and background colors use `var(--vscode-*)` tokens — no hardcoded hex/rgb values.
- [ ] Verify the collapsible section in `<GatedSpecReview>` uses a `<details>/<summary>` element for native accessibility (keyboard-operable).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern="ArchitectureDiffView|DiffRiskBadge|useDiff"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=hitlGateModel` to confirm the updated `HitlGate` model tests still pass after adding `proposedChanges`.
- [ ] Run `pnpm --filter @devs/webview build` and assert no TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## Architecture Diff View` section to `packages/webview/src/components/hitl/README.md`:
  - Document the `proposedChanges` shape and risk level semantics.
  - Document the self-contained diff algorithm and its limitations (line-level only, no inline character diff).
- [ ] Update `docs/agent-memory/architecture-decisions.md`:
  ```
  ## [ADR-HITL-006] Architecture Diff View
  - Diff is computed client-side using a self-contained LCS line diff (no external library).
  - Side-by-side layout: left=before, right=after, using CSS Grid 1fr/1fr.
  - Risk badge colors use var(--vscode-statusBarItem-*) tokens.
  - proposedChanges is an optional field on HitlGate; diff view is hidden when null.
  ```

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview test -- --ci --testPathPattern="ArchitectureDiffView|DiffRiskBadge|useDiff"` and assert exit code `0`.
- [ ] Run `grep -rn "require\|from '.*diff'" packages/webview/src/hooks/useDiff.ts` and confirm no external diff library is imported.
- [ ] Run `pnpm --filter @devs/webview build` and assert exit code `0`.
