# Task: Implement Semantic Diff UI for High-Signal Document Approvals (Sub-Epic: 11_Document Approval and Requirement Linking)

## Covered Requirements
- [8_RISKS-REQ-038]

## 1. Initial Test Written
- [ ] In `packages/core/src/diff/__tests__/semanticDiffer.test.ts`, write unit tests for `SemanticDiffer`:
  - Test `diff(previous: DocumentVersion, next: DocumentVersion): SemanticChange[]` returns an empty array when documents are identical.
  - Test that adding a new `dependency` block to a TAS produces a `SemanticChange` of type `'new-dependency'` with the dependency name in `metadata`.
  - Test that modifying a security policy section produces a `SemanticChange` of type `'security-policy-modified'`.
  - Test that a purely cosmetic whitespace change produces zero `SemanticChange` entries (raw text diff ≠ semantic diff).
  - Test that changes to P3 (Must-have) requirements produce `SemanticChange` entries with `severity: 'critical'`.
  - Test that `SemanticChange[]` output is sorted by `severity` descending (critical → warning → info).
- [ ] In `packages/webview-ui/src/components/__tests__/SemanticDiffPanel.test.tsx`:
  - Render `<SemanticDiffPanel changes={mockChanges} />` with a mix of severities.
  - Assert each change renders with a labeled badge (`"New Dependency Added"`, `"Security Policy Modified"`, etc.).
  - Assert critical changes render with a red badge and `role="alert"`.
  - Assert the panel shows a "No semantic changes detected" message when `changes` is empty.
  - Assert raw text diff blocks are NOT present — only structured semantic change cards.

## 2. Task Implementation
- [ ] Create `packages/core/src/diff/semanticDiffer.ts`:
  - Export `type SemanticChangeType = 'new-dependency' | 'security-policy-modified' | 'requirement-priority-changed' | 'new-requirement' | 'requirement-removed' | 'architecture-decision-changed'`.
  - Export `type Severity = 'critical' | 'warning' | 'info'`.
  - Export `interface SemanticChange { type: SemanticChangeType; severity: Severity; label: string; description: string; metadata: Record<string, unknown> }`.
  - Export `interface DocumentVersion { content: string; parsedAt: number }`.
  - Export `class SemanticDiffer` with `diff(previous: DocumentVersion, next: DocumentVersion): SemanticChange[]`:
    - Parse both versions into structured sections (headings, code blocks, lists) using a lightweight Markdown AST.
    - Detect dependency additions/removals by diffing dependency list sections.
    - Detect security policy changes by comparing sections matching `/security/i` headings.
    - Detect requirement priority changes by comparing `P\d` labels next to REQ-IDs.
    - Ignore whitespace-only and punctuation-only deltas.
    - Sort output by severity (`critical` first).
- [ ] Create `packages/webview-ui/src/components/SemanticDiffPanel.tsx`:
  - Props: `changes: SemanticChange[]`.
  - Renders a vertical list of change cards. Each card shows:
    - Severity badge (red for `critical`, yellow for `warning`, blue for `info`).
    - Human-readable `label` (e.g., "New Dependency Added").
    - Expandable `description` section.
  - Critical changes have `role="alert"` on their card element.
  - Empty state: renders `<p>No semantic changes detected.</p>`.
- [ ] Integrate `SemanticDiffPanel` into `DocumentDualPane.tsx`: show it in a slide-over drawer triggered by an "View Changes" button in the toolbar whenever a document version transition is detected.

## 3. Code Review
- [ ] Verify `SemanticDiffer` does NOT call any LLM — classification must be deterministic regex/AST-based.
- [ ] Confirm the Markdown AST parser used is the same one already in the project (e.g., `unified`/`remark`) to avoid adding a new dependency.
- [ ] Ensure `SemanticChange` labels are taken from a centralized `CHANGE_LABELS` constant map (no magic strings in logic code).
- [ ] Confirm `role="alert"` is only placed on critical items, not on warning or info items.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="semanticDiffer"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="SemanticDiffPanel"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core run typecheck && pnpm --filter @devs/webview-ui run typecheck` to confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add section "Semantic Differ" to `packages/core/AGENT.md`: document supported `SemanticChangeType` values, how to add a new change type, and the severity classification rules.
- [ ] Add section "Semantic Diff Panel" to `packages/webview-ui/AGENT.md`: describe the slide-over trigger mechanism and the card layout.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --coverage -- --testPathPattern="semanticDiffer"` and assert branch coverage ≥ 90%.
- [ ] Execute Playwright E2E test (`pnpm e2e -- --grep "semantic diff panel"`) that: loads the document pane with two fixture document versions (one adding a new dependency), clicks "View Changes", and asserts a card with label "New Dependency Added" is visible with a red badge. Confirm test exits with code 0.
